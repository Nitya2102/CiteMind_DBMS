import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Network, FileText, ArrowLeft } from "lucide-react";

interface MetaPaper {
  _id: string;
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

const PaperDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Decode URL-encoded IDs like hep-th%2F9801234 → hep-th/9801234
  const decodedId = decodeURIComponent(id || "");

  const [paper, setPaper] = useState<FullPaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        console.log("Looking for ID:", decodedId);
        console.log("First 3 meta papers:", metaData.slice(0, 3));

        // Filter out entries that only have a year field (corrupted data)
        const validMeta = metaData.filter((p) => p.paper_id && p.title);

        // Find paper by paper_id or _id
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

        <div className="flex gap-4">
          <Button
            size="lg"
            className="flex-1"
            onClick={() => navigate(`/graph/${id}`)}
          >
            <Network className="mr-2 h-5 w-5" />
            View Citation Graph
          </Button>
          <Button size="lg" variant="outline" className="flex-1">
            <FileText className="mr-2 h-5 w-5" />
            Find Similar Papers
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaperDetails;

