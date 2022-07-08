import React, { useEffect, useRef } from 'react';
import imgSample from './sample.jpg';
import { threshold } from './8419';
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


  const applyTreshold = () => {      
    console.log("TRSHLD")
    if(canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas?.getContext('2d'); 
      const imageData = context?.getImageData(0, 0, 400, 400);
      if (imageData) {
        const thresholdImageData = threshold(imageData, 60);
        context?.putImageData(thresholdImageData, 0, 0);
      }
    }
  };

  return (
    <div className="App">    
      <div className="workbench">
        <canvas
          className="main-canvas"
          height={400}
          width={400}
          ref={canvasRef}
        />
        <button onClick={applyTreshold}> Apply threshold </button>
      </div>
    </div>
  );
}

export default App;
