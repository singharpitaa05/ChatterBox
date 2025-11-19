// USER SEARCH COMPONENT

import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { searchUsers } from '../services/userService';

const UserSearch = ({ onUserSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Handle search input
  const handleSearch = async (searchQuery) => {
    setQuery(searchQuery);

    // Clear results if query is empty
    if (!searchQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    // Perform search
    setLoading(true);
    setIsOpen(true);
    const result = await searchUsers(searchQuery.trim());
    setLoading(false);

    if (result.success) {
      setResults(result.data);
    } else {
      setResults([]);
    }
  };

  // Handle user selection
  const handleSelectUser = (user) => {
    onUserSelect(user);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  // Clear search
  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search users by username or email..."
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          {loading ? (
            // Loading state
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            // Results list
            <div>
              {results.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleSelectUser(user)}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition"
                >
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{user.username}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <div>
                    <span
                      className={`inline-block w-3 h-3 rounded-full ${
                        user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    ></span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // No results
            <div className="p-4 text-center text-gray-500">
              <p>No users found matching "{query}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSearch;