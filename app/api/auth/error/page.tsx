"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reason = searchParams.get("reason");

  useEffect(() => {
    if (!reason) {
      router.replace("/"); // Redirect to home if accessed directly
    }
  }, [reason, router]);

  const getErrorMessage = () => {
    if (reason === "invalid-domain") {
      return "Only @umak.edu.ph accounts are allowed.";
    }
    return "Authentication failed. Please try again.";
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold text-red-500">Access Denied</h1>
      <p className="mt-4 text-white">{getErrorMessage()}</p>
      <a href="/" className="mt-6 px-4 py-2 bg-green-700 rounded text-white hover:bg-green-600">
        Go back to Home
      </a>
    </div>
  );
}

