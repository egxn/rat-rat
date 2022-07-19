import React, { useEffect, useRef } from 'react';
import imgSample from './sample.jpg';
import { border, coloring, fill, threshold } from './8419';
import './App.css';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const loadImage = () => {
      if(canvasRef.current) {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
        const image = new Image();
        image.src = imgSample;
        image.onload = () => {
          context?.drawImage(
            image, 0, 0, 400, 400);
        };
      }
    }

    loadImage();
  }, []);


  const apply = (filter: (imageData: ImageData) => Uint8ClampedArray) => {
    if(canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas?.getContext('2d');
      const imageData = context?.getImageData(0, 0, 400, 400);
      if (imageData) {
        const newImageData = filter(imageData);
        imageData.data.set(newImageData);
        context?.putImageData(imageData, 0, 0);
      }
    }
  }

  const applyFill = () => apply(fill);
  const appyColoring = () => apply(coloring);
  const applyTreshold = () => apply((imageData) => threshold(imageData, 60));
  const applyBorder = () => apply(border);

  return (
    <div className="App">
      <div className="workbench">
        <canvas
          className="main-canvas"
          height={400}
          width={400}
          ref={canvasRef}
        />
        <div className="toolbar">
          <button onClick={applyTreshold}>Threshold </button>
          <button onClick={applyFill}> Fill </button>
          <button onClick={appyColoring}> Coloring </button>
          <button onClick={applyBorder}> Border </button>
        </div>
      </div>
    </div>
  );
}

export default App;