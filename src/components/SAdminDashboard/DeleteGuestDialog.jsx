// app/guests/DeleteGuestDialog.jsx
"use client";

import { Button } from "@/components/ui/button";

export default function DeleteGuestDialog({
  guestName,
  open,
  onClose,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-4 text-red-600">
          Confirm Deletion
        </h2>
        <p className="mb-6">
          Are you sure you want to delete guest <strong>{guestName}</strong>?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
