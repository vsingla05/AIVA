import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Admin from "../models/admin/adminModel.js";
import {Employee} from "../models/employees/index.js"
import {HR} from "../models/hr/index.js"

dotenv.config();

async function Authentication(req, res, next) {
  try {
    const refreshToken = req.cookies?.RefreshToken;
    const accessToken = req.cookies?.AccessToken;

    if (!accessToken && !refreshToken) {
      return res.status(401).json({ msg: "No token provided" });
    }

    if (accessToken) {
      try {
        const decoded = jwt.verify(
          accessToken,
          process.env.ACCESS_TOKEN_SECRET
        );
        req.user = { _id: decoded._id, role: decoded.role };
        console.log('assigned user');
        return next(); 
      } catch (err) {
        console.log('error in authentication', err);
        if(err.name !== 'TokenExpiredError'){
          return res.status(403).send({msg:"Forbidden"})
        }
      }
    }

    if (refreshToken) {
      try {
        const decodedRefresh = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );

        const authId = decodedRefresh._id;
        const auth =
          (await Employee.findById(authId)) ||
          (await HR.findById(authId)) ||
          (await Admin.findById(authId));

        if (!auth) return res.status(404).json({ msg: "User not found" });
        const newAccessToken = await auth.generateAccessToken();

        const cookieOptions = {
          httpOnly: true,
          secure: false, 
          sameSite: "Lax",
          maxAge: 1000 * 60 * 60 * 24, 
          path: "/",
        };

        res.cookie("AccessToken", newAccessToken, cookieOptions);

        console.log("🔄 Access token refreshed");

        req.user = { _id: decodedRefresh._id, role: decodedRefresh.role };
        return next();
      } catch (refreshErr) {
        return res
          .status(403)
          .json({ msg: "Invalid or expired refresh token" });
      }
    }

    return res.status(401).json({ msg: "Unauthorized" });
  } catch (err) {
    console.error("❌ Error in Authentication middleware:", err);
    return res.status(401).json({ msg: "Invalid or expired token" });
  }
}

export default Authentication;
