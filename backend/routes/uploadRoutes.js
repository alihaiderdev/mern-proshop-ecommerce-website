import express from 'express';
import multer from 'multer';
import path from 'path';

const router = express.Router();

var storage = multer.diskStorage({
  // destination: function (req, file, cb) {
  //   cb(null, 'uploads/');
  // },
  // filename: function (req, file, cb) {
  //   cb(null, file.fieldname + '-' + Date.now());
  // },
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    // cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    cb(null, `${file.originalname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// validaing the type of images that user can upload
function checkFileType(file, cb) {
  const fileTypes = /jpg|jpeg|png/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase()); // return true or false
  const mimetype = fileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images Only');
  }
}

var upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// router.post('/', upload.array('images')); // here array method is for multiple images

// here single method is for single image
router.post('/', upload.single('image'), (req, res) => {
  res.send(`/${req.file.path}`);
});

export default router;
