import api from '../components/auth/api'
import { useEffect, useState } from 'react'

export default function useFetchEmployeeTasks() {
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchEmployeeTasks = async () => {
            try {
                const res = await api.get('/employee/tasks')
                if (res.status === 200) {
                    setTasks(res.data.tasks)
                }
            } catch (err) {
                console.error('Error in fetchEmployeeTasks', err)
                setError(err)
            } finally {
                setLoading(false)
            }
        }
        fetchEmployeeTasks()
    }, [])

    return { tasks, loading, error }
}
