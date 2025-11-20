import { SelectBestEmployee } from "./SelectBestEmployee.js";
import Employee from "../../models/employees/employeeModel.js";
import { Task } from "../../models/employees/index.js";
import sendTaskEmail from "../mails/taskMail.js";

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
    task.status = "ASSIGNED";
    await task.save();


    for (const fb of suggestions) {
      await Employee.findByIdAndUpdate(fb._id, {
        $push: {
          reports: {
            taskId: task._id,
            createdAt: new Date(),
            isFallback: true,
          },
          notifications: {
            message: `A new task (${
              task.title || task._id
            }) was created and you are selected as a fallback employee.`,
            createdAt: new Date(),
            taskId: task._id,
            isRead: false,
          },
        },
      });
    }

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

    try {
      await sendTaskEmail(bestEmployee, task, task.pdfUrl);

      for (const fb of suggestions) {
        await sendTaskEmail(fb, task, task.pdfUrl);
      }
    } catch (err) {
      console.error("Email error:", err);
    }

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
