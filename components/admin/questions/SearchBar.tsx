// components/admin/questions/SearchBar.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  handleSearch: () => void;
}

const SearchBar = ({ searchTerm, setSearchTerm, handleSearch }: SearchBarProps) => {
  return (
    <div className="flex-1 flex gap-2">
      <Input
        placeholder="Search questions..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSearch();
          }
        }}
        className="pl-10 w-full border-ink text-ink placeholder:text-ink-500 focus:border-ink focus:ring-ink"
      />
      <Button onClick={handleSearch} variant="secondary" size="icon" className="bg-neutral-50">
        <Search className="h-4 w-4 text-ink-500"  />
      </Button>
    </div>
  );
};

export default SearchBar;