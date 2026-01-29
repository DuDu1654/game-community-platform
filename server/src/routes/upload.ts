import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const router = Router()

// 确保上传目录存在
const uploadDir = 'uploads'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// 配置 multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/
    const mimetype = allowedTypes.test(file.mimetype)
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    
    if (mimetype && extname) {
      return cb(null, true)
    }
    cb(new Error('只支持图片文件 (jpeg, jpg, png, gif, webp)'))
  }
})

// 图片上传接口
router.post('/image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: '请选择图片文件' 
      })
    }
    
    const fileUrl = `/uploads/${req.file.filename}`
    
    res.json({
      success: true,
      message: '上传成功',
      data: {
        url: fileUrl,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    })
  } catch (error) {
    console.error('上传失败:', error)
    res.status(500).json({ 
      success: false, 
      message: '上传失败' 
    })
  }
})

export default router