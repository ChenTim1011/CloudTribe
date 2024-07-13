import React from 'react';
import { Input } from 'shadcn-ui';

type SearchBarProps = {
  onSearch: (query: string) => void;
};

/**
 * A search bar component.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Function} props.onSearch - The callback function to be called when the search value changes.
 * @returns {JSX.Element} The rendered search bar component.
 */
const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const query = (e.target as any).elements.search.value;
        onSearch(query);
      };
    
    
    return (
        <form className="search-bar">
            <input
                type="text" name="search" 
                placeholder="搜尋您要的商品"/>
                <button type="submit">搜尋</button>
        </form>
    );
};

export default SearchBar;
