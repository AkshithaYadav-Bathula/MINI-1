// // // controllers/uploadController.js
// // const cloudinary = require('../config/cloudinary');
// // const fs = require('fs');

// // const uploadImage = async (req, res) => {
// //   try {
// //     const file = req.file;

// //     if (!file) {
// //       return res.status(400).json({ message: 'No file uploaded' });
// //     }

// //     const result = await cloudinary.uploader.upload(file.path, {
// //       folder: 'watermarking_project',
// //     });

// //     // Optionally delete the file locally after upload
// //     fs.unlinkSync(file.path);

// //     return res.status(200).json({ imageUrl: result.secure_url });
// //   } catch (err) {
// //     console.error(err);
// //     return res.status(500).json({ message: 'Upload failed' });
// //   }
// // };

// // module.exports = {
// //   uploadImage,
// // };
// const path = require('path');
// const fs = require('fs');

// exports.uploadImage = (req, file) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: 'No image file provided'
//       });
//     }

//     // Create URL for the uploaded image
//     const imageUrl = `/images/uploads/${req.file.filename}`;

//     return res.status(200).json({
//       success: true,
//       message: 'Image uploaded successfully',
//       imageUrl: imageUrl
//     });
//   } catch (error) {
//     console.error('Error uploading image:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Error uploading image',
//       error: error.message
//     });
//   }
// };
const path = require('path');
const fs = require('fs');

exports.uploadImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }
    // Create URL for the uploaded image
    const imageUrl = `/images/uploads/${req.file.filename}`;
    return res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message
    });
  }
};