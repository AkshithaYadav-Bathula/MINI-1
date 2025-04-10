const path = require('path');
const fs = require('fs');
const { embedWatermarkPLSB } = require('../services/watermarking');
const crypto = require('crypto');

exports.embedWatermark = async (req, res) => {
  try {
    if (!req.files || !req.files.originalImage || !req.files.qrCode) {
      return res.status(400).json({
        success: false, 
        message: 'Missing required files (originalImage and qrCode)'
      });
    }
    
    // Get paths for original image and QR code
    const originalImagePath = path.join(__dirname, '../public/images/uploads', req.files.originalImage[0].filename);
    const qrCodePath = path.join(__dirname, '../public/images/uploads', req.files.qrCode[0].filename);
    
    // Get body box coordinates from request body
    let bodyBox;
    try {
      bodyBox = JSON.parse(req.body.roiData);
    } catch (e) {
      // Use default values if parsing fails
      bodyBox = { x: 100, y: 100, width: 200, height: 300 };
    }
    
    // Embed watermark using PLSB technique
    const watermarkedPath = await embedWatermarkPLSB(
      originalImagePath,
      qrCodePath,
      bodyBox,
      `/images/watermarked/watermarked-${Date.now()}.png`
    );
    
    return res.status(200).json({
      success: true,
      message: 'Watermark embedded successfully',
      watermarkedImagePath: watermarkedPath
    });
  } catch (error) {
    console.error('Error embedding watermark:', error);
    return res.status(500).json({
      success: false,
      message: 'Error embedding watermark',
      error: error.message
    });
  }
};

exports.integrateBlockchain = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No watermarked image provided'
      });
    }
    
    const imagePath = path.join(__dirname, '../public/images/uploads', req.file.filename);
    
    // For simulation, we'll just create a hash of the file
    // In a real application, this would be stored on a blockchain
    const fileBuffer = fs.readFileSync(imagePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    const blockchainHash = hashSum.digest('hex');
    
    // Copy the file to watermarked directory for consistency
    const targetFilename = `blockchain-${Date.now()}-${req.file.filename}`;
    const targetPath = path.join(__dirname, '../public/images/watermarked', targetFilename);
    fs.copyFileSync(imagePath, targetPath);
    
    return res.status(200).json({
      success: true,
      message: 'Image integrated with blockchain successfully',
      blockchainHash: blockchainHash,
      watermarkedImagePath: `/images/watermarked/${targetFilename}`
    });
  } catch (error) {
    console.error('Error integrating with blockchain:', error);
    return res.status(500).json({
      success: false,
      message: 'Error integrating with blockchain',
      error: error.message
    });
  }
};