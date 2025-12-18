import Employee from '../../models/employees/employeeModel.js'

export async function getAllEmployees(req, res) {
  try {
    const employees = await Employee.find({ role: "EMPLOYEE", isActive: true })
      .select(
        "name email department role imageUrl joinDate currentLoad availability performance taskStats isAssigned"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (err) {
    console.error("❌ getAllEmployees error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch employees",
    });
  }
}
