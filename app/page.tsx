'use client'
import {Button} from "@/components/ui/button"; 
import {useSession, signIn} from "next-auth/react";

export default function Home() {
  const {data: session, status} = useSession();
  if (status === 'loading') {
    return <p>Loading</p>;
  }

  if (status === 'authenticated') {
    return <p>Signed in as {session.user?.email}</p>;
  }
  return (
  <>
     <Button onClick={() => signIn("google")}>
        Click Here!
     </Button>
  </>
  );
}
