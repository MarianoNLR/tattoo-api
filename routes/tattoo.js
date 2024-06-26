import { Router } from 'express'
import { TattooController } from '../controllers/tattoo.js'
import { dirname, join, extname } from 'path'
import { fileURLToPath } from 'url'
import multer from 'multer'
import { userExtractor } from '../middleware/userExtractor.js'

const CURRENT_DIR = dirname(fileURLToPath(import.meta.url))
const MIMETYPES = ['image/jpeg', 'image/png']

const multerUpload = multer({
  storage: multer.diskStorage({
    destination: join(CURRENT_DIR, '../uploads'),
    filename: (req, file, cb) => {
      const fileExtension = extname(file.originalname)
      const fileName = file.originalname.split(fileExtension)[0]
      cb(null, `${fileName}-${Date.now()}${fileExtension}`)
    }
  }),
  fileFilter: (req, file, cb) => {
    if (MIMETYPES.includes(file.mimetype)) cb(null, true)
    else cb(new Error(`Image must be one of the following types ${MIMETYPES.join(' ')}`))
  },
  limits: {
    fieldSize: 10000000
  }
})

export const createTattooRouter = ({ tattooModel }) => {
  const tattooRouter = Router()
  const tattooController = new TattooController({ tattooModel })

  tattooRouter.get('/', userExtractor, tattooController.getAll)
  tattooRouter.get('/category', userExtractor, tattooController.getAllCategory)

  tattooRouter.get('/:id', userExtractor, tattooController.getById)
  tattooRouter.get('/category/:id', userExtractor, tattooController.getCategoryById)

  tattooRouter.delete('/:id', userExtractor, tattooController.delete)
  tattooRouter.post('/', userExtractor, (req, res, next) => {
    multerUpload.single('image')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message })
      }

      tattooController.create(req, res)
    })
  })
  tattooRouter.post('/category', userExtractor, tattooController.createCategory)
  tattooRouter.put('/:id', userExtractor, (req, res, next) => {
    multerUpload.single('image')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message })
      }

      tattooController.update(req, res)
    })
  })
  return tattooRouter
}

export const tattooRouter = Router()
