import {HR} from '../../models/hr/index.js'
import { Employee } from '../../models/employees/index.js';
import Admin from '../../models/admin/adminModel.js';

const getAccessAndRefreshToken = async (user) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();
  return { accessToken, refreshToken };
};

export default async function Login(req, res) {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const user =
      (await Employee.findOne({ email })) ||
      (await HR.findOne({ email })) ||
      (await Admin.findOne({ email }));
    if (!user) return res.status(401).json({ msg: "Invalid credentials" });

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ msg: "Invalid password" });
    }

    const { accessToken, refreshToken } = await getAccessAndRefreshToken(user);

    const accessOptions = {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 1000 * 60 * 60 * 24,
      path: "/",
    };
    const refreshOptions = {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 1000 * 60 * 60 * 24 * 10,
      path: "/",
    };

    return res
      .status(200)
      .cookie("AccessToken", accessToken, accessOptions)
      .cookie("RefreshToken", refreshToken, refreshOptions)
      .send({
        msg: "Logged in successfully",
        user: {
          _id: user._id,
          role: user.role,
          name: user.name,
          imageUrl: user.imageUrl,
          email: user.email,
        },
      });
  } catch (err) {
    console.error("Error in login:", err);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
}
