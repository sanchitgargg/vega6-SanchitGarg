import React from 'react';
import { useNavigate } from 'react-router-dom';

const Images = ({ images }) => {
  const navigate = useNavigate();

  const handleAddCaption = (imageId) => {
    navigate(`/canvas/${imageId}`);
  };

  return (
    <div className="mt-10 flex flex-wrap gap-5 justify-center px-4">
      {images.length === 0 ? (
        <p className="text-gray-400 text-center">No images found. Try searching!</p>
      ) : (
        images.map((image, index) => (
          <div key={index} className="rounded overflow-hidden shadow-md">
            <img
              src={image.webformatURL}
              alt={image.tags}
              className="w-64 h-48 object-cover rounded-md"
            />
            <div className="text-center mt-2">
              <button
                onClick={() => handleAddCaption(image.id)}
                className="bg-white text-black px-4 py-1 rounded mt-4 hover:underline cursor-pointer"
              >
                Add Caption
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Images;
