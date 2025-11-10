import chrono from "chrono-node";
import { parse, isValid } from "date-fns";

export default function parseFlexibleDate(dateText) {
  if (!dateText) return null;
  const now = new Date();

  // 1️⃣ Numeric formats: 21/12/2025 or 12-31-2025
  const numMatch = dateText.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
  if (numMatch) {
    const [_, part1, part2, part3] = numMatch;
    const isDMY = parseInt(part1) > 12;
    const fmt = isDMY ? "dd/MM/yyyy" : "MM/dd/yyyy";
    const parsed = parse(`${part1}/${part2}/${part3}`, fmt, now);
    if (isValid(parsed)) return parsed;
  }

  // 2️⃣ Custom HR phrases
  if (/end of day/i.test(dateText)) return new Date(now.setHours(17, 0, 0, 0));
  if (/today afternoon/i.test(dateText)) return new Date(now.setHours(15, 0, 0, 0));

  if (/tomorrow/i.test(dateText)) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (/morning/i.test(dateText)) tomorrow.setHours(9, 0, 0, 0);
    else if (/afternoon/i.test(dateText)) tomorrow.setHours(15, 0, 0, 0);
    else if (/evening/i.test(dateText)) tomorrow.setHours(19, 0, 0, 0);
    else tomorrow.setHours(17, 0, 0, 0);
    return tomorrow;
  }

  // 3️⃣ Relative durations (in 2 hours, after 3 days, etc.)
  const relMatch = dateText.match(
    /(?:in|after)?\s*(\d+)\s*(minute|minutes|min|mins|m|hour|hours|hr|hrs|h|day|days|week|weeks|month|months|year|years)\s*(?:from now|later)?/i
  );
  if (relMatch) {
    const amount = parseInt(relMatch[1], 10);
    const unit = relMatch[2].toLowerCase();
    const future = new Date(now);
    if (unit.startsWith("m") && (unit === "m" || unit.startsWith("min"))) future.setMinutes(now.getMinutes() + amount);
    else if (unit.startsWith("h")) future.setHours(now.getHours() + amount);
    else if (unit.startsWith("day")) future.setDate(now.getDate() + amount);
    else if (unit.startsWith("week")) future.setDate(now.getDate() + 7 * amount);
    else if (unit.startsWith("month")) future.setMonth(now.getMonth() + amount);
    else if (unit.startsWith("year")) future.setFullYear(now.getFullYear() + amount);
    return future;
  }

  // 4️⃣ Chrono fallback for natural expressions
  const parsed = chrono.parseDate(dateText, now, { forwardDate: true });
  if (parsed) return parsed;

  // 5️⃣ Final fallback: today 5 PM
  return new Date(now.setHours(17, 0, 0, 0));
}
