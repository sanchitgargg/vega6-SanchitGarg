import React, { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fabric } from "fabric";

const CanvasEditor = ({ images }) => {
  const { imageId } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const imageLoadedRef = useRef(false);

  // Find the selected image by ID
  const selectedImage = images.find((image) => image.id.toString() === imageId);

  useEffect(() => {
    // Initialize canvas only once
    if (!fabricCanvasRef.current && canvasRef.current) {
      fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
        backgroundColor: "#f0f0f0", // Light gray background for canvas
      });
    }

    // If image is loaded, set the canvas size and add the image
    if (fabricCanvasRef.current && selectedImage && !imageLoadedRef.current) {
      imageLoadedRef.current = true;

      fabricCanvasRef.current.clear(); // Clear anything that was on the canvas

      fabric.Image.fromURL(
        selectedImage.webformatURL,
        (img) => {
          if (!img) {
            console.error("Failed to load image");
            imageLoadedRef.current = false;
            return;
          }

          // Resize the canvas to fit the image
          fabricCanvasRef.current.setWidth(img.width);
          fabricCanvasRef.current.setHeight(img.height);

          // Scale the image to fit in the canvas
          const scale = Math.min(
            fabricCanvasRef.current.getWidth() / img.width,
            fabricCanvasRef.current.getHeight() / img.height
          ) * 0.8;
          img.scale(scale);

          img.set({
            selectable: false, // Don't allow selecting the background image
          });

          fabricCanvasRef.current.add(img); // Add image to canvas
          fabricCanvasRef.current.centerObject(img); // Center the image
          fabricCanvasRef.current.sendToBack(img); // Keep image at the back
          fabricCanvasRef.current.renderAll();
        },
        { crossOrigin: "anonymous" }
      );
    }

    // Ensure elements are always on top of the image
    fabricCanvasRef.current?.on('object:selected', (e) => {
      const selectedObject = e.target;
      if (selectedObject && selectedObject !== fabricCanvasRef.current.getObjects()[0]) {
        fabricCanvasRef.current.bringToFront(selectedObject); // Move selected object on top
      }
    });

    return () => {
      // Clean up the canvas when component is unmounted
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
        imageLoadedRef.current = false;
      }
    };
  }, [selectedImage]);

  const handleBack = () => {
    navigate("/"); // Navigate back to the main page
  };

  const handleDownload = () => {
    if (!fabricCanvasRef.current) {
      console.error("Canvas is not ready");
      alert("Canvas is not initialized");
      return;
    }

    try {
      fabricCanvasRef.current.renderAll();
      const dataURL = fabricCanvasRef.current.toDataURL({
        format: "png",
        quality: 1.0,
        multiplier: 1,
      });

      if (!dataURL || dataURL === "data:,") {
        console.error("Failed to generate image");
        alert("Failed to generate image");
        return;
      }

      const link = document.createElement("a");
      link.href = dataURL;
      link.download = `edited-image-${imageId}.png`; // Set the download file name
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download the image.");
    }
  };

  const addText = () => {
    if (!fabricCanvasRef.current) return;

    // Create a text box and add it to the canvas
    const text = new fabric.Textbox("Enter text", {
      left: 50,
      top: 50,
      width: 200,
      fontSize: 20,
      fill: "#000000",
      editable: true,
      selectable: true,
      hasControls: true,
    });

    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.bringToFront(text); // Ensure the text is above the image
    fabricCanvasRef.current.setActiveObject(text); // Select the text object
    fabricCanvasRef.current.renderAll();
  };

  const addShape = (shapeType) => {
    if (!fabricCanvasRef.current) return;

    let shape;
    // Create different shapes based on the type selected
    switch (shapeType) {
      case "triangle":
        shape = new fabric.Triangle({
          left: 50,
          top: 50,
          width: 50,
          height: 50,
          fill: "blue",
          selectable: true,
          hasControls: true,
        });
        break;
      case "circle":
        shape = new fabric.Circle({
          left: 50,
          top: 50,
          radius: 25,
          fill: "red",
          selectable: true,
          hasControls: true,
        });
        break;
      case "rectangle":
        shape = new fabric.Rect({
          left: 50,
          top: 50,
          width: 80,
          height: 50,
          fill: "green",
          selectable: true,
          hasControls: true,
        });
        break;
      case "pentagon":
        shape = new fabric.Polygon(
          [
            { x: 25, y: 0 }, // Top
            { x: 50, y: 20 }, // Top-right
            { x: 40, y: 50 }, // Bottom-right
            { x: 10, y: 50 }, // Bottom-left
            { x: 0, y: 20 }, // Top-left
          ],
          {
            left: 50,
            top: 50,
            fill: "purple",
            selectable: true,
            hasControls: true,
          }
        );
        break;
      default:
        return;
    }

    fabricCanvasRef.current.add(shape);
    fabricCanvasRef.current.bringToFront(shape); // Bring shape above the background image
    fabricCanvasRef.current.setActiveObject(shape); // Select the newly added shape
    fabricCanvasRef.current.renderAll();
  };

  const handleDelete = () => {
    if (!fabricCanvasRef.current) {
      console.error("Canvas is not initialized");
      return;
    }

    const activeObject = fabricCanvasRef.current.getActiveObject();
    if (activeObject) {
      // Check if it's the background image (we don't want to delete the image)
      const objects = fabricCanvasRef.current.getObjects();
      if (objects.length > 0 && objects[0] === activeObject) {
        console.log("Cannot delete background image");
        alert("Cannot delete the background image");
        return;
      }

      fabricCanvasRef.current.remove(activeObject); // Remove selected object
      fabricCanvasRef.current.discardActiveObject(); // Deselect the object
      fabricCanvasRef.current.renderAll();
    } else {
      console.log("No object selected");
      alert("Please select an element to delete");
    }
  };

  if (!selectedImage) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white">
          Image not found.{" "}
          <button onClick={handleBack} className="text-blue-500 underline">
            Go back
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6">
        {/* Canvas Section */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Edit Image</h2>
            <div className="space-x-4">
              <button
                onClick={handleDownload}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Download
              </button>
              <button
                onClick={handleBack}
                className="text-blue-500 hover:text-blue-700"
              >
                Back to Search
              </button>
            </div>
          </div>
          <canvas ref={canvasRef} className="border border-gray-300 w-full" />
        </div>

        {/* Control Panel */}
        <div className="w-full md:w-64 bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">
            Add Elements
          </h3>
          <div className="space-y-2">
            <button
              onClick={addText}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Add Text
            </button>
            <button
              onClick={() => addShape("triangle")}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Add Triangle
            </button>
            <button
              onClick={() => addShape("circle")}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Add Circle
            </button>
            <button
              onClick={() => addShape("rectangle")}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Add Rectangle
            </button>
            <button
              onClick={() => addShape("pentagon")}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Add Pentagon
            </button>

            <hr className="border-gray-600 my-3" />

            <button
              onClick={handleDelete}
              className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Delete Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasEditor;
