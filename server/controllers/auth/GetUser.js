import { HR } from '../../models/hr/index.js';
import { Employee } from '../../models/employees/index.js';
import Admin from '../../models/admin/adminModel.js';

export default async function GetUser(req, res) {
  const userId = req.user?._id;

  if (!userId) {
    return res.status(401).send({ msg: "You are logged out!! Please login" });
  }

  try {
    const user =
      (await Employee.findById(userId).lean()) ||
      (await HR.findById(userId).lean()) ||
      (await Admin.findById(userId).lean());

    if (!user) {
      return res.status(404).send({ msg: "User not found" });
    }

    delete user.password;

    return res.status(200).send({ user });
  } catch (err) {
    console.error('Error in getUser:', err);
    return res.status(500).send({ msg: "Internal Server Error" });
  }
}
