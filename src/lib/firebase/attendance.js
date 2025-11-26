// lib/firebase/attendance.js
import { ref, get, set, update } from "firebase/database";
import { db } from "@/lib/firebase/firebase";

/**
 * Get current date in YYYY-MM-DD format (WIB timezone)
 */
function getTodayDateWIB() {
  const now = new Date();
  const wibOffset = 7 * 60; 
  const localOffset = now.getTimezoneOffset();
  const wibTime = new Date(now.getTime() + (wibOffset + localOffset) * 60000);

  const year = wibTime.getFullYear();
  const month = String(wibTime.getMonth() + 1).padStart(2, "0");
  const day = String(wibTime.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Get current timestamp (ISO) in WIB timezone
 */
function getTimestampWIB() {
  const now = new Date();
  const wibOffset = 7 * 60;
  const localOffset = now.getTimezoneOffset();
  const wibTime = new Date(now.getTime() + (wibOffset + localOffset) * 60000);

  return wibTime.toISOString();
}

/**
 * Format timestamp to readable format (WIB)
 */
export function formatTimestampWIB(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

/**
 * Check today's attendance (return masuk / keluar)
 * @param {string} userId
 */
export async function checkTodayAttendance(userId) {
  try {
    const today = getTodayDateWIB();
    const attendanceRef = ref(db, `attendance/${userId}/${today}`);

    const snapshot = await get(attendanceRef);

    if (snapshot.exists()) {
      return {
        exists: true,
        data: snapshot.val(),
      };
    }

    return { exists: false, data: null };
  } catch (error) {
    console.error("Error checking attendance:", error);
    throw error;
  }
}

/**
 * Save Attendance (masuk / keluar)
 * @param {string} userId
 * @param {string} userName
 * @param {string} userEmail
 * @param {"masuk"|"keluar"} type
 */
export async function saveAttendance(userId, userName, userEmail, type) {
  try {
    const timestamp = getTimestampWIB();
    const today = getTodayDateWIB();
    const attendancePath = `attendance/${userId}/${today}`;

    const updates = {};

    // Simpan info user (sekali per hari)
    updates[`${attendancePath}/userId`] = userId;
    updates[`${attendancePath}/name`] = userName;
    updates[`${attendancePath}/email`] = userEmail;

    // Simpan jam masuk atau keluar
    if (type === "masuk") {
      updates[`${attendancePath}/masuk`] = timestamp;
    } else if (type === "keluar") {
      updates[`${attendancePath}/keluar`] = timestamp;
    }

    await update(ref(db), updates);

    return {
      success: true,
      timestamp,
    };
  } catch (error) {
    console.error("Error saving attendance:", error);
    throw error;
  }
}
