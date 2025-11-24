// lib/firebase/attendance.js
import { ref, get, query, orderByChild, equalTo, set, push } from "firebase/database";
import { db } from "@/lib/firebase/firebase";

/**
 * Get current date in YYYY-MM-DD format (WIB timezone)
 */
function getTodayDateWIB() {
  const now = new Date();
  // Convert to WIB (UTC+7)
  const wibOffset = 7 * 60; // 7 hours in minutes
  const localOffset = now.getTimezoneOffset(); // Local offset in minutes
  const wibTime = new Date(now.getTime() + (wibOffset + localOffset) * 60000);
  
  const year = wibTime.getFullYear();
  const month = String(wibTime.getMonth() + 1).padStart(2, '0');
  const day = String(wibTime.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Get current timestamp in WIB timezone
 */
function getTimestampWIB() {
  const now = new Date();
  // Convert to WIB (UTC+7)
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
  return date.toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

/**
 * Check if user already did attendance today
 * @param {string} userId - User ID
 * @returns {Promise<{exists: boolean, timestamp?: string}>}
 */
export async function checkTodayAttendance(userId) {
  try {
    const today = getTodayDateWIB();
    const attendanceRef = ref(db, "attendance");
    const snapshot = await get(attendanceRef);
    
    if (snapshot.exists()) {
      const attendanceData = snapshot.val();
      
      // Loop through all attendance records
      for (const key in attendanceData) {
        const record = attendanceData[key];
        if (record.userId === userId && record.date === today) {
          return {
            exists: true,
            timestamp: record.timestamp
          };
        }
      }
    }
    
    return { exists: false };
  } catch (error) {
    console.error("Error checking attendance:", error);
    throw error;
  }
}

/**
 * Save attendance record
 * @param {string} userId - User ID
 * @param {string} userName - User name
 * @param {string} userEmail - User email
 * @returns {Promise<{success: boolean, timestamp: string}>}
 */
export async function saveAttendance(userId, userName, userEmail) {
  try {
    const timestamp = getTimestampWIB();
    const date = getTodayDateWIB();
    
    const attendanceRef = ref(db, "attendance");
    const newAttendanceRef = push(attendanceRef);
    
    await set(newAttendanceRef, {
      userId,
      userName,
      userEmail,
      timestamp,
      date,
      createdAt: new Date().toISOString()
    });
    
    return {
      success: true,
      timestamp
    };
  } catch (error) {
    console.error("Error saving attendance:", error);
    throw error;
  }
}
