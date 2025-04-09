const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const faceDetectionService = require('../services/faceDetection');

exports.segmentImage = async (req, res) => {
  try {
    console.log('Segmentation request received');
    
    if (!req.file) {
      console.log('No file received in segmentation request');
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }
    
    console.log(`Processing file: ${req.file.filename}`);
    
    // Get the path of the uploaded image
    const imagePath = req.file.path;
    
    try {
      // Call face detection service
      // In a real implementation, this would detect faces
      // For testing, we'll create mock ROI and NROI images
      const baseFilename = path.basename(req.file.filename, path.extname(req.file.filename));
      
      // Create ROI (face) image - for testing, we'll make it a cropped version
      const roiFilename = `roi_${baseFilename}${path.extname(req.file.filename)}`;
      const roiPath = path.join('public/images/roi', roiFilename);
      
      // Create NROI (body) image - for testing, we'll make it a blurred version
      const nroiFilename = `nroi_${baseFilename}${path.extname(req.file.filename)}`;
      const nroiPath = path.join('public/images/nroi', nroiFilename);
      
      // Process images with sharp
      // For ROI - crop the image
      await sharp(imagePath)
        .resize({ width: 300, height: 300, fit: 'cover' })
        .toFile(roiPath);
      
      // For NROI - apply a blur
      await sharp(imagePath)
        .blur(5)  // Apply blur to simulate NROI
        .toFile(nroiPath);
      
      console.log('Successfully processed and saved ROI and NROI images');
      
      return res.json({
        success: true,
        message: 'Image segmented successfully',
        roiPath: `/images/roi/${roiFilename}`,
        nroiPath: `/images/nroi/${nroiFilename}`
      });
    } catch (err) {
      console.error('Error in image processing:', err);
      return res.status(500).json({
        success: false,
        message: `Failed to process image: ${err.message}`
      });
    }
  } catch (error) {
    console.error('Error in segmentation controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to segment image'
    });
  }
};