const fs = require('fs');
const path = require('path');
// const cv = require('opencv4nodejs');
const cv = require('opencv4nodejs-prebuilt');

const { mtcnn } = require('face-api.js');
const canvas = require('canvas');
const faceapi = require('face-api.js');

// Initialize face-api.js
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// Load the MTCNN model
let modelLoaded = false;
const loadModels = async () => {
  if (!modelLoaded) {
    const modelPath = path.join(__dirname, '../models');
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
    await faceapi.nets.mtcnn.loadFromDisk(modelPath);
    modelLoaded = true;
    console.log('Face detection models loaded');
  }
};

// Ensure models directory exists
const modelsDir = path.join(__dirname, '../models');
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

// Fallback face detection using OpenCV
const detectFaceOpenCV = async (imagePath) => {
  try {
    const image = await cv.imread(imagePath);
    const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);
    const faces = await classifier.detectMultiScale(image.bgrToGray());
    
    if (faces.objects.length === 0) {
      return null;
    }
    
    // Get the largest face
    const sortedFaces = faces.objects.sort((a, b) => (b.width * b.height) - (a.width * a.height));
    const face = sortedFaces[0];
    
    return {
      x: face.x,
      y: face.y,
      width: face.width,
      height: face.height
    };
  } catch (error) {
    console.error('OpenCV face detection error:', error);
    return null;
  }
};

// Main face detection function with fallbacks
exports.detectFace = async (imagePath) => {
  try {
    // Try to load models
    try {
      await loadModels();
    } catch (modelError) {
      console.warn('Could not load face-api models, falling back to OpenCV:', modelError);
      return detectFaceOpenCV(imagePath);
    }
    
    // Read the image
    const img = await canvas.loadImage(imagePath);
    
    // Detect faces using MTCNN
    const detections = await faceapi.detectAllFaces(img, new faceapi.MtcnnOptions());
    
    if (detections.length === 0) {
      console.log('No faces detected with MTCNN, trying OpenCV');
      return detectFaceOpenCV(imagePath);
    }
    
    // Get the largest face
    const largestFace = detections.sort((a, b) => 
      (b.box.width * b.box.height) - (a.box.width * a.box.height)
    )[0];
    
    return {
      x: largestFace.box.x,
      y: largestFace.box.y,
      width: largestFace.box.width,
      height: largestFace.box.height
    };
  } catch (error) {
    console.error('Face detection error:', error);
    return detectFaceOpenCV(imagePath);
  }
};

// Body detection (NROI)
exports.detectBody = async (imagePath, faceBox) => {
  try {
    const image = await cv.imread(imagePath);
    const { height, width } = image;
    
    if (!faceBox) {
      // If no face detected, use the middle part of the image
      const bodyX = Math.floor(width * 0.2);
      const bodyY = Math.floor(height * 0.3);
      const bodyWidth = Math.floor(width * 0.6);
      const bodyHeight = Math.floor(height * 0.5);
      
      return { x: bodyX, y: bodyY, width: bodyWidth, height: bodyHeight };
    }
    
    // Estimate body position based on face position
    // Body is usually below the face
    const bodyX = Math.max(0, faceBox.x - Math.floor(faceBox.width * 0.5));
    const bodyY = Math.min(height, faceBox.y + faceBox.height);
    const bodyWidth = Math.min(width - bodyX, faceBox.width * 3);
    const bodyHeight = Math.min(height - bodyY, Math.floor(height * 0.5));
    
    return { x: bodyX, y: bodyY, width: bodyWidth, height: bodyHeight };
  } catch (error) {
    console.error('Body detection error:', error);
    
    // Fallback to default body region
    const image = await cv.imread(imagePath);
    const { height, width } = image;
    
    return {
      x: Math.floor(width * 0.25),
      y: Math.floor(height * 0.3),
      width: Math.floor(width * 0.5),
      height: Math.floor(height * 0.5)
    };
  }
};