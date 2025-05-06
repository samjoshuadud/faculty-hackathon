'use client'

import Image from "next/image"
import Link from "next/link"

export default function Header() {
  return (
    <div>
      <section className="border-b-1 border-white/20">
        <div className="flex items-center justify-between px-10 py-5">
          <div className="flex justify-center items-center gap-5">
            <Image
              src="/umak_logo.png"
              height={60}
              width={60}
              alt="UMAK Logo"
            />
            <h1 className="font-extrabold text-[#95D5B2] text-xl">CCIS FPMS</h1>
          </div>


        </div>
      </section>
    </div>
  )
} 
