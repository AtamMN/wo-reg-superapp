// components/AddGuestDialog.jsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function AddGuestDialog({ open, onOpenChange, onAdd }) {
  const [form, setForm] = useState({ name: "", phone: "", address: "" });

  useEffect(() => {
    if (open) {
      setForm({ name: "", phone: "", address: "" });
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      return;
    }
    onAdd(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Guest</DialogTitle>
          <DialogDescription>Fill out the form below to add a new guest.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <input
            className="border rounded px-2 py-1 w-full"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Name"
          />
          <input
            className="border rounded px-2 py-1 w-full"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone"
          />
          <input
            className="border rounded px-2 py-1 w-full"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Address"
          />
        </div>

        <DialogFooter>
          <Button onClick={handleAdd}>Add</Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
