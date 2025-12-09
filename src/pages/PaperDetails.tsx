import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Network, FileText, ArrowLeft, Lightbulb, Zap } from "lucide-react";
import { detectResearchGap, findSimilarPapers } from "@/lib/semanticSearch";

interface MetaPaper {
  _id?: string;
  paper_id: string;
  title: string;
  authors: string[];
  year: number;
  journal_ref?: string | null;
}

interface AbstractPaper {
  abstract: string;
}

interface FullPaper {
  id: string;
  title: string;
  authors: string[];
  year: number;
  venue: string;
  abstract: string;
}

interface ResearchGap {
  paperId: string;
  uniqueKeywords: string[];
  researchGaps: string[];
  clusterSize: number;
}

const PaperDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const decodedId = decodeURIComponent(id || "");

  const [paper, setPaper] = useState<FullPaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [researchGap, setResearchGap] = useState<ResearchGap | null>(null);
  const [gapLoading, setGapLoading] = useState(false);
  const [similarPapers, setSimilarPapers] = useState<any[]>([]);
  const [showGap, setShowGap] = useState(false);
  const [showSimilar, setShowSimilar] = useState(false);

  useEffect(() => {
    const loadPaper = async () => {
      try {
        const metaRes = await fetch("/CiteMind.Paper_MetaData.json");
        const abstractRes = await fetch("/CiteMind.Abstract.json");

        if (!metaRes.ok || !abstractRes.ok) {
          throw new Error("Failed to fetch JSON files");
        }

        const metaData: MetaPaper[] = await metaRes.json();
        const abstracts: AbstractPaper[] = await abstractRes.json();

        const validMeta = metaData.filter((p) => p.paper_id && p.title);
        const paperIndex = validMeta.findIndex(
          (p) => p.paper_id === decodedId || p._id === decodedId
        );

        if (paperIndex === -1) {
          setError(`Paper with ID "${decodedId}" not found`);
          setPaper(null);
          setLoading(false);
          return;
        }

        const meta = validMeta[paperIndex];
        const abs = abstracts[paperIndex];

        setPaper({
          id: meta.paper_id,
          title: meta.title,
          authors: meta.authors,
          year: meta.year,
          venue: meta.journal_ref || "Unknown Venue",
          abstract: abs?.abstract || "No abstract available.",
        });

        setError(null);
      } catch (err) {
        console.error("Error loading paper:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadPaper();
    }
  }, [decodedId, id]);

  const loadResearchGap = async () => {
    if (!paper) return;
    setGapLoading(true);
    try {
      const gap = await detectResearchGap(decodedId);
      if (gap) {
        setResearchGap(gap);
        setShowGap(true);
      }
    } catch (err) {
      console.error("Error loading research gap:", err);
    } finally {
      setGapLoading(false);
    }
  };

  const loadSimilarPapers = async () => {
    if (!paper) return;
    try {
      const similar = await findSimilarPapers(decodedId, 5);
      setSimilarPapers(similar);
      setShowSimilar(true);
    } catch (err) {
      console.error("Error loading similar papers:", err);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg text-muted-foreground">Loading paper details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
          <CardContent className="pt-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Paper not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-serif font-bold mb-4">{paper.title}</h1>
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <span>{paper.year}</span>
            <span>•</span>
            <span>{paper.venue}</span>
          </div>
          <p className="text-lg">{paper.authors.join(", ")}</p>
        </div>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Abstract
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {paper.abstract}
            </p>
          </CardContent>
        </Card>

        {/* Research Gap Section */}
        {showGap && researchGap && (
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                <Lightbulb className="h-5 w-5" />
                Research Gaps & Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {researchGap.uniqueKeywords.length > 0 && (
                <div>
                  <p className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-2">
                    Unique Keywords (Novel to this paper):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {researchGap.uniqueKeywords.map((kw) => (
                      <Badge key={kw} variant="secondary" className="bg-blue-200 dark:bg-blue-800">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {researchGap.researchGaps.length > 0 && (
                <div>
                  <p className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-2">
                    Future Research Directions:
                  </p>
                  <ul className="space-y-2">
                    {researchGap.researchGaps.slice(0, 3).map((gap, idx) => (
                      <li
                        key={idx}
                        className="text-sm text-blue-900 dark:text-blue-100 flex gap-2"
                      >
                        <span className="font-bold">→</span>
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-xs text-blue-700 dark:text-blue-300">
                Cluster size: {researchGap.clusterSize} related papers
              </p>
            </CardContent>
          </Card>
        )}

        {/* Similar Papers Section */}
        {showSimilar && similarPapers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Similar Papers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {similarPapers.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => navigate(`/paper/${encodeURIComponent(p.id)}`)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{p.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {p.authors.slice(0, 2).join(", ")}
                          {p.authors.length > 2 ? " et al." : ""}
                        </p>
                      </div>
                      {p.similarity && (
                        <Badge variant="outline">
                          {Math.round(p.similarity * 100)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4 flex-wrap">
          <Button
            size="lg"
            className="flex-1 min-w-[200px]"
            onClick={() => navigate(`/graph/${id}`)}
          >
            <Network className="mr-2 h-5 w-5" />
            View Citation Graph
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="flex-1 min-w-[200px]"
            onClick={loadResearchGap}
            disabled={gapLoading}
          >
            <Lightbulb className="mr-2 h-5 w-5" />
            {gapLoading ? "Analyzing..." : "Research Gaps"}
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="flex-1 min-w-[200px]"
            onClick={loadSimilarPapers}
          >
            <Zap className="mr-2 h-5 w-5" />
            Find Similar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaperDetails;

