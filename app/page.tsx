'use client'
import {Button} from "@/components/ui/button"; 
import {useSession, signIn} from "next-auth/react";

export default function Home() {
  const {data: session, status} = useSession();
  return (
  <>
  </>
  );
}
