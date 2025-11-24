// app/guests/UpdateGuestDialog.jsx
"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

export default function UpdateGuestDialog({ guest, open, onClose, onSave }) {
  const nameRef = useRef(null);

  useEffect(() => {
    if (open && nameRef.current) {
      nameRef.current.focus();
    }
  }, [open]);

  if (!open || !guest) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const updatedGuest = {
      ...guest,
      name: form.name.value,
      phone: form.phone.value,
      address: form.address.value,
    };
    onSave(updatedGuest);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Edit Guest</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              name="name"
              defaultValue={guest.name}
              ref={nameRef}
              className="w-full border rounded px-3 py-2 mt-1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Phone</label>
            <input
              name="phone"
              defaultValue={guest.phone}
              className="w-full border rounded px-3 py-2 mt-1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Address</label>
            <input
              name="address"
              defaultValue={guest.address}
              className="w-full border rounded px-3 py-2 mt-1"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
