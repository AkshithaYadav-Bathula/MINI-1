const path = require('path');
const fs = require('fs');
const cv = require('opencv4nodejs');
const sharp = require('sharp');

// Extract a region from an image
exports.extractRegion = async (sourcePath, targetRelativePath, x, y, width, height) => {
  try {
    // Read the image using opencv
    const image = await cv.imread(sourcePath);
    
    // Extract the region
    const region = image.getRegion(new cv.Rect(x, y, width, height));
    
    // Create the target path
    const targetPath = path.join(__dirname, '../public', targetRelativePath);
    
    // Save the region
    await cv.imwrite(targetPath, region);
    
    return targetRelativePath;
  } catch (opencvError) {
    console.warn('OpenCV extraction failed, trying with Sharp:', opencvError);
    
    try {
      // Fallback to Sharp
      const targetPath = path.join(__dirname, '../public', targetRelativePath);
      
      await sharp(sourcePath)
        .extract({ left: x, top: y, width, height })
        .toFile(targetPath);
      
      return targetRelativePath;
    } catch (sharpError) {
      throw new Error(`Failed to extract region: ${sharpError.message}`);
    }
  }
};

// Resize an image to specific dimensions
exports.resizeImage = async (sourcePath, targetRelativePath, width, height) => {
  try {
    // Read the image using opencv
    const image = await cv.imread(sourcePath);
    
    // Resize the image
    const resized = image.resize(height, width);
    
    // Create the target path
    const targetPath = path.join(__dirname, '../public', targetRelativePath);
    
    // Save the resized image
    await cv.imwrite(targetPath, resized);
    
    return targetRelativePath;
  } catch (opencvError) {
    console.warn('OpenCV resize failed, trying with Sharp:', opencvError);
    
    try {
      // Fallback to Sharp
      const targetPath = path.join(__dirname, '../public', targetRelativePath);
      
      await sharp(sourcePath)
        .resize(width, height)
        .toFile(targetPath);
      
      return targetRelativePath;
    } catch (sharpError) {
      throw new Error(`Failed to resize image: ${sharpError.message}`);
    }
  }
};

// Apply basic image enhancements
exports.enhanceImage = async (sourcePath, targetRelativePath) => {
  try {
    // Read the image using opencv
    const image = await cv.imread(sourcePath);
    
    // Enhance the image: increase contrast and apply mild sharpening
    const enhanced = image
      .convertTo(cv.CV_8U, 1.2, 10)  // Increase contrast
      .gaussianBlur(new cv.Size(0, 0), 3)
      .addWeighted(image, 1.5, -0.5, 0);  // Sharpening
    
    // Create the target path
    const targetPath = path.join(__dirname, '../public', targetRelativePath);
    
    // Save the enhanced image
    await cv.imwrite(targetPath, enhanced);
    
    return targetRelativePath;
  } catch (opencvError) {
    console.warn('OpenCV enhancement failed, trying with Sharp:', opencvError);
    
    try {
      // Fallback to Sharp
      const targetPath = path.join(__dirname, '../public', targetRelativePath);
      
      await sharp(sourcePath)
        .sharpen()
        .modulate({ brightness: 1.1, saturation: 1.2 })
        .toFile(targetPath);
      
      return targetRelativePath;
    } catch (sharpError) {
      throw new Error(`Failed to enhance image: ${sharpError.message}`);
    }
  }
};