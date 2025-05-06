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
    switch (reason) {
      case "invalid-domain":
        return "Only @umak.edu.ph accounts are allowed.";
      case "user-not-found":
        return "Your account is not registered in our system. Please contact the administrator.";
      case "database-error":
        return "There was a problem connecting to the database. Please try again later.";
      default:
        return "Authentication failed. Please try again.";
    }
  };

  const getErrorTitle = () => {
    switch (reason) {
      case "invalid-domain":
        return "Invalid Email Domain";
      case "user-not-found":
        return "Account Not Found";
      case "database-error":
        return "System Error";
      default:
        return "Authentication Failed";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center  bg-[#081C15] p-4 flex-grow">
      <div className="bg-[#1B4332] rounded-lg p-8 shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-[#95D5B2] mb-2">{getErrorTitle()}</h1>
        <p className="text-white mb-6">{getErrorMessage()}</p>
        <a 
          href="/" 
          className="inline-block px-6 py-2.5 bg-[#2D6A4F] text-white font-medium rounded-md hover:bg-[#3A7D5D] transition-colors"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
}
