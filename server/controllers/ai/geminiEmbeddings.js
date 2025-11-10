import { GoogleGenerativeAI } from "@google/generative-ai";
import { Employee } from "../models/employees/Employee.js";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || "models/embedding-001";

/**
 * Get Gemini embedding for a text or skill.
 * Optionally cache per employee in DB.
 */
export async function getGeminiEmbedding(text, employeeId = null) {
  if (!text) throw new Error("❌ Empty text for embedding");

  const normalized = text.trim().toLowerCase();

  // 1️⃣ Try fetching from employee cache if ID provided
  if (employeeId) {
    const emp = await Employee.findById(employeeId).select("skillEmbeddings");
    const cached = emp?.skillEmbeddings?.find(
      (s) => s.skill.toLowerCase() === normalized
    );
    if (cached) {
      return cached.embedding;
    }
  }

  // 2️⃣ Otherwise, fetch new embedding from Gemini API
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
  const result = await model.embedContent(normalized);
  const embedding = result.embedding.values; // Float array

  // 3️⃣ Cache back to employee document
  if (employeeId) {
    await Employee.findByIdAndUpdate(employeeId, {
      $pull: { skillEmbeddings: { skill: normalized } }, // remove old if any
    });
    await Employee.findByIdAndUpdate(employeeId, {
      $push: {
        skillEmbeddings: {
          skill: normalized,
          embedding,
          updatedAt: new Date(),
        },
      },
    });
  }

  return embedding;
}
