import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Myinfo from './components/Myinfo';
import SearchBar from './components/SearchBar';
import Images from './components/Images';
import CanvasEditor from './components/CanvasEditor';

const App = () => {
  const [query, setQuery] = useState('');
  const [images, setImages] = useState([]);

  return (
    <Router>
      <div className="min-h-screen bg-black">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Myinfo />
                <SearchBar query={query} setQuery={setQuery} setImages={setImages} />
                <Images images={images} />
              </>
            }
          />
          <Route path="/canvas/:imageId" element={<CanvasEditor images={images} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
