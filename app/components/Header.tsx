"use client";

import Image from "next/image";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <div>
      <section className="border-b-1 border-white/20 flex justify-between px-10">
        <div className="flex items-center justify-between py-5">
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
        {session && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="cursor-pointer focus:outline-none focus:ring-0 active:ring-0">
                <Image
                  src="/default.jpg"
                  alt="profile-pic"
                  height={35}
                  width={35}
                  className="rounded-full"
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </section>
    </div>
  );
}
