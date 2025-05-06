'use client'
import {useSession} from 'next-auth/react';
import {redirect} from 'next/navigation';
import LoadingScreen from '../components/LoadingScreen'
import {House, BookOpen, Award, ClipboardMinus, CalendarSearch} from 'lucide-react';

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
      icon: <House />
    },
    {
      name: "Education",
      icon: <BookOpen />
    },
    {
      name: "Awards",
      icon: <Award />
    },
    {
      name: "Events",
      icon: <CalendarSearch />
    },
  ];
  return (
    <main className="grid grid-cols-[auto_1fr] min-h-screen">
      <div className="border-r-1 border-white/20 h-full p-8 w-68 font-bold text-[#95D5B2] flex justify-center">
        <ul className="flex flex-col w-full">
          {buttons.map((button, index) => (
            <li key={index} className="">
              <button className="flex items-center gap-4 block w-full p-6 text-left cursor-pointer hover:bg-[#2D6A4F] rounded-sm transition-colors duration-200 ease-in-out">
              {button.icon}
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
