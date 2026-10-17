import { logger } from '../utils/logger.js';

// @desc    Upload hazard photo(s)
// @route   POST /api/uploads
// @access  Public / Authenticated
export async function uploadPhotos(req, res, next) {
  try {
    if (!req.files || req.files.length === 0) {
      // Check single file upload
      if (req.file) {
        const fileUrl = `/uploads/${req.file.filename}`;
        return res.status(200).json({
          success: true,
          urls: [fileUrl],
          filename: req.file.filename
        });
      }

      return res.status(400).json({
        success: false,
        message: 'No photo files were provided.'
      });
    }

    const urls = req.files.map((file) => `/uploads/${file.filename}`);
    logger.info(`Uploaded ${urls.length} files successfully.`);

    res.status(200).json({
      success: true,
      count: urls.length,
      urls
    });
  } catch (err) {
    next(err);
  }
}
