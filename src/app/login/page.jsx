"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";
import { useAuth } from "@/lib/contexts/AuthContext";
import useUserInfo from "@/hooks/useUserInfo";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { currentUser } = useAuth()
  const { userInfo, loadingUser } = useUserInfo(currentUser);
  const router = useRouter();

  useEffect(() => {
    if (currentUser && userInfo?.email) {
      switch(userInfo?.role) {
        case 'sadmin':
          router.push('/dashboard/');
          break;
        case 'admin':
          router.push('/dashboard/');
          break;
        case 'user':
          router.push('/dashboard/');
          break;
        default:
          router.push('/');
      }
    }
  }, [currentUser, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Reset error state
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err) {
      console.error(err.message);
      setError("Wrong email or password");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md p-6">
        <CardContent>
          <h1 className="text-2xl font-semibold mb-4 text-center">Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
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
              Sign In
            </Button>
            {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          </form>
        </CardContent>
        <a
          href="/guestBook"
          className="flex place-self-center underline hover:text-sky-600 mt-4"
        >
          Want to fill the Guest Book instead?
        </a>
      </Card>
    </div>
  );
}
