import { useDispatch } from "react-redux";
import { logout } from '../../store/authSlice'
import { useEffect } from "react";
import api from './api'
import { useNavigate } from "react-router-dom";

export default function Logout() {
    const navigate = useNavigate()
  const dispatch = useDispatch();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        const res = await api.post("/auth/logout");

        if (res.status === 200) {
          alert('logout successfully')
          dispatch(logout());
          navigate("/auth/login");
        }
      } catch (err) {
        console.error("Error in logout:", err);
        console.error("Error details:", err.response?.data);
        dispatch(logout());
        navigate("/auth/login");
      }
    };

    handleLogout();
  }, [dispatch]);

  return null;
}
