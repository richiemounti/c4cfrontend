// components/support/SearchBar.tsx
import { FC, useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

const SearchBar: FC<SearchBarProps> = ({ 
  placeholder = "Describe your issue",
  onSearch
}) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-stratosphere/50" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-2 border border-sky rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </form>
  );
};

export default SearchBar;