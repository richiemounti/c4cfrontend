  // components/admin/taxonomy/TaxonomySearchBar.tsx
  import React, { useState } from 'react';
  import { Search } from 'lucide-react';
  import { Input } from '@/components/ui/input';
  import { Button } from '@/components/ui/button';

  interface TaxonomySearchBarProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    handleSearch: () => void;
    placeholder?: string;
  }

  const TaxonomySearchBar: React.FC<TaxonomySearchBarProps> = ({
    searchTerm,
    setSearchTerm,
    handleSearch,
    placeholder = "Search..."
  }) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    };

    return (
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-ink-500" />
        </div>
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e: any) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-10 w-full border-ink text-ink placeholder:text-ink-500 focus:border-ink focus:ring-ink"
        />
        <Button 
          type="button" 
          onClick={handleSearch}
          variant="ghost" 
          className="absolute inset-y-0 right-0 px-3 text-ink hover:bg-ink hover:text-white"
        >
          Search
        </Button>
      </div>
    );
  };

  export default TaxonomySearchBar;