"use client";
import React, { useState } from "react";
import Image from "next/image";
import {signIn} from "next-auth/react"; 
export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  return (
    <main className="">
      <section className="relative flex flex-col-reverse md:flex-row items-center justify-between px-10 md:px-28 py-20 gap-10 bg-[#081C15]">
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-[#74C69D] font-extrabold text-4xl md:text-6xl leading-tight mb-6">
            FACULTY PROFILE <br className="hidden md:block" /> MANAGEMENT SYSTEM
          </h1>
          <p className="text-white/90 text-lg md:text-xl max-w-xl mb-8">
            A centralized platform that enables CCIS faculty to manage their
            academic profiles and allows administrators to oversee faculty
            records for CHED compliance and the promotion of institutional
            excellence.
          </p>
          <button
            onClick={() => setShowLogin(true)}
            className="inline-block bg-gradient-to-r from-green-900 to-green-800 text-white font-semibold px-8 py-3 rounded-xl shadow-md hover:scale-105 transition-transform duration-300 cursor-pointer"
          >
            Login
          </button>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <Image
            src="/ccis_logo.png"
            width={400}
            height={400}
            alt="CCIS Logo"
            className="opacity-70 drop-shadow-lg"
          />
        </div>
      </section>
      {showLogin && (
          <div className="fixed inset-0 bg-white/0 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
    <div className="bg-gradient-to-br from-[#081C15] to-[#258262] p-10 rounded-lg shadow-lg relative transform transition-all duration-300 ease-out animate-scaleIn">
            <button
              className="absolute top-2 right-2 text-gray-500 cursor-pointer hover:text-white transition-colors duration-200"
              onClick={() => setShowLogin(false)}
            >
              ✕
            </button>
            <div className="flex flex-col justify-center items-center gap-4">
              <div className="flex justify-center gap-4 animate-slideDown">
                <Image
                  src="/umak_logo.png"
                  height={50}
                  width={50}
                  alt="Umak Logo"
                />
                <Image
                  src="/ccis_logo.png"
                  height={50}
                  width={50}
                  alt="Umak Logo"
                />
              </div>
              <h1 className="text-white text-4xl font-bold animate-slideDown animation-delay-100">UMAK Login</h1>
              <p className="text-white animate-slideDown animation-delay-200">
                Enter your UMAK credentials to access your account
              </p>
              <button className="w-lg bg-[#1B4332]/60 rounded-lg flex p-3 items-center justify-center gap-2 cursor-pointer hover:bg-[#16362A] transition-colors duration-200 ease-in-out mt-14 animate-slideUp animation-delay-200"
              onClick={() => signIn("google")}>
                <Image src="/google.svg" height={26} width={26} alt="Google" />
                <p className="text-white/60">Authenticate with Google</p>
              </button>
              <p className="text-white/60 mt-4 mb-16 animate-slideUp animation-delay-100">Only UMAK email addresses (@umak.edu.ph) are supported</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

