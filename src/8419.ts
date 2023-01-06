function drawFilter(data: Uint8ClampedArray, filter: (r: number, g: number, b: number) => number[]): Uint8ClampedArray {
  const pixels = new Uint8ClampedArray(data);
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = filter(data[i], data[i+1], data[i+2]);
    pixels[i] = r;
    pixels[i+1] = g;
    pixels[i+2] = b;
  }

  return pixels;
}

function threshold(data: Uint8ClampedArray, threshold: number = 127): Uint8ClampedArray {
  const getTresholdValue = (r:number, g:number, b:number) : number[] => {
    const value = (0.2126 * r + 0.7152 * g + 0.0722 * b >= threshold) ? 255 : 0;
    return [value, value, value];
  }

  return drawFilter(data, getTresholdValue);
}

function fill(data: Uint8ClampedArray, rgbColor: number[] = [138, 43, 226]): Uint8ClampedArray {
  const getRGB = (r:number, g:number, b:number) : number[] => {
    if (r === 255 && g === 255 && b === 255) {
      return rgbColor;
    }

    return [r, g, b];
  }

  return drawFilter(data, getRGB);
}

function coloring(data: Uint8ClampedArray, rgbColor: number[] = [3, 144, 255]): Uint8ClampedArray {
  const getRGB = (r: number, g: number, b: number): number[] => {
    if (r + g + b === 0) {
      return rgbColor;
    }

    return [r, g, b];
  }

  return drawFilter(data, getRGB);
}

function border(data: Uint8ClampedArray): Uint8ClampedArray {
  const pixels = new Uint8ClampedArray(data);

  for (let i = 0; i < data.length * 2; i += 4) {
    const [r, g, b] = [data[i], data[i+1], data[i+2]];
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

function getAdjacentGroupPoints(points: number[], width: number, groupPoints: Set<number>[]): Set<number>[] {
  if (points.length === 0) {
    return groupPoints;
  }

  const point = points?.[0];
  if (point !== undefined) {
    const usedPoints: number[] = groupPoints.map(p => Array.from(p)).flat();
    const left = usedPoints.filter(p => p === point - 4);
    const topLeft = usedPoints.filter(p => p === point - width - 4);
    const top = usedPoints.filter(p => p === point - width);
    const topRight = usedPoints.filter(p => p === point - width + 4);
    const right = points.filter(p => p === point + 4);
    const bottomLeft = points.filter(p => p === point + width - 4);
    const bottom = points.filter(p => p === point + width);
    const bottomRight = points.filter(p => p === point + width + 4);

    const prevPoints: number[] = [left, topLeft, top, topRight]
      .flat()
      .filter(p => p);

    const nextPoints: number[] = [right, bottomRight, bottom, bottomLeft]
      .flat()
      .filter(p => p);

    const indexes = prevPoints
      .map(p => findIndexInPointGroups(groupPoints, p))
      .filter(i => i !== -1);

    const uniqueIndexes = new Set(indexes);
    if (uniqueIndexes.size > 1) {
      const allPoints = Array
        .from(uniqueIndexes)
        .reduceRight((acc, cur) => {
          const group = groupPoints[cur];
          return [...acc, ...Array.from(group)];
      }, [] as number[]);

      uniqueIndexes
        .forEach(i => groupPoints[i] = new Set<number>(allPoints));
      groupPoints = Array.from(new Set(groupPoints));
    } else if (uniqueIndexes.size === 1) {
      [point, ...nextPoints].forEach(p => groupPoints[indexes[0]].add(p));
    } else {
      const newGroup = new Set<number>();
      [point, ...nextPoints].forEach(p => newGroup.add(p));
      groupPoints.push(newGroup);
    }

    const newPoints = points
      .filter(p => ![point, ...prevPoints, ...nextPoints].includes(p));
    
    return getAdjacentGroupPoints(newPoints, width, groupPoints);
  }

  return groupPoints;
}

function getAdjacentPoints(data: Uint8ClampedArray, width: number): Set<number>[] {
  const points: number[] = pixelsToPoints(data);
  if (!hastTwoColors(data)) {
    return [];
  }

  return getAdjacentGroupPoints(points, width, []);
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
  getAdjacentGroupPoints,
  getAdjacentPoints,
  hastTwoColors,
  patternLines,
  pixelsToPoints,
  testPoints,
  threshold
}
