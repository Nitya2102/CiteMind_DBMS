interface VectorEmbedding {
  _id: string;
  summary: string;
  keywords: string[];
  fields: string[];
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
 * Cosine similarity between two vectors
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
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
 * Generate embedding for a search query using simple averaging
 * This is a fallback - ideally you'd use a proper embedding model
 */
function generateQueryEmbedding(query: string, referenceEmbeddings: number[][]): number[] {
  if (referenceEmbeddings.length === 0) return [];

  const embeddingDim = referenceEmbeddings[0].length;
  const embedding = new Array(embeddingDim).fill(0);

  // Simple approach: average embeddings of papers containing query words
  const queryWords = query.toLowerCase().split(/\s+/);
  let count = 0;

  referenceEmbeddings.forEach((emb) => {
    // Simple heuristic: weight by relevance
    embedding.forEach((_, i) => {
      embedding[i] += emb[i];
    });
    count++;
  });

  // Average
  return embedding.map((val) => (count > 0 ? val / count : val));
}

interface SearchOptions {
  limit?: number;
  minSimilarity?: number;
}

/**
 * Search papers using vector embeddings
 */
export async function searchByEmbedding(
  query: string,
  options: SearchOptions = {}
): Promise<any[]> {
  const { limit = 20, minSimilarity = 0.3 } = options;

  try {
    const embedRes = await fetch("/CiteMind.vector_embeddings.json");
    const metaRes = await fetch("/CiteMind.Paper_MetaData.json");

    if (!embedRes.ok || !metaRes.ok) {
      throw new Error("Failed to fetch data");
    }

    const embeddings: VectorEmbedding[] = await embedRes.json();
    const metadata: MetaPaper[] = await metaRes.json();

    // Extract all embeddings for query generation
    const allVectors = embeddings.map((e) => e.embedding);

    // Generate query embedding
    const queryEmbedding = generateQueryEmbedding(query, allVectors);

    // Calculate similarities
    const results = embeddings
      .map((item, idx) => {
        const similarity = cosineSimilarity(queryEmbedding, item.embedding);
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
          },
        };
      })
      .filter((result) => result.similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return results.map((r) => r.paper);
  } catch (err) {
    console.error("Error in semantic search:", err);
    return [];
  }
}

/**
 * Search by keywords/filters
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
        const meta = metadata.find((m) => m.paper_id === item._id || m._id === item._id);

        // Check if keywords match
        const keywordMatch = keywords.some((kw) =>
          item.keywords.some((k) => k.toLowerCase().includes(kw.toLowerCase()))
        );

        // Check if fields match
        const fieldMatch = !fields || fields.length === 0 || fields.some((f) => item.fields.includes(f));

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
 * Find similar papers to a given paper
 */
export async function findSimilarPapers(paperId: string, limit: number = 5): Promise<any[]> {
  try {
    const embedRes = await fetch("/CiteMind.vector_embeddings.json");
    const metaRes = await fetch("/CiteMind.Paper_MetaData.json");

    const embeddings: VectorEmbedding[] = await embedRes.json();
    const metadata: MetaPaper[] = await metaRes.json();

    // Find the query paper
    const queryPaper = embeddings.find((e) => e._id === paperId);
    if (!queryPaper) {
      console.error("Paper not found");
      return [];
    }

    // Find similar papers
    const results = embeddings
      .filter((e) => e._id !== paperId) // Exclude the query paper itself
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