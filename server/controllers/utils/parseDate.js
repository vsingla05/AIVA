import * as chrono from "chrono-node";


export default function parseDate(dateText) {
  if (!dateText) return null;

  const now = new Date();

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

  const parsed = chrono.parseDate(dateText, now, { forwardDate: true });
  if (parsed) return parsed;

  now.setHours(17, 0, 0, 0);
  return now;
}