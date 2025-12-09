// src/lib/semanticSearch.ts - RESTORED CLIENT-SIDE VERSION

const API_BASE = "http://127.0.0.1:8000";

interface VectorEmbedding {
  _id: string;
  summary: string;
  keywords: string[];
  fields: string[];
  novelty: string;
  related_work: string[];
  embedding: number[];
}

interface MetaPaper {
  _id?: string;
  paper_id: string;
  title: string;
  authors: string[];
  year: number;
  journal_ref?: string | null;
  selected_category?: string;
}

/**
 * Cosine similarity calculation
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (normA * normB);
}

/**
 * Keyword-based search (client-side)
 */
export async function searchByKeywords(
  keywords: string[],
  fields?: string[]
): Promise<any[]> {
  try {
    const embedRes = await fetch("/CiteMind.vector_embeddings.json");
    const metaRes = await fetch("/CiteMind.Paper_MetaData.json");

    const embeddings: VectorEmbedding[] = await embedRes.json();
    const metadata: MetaPaper[] = await metaRes.json();

    return embeddings
      .map((item) => {
        const meta = metadata.find(
          (m) => m.paper_id === item._id || m._id === item._id
        );

        const keywordMatch = keywords.some((kw) =>
          item.keywords.some((k) =>
            k.toLowerCase().includes(kw.toLowerCase())
          )
        );

        const fieldMatch =
          !fields ||
          fields.length === 0 ||
          fields.some((f) => item.fields.includes(f));

        return {
          match: keywordMatch && fieldMatch,
          paper: {
            id: item._id,
            title: meta?.title || "Unknown Title",
            authors: meta?.authors || [],
            year: meta?.year || 0,
            abstract: item.summary,
            category: meta?.selected_category || "Unknown",
            keywords: item.keywords,
            fields: item.fields,
          },
        };
      })
      .filter((result) => result.match)
      .map((r) => r.paper);
  } catch (err) {
    console.error("Error in keyword search:", err);
    return [];
  }
}

/**
 * Find similar papers using embeddings (client-side)
 */
export async function findSimilarPapers(
  paperId: string,
  limit: number = 5
): Promise<any[]> {
  try {
    const embedRes = await fetch("/CiteMind.vector_embeddings.json");
    const metaRes = await fetch("/CiteMind.Paper_MetaData.json");

    const embeddings: VectorEmbedding[] = await embedRes.json();
    const metadata: MetaPaper[] = await metaRes.json();

    const queryPaper = embeddings.find((e) => e._id === paperId);
    if (!queryPaper) {
      console.error("Paper not found");
      return [];
    }

    const results = embeddings
      .filter((e) => e._id !== paperId)
      .map((item) => {
        const similarity = cosineSimilarity(queryPaper.embedding, item.embedding);
        const meta = metadata.find((m) => m.paper_id === item._id || m._id === item._id);

        return {
          similarity,
          paper: {
            id: item._id,
            title: meta?.title || "Unknown Title",
            authors: meta?.authors || [],
            year: meta?.year || 0,
            abstract: item.summary,
            category: meta?.selected_category || "Unknown",
            keywords: item.keywords,
            fields: item.fields,
            similarity,
          },
        };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return results.map((r) => r.paper);
  } catch (err) {
    console.error("Error finding similar papers:", err);
    return [];
  }
}

/**
 * Detect research gaps using embeddings (client-side)
 */
export async function detectResearchGap(
  paperId: string
): Promise<{
  paperId: string;
  uniqueKeywords: string[];
  researchGaps: string[];
  clusterSize: number;
} | null> {
  try {
    const embedRes = await fetch("/CiteMind.vector_embeddings.json");
    if (!embedRes.ok) throw new Error("Failed to fetch embeddings");

    const papers: VectorEmbedding[] = await embedRes.json();

    const paper = papers.find((p) => p._id === paperId);
    if (!paper) return null;

    const clusterPapers: VectorEmbedding[] = [paper];

    papers.forEach((p) => {
      if (p._id === paperId) return;

      const sharedKeywords = paper.keywords.filter((k) => p.keywords.includes(k));
      const embeddingSimilarity = cosineSimilarity(paper.embedding, p.embedding);

      if (sharedKeywords.length >= 2 || embeddingSimilarity > 0.6) {
        clusterPapers.push(p);
      }
    });

    const uniqueKeywords = paper.keywords.filter((kw) => {
      const count = clusterPapers.filter((p) => p.keywords.includes(kw)).length;
      return count === 1;
    });

    return {
      paperId,
      uniqueKeywords,
      researchGaps: paper.related_work || [],
      clusterSize: clusterPapers.length,
    };
  } catch (err) {
    console.error("Error detecting research gap:", err);
    return null;
  }
}