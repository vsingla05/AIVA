import { Task } from '../../models/employees/index.js';
import { Employee } from '../../models/employees/index.js';
import parseDate from '../utils/parseDate.js';
import cleanJSON from '../utils/cleanJson.js';
import SelectBestEmployee from '../ai/SelectBestEmployee.js';
import runPrompt from '../llmFunctions/createTask.js';
import generatePhasesAndReport from '../llmFunctions/generatePhasesAndReport.js';
import sendTaskEmail from '../auth/MailLayout.js';

export default async function HandleChatMessage(req, res) {
  const { command } = req.body;
  const hrId = req.user?._id;

  try {
    // STEP 1: Extract task fields from AI
    const extracted = await runPrompt('extractValues', command);
    const cleaned = cleanJSON(extracted);

    let taskData;
    try {
      taskData = JSON.parse(cleaned);
    } catch {
      return res.json({
        reply: "Sorry, I couldn't extract the task details properly. Could you rephrase?",
      });
    }

    // STEP 2: Find latest incomplete task OR create new
    let task = await Task.findOne({
      assignedBy: hrId,
      status: { $ne: 'DONE' },
    }).sort({ createdAt: -1 });

    if (!task) task = new Task({ assignedBy: hrId });
    console.log(task);

    // STEP 3: Merge AI fields
    if (taskData.task) task.title = taskData.task;

    if (taskData.deadline) {
      const parsedDate = parseDate(taskData.deadline);
      if (!parsedDate) {
        return res.status(400).json({
          reply:
            "Sorry, I couldn't understand the deadline. Please provide a clearer date/time.",
        });
      }
      task.dueDate = parsedDate;
    }

    if (taskData.priority) task.priority = taskData.priority;
    if (taskData.requiredSkills) task.requiredSkills = taskData.requiredSkills;
    if (taskData.estimatedHours) task.estimatedHours = taskData.estimatedHours;

    await task.save();
    console.log('partial task saved');

    // STEP 4: Check missing fields
    const mergedData = {
      task: task.title || '',
      deadline: task.dueDate ? task.dueDate.toISOString() : '',
      priority: task.priority || '',
    };
    const missingCheck = await runPrompt('missingField', mergedData);
    if (missingCheck !== 'All fields are complete.') {
      return res.json({ reply: missingCheck });
    }

    // STEP 5: Select best employee
    let bestEmployee, suggestions;
    try {
      ({ bestEmployee, suggestions } = await SelectBestEmployee(task));
    } catch (err) {
      console.error('Error selecting best employee:', err.message);
      return res.status(500).json({ reply: 'Failed to select employee.' });
    }

    if (!bestEmployee) {
      return res.status(500).json({ reply: 'No suitable employee found.' });
    }

    task.employeeId = bestEmployee._id;

    // STEP 6: Save fallback employees (excluding bestEmployee)
    if (suggestions.length > 0) {
      task.fallbackEmployees = suggestions
        .filter((e) => e._id.toString() !== bestEmployee._id.toString())
        .map((e) => e._id);
    }
    console.log(bestEmployee);
    await task.save();

    // STEP 7: Generate phases + PDF report
    let pdfUrl = '';
    try {
      const result = await generatePhasesAndReport(task, bestEmployee);
      pdfUrl = result.pdfUrl || '';
    } catch (err) {
      console.error('Error generating PDF report:', err);
      pdfUrl = ''; // fail gracefully
    }
    
    console.log(pdfUrl);
    // STEP 8: Update employee assignment status
    try {
      bestEmployee.isAssigned = true;
      await bestEmployee.save();
    } catch (err) {
      console.error('Error updating employee assignment:', err);
    }

    // STEP 9: Send email with PDF
    try {
      if (pdfUrl) await sendTaskEmail(bestEmployee, task, pdfUrl);
    } catch (err) {
      console.error('Error sending task email:', err);
    }

    // STEP 10: Construct reply
    const fallbackNames = suggestions
      .filter((e) => e._id.toString() !== bestEmployee._id.toString())
      .map((e) => e.name);

    const reply = `✅ Task saved successfully: "${task.title}" assigned to ${bestEmployee.name}.
Fallback employees: ${fallbackNames.length > 0 ? fallbackNames.join(', ') : 'None'}.
Deadline: ${task.dueDate ? task.dueDate.toISOString().split('T')[0] : 'N/A'}, 
Priority: ${task.priority || 'N/A'}, Estimated Hours: ${task.estimatedHours || 'N/A'}.
PDF report: ${pdfUrl ? pdfUrl : 'Not generated'}`;

    return res.json({ reply });
  } catch (err) {
    console.error('Error in HandleChatMessage:', err);
    return res
      .status(500)
      .json({ reply: 'Something went wrong while processing your task.' });
  }
}
