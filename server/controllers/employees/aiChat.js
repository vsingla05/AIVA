import runPrompt from '../llmFunctions/createTask.js'
import { handleLeaveAction } from "../leave/handleLeaveAction.js";

/**
 * Main AI Chat Controller
 */
export const aiChat = async (req, res) => {
  try {
    const { command } = req.body;
    const employeeId = req.user._id;

    console.log("command in aichat", command)
    

    if (!command?.trim()) {
      return res.status(400).json({ reply: "Please type something." });
    }

    // 1️⃣ Intent detection
    const intentRaw = await runPrompt("identifyIntent", {
      user_message: command,
    });

    const intent = intentRaw.replace(/[^A-Z_]/gi, "").toUpperCase();

    // 2️⃣ Route based on intent
    if (intent === "LEAVE_APPLY") {
      const reply = await handleLeaveAction(command, employeeId);
      return res.json({ reply });
    }

    // 3️⃣ Normal chat fallback
    const chatReply = await runPrompt("generalChat", {
      user_message: command,
    });

    return res.json({ reply: chatReply });
  } catch (error) {
    console.error("AI Chat Error:", error);
    return res.status(500).json({
      reply: "Something went wrong. Please try again.",
    });
  }
};
