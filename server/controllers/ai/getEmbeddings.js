import Employee from "../../models/employees/employeeModel.js";
import { pipeline } from "@xenova/transformers";

// Singleton to hold the model pipeline so we only load it once
class EmbeddingService {
  static task = "feature-extraction";
  static model = "Xenova/all-MiniLM-L6-v2";
  static instance = null;

  static async getInstance() {
    if (!this.instance) {
      console.log("⚙️ Loading local embedding model...");
      this.instance = await pipeline(this.task, this.model);
    }
    return this.instance;
  }
}

export async function getEmbedding(text, employeeId = null) {
  if (!text) throw new Error("❌ Empty text for embedding");

  const normalized = text.trim().toLowerCase();

  // 1️⃣ Check Employee Cache First (Your existing logic)
  if (employeeId) {
    const emp = await Employee.findById(employeeId).select("skillEmbeddings");
    const cached = emp?.skillEmbeddings?.find(
      (s) => s.skill.toLowerCase() === normalized
    );

    if (cached) {
      return cached.embedding;
    }
  }

  // 2️⃣ Generate Fresh Embedding Locally (FREE)
  let embedding;
  try {
    const extractor = await EmbeddingService.getInstance();
    
    // Generate embedding
    // pooling: 'mean' averages the token vectors to get one sentence vector
    // normalize: true ensures cosine similarity works correctly later
    const output = await extractor(normalized, { pooling: 'mean', normalize: true });
    
    // Convert Tensor to plain JavaScript Array
    embedding = Array.from(output.data);
    
  } catch (err) {
    console.error("❌ Local Embedding Error:", err);
    throw new Error("Embedding generation failed");
  }

  // 3️⃣ Cache embedding (Your existing logic)
  if (employeeId) {
    // Using updateOne is often slightly faster/safer for concurrent writes than findByIdAndUpdate with pull/push separate
    await Employee.updateOne(
      { _id: employeeId },
      { $pull: { skillEmbeddings: { skill: normalized } } }
    );

    await Employee.updateOne(
      { _id: employeeId },
      { 
        $push: {
          skillEmbeddings: {
            skill: normalized,
            embedding,
            updatedAt: new Date(),
          },
        },
      }
    );
  }

  return embedding;
}