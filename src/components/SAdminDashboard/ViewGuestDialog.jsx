"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

function getTimeAgo(timestamp) {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now - then;

  const totalMins = Math.floor(diffMs / (1000 * 60));
  const days = Math.floor(totalMins / (60 * 24));
  const hours = Math.floor((totalMins % (60 * 24)) / 60);
  const minutes = totalMins % 60;

  let result = [];
  if (days > 0) result.push(`${days} day${days > 1 ? "s" : ""}`);
  if (hours > 0) result.push(`${hours} hour${hours > 1 ? "s" : ""}`);
  if (minutes > 0 || result.length === 0)
    result.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);

  return result.join(", ") + " ago";
}

function formatPresentTime(date) {
  return date.toLocaleString("en-US", {
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function ViewGuestDialog({ guest, open, onClose }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, [open]);

  if (!open || !guest) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Guest Details</h2>
        <div className="space-y-4">
          <div>
            <span className="font-medium">Name:</span> {guest.name}
          </div>
          <div>
            <span className="font-medium">Phone:</span> {guest.phone}
          </div>
          <div>
            <span className="font-medium">Address:</span> {guest.address}
          </div>
          <div>
            <span className="font-medium">Present time:</span>{" "}
            {formatPresentTime(currentTime)}{" "}
            <span className="text-muted-foreground">
              ({getTimeAgo(guest.timestamp)})
            </span>
          </div>
          <div>
            <span className="font-medium block mb-1">Signature:</span>
            <img
              src={guest.signature}
              alt="Signature"
              className="w-60 h-28 border object-contain bg-gray-100 p-2 rounded"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
