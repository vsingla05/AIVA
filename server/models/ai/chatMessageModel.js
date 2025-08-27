import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ["HR", "AI"],
    required: true,
  },
  hrId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "HR",
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
export default ChatMessage
