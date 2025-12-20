import express from 'express'
import {Signup} from '../../controllers/employees/index.js'
import {Authentication} from '../../middlewares/index.js'
import FetchEmployees from '../../controllers/employees/FetchEmployees.js'
import GetEmployee from '../../controllers/employees/GetEmployee.js'
import GetEmployeeTasks from '../../controllers/employees/getEmployeeTasks.js'
import Leave from '../../models/employees/leaveModel.js'
import handleEmployeeAction from '../../controllers/employees/handleEmployeeAction.js'
import { getLatestTask } from '../../controllers/employees/getLatestTask.js'
import { getNotifications } from '../../controllers/employees/notifications.js'
import { getUnreadCount } from '../../controllers/employees/notifications.js'
import { markAllAsRead } from '../../controllers/employees/notifications.js'
import { markNotificationAsRead } from '../../controllers/employees/notifications.js'
import { getAllTasks } from '../../controllers/employees/getAllTasks.js'
import GetIdTask from '../../controllers/employees/getTaskByID.js'
import { employeeOverview } from '../../controllers/employees/employeeOverview.js'

const router = express.Router()

router.post('/signup', Signup)
router.get('/all', Authentication, FetchEmployees)
router.get('/me', Authentication, GetEmployee)
router.get('/notifications', Authentication, getNotifications)
router.get('/notifications/unread-count', Authentication, getUnreadCount)
router.put('/notifications/read-all', Authentication, markAllAsRead)
router.put('/notification/:id/read', Authentication, markNotificationAsRead)
router.get('/all-tasks', Authentication, getAllTasks)
router.get('/task/:id', Authentication, GetIdTask)
router.get('/overview', Authentication, employeeOverview)

router.get("/:id/leaves", async (req, res) => {
  const leaves = await Leave.find({ employeeId: req.params.id }).sort({ createdAt: -1 });
  res.json(leaves);
});


export default router