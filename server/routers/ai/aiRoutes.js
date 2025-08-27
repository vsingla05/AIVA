import express from 'express'
import { Authentication } from '../../middlewares/index.js'
import HandleChatMessage from '../../controllers/ai/HandleChatMessage.js'

const router = express.Router()

router.post('/chat', Authentication, HandleChatMessage)

export default router