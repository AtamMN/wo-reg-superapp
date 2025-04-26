"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { auth, db } from "@/lib/firebase/firebase";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();

    const role = "users";
    const roleRef = ref(db, `accounts/${role}`);

    try {
      // Step 1: Create the user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Step 2: Get current users under 'users' role
      const snapshot = await get(roleRef);
      const existing = snapshot.exists() ? snapshot.val() : {};

      // Step 3: Calculate the next available roleId (user1, user2, ...)
      const takenIds = Object.keys(existing)
        .filter((key) => /^user\d+$/.test(key))
        .map((key) => parseInt(key.replace("user", "")))
        .sort((a, b) => a - b);

      let newIdNum = 1;
      for (let i = 0; i < takenIds.length; i++) {
        if (takenIds[i] !== newIdNum) break;
        newIdNum++;
      }

      const roleId = `user${newIdNum}`;

      // Step 4: Save user role data
      await set(ref(db, `accounts/${role}/${roleId}`), {
        name,
        email,
        uid,
      });

      router.push("/");
    } catch (error) {
      console.error("Registration failed:", error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md p-6">
        <CardContent>
          <h1 className="text-2xl font-semibold mb-4 text-center">Register</h1>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Create Account
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
