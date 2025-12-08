import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export interface FilterState {
  years: string[];
  topics: string[];
}

interface FilterSidebarProps {
  yearRanges: string[];     // e.g., "2021–2025", "2016–2020"
  topicKeys: string[];      // actual arXiv category keys
  topicMap: Record<string, string>;
  filters: FilterState;
  onChange: (updated: FilterState) => void;
}

export const FilterSidebar = ({
  yearRanges,
  topicKeys,
  topicMap,
  filters,
  onChange,
}: FilterSidebarProps) => {
  
  const toggle = (group: keyof FilterState, value: string) => {
    const updated = { ...filters };
    updated[group] = updated[group].includes(value)
      ? updated[group].filter((x) => x !== value)
      : [...updated[group], value];
    onChange(updated);
  };

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="text-lg">Filters</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">

        {/* YEAR RANGE FILTER */}
        <div>
          <h3 className="font-medium mb-3">Year Range</h3>
          <div className="space-y-3">
            {yearRanges.map((range) => (
              <div key={range} className="flex items-center space-x-2">
                <Checkbox
                  id={`year-${range}`}
                  checked={filters.years.includes(range)}
                  onCheckedChange={() => toggle("years", range)}
                />
                <Label
                  htmlFor={`year-${range}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {range}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* TOPIC FILTER */}
        <div>
          <h3 className="font-medium mb-3">Topics</h3>
          <div className="space-y-3">
            {topicKeys.map((key) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={`topic-${key}`}
                  checked={filters.topics.includes(key)}
                  onCheckedChange={() => toggle("topics", key)}
                />
                <Label
                  htmlFor={`topic-${key}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {topicMap[key]}
                </Label>
              </div>
            ))}
          </div>
        </div>

      </CardContent>
    </Card>
  );
};


