import { Employee } from "../../models/employees/index.js";

export default async function GetEmployee(req, res) {
    const eid = req.user?._id
    try {
        const employee = await Employee.findById(eid).select('-password -refreshToken').lean();
        if(!employee){
            return res.status(404).send({msg:"Employee not found for this particular EID"})
        }
        return res.status(200).send({employee}); 
    } catch (err) {
        console.log('error in GetEmployee', err);
        return res.status(500).send({ msg: "Internal Server Error" });
    }
}
