import { useCallback, useEffect, useRef, useState } from 'react';
import imgSample from './sample.jpg';
import { border, coloring, fill, hastTwoColors, getPatches ,patternLines ,threshold } from './8419';
import './App.css';

interface patternSettings {
  color?: string,
  height?: number,
  lineWidth?: number,
  startX?: number,
  startY?: number,
  width?: number,
  x?: number,
  y?: number,
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [patternRepeat, setPatternRepeat] = useState<string>('repeat');
  const [patternSettings, setPatternSettings] = useState<patternSettings>({
    color: 'white',
    height: 50,
    lineWidth: 5,
    startX: 0,
    startY: 0,
    width: 50,
    x: 50, 
    y: 50,
  });


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

  const applyTreshold = useCallback(() => apply((imageData) => threshold(imageData, 60)), []);

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
  }, [applyTreshold]);

  const applyFill = () => apply(fill);
  const appyColoring = () => apply(coloring);
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

  const getChunks = async () => {
    if(canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas?.getContext('2d');
      const imageData = context?.getImageData(0, 0, 760, 760);

      if (imageData && hastTwoColors(imageData)) {
        const patches = await getPatches(imageData, 760);
        const px = new Uint8ClampedArray(imageData.data);

        patches.forEach((patch) => {
          const newR = Math.floor(Math.random() * 256);
          const newG = Math.floor(Math.random() * 256);
          const newB = Math.floor(Math.random() * 256);
          patch.forEach((pixel) => {
            const [r, g, b]: number[] = pixel;
            px[`${r}`] = newR;
            px[`${g}`] = newG;
            px[`${b}`] = newB;
          });

          imageData.data.set(px);
          context?.putImageData(imageData, 0, 0);
        });
        console.log({patches});
      };
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
          <button onClick={getChunks}>Chunks</button>
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
              onChange={(e) => setPatternSettings({...patternSettings, lineWidth: Number(e.target.value)})}
              value={patternSettings.lineWidth}
              type="number"
            />
          </div>
          <div className='row'>
            <label>Start X</label>
            <input
              max={patternSettings.width}
              onChange={(e) => setPatternSettings({...patternSettings, startX: Number(e.target.value)})}
              value={patternSettings.startX}
              type="number"
            />
          </div>
          <div className='row'>
            <label>Start Y</label>
            <input
              max={patternSettings.height}
              onChange={(e) => setPatternSettings({...patternSettings, startY: Number(e.target.value)})}
              value={patternSettings.startY}
              type="number"
            />
          </div>
          <div className='row'>
            <label>X</label>
            <input
              max={patternSettings.width}
              onChange={(e) => setPatternSettings({...patternSettings, x: Number(e.target.value)})}
              value={patternSettings.x}
              type="number"
            />
          </div>
          <div className='row'>
            <label>Y</label>
            <input
              max={patternSettings.height}
              onChange={(e) => setPatternSettings({...patternSettings, y: Number(e.target.value)})}
              value={patternSettings.y}
              type="number"
            />
          </div>
          <div className='row'>
            <label>Width</label>
            <input
              onChange={(e) => setPatternSettings({...patternSettings, width: Number(e.target.value)})}
              value={patternSettings.width}
              type="number"
            />
          </div>
          <div className='row'>
            <label>Height</label>
            <input
              onChange={(e) => setPatternSettings({...patternSettings, height: Number(e.target.value)})}
              value={patternSettings.height}
              type="number"
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