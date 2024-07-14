import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

type SearchBarProps = {
  onSearch: (query: string) => void;
  className?: string; // add className prop
};

/**
 * A search bar component.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Function} props.onSearch - The callback function to be called when the search value changes.
 * @returns {JSX.Element} The rendered search bar component.
 */
const SearchBar: React.FC<SearchBarProps> = ({ onSearch, className }) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form className={`search-bar flex items-center ${className}`} onSubmit={handleSearch}>
      <Input
        type="text"
        name="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜尋您要的商品"
        className="flex-grow"
        
      />
      <Button type="submit" variant="outline" className="ml-2">
        <FontAwesomeIcon icon={faSearch} />
      </Button>
    </form>
  );
};

export default SearchBar;
