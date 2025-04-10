const path = require('path');
const fs = require('fs');
const { detectFace, detectBody } = require('../services/faceDetection');
const imageProcessing = require('../utils/imageProcessing');

exports.segmentImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const imagePath = path.join(__dirname, '../public/images/uploads', req.file.filename);
    
    // Detect face (ROI)
    const faceBox = await detectFace(imagePath);
    
    if (!faceBox) {
      return res.status(400).json({
        success: false,
        message: 'No face detected in the image'
      });
    }
    
    // Detect body (NROI)
    const bodyBox = await detectBody(imagePath, faceBox);
    
    // Extract and save ROI (face)
    const roiPath = await imageProcessing.extractRegion(
      imagePath, 
      '/images/roi/roi-' + req.file.filename,
      faceBox.x,
      faceBox.y,
      faceBox.width,
      faceBox.height
    );
    
    // Extract and save NROI (body)
    const nroiPath = await imageProcessing.extractRegion(
      imagePath,
      '/images/nroi/nroi-' + req.file.filename,
      bodyBox.x,
      bodyBox.y,
      bodyBox.width,
      bodyBox.height
    );
    
    return res.status(200).json({
      success: true,
      message: 'Image segmentation successful',
      roiImagePath: roiPath,
      nroiImagePath: nroiPath,
      faceBox: faceBox,
      bodyBox: bodyBox
    });
  } catch (error) {
    console.error('Error segmenting image:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing image',
      error: error.message
    });
  }
};