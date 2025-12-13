import { SelectBestEmployee } from "./SelectBestEmployee.js";
import Employee from "../../models/employees/employeeModel.js";
import { Task } from "../../models/employees/index.js";

export async function AssignTaskWithAI(task) {
  try {
    console.log("🤖 AI Assignment…");

    const { bestEmployee, suggestions, reasoning } = await SelectBestEmployee(
      task
    );

    if (!bestEmployee) {
      return { success: false, message: "No suitable employee found." };
    }

    task.employeeId = bestEmployee._id;
    task.fallbackEmployees = suggestions.map((e) => e._id);
    task.reasoning = reasoning;
    task.status = "TODO";
    await task.save();

    await Task.findByIdAndUpdate(task._id, {
      $push: {
        aiLogs: {
          bestEmployee: bestEmployee.name,
          fallbackEmployees: suggestions.map((s) => s.name),
          aiReasoning: reasoning,
          createdAt: new Date(),
        },
      },
    });

    return {
      success: true,
      bestEmployee,
      fallbacks: suggestions,
      reasoning,
      taskId: task._id,
    };
  } catch (err) {
    console.error("❌ AssignTaskWithAI Error:", err);
    return { success: false, message: "Internal AI assignment error." };
  }
}



