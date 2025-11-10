import { SelectBestEmployee } from "./SelectBestEmployee.js";
import Employee from "../../models/employees/index.js";
import { Task } from "../../models/employees/index.js";
import sendTaskEmail from "../mails/taskMail.js";

/**
 * 🔹 Full pipeline: Select best employee, assign task, update DB, log reasoning.
 * @param {Object} task - Newly created task document
 * @returns {Object} - assignment result
 */
export async function AssignTaskWithAI(task) {
  try {
    console.log("🤖 Running AI assignment pipeline...");

    // STEP 1️⃣ — Get best + fallback employees via Gemini reasoning
    const { bestEmployee, suggestions, reasoning } = await SelectBestEmployee(task);

    if (!bestEmployee) {
      return { success: false, message: "No suitable employee found." };
    }

    // STEP 2️⃣ — Update task assignment info
    task.employeeId = bestEmployee._id;
    task.fallbackEmployees = suggestions?.map((e) => e._id) || [];
    task.reasoning = reasoning;
    task.assignedAt = new Date();
    await task.save();

    // STEP 3️⃣ — Update main employee load + mark assigned
    bestEmployee.currentLoad += task.estimatedHours || 0;
    bestEmployee.isAssigned = true;
    bestEmployee.totalTaskAssigned += 1;
    await bestEmployee.save();

    // STEP 4️⃣ — Update fallback employees’ report logs
    for (const fb of suggestions || []) {
      const emp = await Employee.findById(fb._id);
      if (!emp) continue;
      emp.reports.push({
        taskId: task._id,
        pdfUrl: task.pdfUrl || "",
        createdAt: new Date(),
      });
      await emp.save();
    }

    // STEP 5️⃣ — Log reasoning (for HR transparency)
    const reasoningLog = {
      taskId: task._id,
      bestEmployee: bestEmployee.name,
      fallbackEmployees: suggestions.map((s) => s.name),
      aiReasoning: reasoning,
      createdAt: new Date(),
    };
    console.log("🧠 Reasoning Log:", reasoningLog);

    // (Optional: save reasoning logs to Mongo)
    await Task.findByIdAndUpdate(task._id, {
      $push: { aiLogs: reasoningLog },
    });

    // STEP 6️⃣ — Send email notifications
    try {
      await sendTaskEmail(bestEmployee, task, task.pdfUrl || "");
      for (const fb of suggestions || []) {
        await sendTaskEmail(fb, task, task.pdfUrl || "");
      }
    } catch (err) {
      console.error("📧 Email sending failed:", err);
    }

    console.log(`✅ Task '${task.title}' assigned to ${bestEmployee.name}`);
    return {
      success: true,
      bestEmployee,
      fallbacks: suggestions,
      reasoning,
    };
  } catch (err) {
    console.error("❌ Error in AssignTaskWithAI:", err);
    return { success: false, message: "Internal AI assignment error." };
  }
}
