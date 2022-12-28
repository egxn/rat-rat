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

function findIndexInPixelGroup(pixelGroup: number[][][], point: number[]): number {
  let index = -1;

  for (let i = 0; i < pixelGroup.length; i++) {
    const group : number[][] = pixelGroup[i];
    if ( group.some((p) => p[0] === point[0] && p[1] === point[1] && p[2] === point[2])) {
      index = i;
      break;
    }
  }

  return index;
}


function getPatches(src: ImageData, width: number): Promise<number[][][]> {
  return new Promise((resolve) => {
    if (!hastTwoColors(src)) {
     resolve([]);
    }

    const pixelGroup: number[][][] = [];


    for (let i = 0; i < 1200000; i += 4) {
      const [r, g, b] = [src.data?.[i], src.data?.[i + 1], src.data?.[i + 2]];
      if (r + g + b !== 0) {
        continue;
      }

      const [rLeft, gLeft, bLeft] =
        [src.data?.[i - 4], src.data?.[i - 3], src.data?.[i - 2]];
      const [rTop, gTop, bTop] =
        [src.data?.[i - width], src.data?.[i - width + 1], src.data?.[i - width + 2]];
      const [rTopLeft, gTopLeft, bTopLeft] =
        [src.data?.[i - width - 4], src.data?.[i - width - 3], src.data?.[i - width - 2]];
      const [rTopRight, gTopRight, bTopRight] =
        [src.data?.[i - width + 4], src.data?.[i - width + 5], src.data?.[i - width + 6]];

      if (rLeft + gLeft + bLeft === 0) {
        const index = findIndexInPixelGroup(pixelGroup, [i - 4, i - 3, i - 2]);
        if (index !== -1 && !pixelGroup[index].includes([i, i + 1, i + 2])) {
          pixelGroup[index].push([i, i + 1, i + 2]);
        }
      } else if (rTop + gTop + bTop === 0) {
        const index = findIndexInPixelGroup(pixelGroup, [i - width, i - width + 1, i - width + 2]);
        if (index !== -1 && !pixelGroup[index].includes([i, i + 1, i + 2])) {
          pixelGroup[index].push([i, i + 1, i + 2]);
        }
      } else if (rTopLeft + gTopLeft + bTopLeft === 0) {
        const index = findIndexInPixelGroup(pixelGroup, [i - width - 4, i - width - 3, i - width - 2]);
        if (index !== -1 && !pixelGroup[index].includes([i, i + 1, i + 2])) {
          pixelGroup[index].push([i, i + 1, i + 2]);
        }
      } else if (rTopRight + gTopRight + bTopRight === 0) {
        const index = findIndexInPixelGroup(pixelGroup, [i - width + 4, i - width + 5, i - width + 6]);
        if (index !== -1 && !pixelGroup[index].includes([i, i + 1, i + 2])) {
          pixelGroup[index].push([i, i + 1, i + 2]);
        }
      } else {

        const [rRight, gRight, bRight] =
          [src.data?.[i + 4], src.data?.[i + 5], src.data?.[i + 6]];
        const [rBottom, gBottom, bBottom] =
          [src.data?.[i + width], src.data?.[i + width + 1], src.data?.[i + width + 2]];
        const [rBottomLeft, gBottomLeft, bBottomLeft] =
          [src.data?.[i + width - 4], src.data?.[i + width - 3], src.data?.[i + width - 2]];
        const [rBottomRight, gBottomRight, bBottomRight] =
          [src.data?.[i + width + 4], src.data?.[i + width + 5], src.data?.[i + width + 6]];


        const newGroup : number[][] = [];
        newGroup.push([i, i + 1, i + 2]);

        if (rRight + gRight + bRight === 0) {
          newGroup.push([i + 4, i + 5, i + 6]);
        }

        if (rBottom + gBottom + bBottom === 0) {
          newGroup.push([i + width, i + width + 1, i + width + 2]);
        }

        if (rBottomLeft + gBottomLeft + bBottomLeft === 0) {
          newGroup.push([i + width - 4, i + width - 3, i + width - 2]);
        }

        if (rBottomRight + gBottomRight + bBottomRight === 0) {
          newGroup.push([i + width + 4, i + width + 5, i + width + 6]);
        }

        if (newGroup.length > 1) {
          pixelGroup.push(newGroup);
        }
      }
    }


    const patches: number[][][] = pixelGroup;
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
