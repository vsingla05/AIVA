import express from 'express'
import multer from 'multer'
import {storage} from '../../cloud/cloudinary.js'
import { Authentication } from '../../middlewares/index.js'
import { completePhase } from '../../controllers/task/handlePhaseTask.js'
import HandleFinalSubmit from '../../controllers/task/handleFinalSubmit.js'

const upload = multer({storage})
const router = express.Router()

router.post('/:id/phase/:pid', Authentication, completePhase)
router.post('/:id/finalSubmit', Authentication, upload.single('file'), HandleFinalSubmit)

export default router