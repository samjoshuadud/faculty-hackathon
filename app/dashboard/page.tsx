'use client'
import {useSession} from 'next-auth/react';
import {redirect} from 'next/navigation';
import LoadingScreen from '../components/LoadingScreen'
export default function Home() {
  const {data: session, status} = useSession();
  if (status == 'loading') return <LoadingScreen />;

  if (!session) {
    redirect('/');
    return null;
  }


  const buttons = [
    {
      name: "My Dashboard",
    },
    {
      name: "Education",
    },
    {
      name: "Awards",
    },
    {
      name: "Reports",
    },
    {
      name: "Events",
    },
  ];
  return (
    <main className="grid grid-cols-[auto_1fr] min-h-screen">
      <div className="border-r-1 border-white/20 h-full p-8 w-68 font-bold text-[#95D5B2] flex justify-center">
        <ul className="flex flex-col w-full">
          {buttons.map((button, index) => (
            <li key={index}>
              <button className="block w-full p-6 text-left cursor-pointer hover:bg-[#2D6A4F] rounded-sm transition-colors duration-200 ease-in-out">
                {button.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div></div>
    </main>
  );
}
