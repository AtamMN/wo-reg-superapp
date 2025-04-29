// hooks/useGuests.js
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/firebase';
import { ref, onValue } from 'firebase/database';

export default function useGuests() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    const guestsRef = ref(db, 'guests');
    
    const unsubscribe = onValue(guestsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        const guestsArray = Object.entries(data || {}).map(([id, guest]) => ({
          id,
          ...guest,
          timestamp: new Date(guest.timestamp).toLocaleString()
        }));

        // Get column names from first item (if exists)
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
    }, (error) => {
      setError(error.message);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return { 
    guests, 
    loading, 
    error, 
    columns, 
    columnCount: columns.length 
  };
}