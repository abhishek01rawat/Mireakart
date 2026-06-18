import path from 'path';
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = 'uploads/screenshots/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

function fileFilter(req, file, cb) {
  const filetypes = /jpe?g|png|webp/;
  const mimetypes = /image\/jpeg|image\/png|image\/webp/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = mimetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Images only (jpeg, jpg, png, webp)'), false);
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const uploadSingleImage = upload.single('image');

router.post('/', protect, (req, res) => {
  uploadSingleImage(req, res, function (err) {
    if (err) {
      return res.status(400).send({ message: err.message });
    }
    if (!req.file) {
      return res.status(400).send({ message: 'No file uploaded' });
    }
    res.status(200).send({
      message: 'Image uploaded successfully',
      image: `/${req.file.path.replace(/\\/g, '/')}`,
    });
  });
});

export default router;
