const path = require('path');
const fs = require('fs');
const { extractWatermarkPLSB } = require('../services/watermarking');
const { detectBody } = require('../services/faceDetection');
const QrCode = require('qrcode-reader');
const Jimp = require('jimp');
const blockchain = require('../services/blockchain');

exports.extractWatermark = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No watermarked image provided'
      });
    }

    const imagePath = path.join(__dirname, '../public/images/uploads', req.file.filename);
    
    // Detect body region in the watermarked image
    // If body coordinates are provided in the request, use those instead
    let bodyBox;
    
    if (req.body.bodyBox) {
      try {
        bodyBox = JSON.parse(req.body.bodyBox);
      } catch (e) {
        console.warn('Error parsing bodyBox from request, detecting automatically');
      }
    }
    
    if (!bodyBox) {
      // Detect body automatically
      bodyBox = await detectBody(imagePath);
      
      if (!bodyBox) {
        return res.status(400).json({
          success: false,
          message: 'Failed to detect body region in the image'
        });
      }
    }
    
    // Extract watermark
    const extractedPath = `/images/extracted/extracted-${Date.now()}.png`;
    const extractedFullPath = await extractWatermarkPLSB(
      imagePath,
      bodyBox,
      extractedPath
    );
    
    // Try to read QR code from extracted watermark
    const extractedQrPath = path.join(__dirname, '../public', extractedPath);
    const image = await Jimp.read(extractedQrPath);
    const qrCodeReader = new QrCode();
    
    // Process verification if blockchain hash is provided
    let verified = null;
    
    if (req.body.blockchainHash) {
      // Verify against blockchain hash
      const verificationResult = await blockchain.verifyOnBlockchain(
        imagePath,
        req.body.blockchainHash
      );
      
      verified = verificationResult.verified;
    }
    
    // Decode QR
    try {
      const result = await new Promise((resolve, reject) => {
        qrCodeReader.callback = (err, result) => {
          if (err) reject(err);
          resolve(result);
        };
        
        qrCodeReader.decode(image.bitmap);
      });
      
      if (result && result.result) {
        return res.status(200).json({
          success: true,
          message: 'QR code successfully extracted',
          qrCodePath: extractedPath,
          decodedData: result.result,
          verified
        });
      } else {
        return res.status(200).json({
          success: true,
          message: 'Watermark extracted but could not decode QR data',
          qrCodePath: extractedPath,
          verified
        });
      }
    } catch (qrError) {
      console.warn('QR decoding error:', qrError);
      return res.status(200).json({
        success: true,
        message: 'Watermark extracted but QR decoding failed',
        qrCodePath: extractedPath,
        verified
      });
    }
  } catch (error) {
    console.error('Error extracting watermark:', error);
    return res.status(500).json({
      success: false,
      message: 'Error extracting watermark',
      error: error.message
    });
  }
};