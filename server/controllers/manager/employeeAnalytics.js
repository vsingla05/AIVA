import Task from "../../models/employees/taskModel.js";
import Employee from "../../models/employees/employeeModel.js";

export const getEmployeeAnalytics = async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments();

    const completedTasks = await Task.countDocuments({ status: "DONE" });
    const delayedTasks = await Task.countDocuments({
      "taskDelay.isDelayed": true,
    });

    const successRate = totalTasks
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

    // Delay breakdown
    const minorDelays = await Task.countDocuments({
      "taskDelay.delayDays": { $gt: 0, $lte: 2 },
    });

    const majorDelays = await Task.countDocuments({
      "taskDelay.delayDays": { $gte: 3 },
    });

    const onTime = totalTasks - minorDelays - majorDelays;

    // Top performers
    const topEmployees = await Employee.find({ isActive: true })
      .select("name performance taskStats")
      .sort({ "performance.avgQualityRating": -1 })
      .limit(5);

    const leaderboard = topEmployees.map(emp => ({
      name: emp.name,
      completed: emp.taskStats.completedTasks || 0,
      quality: emp.performance.avgQualityRating || 0,
    }));

    res.status(200).json({
      success: true,
      stats: {
        avgPerformance: Math.round(
          topEmployees.reduce(
            (acc, e) => acc + (e.performance.performanceScore || 0),
            0
          ) / (topEmployees.length || 1)
        ),
        successRate,
        delayedTasks,
        avgEfficiency: Math.round(
          topEmployees.reduce(
            (acc, e) => acc + (e.performance.efficiency || 0),
            0
          ) / (topEmployees.length || 1)
        ),
      },
      reliability: {
        onTimePercent: Math.round((onTime / totalTasks) * 100) || 0,
        minorPercent: Math.round((minorDelays / totalTasks) * 100) || 0,
        majorPercent: Math.round((majorDelays / totalTasks) * 100) || 0,
      },
      leaderboard,
    });
  } catch (err) {
    console.error("Employee analytics error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load analytics",
    });
  }
};
