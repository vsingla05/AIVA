import { Employee } from "../../models/employees/index.js";
import {Task} from '../../models/employees/index.js'

export default async function GetEmployeeTasks(req, res) {
    const eid = req.user?._id
    try {
        const tasks = await Task.find({employeeId:eid}).populate('assignedBy')
        return res.status(200).send({tasks}); 
    } catch (err) {
        console.log('error in FetchEmployeesTasks', err);
        return res.status(500).send({ msg: "Internal Server Error" });
    }
}
