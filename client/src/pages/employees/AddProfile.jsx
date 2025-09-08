import { useState, useEffect } from "react";
import api from "../../components/auth/api";

export default function Profile() {
  const [employee, setEmployee] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (formData) => {

    const res = await api.post('/employee/addProfile')
    if(res.status === 200){
        const data = await res.data.employee
        setEmployee(data);
        setEditing(false);
    }
  };

  if (!employee) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-2xl p-6">
        {/* Profile header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200">
            {employee.imageUrl ? (
              <img src={employee.imageUrl} alt={employee.name} className="w-full h-full object-cover" />
            ) : (
              <span className="flex items-center justify-center w-full h-full text-xl font-bold text-gray-500">
                {employee.name[0]}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{employee.name}</h2>
            <p className="text-gray-500">{employee.role}</p>
            <p className="text-sm text-gray-400">
              Joined {new Date(employee.joinDate).toDateString()}
            </p>
          </div>
        </div>

        {/* Editable fields */}
        <div className="grid gap-4">
          <input
            type="text"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={!editing}
            placeholder="Email"
            className="border p-2 rounded-md"
          />
          <input
            type="text"
            name="phone"
            value={formData.phone || ""}
            onChange={handleChange}
            disabled={!editing}
            placeholder="Phone"
            className="border p-2 rounded-md"
          />
          <textarea
            name="address"
            value={formData.address || ""}
            onChange={handleChange}
            disabled={!editing}
            placeholder="Address"
            className="border p-2 rounded-md"
          />
        </div>

        {/* Skills */}
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {employee.skills.length > 0 ? (
              employee.skills.map((s, idx) => (
                <span
                  key={idx}
                  className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full"
                >
                  {s.name} (Lvl {s.level})
                </span>
              ))
            ) : (
              <p className="text-gray-400">No skills added</p>
            )}
          </div>
        </div>

        {/* Availability */}
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Availability</h3>
          <p>Max weekly hours: {employee.availability.maxWeeklyHours}</p>
          <p>Current load: {employee.currentLoad} hrs</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-6">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="border px-4 py-2 rounded-md"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
