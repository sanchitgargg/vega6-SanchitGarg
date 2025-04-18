import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import axios from 'axios';

const SearchBar = ({ query, setQuery, setImages }) => {
  const handleSearch = async () => {
    if (!query.trim()) {
      alert("Please enter a search term.");
      return;
    }

    try {
      const response = await axios.get(
        `https://pixabay.com/api/?key=49777574-6558a7e0ded36940f3b21122b&q=${encodeURIComponent(query)}&image_type=photo&per_page=12`
      );
      setImages(response.data.hits);
    } catch (error) {
      console.error('Error fetching images:', error);
      alert("There was an error fetching the images.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto mt-10">
      <input
        type="text"
        placeholder="Search images..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="bg-black w-full pl-4 pr-10 py-2 text-white placeholder-gray-400 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <MagnifyingGlassIcon
        onClick={handleSearch}
        className="w-5 h-5 text-white absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
      />
    </div>
  );
};

export default SearchBar;
