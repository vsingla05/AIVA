import api from "./api";
import { useEffect, useState } from "react";
import { logout } from "../../store/authSlice";
import { useNavigate, Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";

export default function AuthLayout({ children, roles = [] }) {
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        if (res.status === 200) {
          console.log(res.data.user);
          setRole(res.data.user.role);
        }
      } catch (err) {
        dispatch(logout());
        navigate("/auth/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [dispatch, navigate]);

  if (loading) return <p>Loading...</p>;

  if (!roles.includes(role)) {
    alert("You are not authorized for this route");
    navigate("/");
    return null;
  }

  return <>{children ? children : <Outlet />}</>;
}
