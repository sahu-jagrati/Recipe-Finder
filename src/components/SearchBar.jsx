import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('name'); // 'name' | 'ingredient'

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) onSearch(trimmed, searchType);
  };

  return (
    <div className="search-wrapper">
      {/* Toggle: name vs ingredient */}
      <div className="search-type-tabs">
        <button
          type="button"
          className={`search-tab ${searchType === 'name' ? 'active' : ''}`}
          onClick={() => setSearchType('name')}
        >
          🔤 By Name
        </button>
        <button
          type="button"
          className={`search-tab ${searchType === 'ingredient' ? 'active' : ''}`}
          onClick={() => setSearchType('ingredient')}
        >
          🥕 By Ingredient
        </button>
      </div>

      {/* Search form */}
      <form className="search-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="search-input"
          placeholder={
            searchType === 'name'
              ? 'e.g. Pasta, Sushi, Biryani…'
              : 'e.g. Chicken, Garlic, Tomato…'
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="search-submit">
          <FiSearch size={18} />
          <span className="btn-label">Search</span>
        </button>
      </form>
    </div>
  );
}
