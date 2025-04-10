// // routes/api.js
// const express = require('express');
// const router = express.Router();
// const upload = require('../middleware/upload');
// const { uploadImage } = require('../controllers/uploadController');

// // POST /api/upload
// router.post('/upload', upload.single('image'), uploadImage);

// module.exports = router;
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const uploadController = require('../controllers/uploadController');
const segmentationController = require('../controllers/segmentationController');
const qrController = require('../controllers/qrController');
const watermarkController = require('../controllers/watermarkController');
const verifyController = require('../controllers/verifyController');

// Upload route
router.post('/upload', upload.single('image'), uploadController.uploadImage);

// Segmentation route
router.post('/segment', upload.single('image'), segmentationController.segmentImage);

// QR code generation route
router.post('/generate-qr', qrController.generateQR);

// Watermark embedding route
router.post('/embed-watermark', 
  upload.fields([
    { name: 'originalImage', maxCount: 1 },
    { name: 'qrCode', maxCount: 1 }
  ]), 
  watermarkController.embedWatermark
);

// Blockchain integration route
router.post('/integrate-blockchain', upload.single('watermarkedImage'), 
  watermarkController.integrateBlockchain
);

// Extract watermark route
router.post('/extract-watermark', upload.single('watermarkedImage'), 
  verifyController.extractWatermark
);

module.exports = router;