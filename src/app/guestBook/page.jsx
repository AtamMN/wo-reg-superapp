"use client";

import { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { ref, get, set } from "firebase/database";
import { db } from "@/lib/firebase/firebase";
import { useAuth } from "@/lib/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, LogIn, User as UserIcon } from "lucide-react";

export default function GuestBook() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isSigned, setIsSigned] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const sigCanvas = useRef();
  const { user, logout } = useAuth();

  // Track signature changes
  const handleSignature = () => {
    if (!sigCanvas.current) return;
    setIsSigned(!sigCanvas.current.isEmpty());
  };

  const handleSubmit = async () => {
    setMessage({ type: "", text: "" });

    if (!name.trim() || !phone.trim() || !address.trim()) {
      setMessage({ type: "error", text: "All fields are required." });
      return;
    }

    if (sigCanvas.current.isEmpty()) {
      setMessage({ type: "error", text: "Please provide a signature." });
      return;
    }

    setSubmitting(true);
    try {
      const guestsRef = ref(db, "guests");
      const guestsSnap = await get(guestsRef);

      const existingGuests = guestsSnap.exists() ? guestsSnap.val() : {};
      const takenIds = Object.keys(existingGuests)
        .filter((id) => /^guest\d+$/.test(id))
        .map((id) => parseInt(id.replace("guest", "")))
        .sort((a, b) => a - b);

      let newIdNum = 1;
      for (let i = 0; i < takenIds.length; i++) {
        if (takenIds[i] !== newIdNum) break;
        newIdNum++;
      }

      const guestId = `guest${newIdNum}`;
      const signatureData = sigCanvas.current.toDataURL();

      await set(ref(db, `guests/${guestId}`), {
        name,
        phone,
        address,
        signature: signatureData,
        timestamp: new Date().toISOString(),
      });

      // Reset form
      setName("");
      setPhone("");
      setAddress("");
      sigCanvas.current.clear();
      setIsSigned(false);
      setMessage({ type: "success", text: `Guest successfully submitted!` });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to submit guest. Try again." });
    }
    setSubmitting(false);
  };

  const handleLogout = async () => {
    await logout();
    setShowUserModal(false);
  };

  return (
    <div className="p-6 pb-20 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Guest Book</h1>

      <Input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <Textarea
        placeholder="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      <div>
        <p className="mb-1 font-medium">Signature</p>
        <SignatureCanvas
          penColor="black"
          canvasProps={{
            width: 500,
            height: 200,
            className: "border rounded bg-white",
          }}
          ref={sigCanvas}
          onEnd={handleSignature}
        />
        {isSigned && (
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => {
              sigCanvas.current.clear();
              setIsSigned(false);
            }}
          >
            Clear
          </Button>
        )}
      </div>

      <div className="flex mt-2 items-center">
        <Button disabled={submitting} onClick={handleSubmit}>
          {submitting ? "Submitting..." : "Submit"}
        </Button>
        {message.text && (
          <p
            className={`pl-3 text-sm ${
              message.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>

      {/* Floating Login/User Button with Dropdown */}
      <div className="fixed bottom-4 right-4 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="rounded-full p-3 shadow-lg" variant="default">
              {user ? (
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs bg-gray-200 text-gray-600">
                    {user.name?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <LogIn className="w-4 h-4" />
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-64 p-2">
            {user ? (
              <>
                <div className="flex items-center px-2 py-2 gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {user.name || "No Name"}
                    </p>
                    <p className="text-sm font-medium text-gray-500">
                      {user.name || "Anonymous"}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 cursor-pointer mt-1"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem
                onClick={() => (window.location.href = "/login")}
                className="cursor-pointer"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
