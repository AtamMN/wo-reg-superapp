// hooks/useInvitation.js
import { useState, useEffect } from "react";
import { ref, get, set } from "firebase/database";
import { db } from "@/lib/firebase/firebase";

export default function useInvitation() {
  const [formData, setFormData] = useState({
    openingMessage: "",
    lokasi: "",
    jam: "",
    tanggal: "",
    closingStatement: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const invitationRef = ref(db, "invitation");
        const snapshot = await get(invitationRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          setFormData({
            openingMessage: data.openingMessage || "",
            lokasi: data.lokasi || "",
            jam: data.jam || "",
            tanggal: data.tanggal || "",
            closingStatement: data.closingStatement || "",
          });
        } else {
          console.log("No invitation data found in Firebase.");
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update the invitation data in Firebase
  const updateInvitation = async (newData) => {
    try {
      const invitationRef = ref(db, "invitation");
      await set(invitationRef, newData);
      setFormData(newData); // Update local state with the new data
    } catch (error) {
      console.error("Error updating invitation: ", error);
      alert("Failed to update invitation.");
    }
  };

  return {
    formData,
    loading,
    error,
    updateInvitation,
  };
}
