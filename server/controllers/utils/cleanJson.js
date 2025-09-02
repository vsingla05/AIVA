export default function cleanJSON(aiOutput) {
  return aiOutput
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}