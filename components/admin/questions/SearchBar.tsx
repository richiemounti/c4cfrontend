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
        className="pl-10 w-full border-stratosphere text-stratosphere placeholder:text-stratosphere-500 focus:border-stratosphere focus:ring-stratosphere"
      />
      <Button onClick={handleSearch} variant="secondary" size="icon" className="bg-sky-50">
        <Search className="h-4 w-4 text-stratosphere-500"  />
      </Button>
    </div>
  );
};

export default SearchBar;