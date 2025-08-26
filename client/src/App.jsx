import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { login, logout } from "./store/authSlice";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import api from "./components/auth/api";

function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        if (isMounted && res.status === 200) {
          dispatch(login(res.data.user));
        }
      } catch (err) {
        if (isMounted) {
          dispatch(logout());
          navigate("/auth/login");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchUser();
    return () => {
      isMounted = false;
    };
  }, [dispatch, navigate]);

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <h1 className="text-blue-500">Welcome to AIVA</h1>
      <Outlet />
    </>
  );
}

export default App;
