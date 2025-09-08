import express from 'express'
import {Signup} from '../../controllers/employees/index.js'
import {Authentication} from '../../middlewares/index.js'
import FetchEmployees from '../../controllers/employees/FetchEmployees.js'
import GetEmployee from '../../controllers/employees/GetEmployee.js'
import GetEmployeeTasks from '../../controllers/employees/getEmployeeTasks.js'
import GetIdTask from '../../controllers/employees/getIdTask.js'

const router = express.Router()

router.post('/signup', Signup)
router.get('/all', Authentication, FetchEmployees)
router.get('/getEmployee', Authentication, GetEmployee)
router.get('/tasks', Authentication, GetEmployeeTasks)
router.get('/task/:id', Authentication, GetIdTask)


export default router