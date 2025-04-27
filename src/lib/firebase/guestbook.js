// lib/firebase/guestbook.js
import { ref, get, set } from "firebase/database";
import { db } from "@/lib/firebase/firebase";

export async function submitGuest(guestData) {
  try {
    const guestsRef = ref(db, "guests");
    const guestsSnap = await get(guestsRef);

    const existingGuests = guestsSnap.exists() ? guestsSnap.val() : {};
    const takenIds = Object.keys(existingGuests)
      .filter((id) => /^guest\d+$/.test(id))
      .map((id) => parseInt(id.replace("guest", "")))
      .sort((a, b) => a - b);

    let newIdNum = 1;
    for (let i = 0; i < takenIds.length; i++) {
      if (takenIds[i] !== newIdNum) break;
      newIdNum++;
    }

    await set(ref(db, `guests/guest${newIdNum}`), {
      ...guestData,
      timestamp: new Date().toISOString(),
      // validator field will be automatically included from guestData
    });
    
    return { success: true, id: newIdNum };
  } catch (error) {
    console.error("Error submitting guest:", error);
    return { success: false, error };
  }
}