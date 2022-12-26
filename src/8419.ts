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

function patternLines({color = 'blue' ,height = 50, lineWidth = 5, startX = 0, startY = 0, width = 50 , x = 50, y = 50}): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = Math.abs(width);
  canvas.height = Math.abs(height);

  if (ctx) {
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }

  return canvas;
}

function hastTwoColors(src: ImageData): boolean {
  const colors = new Set();
  for (let i = 0; i < src.data.length; i += 4) {
    const [r, g, b] = [src.data[i], src.data[i+1], src.data[i+2]];
    colors.add(`${r}${g}${b}`);
  }

  return colors.size === 2;
}

interface Pixel {
  i?: number[];
  iRgb?: number[];
  right?: number[];
  bottomLeft?: number[];
  bottom?: number[];
  bottomRight?: number[];
}

function getAdjacentPixels(src: ImageData, width: number): Pixel[] {
  const pixels: Pixel[] = [];
  for (let i = 0; i < src.data.length; i += 4) {
    const [r, g, b] = [src.data?.[i], src.data?.[i+1], src.data?.[i+2]];
    if (r + g + b === 0) {
      continue;
    }

    const pixel: Pixel =  { };
    const [rRight, gRight, bRight] = [src.data?.[i+4], src.data?.[i+5], src.data?.[i+6]];
    const [rBottomLeft, gBottomLeft, bBottomLeft] = [src.data?.[i+width-4], src.data?.[i+width-3], src.data?.[i+width-2]];
    const [rBottom, gBottom, bBottom] = [src.data?.[i+width], src.data?.[i+width+1], src.data?.[i+width+2]];
    const [rBottomRight, gBottomRight, bBottomRight] = [src.data?.[i+width+4], src.data?.[i+width+5], src.data?.[i+width+6]];

    if (rRight + gRight + bRight === 0) {
      pixel.right = [i+4, i+5, i+6];
    }

    if (rBottomLeft + gBottomLeft + bBottomLeft === 0) {
      pixel.bottomLeft = [i+width-4, i+width-3, i+width-2];
    }

    if (rBottom + gBottom + bBottom === 0) {
      pixel.bottom = [i+width, i+width+1, i+width+2];
    }

    if (rBottomRight + gBottomRight + bBottomRight === 0) {
      pixel.bottomRight = [i+width+4, i+width+5, i+width+6];
    }

    if (pixel?.right || pixel?.bottomLeft || pixel?.bottom || pixel?.bottomRight) {
      pixel.i = [i, i+1, i+2];
      pixel.iRgb = [r, g, b];
      pixels.push(pixel);
    }
  }

  return pixels;
}

function getPatches(src: ImageData, width: number): Promise<Pixel[][]> {
  return new Promise((resolve) => {
    if (!hastTwoColors(src)) {
     resolve([]);
    }

    const pixels = getAdjacentPixels(src, width);
    pixels.reduce((acc: [], pixel) => {
      const patch: Pixel[] = [];
      if (pixel.right) {
        patch.push(pixel);
        pixel.right.forEach((i) => {
          const index = pixels.findIndex((p) => p.i?.includes(i));
          if (index !== -1) {
            patch.push(pixels[index]);
          }
        });
      }

      if (pixel.bottomLeft) {
        patch.push(pixel);
        pixel.bottomLeft.forEach((i) => {
          const index = pixels.findIndex((p) => p.i?.includes(i));
          if (index !== -1) {
            patch.push(pixels[index]);
          }
        });
      }

      if (pixel.bottom) {
        patch.push(pixel);
        pixel.bottom.forEach((i) => {
          const index = pixels.findIndex((p) => p.i?.includes(i));
          if (index !== -1) {
            patch.push(pixels[index]);
          }
        });
      }

      if (pixel.bottomRight) {
        patch.push(pixel);
        pixel.bottomRight.forEach((i) => {
          const index = pixels.findIndex((p) => p.i?.includes(i));
          if (index !== -1) {
            patch.push(pixels[index]);
          }
        });
      }

      if (patch.length > 0) {
        acc.push(patch);
      }

      return acc;
    }, []);
    console.log(pixels);
    const patches: Pixel[][] = [];
    resolve(patches);
  });
}

export {
  border,
  coloring,
  fill,
  getPatches,
  hastTwoColors,
  patternLines,
  threshold
}
