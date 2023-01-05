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

  for (let i = 0; i < src.data.length * 2; i += 4) {
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

function hastTwoColors(data: Uint8ClampedArray): boolean {
  const colors = new Set();
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = [data[i], data[i+1], data[i+2]];
    colors.add(`${r}${g}${b}`);
  }

  return colors.size === 2;
}

function findIndexInPointGroups(points: Set<number>[], point: number): number {
  let index = -1;

  for (let i = 0; i < points.length; i++) {
    const group : Set<number> = points[i];
    if (group.has(point)) {
      index = i;
      break;
    }
  }

  return index;
}

function pixelsToPoints(data: Uint8ClampedArray): number[] {
  return Array.from(data)
    .reduce((acc, cur, i) => {
      if (i % 4 === 0 && cur === 0) {
        acc.push(i);
      }

      return acc;
    }, [] as number[]);
}

function getAdjacentPoints(data: Uint8ClampedArray, width: number): number[][] {
  const points: number[] = pixelsToPoints(data);
  if (!hastTwoColors(data)) {
    return [];
  }

  const pointGroup: Set<number>[] = [];
  const usedPoints: Set<number> = new Set();

  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const left = point - 4;
    const right = point + 4;

    const topLeft = point - width - 4;
    const top = point - width;
    const topRight = point - width + 4;

    const bottomLeft = point + width - 4;
    const bottom = point + width;
    const bottomRight = point + width + 4;

    const previousPoints = [left, topLeft, top, topRight]
      .filter((p) => points.includes(p))
      .sort((a, b) => a - b);

    const nextPoints = [right, bottom, bottomRight, bottomLeft]
      .filter((p) => points.includes(p))
      .sort((a, b) => a - b);

    const [indexPoint] = previousPoints
      .map((p) => findIndexInPointGroups(pointGroup, p))
      .filter((index) => index !== -1)
      .sort((a, b) => a - b);

    if (indexPoint !== undefined) {
      previousPoints.forEach((p) => {
        // if (!usedPoints.has(p)) {
          pointGroup[indexPoint].add(p)
          usedPoints.add(p);
        // }
      });
      nextPoints.forEach((p) => {
        // if (!usedPoints.has(p)) {
          pointGroup[indexPoint].add(p)
          usedPoints.add(p);
        // }
      });
      // if (!usedPoints.has(point)) {
        pointGroup[indexPoint].add(point);
        usedPoints.add(point);
      // }
    } else {
      const newGroup = new Set<number>();
      previousPoints.forEach((p) => newGroup.add(p));
      nextPoints.forEach((p) => newGroup.add(p));
      pointGroup.push(newGroup);
    }
  }

  return pointGroup.map((group) => Array.from(group));
}

const testPoints = new Uint8ClampedArray([
  255, 255, 255, 255,
  255, 255, 255, 255,
  255, 255, 255, 255,
  255, 255, 255, 255,

  255, 255, 255, 255,
  0, 0, 0, 255,
  0, 0, 0, 255,
  255, 255, 255, 255,

  255, 255, 255, 255,
  0, 0, 0, 255,
  0, 0, 0, 255,
  255, 255, 255, 255,

  255, 255, 255, 255,
  255, 255, 255, 255,
  255, 255, 255, 255,
  255, 255, 255, 255,
]);

export {
  border,
  coloring,
  fill,
  getAdjacentPoints,
  hastTwoColors,
  patternLines,
  pixelsToPoints,
  testPoints,
  threshold
}
