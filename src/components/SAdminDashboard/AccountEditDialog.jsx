// AccountEditDialog Component
"use client";
import { getAuth } from "firebase/auth";
import { useState, useEffect } from "react";
import useUserInfo from "@/hooks/useUserInfo";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function AccountEditDialog({ isOpen, onClose, editData }) {
  const auth = getAuth();
  const { updateAccount } = useUserInfo(auth.currentUser);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || "",
        email: editData.email || "",
        role: editData.role || "user",
      });
    }
  }, [editData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  async function handleEmailUpdate() {
    try {
      const res = await fetch("/api/admin/update-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: editData.id,
          newEmail: formData.email,
        }),
      });

      const text = await res.text(); // ambil sebagai text dulu
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }

      if (!res.ok) {
        throw new Error(data?.error || "Unknown server error");
      }

      alert("Email updated successfully.");
      onClose();
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  const handleSubmit = async () => {
    if (!editData) return;

    try {
      // 🔹 1. Update Firebase AUTH (displayName only)
      if (auth.currentUser.uid === editData.id) {
        await updateProfile(auth.currentUser, {
          displayName: formData.name,
        });
      }

      // 🔹 2. Update Firebase Realtime Database
      await updateAccount(editData.id, {
        name: formData.name,
        role: formData.role,
      });

      onClose();
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update account");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-2">
            <label>Name</label>
            <input
              className="border rounded p-2"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label>Email</label>
            <input
              className="border rounded p-2"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label>Role</label>
            <Select
              value={formData.role}
              onValueChange={(v) => handleChange("role", v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">admin</SelectItem>
                <SelectItem value="user">user</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleEmailUpdate}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
