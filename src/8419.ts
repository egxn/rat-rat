/**
 * @param {ImageData} srcImageData 
 * @param {number} threshold 
 * @returns {ImageData}
 */
const threshold = (srcImageData: ImageData, threshold: number = 127) => {
  for (let i = 0; i < srcImageData.data.length; i += 4) {
    const r = srcImageData.data[i];
    const g = srcImageData.data[i+1];
    const b = srcImageData.data[i+2];

    const v = (0.2126*r + 0.7152*g + 0.0722*b >= threshold)
      ? 255
      : 0;

    srcImageData.data[i] = v;
    srcImageData.data[i+1] = v;
    srcImageData.data[i+2] = v;
  }

  return srcImageData;
}

export {
  threshold
}