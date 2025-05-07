"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import LoadingScreen from "../components/LoadingScreen";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <LoadingScreen />;
  }

  if (!session) {
    redirect("/");
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Welcome to Next.js!</h1>
      <p className="mt-4 text-lg">This is a simple example of a Next.js application.</p>
    </main>
  )
}
