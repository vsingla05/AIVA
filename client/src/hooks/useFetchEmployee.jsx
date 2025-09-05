import api from '../components/auth/api'
import { useEffect, useState } from 'react'

export default function useFetchEmployee() {
    const [employee, setEmployee] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const res = await api.get('/employee/getEmployee')
                console.log('in hooke',res.data.employee.reports);
                if (res.status === 200) {
                    setEmployee(res.data.employee)
                }
            } catch (err) {
                console.error('Error in fetchEmployee', err)
                setError(err)
            } finally {
                setLoading(false)
            }
        }
        fetchEmployee()
    }, [])

    return { employee, loading, error }
}
