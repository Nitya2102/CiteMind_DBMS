import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeTypes,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface MetaPaper {
  paper_id: string;
  title: string;
  authors: string[];
  year: number;
}

interface CitationContext {
  label: "background" | "extend" | "contrast" | "support";
}

const CustomNode = ({ data }: { data: any }) => {
  const getBadgeColor = () => {
    switch (data.type) {
      case "Paper":
        return "default";
      case "Author":
        return "secondary";
      case "Citation":
        return "outline";
      default:
        return "default";
    }
  };

  const getNodeColor = () => {
    switch (data.intentLabel) {
      case "extend":
        return "bg-blue-100 dark:bg-blue-900";
      case "contrast":
        return "bg-red-100 dark:bg-red-900";
      case "support":
        return "bg-green-100 dark:bg-green-900";
      case "background":
        return "bg-gray-100 dark:bg-gray-800";
      default:
        return "bg-card";
    }
  };

  return (
    <div
      className={`px-6 py-3 shadow-xl rounded-xl border-2 border-primary/20 min-w-[200px] hover:shadow-2xl hover:border-primary/40 transition-all cursor-move ${getNodeColor()}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="font-semibold text-base text-foreground">
          {data.label}
        </div>
        <Badge variant={getBadgeColor()} className="text-xs shrink-0">
          {data.type}
        </Badge>
      </div>
      {data.year && (
        <div className="text-sm text-muted-foreground mt-2 font-medium">
          {data.year}
        </div>
      )}
      {data.intentLabel && (
        <div className="text-xs text-muted-foreground mt-1 capitalize">
          {data.intentLabel}
        </div>
      )}
    </div>
  );
};

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

const getEdgeColor = (intent: string) => {
  switch (intent) {
    case "extend":
      return "#3b82f6"; // blue
    case "contrast":
      return "#ef4444"; // red
    case "support":
      return "#22c55e"; // green
    case "background":
      return "#8b5cf6"; // purple
    default:
      return "#6b7280"; // gray
  }
};

const KnowledgeGraph = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [mainPaper, setMainPaper] = useState<MetaPaper | null>(null);

  useEffect(() => {
    const buildGraph = async () => {
      try {
        const metaRes = await fetch("/CiteMind.Paper_MetaData.json");
        const citationContextRes = await fetch(
          "/CiteMind.citation_context.json"
        );

        const metaData: MetaPaper[] = await metaRes.json();
        const citationContexts: CitationContext[] = await citationContextRes.json();

        // Find the main paper
        const main = metaData.find((p) => p.paper_id === id);
        if (!main) {
          setLoading(false);
          return;
        }

        setMainPaper(main);

        // Create center node for main paper
        const centerNode: Node = {
          id: `paper-${main.paper_id}`,
          type: "custom",
          position: { x: 400, y: 50 },
          data: {
            label: main.title.substring(0, 50) + "...",
            type: "Paper",
            year: main.year,
            intentLabel: "main",
          },
        };

        const generatedNodes: Node[] = [centerNode];
        const generatedEdges: Edge[] = [];

        // Add author nodes
        main.authors.forEach((author, idx) => {
          const authorId = `author-${author}`;
          generatedNodes.push({
            id: authorId,
            type: "custom",
            position: {
              x: 100 + idx * 80,
              y: 250,
            },
            data: {
              label: author,
              type: "Author",
            },
          });

          generatedEdges.push({
            id: `edge-${main.paper_id}-${author}`,
            source: `paper-${main.paper_id}`,
            target: authorId,
            label: "authored by",
            animated: false,
            style: {
              stroke: "#a78bfa",
              strokeWidth: 2,
            },
            labelStyle: { fill: "hsl(var(--foreground))", fontWeight: 600 },
            labelBgStyle: { fill: "hsl(var(--card))" },
          });
        });

        // Add citation papers with context from CiteMind.citation_context.json
        const citationsToShow = Math.min(8, citationContexts.length);
        citationContexts.slice(0, citationsToShow).forEach((context, idx) => {
          const relatedPaper = metaData[idx];
          if (!relatedPaper) return;

          const citationId = `paper-${relatedPaper.paper_id}`;
          const angle = (idx / citationsToShow) * 2 * Math.PI;
          const radius = 300;

          generatedNodes.push({
            id: citationId,
            type: "custom",
            position: {
              x: 400 + radius * Math.cos(angle),
              y: 50 + radius * Math.sin(angle),
            },
            data: {
              label: relatedPaper.title.substring(0, 40) + "...",
              type: "Citation",
              year: relatedPaper.year,
              intentLabel: context.label,
            },
          });

          generatedEdges.push({
            id: `edge-${main.paper_id}-${relatedPaper.paper_id}`,
            source: `paper-${main.paper_id}`,
            target: citationId,
            label: context.label,
            animated: context.label === "extend",
            style: {
              stroke: getEdgeColor(context.label),
              strokeWidth: 2,
            },
            labelStyle: { fill: "hsl(var(--foreground))", fontWeight: 600 },
            labelBgStyle: { fill: "hsl(var(--card))" },
          });
        });

        setNodes(generatedNodes);
        setEdges(generatedEdges);
      } catch (err) {
        console.error("Failed to build graph:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      buildGraph();
    }
  }, [id, setNodes, setEdges]);

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-lg">Loading citation graph...</div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] p-4">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="h-[calc(100%-3rem)] grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 border rounded-lg overflow-hidden bg-card">
          {nodes.length > 0 ? (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              nodesDraggable={true}
              nodesConnectable={false}
              elementsSelectable={true}
              fitView
              minZoom={0.3}
              maxZoom={2}
            >
              <Background gap={16} size={1} color="hsl(var(--border))" />
              <Controls />
              <MiniMap
                nodeColor="hsl(var(--primary))"
                maskColor="hsl(var(--muted) / 0.8)"
                style={{ backgroundColor: "hsl(var(--card))" }}
              />
            </ReactFlow>
          ) : (
            <div className="flex items-center justify-center h-full">
              No citation data available
            </div>
          )}
        </div>

        <div className="space-y-4">
          {mainPaper && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Paper Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-semibold text-sm">{mainPaper.title}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {mainPaper.authors.join(", ")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Year: {mainPaper.year}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Citation Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm">Extends</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm">Contrast</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm">Support</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-sm">Background</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Instructions</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Drag nodes to explore connections.</p>
              <p>Scroll to zoom in/out.</p>
              <p>Center node is the main paper.</p>
              <p>Connected papers show citation relationships.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraph;