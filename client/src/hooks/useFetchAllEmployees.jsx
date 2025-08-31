import api from '../components/auth/api'
import { useEffect, useState } from 'react'

export default function useFetchEmployees() {
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await api.get('/employee/all')
                if (res.status === 200) {
                    console.log(res.data.employees);
                    setEmployees(res.data.employees)
                }
            } catch (err) {
                console.error('Error in fetchEmployees', err)
                setError(err)
            } finally {
                setLoading(false)
            }
        }
        fetchEmployees()
    }, [])

    return { employees, loading, error }
}
