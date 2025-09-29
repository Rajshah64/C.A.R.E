"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ResponderPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if responder is already logged in
    const storedResponder = localStorage.getItem("responder");
    if (storedResponder) {
      router.push("/responder/dashboard");
    } else {
      router.push("/responder/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
