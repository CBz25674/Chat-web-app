const multer = require("multer");
const path = require("path")
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/asset");
    },
    filename: (req, file, cb) => {
        const suffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, file.originalname + "=" + suffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const fileType = /jpeg|jpg|png|gif/;

    const extname = fileType.test(path.extname(file.originalname).toLowerCase());

    const mimeTest = fileType.test(file.mimetype);

    if (extname && mimeTest) {
        return cb(null, true)
    }
}

const upload = multer({ 
    storage: storage 
});

module.exports = upload;