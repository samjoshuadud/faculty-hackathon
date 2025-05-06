
import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import { SessionProvider } from "next-auth/react";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en h-full">
      <body
        className="antialiased min-h-screen flex flex-col"}
      >
        <Header />
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
