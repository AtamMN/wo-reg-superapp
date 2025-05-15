import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/firebase';
import { ref, onValue, update } from 'firebase/database';

export default function useGuests() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    const guestsRef = ref(db, 'guests');

    const unsubscribe = onValue(
      guestsRef,
      (snapshot) => {
        try {
          const data = snapshot.val();
          const guestsArray = Object.entries(data || {})
            .map(([id, guest]) => ({
              id,
              ...guest,
              timestamp: new Date(guest.timestamp).toLocaleString(),
            }))
            .filter(g => !g.deleted); // exclude deleted guests

          const columnNames = guestsArray.length > 0
            ? Object.keys(guestsArray[0])
            : ['id', 'name', 'phone', 'address', 'signature', 'timestamp', 'validator'];

          setGuests(guestsArray);
          setColumns(columnNames);
          setLoading(false);
        } catch (err) {
          setError(err.message);
          setLoading(false);
        }
      },
      (error) => {
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Update a guest by ID
  const updateGuest = async (id, updatedData) => {
    const guestRef = ref(db, `guests/${id}`);
    await update(guestRef, updatedData);
  };

  // Soft delete a guest (mark as deleted)
  const softDeleteGuest = async (id) => {
    const guestRef = ref(db, `guests/${id}`);
    await update(guestRef, { deleted: true });
  };

  // Update the isShared field of a guest
  const updateIsShared = async (id, isShared) => {
    const guestRef = ref(db, `guests/${id}`);
    await update(guestRef, { isShared });
  };

  return {
    guests,
    loading,
    error,
    columns,
    columnCount: columns.length,
    updateGuest,
    softDeleteGuest,
    updateIsShared // Add the function to return it
  };
}
