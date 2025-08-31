import express from 'express'
import {Signup} from '../../controllers/employees/index.js'
import {Authentication} from '../../middlewares/index.js'
import FetchEmployees from '../../controllers/employees/FetchEmployees.js'

const router = express.Router()

router.post('/signup', Signup)
router.get('/all', Authentication, FetchEmployees)


export default router