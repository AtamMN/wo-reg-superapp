"use client";

import { Button } from "@/components/ui/button";

const ShareGuestDialog = ({ guest, open, onClose }) => {
  if (!open || !guest) return null;

  const handleShare = () => {
    const message = `Hello ${guest.name},\n\nYou are invited to our event! Please confirm your attendance.`;
    const phoneNumber = guest.phone.replace(/\D/g, ""); // Ensure the phone number is in the correct format

    // WhatsApp URL format for sending messages
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    // Open WhatsApp with the invitation message
    window.open(whatsappUrl, "_blank");

    // Close the dialog after sharing
    onClose();
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h3 className="text-lg font-semibold">Share Invitation</h3>
        <p className="my-4">
          Are you sure you want to share the invitation with{" "}
          <span className="font-bold">{guest.name}</span>?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleShare}>
            Share on WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShareGuestDialog;
  