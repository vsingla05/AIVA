import express from 'express'
import { Authentication } from '../../middlewares/index.js'
import HandleChatMessage from '../../controllers/ai/HandleChatMessage.js'
import { aiChat } from '../../controllers/employees/aiChat.js'

const router = express.Router()

router.post('/manager/chat', Authentication, HandleChatMessage)
router.post('/employee/chat', Authentication, aiChat)

export default router