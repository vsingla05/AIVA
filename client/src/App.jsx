import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { login, logout } from "./store/authSlice";
import { useDispatch } from "react-redux";
import api from "./components/auth/api";


function App() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        if (res.status === 200 && res.data.user) {
          dispatch(login(res.data.user));
        } else {
          dispatch(logout());
        }
      } catch (err) {
        dispatch(logout());
      } finally {
        setLoading(false); 
      }
    };
    fetchUser();
  }, [dispatch]);

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Outlet />
    </>
  );
}

export default App;
