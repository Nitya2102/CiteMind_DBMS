import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  defaultValue?: string;
}

export const SearchBar = ({ onSearch, placeholder = "Search papers by concept, method, or finding...", defaultValue = "" }: SearchBarProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("search") as string;
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl">
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            name="search"
            type="text"
            placeholder={placeholder}
            defaultValue={defaultValue}
            className="pl-12 h-14 text-base bg-card border-2 focus-visible:ring-primary"
          />
        </div>
        <Button type="submit" size="lg" className="h-14 px-8">
          Search
        </Button>
      </div>
    </form>
  );
};
