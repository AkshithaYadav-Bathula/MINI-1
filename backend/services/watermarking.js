const path = require('path');
const fs = require('fs');
const cv = require('opencv4nodejs');
const sharp = require('sharp');

// PLSB (Pixel Least Significant Bit) watermarking
exports.embedWatermarkPLSB = async (originalImagePath, qrCodePath, bodyBox, targetRelativePath) => {
  try {
    // Read the original image and QR code
    const originalImage = await cv.imread(originalImagePath);
    const qrCode = await cv.imread(qrCodePath);
    
    // Destructure body box coordinates
    const { x, y, width, height } = bodyBox;
    
    // Resize QR code to fit the body region
    const resizedQR = qrCode.resize(height, width);
    
    // Convert QR to binary (0 or 1)
    const qrBinary = [];
    for (let c = 0; c < 3; c++) {
      const channel = resizedQR.getDataAsArray().map(row => 
        row.map(pixel => pixel[c] > 128 ? 1 : 0)
      );
      qrBinary.push(channel);
    }
    
    // Clone the original image for watermarking
    const watermarked = originalImage.copy();
    
    // Get region of interest
    const roi = watermarked.getRegion(new cv.Rect(x, y, width, height));
    
    // Embed the watermark into the 2 least significant bits
    const roiData = roi.getDataAsArray();
    
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        for (let c = 0; c < 3; c++) {
          // Clear the two least significant bits (mask with 11111100 = 0xFC)
          roiData[i][j][c] = roiData[i][j][c] & 0xFC;
          
          // Set the 2nd least significant bit and the least significant bit
          // to the watermark bit
          roiData[i][j][c] = roiData[i][j][c] | (qrBinary[c][i][j] << 1) | qrBinary[c][i][j];
        }
      }
    }
    
    // Update the ROI in the watermarked image
    const updatedRoi = new cv.Mat(roiData, cv.CV_8UC3);
    updatedRoi.copyTo(watermarked.getRegion(new cv.Rect(x, y, width, height)));
    
    // Save the watermarked image
    const targetPath = path.join(__dirname, '../public', targetRelativePath);
    await cv.imwrite(targetPath, watermarked);
    
    return targetRelativePath;
  } catch (opencvError) {
    console.warn('OpenCV watermarking failed:', opencvError);
    throw new Error(`Failed to embed watermark: ${opencvError.message}`);
  }
};

// Extract watermark using PLSB
exports.extractWatermarkPLSB = async (watermarkedImagePath, bodyBox, targetRelativePath) => {
  try {
    // Read the watermarked image
    const watermarkedImage = await cv.imread(watermarkedImagePath);
    
    // Destructure body box coordinates
    const { x, y, width, height } = bodyBox;
    
    // Get body region
    const bodyRoi = watermarkedImage.getRegion(new cv.Rect(x, y, width, height));
    
    // Extract the watermark from the least significant bits
    const extracted = new cv.Mat(height, width, cv.CV_8UC3);
    const bodyData = bodyRoi.getDataAsArray();
    const extractedData = extracted.getDataAsArray();
    
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        for (let c = 0; c < 3; c++) {
          // Extract LSB (bit 0)
          const lsb = bodyData[i][j][c] & 0x01;
          
          // Extract bit before LSB (bit 1)
          const bitBeforeLsb = (bodyData[i][j][c] & 0x02) >> 1;
          
          // If both bits match, we have higher confidence
          if (lsb === bitBeforeLsb) {
            extractedData[i][j][c] = lsb * 255;
          } else {
            // When bits don't match, use a threshold based on surrounding pixels
            extractedData[i][j][c] = Math.round((lsb + bitBeforeLsb) / 2) * 255;
          }
        }
      }
    }
    
    // Update the extracted image with the extracted data
    const updatedExtracted = new cv.Mat(extractedData, cv.CV_8UC3);
    
    // Apply post-processing for better QR readability
    const gray = updatedExtracted.cvtColor(cv.COLOR_BGR2GRAY);
    const binary = gray.threshold(
      128, 255, cv.THRESH_BINARY | cv.THRESH_OTSU
    );
    
    // Convert back to BGR for consistency
    const enhancedExtracted = binary.cvtColor(cv.COLOR_GRAY2BGR);
    
    // Save the extracted watermark
    const targetPath = path.join(__dirname, '../public', targetRelativePath);
    await cv.imwrite(targetPath, enhancedExtracted);
    
    return targetRelativePath;
  } catch (opencvError) {
    console.warn('OpenCV extraction failed:', opencvError);
    throw new Error(`Failed to extract watermark: ${opencvError.message}`);
  }
};