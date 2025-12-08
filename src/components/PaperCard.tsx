import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  year: number;
  venue: string;
  relevanceScore?: number;
  topics?: string[];
}

interface PaperCardProps {
  paper: Paper;
}

export const PaperCard = ({ paper }: PaperCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-serif font-semibold mb-2 group-hover:text-primary transition-colors">
              {paper.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {paper.authors.join(", ")}
            </p>
          </div>
          {paper.relevanceScore && (
            <Badge variant="outline" className="shrink-0">
              {Math.round(paper.relevanceScore * 100)}% match
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{paper.year}</span>
            <span>•</span>
            <span>{paper.venue}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
            onClick={() => navigate(`/paper/${paper.id}`)}
          >
            View Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        {paper.topics && paper.topics.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {paper.topics.map((topic) => (
              <Badge key={topic} variant="secondary" className="text-xs">
                {topic}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
