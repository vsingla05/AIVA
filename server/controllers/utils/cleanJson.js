// export default function cleanJSON(rawText) {
//   // 1. Validate Input
//   if (!rawText || typeof rawText !== "string") {
//     throw new Error("❌ cleanJSON: Input must be a non-empty string.");
//   }

//   let cleaned = rawText.trim();

//   // 2. Remove Markdown Fences
//   // Handles ```json, ``` and trims whitespace.
//   cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/```$/, "");

//   // 3. Robustly Extract Core JSON
//   // Finds the first '{' or '[' and then seeks its matching '}' or ']'
//   // This is more reliable than a single regex for finding the JSON payload.
//   const firstBracket = cleaned.indexOf('{');
//   const firstSquare = cleaned.indexOf('[');

//   let startIndex;
//   if (firstBracket === -1 && firstSquare === -1) {
//     throw new Error("Invalid JSON: No '{' or '[' found in the input.");
//   }

//   if (firstBracket !== -1 && (firstBracket < firstSquare || firstSquare === -1)) {
//     startIndex = firstBracket;
//   } else {
//     startIndex = firstSquare;
//   }

//   const openChar = cleaned[startIndex];
//   const closeChar = openChar === '{' ? '}' : ']';
//   let openCount = 0;
//   let endIndex = -1;

//   for (let i = startIndex; i < cleaned.length; i++) {
//     if (cleaned[i] === openChar) openCount++;
//     if (cleaned[i] === closeChar) openCount--;
//     if (openCount === 0) {
//       endIndex = i;
//       break;
//     }
//   }

//   if (endIndex === -1) {
//     throw new Error("Invalid JSON: Could not find matching closing bracket/brace.");
//   }

//   cleaned = cleaned.substring(startIndex, endIndex + 1);

//   // 4. Perform Serial Corrections on the Extracted JSON String.
//   // The order of these replacements is important.

//   // Remove comments (both single and multi-line)
//   cleaned = cleaned.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');

//   // Add double quotes to unquoted keys. E.g., {key: "value"} -> {"key": "value"}
//   // Looks for a brace or comma, optional whitespace, a word, optional whitespace, and a colon.
//   cleaned = cleaned.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');

//   // Replace single quotes used for strings with double quotes.
//   // This is a common AI error but can be risky if a value contains an apostrophe.
//   // For most AI JSON cleanup, this is a net positive.
//   cleaned = cleaned.replace(/'/g, '"');

//   // Remove trailing commas before a closing bracket or brace.
//   cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');


//   // 5. Final Validation Attempt
//   try {
//     // If it parses, we have a valid JSON string.
//     JSON.parse(cleaned);
//     return cleaned;
//   } catch (err) {
//     console.error("❌ cleanJSON failed after all cleaning steps:", err.message);
//     console.error("Original Text:", rawText);
//     console.error("Cleaned Text Attempt:", cleaned);
//     throw new Error("Failed to parse JSON. The AI response is likely severely malformed.");
//   }
// }

// // cleanJSON.js - END OF FILE



export default function cleanJSON(aiOutput) {
  return aiOutput
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}