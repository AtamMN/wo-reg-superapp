// app/guestbook/page.jsx
"use client";

import { useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import useUserInfo from "@/hooks/useUserInfo";
import GuestForm from "@/components/GuestBook/GuestForm";
import UserDropdown from "@/components/GuestBook/UserDropdown";
import { submitGuest } from "@/lib/firebase/guestbook";

export default function GuestBook() {
  const { currentUser } = useAuth();
  const { userInfo, loadingUser } = useUserInfo(currentUser);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const result = await submitGuest(formData);

      if (result.success) {
        setMessage({
          type: "success",
          text: `Guest #${result.id} submitted!`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Submission failed. Please try again.",
      });
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-xl">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 space-y-6">
          <h1 className="text-2xl font-bold text-center">Guest Book</h1>

          <GuestForm
            validator={currentUser}
            onSubmit={handleSubmit}
            submitting={submitting}
          />

          {message.text && (
            <p
              className={`text-center text-sm ${
                message.type === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {message.text}
            </p>
          )}
        </div>

        <div className="fixed bottom-4 right-4 z-50">
          <UserDropdown
            currentUser={currentUser}
            userInfo={userInfo}
            loadingUser={loadingUser}
          />
        </div>
      </div>
    </div>
  );
}