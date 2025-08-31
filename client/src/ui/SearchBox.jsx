import React, { useState } from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import useFetchEmployees from '../hooks/useFetchAllEmployees';

const animatedComponents = makeAnimated();

export default function AnimatedMulti({onSelectEmployees}) {
    const { employees = [], loading, error } = useFetchEmployees(); 
    const [selectedEmployees, setSelectedEmployees] = useState([]);

    console.log('from search', employees);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error fetching employees</p>;

    const empOptions = employees.map(emp => ({
        value: emp._id,
        label: `${emp.name} (${emp.email})`
    }));

    const handleChange = (selected)=>{
        setSelectedEmployees(selected)
        onSelectEmployees(selected.map(emp => emp.value))
    }

    return (
        <Select
            closeMenuOnSelect={false}
            components={animatedComponents}
            isMulti
            options={empOptions}
            value={selectedEmployees}
            onChange={handleChange} 
            placeholder="Select employees..."
        />
    );
}
