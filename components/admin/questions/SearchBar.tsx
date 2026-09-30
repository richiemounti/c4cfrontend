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
        className="pl-10 w-full border-c4c-rule text-black placeholder:text-c4c-petrol focus:border-c4c-petrol focus:ring-c4c-petrol"
      />
      <Button onClick={handleSearch} variant="secondary" size="icon" className="bg-c4c-grey-bg">
        <Search className="h-4 w-4 text-black"  />
      </Button>
    </div>
  );
};

export default SearchBar;