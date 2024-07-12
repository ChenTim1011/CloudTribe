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
    return (
        <div className="search-bar">
            <Input
                placeholder="搜尋您要的商品"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearch(e.target.value)}
            />
        </div>
    );
};

export default SearchBar;
