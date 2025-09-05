import { Employee } from "../../models/employees/index.js";

export default async function FetchEmployees(req, res) {
    try {
        const employees = await Employee.find({}).select('-password -refreshToken');
        return res.status(200).send({employees}); 
    } catch (err) {
        console.log('error in FetchEmployees', err);
        return res.status(500).send({ msg: "Internal Server Error" });
    }
}
