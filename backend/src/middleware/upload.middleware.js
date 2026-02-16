import multer from "multer";
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from "../utils/constants.util.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_, file, cb) => {
    const name = (file.originalname || "").toLowerCase();
    const isAllowed = ALLOWED_FILE_TYPES.some((ext) => name.endsWith(ext));
    if (isAllowed) return cb(null, true);
    cb(new Error(`Only ${ALLOWED_FILE_TYPES.join(", ")} files are allowed`));
  },
});

export const uploadMiddleware = (req, res, next) => {
  const contentType = (req.headers["content-type"] || "").toLowerCase();

  if (contentType.includes("application/json")) {
    return next();
  }

  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};
