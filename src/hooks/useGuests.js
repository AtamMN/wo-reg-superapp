// hooks/useGuests.js
import { useState, useEffect } from 'react';

export default function useGuests() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    const fetchGuests = async () => {
      try {
        const response = await fetch(
          'https://wo-reg-superapp-default-rtdb.asia-southeast1.firebasedatabase.app/guests.json',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch guests');
        }

        const data = await response.json();
        
        // Transform the Firebase object to array
        const guestsArray = Object.entries(data || {}).map(([id, guest]) => ({
          id,
          ...guest,
          timestamp: new Date(guest.timestamp).toLocaleString()
        }));

        // Get column names from first item (if exists)
        const columnNames = 
        // guestsArray.length > 0 
        //   ? Object.keys(guestsArray[0])
        //   : 
          ['id', 'name', 'phone', 'address', 'signature', 'timestamp', 'validator']; // Default columns

        setGuests(guestsArray);
        setColumns(columnNames);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchGuests();
  }, []);

  return { 
    guests, 
    loading, 
    error, 
    columns, 
    columnCount: columns.length 
  };
}