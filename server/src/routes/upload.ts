import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { authMiddleware } from '../middleware/auth';

const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed file extensions and MIME types
const ALLOWED_TYPES: Record<string, string[]> = {
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.png': ['image/png'],
  '.gif': ['image/gif'],
  '.webp': ['image/webp'],
  '.pdf': ['application/pdf'],
  '.doc': ['application/msword'],
  '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  '.xls': ['application/vnd.ms-excel'],
  '.xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
};
// SVG intentionally excluded — XSS vector

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    // Generate random filename to prevent path traversal and overwrites
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedMimes = ALLOWED_TYPES[ext];

    if (!allowedMimes) {
      cb(new Error(`File type ${ext} not allowed`));
      return;
    }

    if (!allowedMimes.includes(file.mimetype)) {
      cb(new Error(`MIME type ${file.mimetype} does not match extension ${ext}`));
      return;
    }

    cb(null, true);
  },
});

export const uploadRouter = Router();

uploadRouter.post('/', authMiddleware, upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }
  res.json({ url: `/uploads/${req.file.filename}`, filename: req.file.filename });
});

uploadRouter.post('/multiple', authMiddleware, upload.array('files', 10), (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    res.status(400).json({ error: 'No files uploaded' });
    return;
  }
  const urls = files.map((f) => ({ url: `/uploads/${f.filename}`, filename: f.filename }));
  res.json(urls);
});
