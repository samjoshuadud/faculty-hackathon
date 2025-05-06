'use client';

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col justify-between">
      <section className="relative flex flex-col-reverse md:flex-row items-center justify-between px-10 md:px-28 py-20 gap-10 bg-[#081C15]">

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-[#74C69D] font-extrabold text-4xl md:text-6xl leading-tight mb-6">
            FACULTY PROFILE <br className="hidden md:block" /> MANAGEMENT SYSTEM
          </h1>
          <p className="text-white/90 text-lg md:text-xl max-w-xl mb-8">
            A centralized platform that enables CCIS faculty to manage their academic profiles and allows administrators to oversee faculty records for CHED compliance and the promotion of institutional excellence.
          </p>
          <Link
            href="/"
            className="inline-block bg-gradient-to-r from-green-900 to-green-800 text-white font-semibold px-8 py-3 rounded-xl shadow-md hover:scale-105 transition-transform duration-300"
          >
            Login
          </Link>
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
    </main>
  );
}

