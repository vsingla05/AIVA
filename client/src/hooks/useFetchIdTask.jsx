import { useEffect, useState } from "react";
import api from "../components/auth/api";

export default function useFetchIdTask(id) {
  const [task, setTask] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchIdTask = async () => {
      try {
        const res = await api.get(`/employee/task/${id}`);
        if (res.status === 200) {
          setTask(res.data.task);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchIdTask();
    }
  }, [id]); 

  return { task, loading, error };
}
