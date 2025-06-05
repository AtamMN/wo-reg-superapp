// app/guestbook/page.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import useUserInfo from "@/hooks/useUserInfo";
import GuestForm from "@/components/GuestBook/GuestForm";
import UserDropdown from "@/components/GuestBook/UserDropdown";
import { submitGuest } from "@/lib/firebase/guestbook";
import { Maximize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GuestBook() {
  const { currentUser } = useAuth();
  const { userInfo, loadingUser } = useUserInfo(currentUser);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const cardRef = useRef(null);
  const [showCloseButton, setShowCloseButton] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreen = !!document.fullscreenElement;
      setIsFullscreen(fullscreen);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleContainerDoubleClick = (e) => {
    if (
      isFullscreen &&
      cardRef.current &&
      !cardRef.current.contains(e.target)
    ) {
      setShowCloseButton(!showCloseButton);
    }
  };

  useEffect(() => {
    if (isFullscreen) {
      const timeout = setTimeout(() => {
        setShowCloseButton(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [showCloseButton, isFullscreen]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const result = await submitGuest(formData);

      if (result.success) {
        setMessage({
          type: "success",
          text: `Guest Successfully Submitted!`,
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
    <div
      className={`${
        isFullscreen
          ? "fixed inset-0 w-screen h-screen p-0" // Fullscreen styles
          : "min-h-screen flex items-center justify-center p-4 sm:p-6"
      } bg-[url('/bg-guestbook.png')] bg-cover bg-no-repeat bg-center`}
      onDoubleClick={handleContainerDoubleClick}
      onTouchEnd={(e) => {
        if (
          isFullscreen &&
          cardRef.current &&
          !cardRef.current.contains(e.target)
        ) {
          setShowCloseButton(!showCloseButton);
        }
      }}
    >
      <div
        className={`absolute inset-0 bg-black/50 ${
          isFullscreen ? "w-screen h-screen" : "w-full h-full"
        }`}
      />
      <div
        className={`flex ${
          isFullscreen ? "h-screen" : "h-full"
        } place-items-center justify-center relative z-10`}
      >
        <div
          ref={cardRef}
          className="bg-white rounded-lg shadow-lg p-6 sm:p-8 space-y-6 max-h-3/4 relative"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className={`transition-opacity duration-300 z-[999] bg-white/90 hover:bg-white ${
              isFullscreen ? "fixed top-4 right-4" : "absolute top-4 right-4"
            } ${
              isFullscreen && !showCloseButton ? "opacity-0" : "opacity-100"
            }`}
          >
            {isFullscreen ? (
              <X className="h-5 w-5" />
            ) : (
              <Maximize2 className="h-5 w-5" />
            )}
          </Button>

          <h1 className="text-2xl font-bold text-center">Guest Book</h1>

          <GuestForm
            validator={currentUser}
            onSubmit={handleSubmit}
            submitting={submitting}
          />

          {message.text ? (
            <p
              className={`text-center text-sm ${
                message.type === "success" ? "text-green-600" : "text-red-600"
              } animate-fade-out animate-duration-500 animate-delay-[3000ms]`}
              onAnimationEnd={() => setMessage({ type: "", text: "" })}
            >
              {message.text}
            </p>
          ) : (
            <div className="pb-3"></div>
          )}
        </div>

        {!isFullscreen && (
          <div className="fixed bottom-4 right-4 z-50">
            <UserDropdown
              currentUser={currentUser}
              userInfo={userInfo}
              loadingUser={loadingUser}
            />
          </div>
        )}
      </div>
    </div>
  );
}
