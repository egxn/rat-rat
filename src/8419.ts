function drawFilter(src: ImageData, filter: (r: number, g: number, b: number) => number[]): Uint8ClampedArray {
  const pixels = new Uint8ClampedArray(src.data);
  for (let i = 0; i < src.data.length; i += 4) {
    const [r, g, b] = filter(src.data[i], src.data[i+1], src.data[i+2]);
    pixels[i] = r;
    pixels[i+1] = g;
    pixels[i+2] = b;
  }

  return pixels;
}

/**
 * @param {ImageData} src
 * @param {number} threshold
 * @returns {Uint8ClampedArray}
 */
function threshold(src: ImageData, threshold: number = 127): Uint8ClampedArray {
  const getTresholdValue = (r:number, g:number, b:number) : number[] => {
    const value = (0.2126 * r + 0.7152 * g + 0.0722 * b >= threshold) ? 255 : 0;
    return [value, value, value];
  }

  return drawFilter(src, getTresholdValue);
}

/**
 * @param {ImageData} src
 * @returns {Uint8ClampedArray}
 */
function fill(src: ImageData, rgbColor: number[] = [138, 43, 226]): Uint8ClampedArray {
  const getRGB = (r:number, g:number, b:number) : number[] => {
    if (r === 255 && g === 255 && b === 255) {
      return rgbColor;
    }

    return [r, g, b];
  }

  return drawFilter(src, getRGB);
}

function coloring(src: ImageData, rgbColor: number[] = [3, 144, 255]): Uint8ClampedArray {
  const getRGB = (r: number, g: number, b: number): number[] => {
    if (r + g + b === 0) {
      return rgbColor;
    }

    return [r, g, b];
  }

  return drawFilter(src, getRGB);
}

function border(src: ImageData): Uint8ClampedArray {
  const pixels = new Uint8ClampedArray(src.data);

  for (let i = 0; i < src.data.length; i += 4) {
    const [r, g, b] = [src.data[i], src.data[i+1], src.data[i+2]];
    let outside = true;
    if (r !== pixels?.[i+4] && g !== pixels?.[i+5] && b !== pixels?.[i+6]) {
      if (outside) {
        pixels[i] = 255;
        pixels[i+1] = 255;
        pixels[i+2] = 255;
        outside = false;
      } else {
        pixels[i+4] = 255;
        pixels[i+5] = 255;
        pixels[i+6] = 255;
        outside = true;
      }
    } else {
      pixels[i] = r;
      pixels[i+1] = g;
      pixels[i+2] = b;
    }
  }

  return pixels;
}

function patternLines({color = 'blue' ,lineWidth = 5, x = 50, y = 50}): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = Math.abs(x);
  canvas.height = Math.abs(y);

  if (ctx) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }

  return canvas;
}

export {
  border,
  coloring,
  fill,
  patternLines,
  threshold
}
