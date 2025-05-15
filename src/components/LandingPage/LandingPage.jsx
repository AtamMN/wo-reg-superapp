"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  Facebook,
  FileText,
  Instagram,
  Linkedin,
  Twitter,
  Users,
} from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import useUserInfo from "@/hooks/useUserInfo";
import UserDropdown from "../GuestBook/UserDropdown";
import { auth } from "@/lib/firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function LandingPage() {
  const { currentUser } = useAuth();
  const { userInfo, loadingUser } = useUserInfo(currentUser);
  const router = useRouter();

  // useEffect(() => {
  //   if (!loading && !user) {
  //     router.push("/");
  //   }
  // }, [user, loading, router]);

  // if (loading || !user) {
  //   return <div className="flex justify-center items-center h-screen">Loading...</div>;
  // }
  const handleTrialLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, "trial@trial.com", "trial123");
      router.push("/dashboard");
    } catch (error) {
      console.error("Trial login failed:", error);
      toast.error("Failed to login with trial account"); // fallback: alert("...")
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-slate-600" />
            <span className="text-xl font-bold text-slate-900">WO-Reg</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link
              href="#features"
              className="text-sm font-medium text-slate-700 hover:text-slate-600 transition-colors"
            >
              Features
            </Link>
            <Link
              href="#testimonials"
              className="text-sm font-medium text-slate-700 hover:text-slate-600 transition-colors"
            >
              Testimonials
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-slate-700 hover:text-slate-600 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#contact"
              className="text-sm font-medium text-slate-700 hover:text-slate-600 transition-colors"
            >
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            {currentUser ? (
              <UserDropdown currentUser={currentUser} userInfo={userInfo} />
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-700 hover:underline underline-offset-4"
                >
                  Log in
                </Link>
                <button className="inline-flex items-center justify-center rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2">
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-slate-900">
                    Organize your events in one place
                  </h1>
                  <p className="max-w-[600px] text-slate-500 md:text-xl pt-3">
                    Simplify event registration, attendee management, and
                    scheduling with our comprehensive platform.
                  </p>
                </div>
                {!currentUser ? (
                  <div className="flex flex-col gap-2 min-[400px]:flex-row">
                    <button
                      onClick={handleTrialLogin}
                      className="inline-flex items-center justify-center rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                    >
                      Start Free Trial
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                    <button className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2">
                      Schedule Demo
                    </button>
                  </div>
                ) : (
                  <a href="/dashboard">
                    <button className="inline-flex items-center justify-center rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2">
                      Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </a>
                )}
              </div>
              <Image
                src="/dashboard.png"
                width={550}
                height={550}
                alt="Dashboard Preview"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>

        {/* Metrics Section */}
        <section className="w-full py-12 md:py-24 bg-slate-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Metric Card 1 */}
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="pb-2">
                  <div className="text-sm font-medium text-slate-500 flex items-center justify-between">
                    Total Events
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center">
                      +12.5%
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">1,250</div>
                  <p className="text-xs text-slate-500 mt-1">
                    Trending up this month
                  </p>
                </div>
              </div>

              {/* Metric Card 2 */}
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="pb-2">
                  <div className="text-sm font-medium text-slate-500 flex items-center justify-between">
                    New Registrations
                    <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full flex items-center">
                      -20%
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">1,234</div>
                  <p className="text-xs text-slate-500 mt-1">
                    Down 20% this period
                  </p>
                </div>
              </div>

              {/* Metric Card 3 */}
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="pb-2">
                  <div className="text-sm font-medium text-slate-500 flex items-center justify-between">
                    Active Accounts
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center">
                      +12.5%
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">
                    45,678
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Strong user retention
                  </p>
                </div>
              </div>

              {/* Metric Card 4 */}
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="pb-2">
                  <div className="text-sm font-medium text-slate-500 flex items-center justify-between">
                    Growth Rate
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center">
                      +4.5%
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">4.5%</div>
                  <p className="text-xs text-slate-500 mt-1">
                    Steady performance increase
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-slate-100 px-3 py-1 text-sm text-slate-700">
                  Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-slate-900">
                  Everything You Need in One Place
                </h2>
                <p className="max-w-[900px] text-slate-500 md:text-xl">
                  Our platform provides all the tools you need to manage your
                  events efficiently.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
              {/* Feature Card 1 */}
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="rounded-full bg-slate-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-slate-700" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-900">
                  Event Management
                </h3>
                <p className="text-slate-500">
                  Create and manage events with customizable registration forms
                  and automated workflows.
                </p>
              </div>

              {/* Feature Card 2 */}
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="rounded-full bg-slate-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-slate-700" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-900">
                  Attendee Management
                </h3>
                <p className="text-slate-500">
                  Track registrations, send communications, and manage attendee
                  information in one place.
                </p>
              </div>

              {/* Feature Card 3 */}
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="rounded-full bg-slate-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-slate-700" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-900">
                  Advanced Analytics
                </h3>
                <p className="text-slate-500">
                  Gain insights with real-time data and comprehensive reports on
                  your events and attendees.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section
          id="testimonials"
          className="w-full py-12 md:py-24 lg:py-32 bg-slate-50"
        >
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-slate-100 px-3 py-1 text-sm text-slate-700">
                  Testimonials
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-slate-900">
                  What Our Customers Say
                </h2>
                <p className="max-w-[900px] text-slate-500 md:text-xl">
                  Don't just take our word for it. Here's what our customers
                  have to say about WO-Reg.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-2 lg:gap-12">
              {/* Testimonial 1 */}
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="h-5 w-5 fill-slate-700"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-lg font-medium mb-6 text-slate-900">
                  "WO-Reg has completely transformed how we manage our
                  conferences. The attendee management features alone have saved
                  us countless hours."
                </p>
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-slate-100 p-1">
                    <svg
                      className="h-8 w-8 text-slate-500"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Sarah Johnson
                    </p>
                    <p className="text-sm text-slate-500">
                      Event Director, TechConf
                    </p>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="h-5 w-5 fill-slate-700"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-lg font-medium mb-6 text-slate-900">
                  "The analytics dashboard gives us insights we never had
                  before. We've been able to optimize our events and increase
                  attendance by 30%."
                </p>
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-slate-100 p-1">
                    <svg
                      className="h-8 w-8 text-slate-500"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Michael Chen
                    </p>
                    <p className="text-sm text-slate-500">
                      Marketing Director, EventPro
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-slate-100 px-3 py-1 text-sm text-slate-700">
                  Pricing
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-slate-900">
                  Simple, Transparent Pricing
                </h2>
                <p className="max-w-[900px] text-slate-500 md:text-xl">
                  Choose the plan that's right for your organization.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-3">
              {/* Starter Plan */}
              <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900">Starter</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl font-bold tracking-tight text-slate-900">
                      $29
                    </span>
                    <span className="ml-1 text-xl font-semibold text-slate-600">
                      /month
                    </span>
                  </div>
                  <p className="text-slate-500 mt-2">
                    Perfect for small events and workshops.
                  </p>
                </div>
                <div className="px-6 pb-4">
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-slate-700" />
                      <span className="text-slate-700">Up to 5 events</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-slate-700" />
                      <span className="text-slate-700">Basic analytics</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-slate-700" />
                      <span className="text-slate-700">
                        100 registrations/month
                      </span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-slate-700" />
                      <span className="text-slate-700">Email support</span>
                    </li>
                  </ul>
                </div>
                <div className="px-6 pb-6 pt-2">
                  <button className="w-full rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2">
                    Get Started
                  </button>
                </div>
              </div>

              {/* Pro Plan */}
              <div className="rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden relative">
                <div className="absolute top-0 right-0 bg-slate-700 text-white text-xs font-medium px-3 py-1 rounded-bl-lg rounded-tr-lg">
                  Popular
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900">Pro</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl font-bold tracking-tight text-slate-900">
                      $79
                    </span>
                    <span className="ml-1 text-xl font-semibold text-slate-600">
                      /month
                    </span>
                  </div>
                  <p className="text-slate-500 mt-2">
                    For growing organizations with multiple events.
                  </p>
                </div>
                <div className="px-6 pb-4">
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-slate-700" />
                      <span className="text-slate-700">Up to 20 events</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-slate-700" />
                      <span className="text-slate-700">Advanced analytics</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-slate-700" />
                      <span className="text-slate-700">
                        500 registrations/month
                      </span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-slate-700" />
                      <span className="text-slate-700">Priority support</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-slate-700" />
                      <span className="text-slate-700">Custom branding</span>
                    </li>
                  </ul>
                </div>
                <div className="px-6 pb-6 pt-2">
                  <button className="w-full rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2">
                    Get Started
                  </button>
                </div>
              </div>

              {/* Enterprise Plan */}
              <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900">
                    Enterprise
                  </h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl font-bold tracking-tight text-slate-900">
                      $199
                    </span>
                    <span className="ml-1 text-xl font-semibold text-slate-600">
                      /month
                    </span>
                  </div>
                  <p className="text-slate-500 mt-2">
                    For large organizations with complex event needs.
                  </p>
                </div>
                <div className="px-6 pb-4">
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-slate-700" />
                      <span className="text-slate-700">Unlimited events</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-slate-700" />
                      <span className="text-slate-700">Custom analytics</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-slate-700" />
                      <span className="text-slate-700">
                        Unlimited registrations
                      </span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-slate-700" />
                      <span className="text-slate-700">24/7 phone support</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-slate-700" />
                      <span className="text-slate-700">API access</span>
                    </li>
                  </ul>
                </div>
                <div className="px-6 pb-6 pt-2">
                  <button className="w-full rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2">
                    Contact Sales
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-slate-50">
          <div className="container mx-auto grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-slate-900">
                Ready to Streamline Your Event Management?
              </h2>
              <p className="mx-auto max-w-[600px] text-slate-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join thousands of organizations that trust WO-Reg to organize
                their events.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
              <form className="flex space-x-2">
                <input
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter your email"
                  type="email"
                />
                <button className="rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2">
                  Get Started
                </button>
              </form>
              <p className="text-xs text-slate-500">
                Start your free 14-day trial. No credit card required.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 py-6 md:py-0">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-slate-700" />
            <span className="text-lg font-bold text-slate-900">WO-Reg</span>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <Link
              href="#"
              className="text-xs md:text-sm text-slate-500 hover:underline underline-offset-4"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="text-xs md:text-sm text-slate-500 hover:underline underline-offset-4"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-xs md:text-sm text-slate-500 hover:underline underline-offset-4"
            >
              Contact
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-slate-500 hover:text-slate-900">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link href="#" className="text-slate-500 hover:text-slate-900">
              <Facebook className="h-5 w-5" />
              <span className="sr-only">Facebook</span>
            </Link>
            <Link href="#" className="text-slate-500 hover:text-slate-900">
              <Instagram className="h-5 w-5" />
              <span className="sr-only">Instagram</span>
            </Link>
            <Link href="#" className="text-slate-500 hover:text-slate-900">
              <Linkedin className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
