/**
 * Helper to convert 12-hour/24-hour time strings like '09:30 AM' or '18:30' into minutes from midnight
 */
function parseTimeToMinutes(timeStr) {
  if (!timeStr) return null;
  const cleaned = timeStr.trim().toUpperCase();
  const match = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3];

  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

/**
 * Checks if current server time is within active shift window
 */
function isWithinShiftWindow(startTimeStr, endTimeStr, now = new Date()) {
  const startMin = parseTimeToMinutes(startTimeStr) ?? (9 * 60 + 30); // 09:30 AM default
  const endMin = parseTimeToMinutes(endTimeStr) ?? (18 * 60 + 30);   // 06:30 PM default

  // Current server time in minutes from midnight
  const nowMin = now.getHours() * 60 + now.getMinutes();

  if (startMin <= endMin) {
    // Normal day shift: e.g. 09:30 to 18:30
    return nowMin >= startMin && nowMin < endMin;
  } else {
    // Overnight shift: e.g. 21:00 to 06:00
    return nowMin >= startMin || nowMin < endMin;
  }
}

module.exports = {
  parseTimeToMinutes,
  isWithinShiftWindow
};

