import express from 'express'
import {Login, Logout} from '../../controllers/auth/index.js'
import {Authentication} from '../../middlewares/index.js'
import GetUser from '../../controllers/auth/GetUser.js'

const router = express.Router()

router.post('/login', Login)
console.log("inside authroutes");
router.post('/logout', Authentication, Logout)
router.get('/me', Authentication, GetUser)

export default router