import mongoose from "mongoose";
import { model } from './geminiClient.js';
import ChatMessage from "../../models/ai/chatMessageModel.js";
import { Employee, Task } from "../../models/employees/index.js";

export default async function HandleChatMessage(req, res) {
  const { command, hrId } = req.body;
  const employeeId = req.user?._id;



  // Check required data
  if (!command || !hrId) {
    return res.status(400).json({ reply: "Missing command or hrId" });
  }

  if (!employeeId) {
    return res.status(400).json({ reply: "User not authenticated or missing employeeId" });
  }

  try {
    // Save HR message
    await ChatMessage.create({ sender: "HR", hrId, message: command });

    // Prepare AI prompt
    const prompt = `
      You are an office AI assistant.
      Extract task info from the following command:
      "${command}"
      Return strictly valid JSON ONLY in this format:
      {"title":"...", "description":"...", "dueDate":"YYYY-MM-DD", "priority":"high/medium/low"}
      DO NOT include any explanations or extra text.
    `;

    // Call Gemini
    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text(); // ensure it's a string
    console.log("Raw AI response:", aiResponse);

    // Extract JSON safely
    const jsonMatch = aiResponse.match(/\{.*\}/s);
    if (!jsonMatch) {
      return res.json({ reply: "Could not understand the command." });
    }

    let taskData;
    try {
      taskData = JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error("JSON parse error:", err);
      return res.json({ reply: "Could not understand the command." });
    }

    // Find employee
    const employee = await Employee.findById(employeeId); // Mongoose accepts string ID directly
    console.log("Found employee:", employee);
    if (!employee) return res.json({ reply: "Employee not found." });

    // Normalize priority
    const priorityMap = {
      low: "LOW",
      medium: "MEDIUM",
      high: "HIGH",
    };

    // Default dueDate if missing
    let dueDate = null;
    if (taskData.dueDate) {
      const date = new Date(taskData.dueDate);
      if (!isNaN(date)) dueDate = date;
    }

    // Create task
    const task = await Task.create({
      title: taskData.title || "Untitled Task",
      description: taskData.description || "",
      employeeId: employee._id,
      assignedBy: hrId,
      dueDate,
      priority: priorityMap[taskData.priority?.toLowerCase()] || "MEDIUM",
      status: "TODO",
    });

    const replyText = `Task "${task.title}" assigned to ${employee.name} (Due: ${task.dueDate?.toDateString() || "No date"})`;

    // Save AI response
    await ChatMessage.create({ sender: "AI", hrId, message: replyText });

    res.json({ reply: replyText });
  } catch (err) {
    console.error("Error in HandleChatMessage:", err);
    res.status(500).json({ reply: "Server error." });
  }
}
