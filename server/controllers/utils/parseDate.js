import * as chrono from "chrono-node";

export default function parseDate(dateText) {
  if (!dateText) return null;

  const now = new Date();

  // 🔹 Special hard-coded cases
  if (/end of day/i.test(dateText)) {
    now.setHours(17, 0, 0, 0);
    return now;
  }

  if (/today afternoon/i.test(dateText)) {
    now.setHours(15, 0, 0, 0);
    return now;
  }

  if (/tomorrow/i.test(dateText)) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (/morning/i.test(dateText)) tomorrow.setHours(9, 0, 0, 0);
    else if (/afternoon/i.test(dateText)) tomorrow.setHours(15, 0, 0, 0);
    else if (/evening/i.test(dateText)) tomorrow.setHours(19, 0, 0, 0);
    else tomorrow.setHours(17, 0, 0, 0);
    return tomorrow;
  }

  // 🔹 Handle relative durations like "in 10 minutes", "10 mins from now", "after 2 hrs"
  const relativeMatch = dateText.match(
    /(?:in|after)?\s*(\d+)\s*(minute|minutes|min|mins|m|hour|hours|hr|hrs|h|day|days|week|weeks|month|months|year|years)\s*(?:from now|later)?/i
  );

  if (relativeMatch) {
    const amount = parseInt(relativeMatch[1], 10);
    const unit = relativeMatch[2].toLowerCase();

    const futureDate = new Date(now);
    if (unit.startsWith("m") && (unit === "m" || unit.startsWith("min"))) {
      futureDate.setMinutes(now.getMinutes() + amount);
    } else if (unit.startsWith("h") || unit.startsWith("hr")) {
      futureDate.setHours(now.getHours() + amount);
    } else if (unit.startsWith("day")) {
      futureDate.setDate(now.getDate() + amount);
    } else if (unit.startsWith("week")) {
      futureDate.setDate(now.getDate() + amount * 7);
    } else if (unit.startsWith("month")) {
      futureDate.setMonth(now.getMonth() + amount);
    } else if (unit.startsWith("year")) {
      futureDate.setFullYear(now.getFullYear() + amount);
    }

    return futureDate;
  }

  // 🔹 Fallback to chrono natural language parsing
  const parsed = chrono.parseDate(dateText, now, { forwardDate: true });
  if (parsed) return parsed;

  // 🔹 Default: today end of day
  now.setHours(17, 0, 0, 0);
  return now;
}
