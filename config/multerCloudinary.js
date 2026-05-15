import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from './cloudinary.js'

const storage = new CloudinaryStorage({
  cloudinary,

  params: async (req, file) => {

    // PDF
    if (file.mimetype === 'application/pdf') {
      return {
        folder: 'library-pdfs',
        resource_type: 'raw'
      }
    }

    // Image
    return {
      folder: 'library-images'
    }
  }
})

const upload = multer({ storage })

export default upload