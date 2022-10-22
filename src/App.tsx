import { useEffect, useRef, useState } from 'react';
import imgSample from './sample.jpg';
import { border, coloring, fill, patternLines ,threshold } from './8419';
import './App.css';

interface patternSettings {
  color?: string,
  lineWidth?: number,
  x?: number,
  y?: number,
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [patternRepeat, setPatternRepeat] = useState<string>('repeat');
  const [patternSettings, setPatternSettings] = useState<patternSettings>({
    color: 'white',
    lineWidth: 5, 
    x: 50, 
    y: 50,
  });


  useEffect(() => {
    const loadImage = () => {
      if(canvasRef.current) {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
        const image = new Image();
        image.src = imgSample;
        image.onload = () => {
          context?.drawImage(
            image, 0, 0, 760, 760);
          applyTreshold();
        };
      }
    }

    loadImage();
  }, []);


  const apply = (filter: (imageData: ImageData) => Uint8ClampedArray) => {
    if(canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas?.getContext('2d');
      const imageData = context?.getImageData(0, 0, 760, 7600);
      if (imageData) {
        const newImageData = filter(imageData);
        imageData.data.set(newImageData);
        context?.putImageData(imageData, 0, 0);
      };
    };
  };

  const applyFill = () => apply(fill);
  const appyColoring = () => apply(coloring);
  const applyTreshold = () => apply((imageData) => threshold(imageData, 60));
  const applyBorder = () => apply(border);

  const createPattern = () => {
    const lines = patternLines(patternSettings);
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    const pattern = context?.createPattern(lines, patternRepeat);
    if (context && pattern && canvas) {
      context.fillStyle = pattern;
      context.fillRect(0, 0, canvas.width, canvas.height);
    };
  };

  return (
    <div className="App">
      <div className="workbench">
        <canvas
          className="main-canvas"
          height={760}
          width={760}
          ref={canvasRef}
        />
        <div className="toolbar">
          <button onClick={applyTreshold}>Threshold </button>
          <button onClick={applyFill}> Fill </button>
          <button onClick={appyColoring}> Coloring </button>
          <button onClick={applyBorder}> Border </button>
          <div className='vertical'>
            <button onClick={createPattern}> Pattern </button>
            <select onChange={(e) => setPatternRepeat(e.target.value)} value={patternRepeat}>
              <option value="repeat">repeat</option>
              <option value="repeat-x">repeat-x</option>
              <option value="repeat-y">repeat-y</option>
              <option value="no-repeat">no-repeat</option>
            </select>
          </div>
        </div>
        <div className='pattern-settings'>
          <div className='row'>
            <label>Line width</label>
            <input
              type="number"
              onChange={(e) => setPatternSettings({...patternSettings, lineWidth: Number(e.target.value)})}
              value={patternSettings.lineWidth}
            />
          </div>
          <div className='row'>
            <label>X</label>
            <input
              type="number"
              onChange={(e) => setPatternSettings({...patternSettings, x: Number(e.target.value)})}
              value={patternSettings.x}
            />
          </div>
          <div className='row'>
            <label>Y</label>
            <input
              type="number"
              onChange={(e) => setPatternSettings({...patternSettings, y: Number(e.target.value)})}
              value={patternSettings.y}
            />
          </div>
          <div>
            <select onChange={(e) => setPatternSettings({...patternSettings, color: e.target.value})}>
              <option value="white">white</option>
              <option value="blue">blue</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;