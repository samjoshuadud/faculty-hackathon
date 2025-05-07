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
import { redirect } from "next/navigation";
import LoadingScreen from "./LoadingScreen";


export default function Header() {
  const { data: session, status } = useSession();

  return (
    <div>
      <section className="border-b-1 border-white/20 flex justify-between px-10">
        <div className="flex items-center justify-between py-5">
          <div className="flex justify-center items-center gap-5">
            <button
              className="cursor-pointer transition-transform duration-200 hover:scale-105"
              onClick={() => redirect("/")}
            >
              <Image
                src="/umak_logo.png"
                height={60}
                width={60}
                alt="UMAK Logo"
                className="transition-transform duration-200 hover:scale-105"
              />
            </button>
            <h1 className="font-extrabold text-[#95D5B2] text-xl">
              {session?.user?.role === "faculty"
                ? "Faculty Dashboard"
                : session?.user?.role === "admin"
                  ? "Admin Dashboard"
                  : "CCIS FPMS"}
            </h1>
          </div>
        </div>
        {session && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="cursor-pointer focus:outline-none focus:ring-0 active:ring-0 transition-transform duration-200 hover:scale-110">
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
        {session?.user?.role !== "admin" && (
          <DropdownMenuItem asChild>
            <Link href="/profile">Profile</Link>
          </DropdownMenuItem>
        )}
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
