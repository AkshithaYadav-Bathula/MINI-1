// controllers/uploadController.js
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

const uploadImage = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'watermarking_project',
    });

    // Optionally delete the file locally after upload
    fs.unlinkSync(file.path);

    return res.status(200).json({ imageUrl: result.secure_url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Upload failed' });
  }
};

module.exports = {
  uploadImage,
};
