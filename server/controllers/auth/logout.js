import {HR} from '../../models/hr/index.js'
import { Employee } from '../../models/employees/index.js';
import Admin from '../../models/admin/adminModel.js';

export default async function Logout(req, res) {
  const authId = req.user._id;

  try {
    if (!authId) {
      return res.status(401).json({ msg: "Unauthorized Access" });
    }

    const user =
      (await Employee.findById(authId)) ||
      (await HR.findById(authId))

    if (!user) {
      return res.status(404).json({ msg: "User Not Found" });
    }

    if (user.constructor.modelName === "Employee") {
      await Employee.findByIdAndUpdate(authId, { refreshToken: null });
    } else if (user.constructor.modelName === "HR") {
      await HR.findByIdAndUpdate(authId, { refreshToken: null });
    } else if (user.constructor.modelName === "Admin") {
      await Admin.findByIdAndUpdate(authId, { refreshToken: null });
    }

    const options = {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      path: '/',
      domain: 'localhost'
    };

    console.log('Cookies before clearing:', req.cookies);

    res.clearCookie("RefreshToken", options);
    res.clearCookie("AccessToken", options);

    console.log('Cookies after clearing:', req.cookies);

    return res.status(200).json({ msg: "Logged out successfully" });
  } catch (err) {
    console.log("Error in logout", err);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
}
