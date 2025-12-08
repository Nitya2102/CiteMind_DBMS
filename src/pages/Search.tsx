import { useEffect, useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { FilterSidebar } from "@/components/FilterSidebar";
import { PaperCard, Paper } from "@/components/PaperCard";
import { useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface NLPOutput {
  summary: string;
  keywords: string[];
  fields: string[];
  novelty: string;
  related_work: string[];
}

interface MetaPaper {
  paper_id: string;
  title: string;
  authors: string[];
  year: number;
  selected_category: string;
}

interface NLPData {
  paper_id: string;
  nlp_output: NLPOutput;
}

const CATEGORY_MAP: Record<string, string> = {
  "astro-ph": "Astrophysics",
  "astro-ph.CO": "Cosmology",
  "astro-ph.GA": "Astrophysics of Galaxies",
  "astro-ph.HE": "High Energy Astrophysical Phenomena",
  "astro-ph.SR": "Solar and Stellar Astrophysics",
  "cond-mat.mes-hall": "Mesoscale & Nanoscale Physics",
  "cond-mat.mtrl-sci": "Materials Science",
  "cond-mat.stat-mech": "Statistical Mechanics",
  "cond-mat.str-el": "Strongly Correlated Electrons",
  "cs.CL": "NLP (Computation & Language)",
  "cs.CV": "Computer Vision",
  "cs.IT": "Information Theory",
  "cs.LG": "Machine Learning",
  "cs.RO": "Robotics",
  "gr-qc": "General Relativity & Cosmology",
  "hep-ph": "High Energy Physics – Phenomenology",
  "hep-th": "High Energy Physics – Theory",
  "math.AG": "Algebraic Geometry",
  "math.AP": "PDEs",
  "math.CO": "Combinatorics",
  "math.NT": "Number Theory",
  "math.OC": "Optimization & Control",
  "math.PR": "Probability",
  "nucl-th": "Nuclear Theory",
  "quant-ph": "Quantum Physics",
};

const yearRanges = [
  "2021–2025",
  "2016–2020",
  "2011–2015",
  "2000–2010",
  "Earlier",
];

const classifyYear = (year: number): string => {
  if (year >= 2021) return "2021–2025";
  if (year >= 2016) return "2016–2020";
  if (year >= 2011) return "2011–2015";
  if (year >= 2000) return "2000–2010";
  return "Earlier";
};

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    years: [] as string[],
    topics: [] as string[],
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const metaRes = await fetch("/CiteMind.Paper_MetaData.json");
        const nlpRes = await fetch("/CiteMind.nlp_output.json");

        const metaData: MetaPaper[] = await metaRes.json();
        const nlpData: NLPData[] = await nlpRes.json();

        // Create a map of paper_id to NLP output for quick lookup
        const nlpMap = new Map<string, NLPOutput>();
        nlpData.forEach((item) => {
          nlpMap.set(item.paper_id, item.nlp_output);
        });

        const processed: Paper[] = metaData.map((m) => {
          const nlp = nlpMap.get(m.paper_id);
          return {
            id: m.paper_id,
            title: m.title,
            authors: m.authors,
            year: m.year,
            venue: CATEGORY_MAP[m.selected_category] || "Unknown",
            topics: nlp?.fields || [m.selected_category],
            relevanceScore: Math.random(),
          };
        });

        setPapers(processed);
      } catch (e) {
        console.error("Error loading papers:", e);
      }
      setLoading(false);
    };

    loadData();
  }, []);

  const applyFilters = (p: Paper) => {
    let inYear = true;
    if (filters.years.length > 0) {
      const yr = classifyYear(p.year);
      inYear = filters.years.includes(yr);
    }

    let inTopic = true;
    if (filters.topics.length > 0) {
      inTopic = filters.topics.some((t) => p.topics?.includes(t));
    }

    return inYear && inTopic;
  };

  const filteredPapers = papers
    .filter(applyFilters)
    .filter((p) =>
      query
        ? p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.authors.some((a) => a.toLowerCase().includes(query.toLowerCase()))
        : true
    );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 space-y-4">
        <div className="flex items-center gap-2">
          <SearchBar
            key={query || "searchbar"}
            defaultValue={query}
            onSearch={(q) => {
              const trimmed = q.trim();
              if (trimmed) setSearchParams({ q: trimmed });
              else setSearchParams({});
            }}
          />

          {query && (
            <button
              type="button"
              className="ml-2 text-sm px-3 py-1 rounded-md border border-muted-foreground/30 hover:bg-muted"
              onClick={() => setSearchParams({})}
            >
              Clear
            </button>
          )}
        </div>

        {query && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Searching for:</span>
            <Badge variant="secondary">{query}</Badge>
            <span className="text-sm text-muted-foreground">
              • {filteredPapers.length} results
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <FilterSidebar
            yearRanges={yearRanges}
            topicKeys={Object.keys(CATEGORY_MAP)}
            topicMap={CATEGORY_MAP}
            filters={filters}
            onChange={setFilters}
          />
        </aside>

        <main className="lg:col-span-3 space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading papers...</p>
            </div>
          ) : filteredPapers.length > 0 ? (
            filteredPapers.map((p) => (
              <PaperCard key={p.id} paper={p} />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {query ? "No papers found matching your search." : "No papers available."}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Search;