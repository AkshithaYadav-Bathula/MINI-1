const path = require('path');
const fs = require('fs');
const cloudinary = require('../config/cloudinary');
const qrcode = require('qrcode');

exports.generateQR = async (req, res) => {
  try {
    const { roiImageUrl } = req.body;
    
    if (!roiImageUrl) {
      return res.status(400).json({
        success: false,
        message: 'No ROI image URL provided'
      });
    }
    
    // Upload ROI to Cloudinary (or use local path for testing)
    let dataToEncode;
    
    try {
      // Try to upload to cloudinary
      const cloudinaryResult = await cloudinary.uploader.upload(
        path.join(__dirname, '../public', roiImageUrl),
        { folder: 'watermarking-roi' }
      );
      
      dataToEncode = cloudinaryResult.secure_url;
      console.log('ROI uploaded to Cloudinary:', dataToEncode);
    } catch (cloudinaryError) {
      console.error('Error uploading to Cloudinary:', cloudinaryError);
      // Fallback: use local path as data
      dataToEncode = `face_data_${Date.now()}`;
    }
    
    // Generate QR code
    const qrFilename = `qr-${Date.now()}.png`;
    const qrFilePath = path.join(__dirname, '../public/images/qr', qrFilename);
    
    await qrcode.toFile(qrFilePath, dataToEncode, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300
    });
    
    return res.status(200).json({
      success: true, 
      message: 'QR code generated successfully',
      qrCodePath: `/images/qr/${qrFilename}`,
      encodedData: dataToEncode
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return res.status(500).json({
      success: false,
      message: 'Error generating QR code',
      error: error.message
    });
  }
};