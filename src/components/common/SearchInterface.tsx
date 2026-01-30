'use client';

import React, { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

interface SearchResult {
  id: string;
  title: string;
  category: string;
  date: string;
  url: string;
}

interface SearchInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const SearchInterface = ({ isOpen, onClose, className = '' }: SearchInterfaceProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const mockResults: SearchResult[] = [
    {
      id: '1',
      title: 'Bitcoin Reaches New All-Time High Above $50,000',
      category: 'Markets',
      date: '2026-01-28',
      url: '/article-reader?id=1'
    },
    {
      id: '2',
      title: 'Ethereum 2.0 Staking Surpasses 10 Million ETH',
      category: 'DeFi',
      date: '2026-01-27',
      url: '/article-reader?id=2'
    },
    {
      id: '3',
      title: 'Solana Network Upgrade Improves Transaction Speed',
      category: 'Technology',
      date: '2026-01-26',
      url: '/article-reader?id=3'
    },
    {
      id: '4',
      title: 'Major Exchange Lists New DeFi Tokens',
      category: 'Markets',
      date: '2026-01-25',
      url: '/article-reader?id=4'
    }
  ];

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        const filtered = mockResults.filter(result =>
          result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(filtered);
        setIsLoading(false);
        setSelectedIndex(-1);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setSelectedIndex(-1);
    }
  }, [searchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < searchResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      window.location.href = searchResults[selectedIndex].url;
    }
  };

  const handleResultClick = (url: string) => {
    window.location.href = url;
    onClose();
  };

  const handleClear = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[1001] bg-background ${className}`}>
      <div className="flex items-start justify-center min-h-screen px-4 pt-20">
        <div className="w-full max-w-3xl">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute left-6 top-1/2 -translate-y-1/2">
              <Icon name="MagnifyingGlassIcon" size={24} className="text-muted-foreground" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search crypto news, markets, and analytics..."
              className="w-full h-16 pl-16 pr-16 text-lg bg-card text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary rounded-[4px]"
            />
            {searchQuery && (
              <button
                onClick={handleClear}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground transition-smooth"
                aria-label="Clear search"
              >
                <Icon name="XMarkIcon" size={20} />
              </button>
            )}
          </div>

          {/* Search Results */}
          {searchQuery.trim().length > 0 && (
            <div 
              ref={resultsRef}
              className="mt-4 bg-card border border-border shadow-lg max-h-[60vh] overflow-y-auto"
            >
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-muted-foreground font-caption">Searching...</div>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="divide-y divide-border">
                  {searchResults.map((result, index) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result.url)}
                      className={`w-full text-left px-6 py-4 transition-smooth ${
                        index === selectedIndex
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-medium font-heading mb-1 truncate">
                            {result.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs font-caption">
                            <span className={index === selectedIndex ? 'opacity-80' : 'text-primary'}>
                              {result.category}
                            </span>
                            <span className={index === selectedIndex ? 'opacity-60' : 'text-muted-foreground'}>
                              {new Date(result.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                        <Icon 
                          name="ArrowRightIcon" 
                          size={20} 
                          className={index === selectedIndex ? 'opacity-80' : 'text-muted-foreground'}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <Icon name="MagnifyingGlassIcon" size={48} className="text-muted-foreground mb-4" />
                  <p className="text-muted-foreground font-caption">
                    No results found for "{searchQuery}"
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try different keywords or browse our categories
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="mt-8 px-6 py-3 text-sm font-medium text-foreground hover:text-primary transition-smooth flex items-center gap-2"
          >
            <Icon name="XMarkIcon" size={20} />
            Close Search
          </button>

          {/* Keyboard Shortcuts Hint */}
          <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground font-caption">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-muted border border-border">↑↓</kbd>
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-muted border border-border">Enter</kbd>
              <span>Select</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-muted border border-border">Esc</kbd>
              <span>Close</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchInterface;
