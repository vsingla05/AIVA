import {Employee} from '../../models/employees/index.js'


const getAccessAndRefreshToken = async (user) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();
  return { accessToken, refreshToken };
};

export default async function Signup(req, res) {
  const { name, email, password, mobileNo } = req.body;

  try {
    if (!name || !email || !password || !mobileNo) {
      return res.status(400).send({ msg: "All Fields Are Required" });
    }
    const user = new Employee({
      name,
      email,
      password,
      mobileNo,
    });
    await user.save();

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
      .json({
        msg: "Signup successfully",
        user: {
          _id: user._id,
          role: user.role,
          name: user.name,
          imageUrl: user.imageUrl,
          email: user.email,
        },
      });
  } catch (err) {
    console.log("Error On Signup", err);
    return res.status(500).send({ msg: "Internal Server Error" });
  }
}
