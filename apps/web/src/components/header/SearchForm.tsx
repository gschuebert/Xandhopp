'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'country' | 'feature' | 'guide';
  url: string;
}

interface SearchFormProps {
  locale: string;
}

export function SearchForm({ locale }: SearchFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery('');
        setResults([]);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          setIsOpen(false);
          setQuery('');
          setResults([]);
          setSelectedIndex(-1);
          break;
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => 
            prev < results.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          event.preventDefault();
          if (selectedIndex >= 0 && results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, results]);

  const searchMeilisearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          locale,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      searchMeilisearch(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleResultClick = (result: SearchResult) => {
    window.location.href = result.url;
    setIsOpen(false);
    setQuery('');
    setResults([]);
    setSelectedIndex(-1);
  };

  const handleSearchToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
      setSelectedIndex(-1);
    }
  };

  return (
    <div ref={searchRef} className="relative">
      {/* Search Button */}
      <button
        onClick={handleSearchToggle}
        className="p-2 text-xandhopp-blue hover:text-xandhopp-orange transition-colors"
        aria-label="Search"
      >
        <Search className="w-5 h-5" />
      </button>

      {/* Search Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Search Input */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder="Search countries, features, guides..."
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-xandhopp-orange focus:border-transparent outline-none"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              {query && (
                <button
                  onClick={() => {
                    setQuery('');
                    setResults([]);
                    setSelectedIndex(-1);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-xandhopp-orange mx-auto"></div>
                <p className="mt-2">Searching...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                      index === selectedIndex ? 'bg-gray-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-2 h-2 rounded-full ${
                          result.type === 'country' ? 'bg-blue-500' :
                          result.type === 'feature' ? 'bg-green-500' :
                          'bg-purple-500'
                        }`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {result.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {result.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 capitalize">
                          {result.type}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : query ? (
              <div className="p-4 text-center text-gray-500">
                <p>No results found for "{query}"</p>
                <p className="text-xs mt-1">Try different keywords</p>
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p>Start typing to search...</p>
                <p className="text-xs mt-1">Search countries, features, and guides</p>
              </div>
            )}
          </div>

          {/* Search Tips */}
          {!query && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-600 mb-2">Search tips:</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-white rounded text-xs text-gray-600">countries</span>
                <span className="px-2 py-1 bg-white rounded text-xs text-gray-600">visa</span>
                <span className="px-2 py-1 bg-white rounded text-xs text-gray-600">cost of living</span>
                <span className="px-2 py-1 bg-white rounded text-xs text-gray-600">taxes</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
