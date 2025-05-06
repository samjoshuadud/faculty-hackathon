"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import LoadingScreen from "../components/LoadingScreen";
import {
  House,
  BookOpen,
  Award,
  CalendarSearch,
  FileText,
  Clock,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Home() {
  const [showDisplay, setshowDisplay] = useState("dashboard");

  const { data: session, status } = useSession();
  if (status == "loading") return <LoadingScreen />;

  if (!session) {
    redirect("/");
    return null;
  }

  const buttons = [
    {
      name: "My Dashboard",
      icon: <House size={18} />,
      value: "dashboard", // This matches your showDisplay state values
    },
    {
      name: "Education",
      icon: <BookOpen size={18} />,
      value: "education",
    },
    {
      name: "Awards",
      icon: <Award size={18} />,
      value: "awards",
    },
    {
      name: "Events",
      icon: <CalendarSearch size={18} />,
      value: "events",
    },
  ];

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
      },
    },
  };

  // Certificate expiration data
  const expiringCertificates = [
    {
      name: "Project Management Professional",
      expires: "Jun 15, 2025",
      daysLeft: 40,
    },
    { name: "AWS Solutions Architect", expires: "May 30, 2025", daysLeft: 24 },
    { name: "CISSP", expires: "Aug 22, 2025", daysLeft: 108 },
  ];

  const mydashboard = () => {
    return (
      <>
        <motion.header
          className="flex items-center justify-between px-6 py-4 border-b border-[#1B4332]"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-[#95D5B2] text-xl font-medium">My Overview</h1>
          <motion.button
            className="inline-flex items-center gap-2 bg-[#95D5B2] text-[#081C15] px-4 py-2 rounded-md text-sm font-medium"
            whileHover={{
              y: -2,
              boxShadow: "0 10px 15px -3px rgba(149, 213, 178, 0.2)",
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <FileText size={16} />
            Generate CV
          </motion.button>
        </motion.header>

        {/* Main content area */}
        <motion.div
          className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Profile completion container */}
          <motion.div
            className="bg-[#1B4332] rounded-lg p-5 shadow-sm"
            variants={itemVariants}
            whileHover={{ boxShadow: "0 4px 20px rgba(149, 213, 178, 0.1)" }}
          >
            <h2 className="text-white font-medium text-base mb-4">
              Profile Completion
            </h2>
            <div className="space-y-4">
              {/* Overall completion */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-[#95D5B2] text-sm">Overall</span>
                  <span className="text-[#95D5B2] text-sm">75%</span>
                </div>
                <div className="w-full bg-[#081C15] rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="bg-[#95D5B2] h-1.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "75%" }}
                    transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                  ></motion.div>
                </div>
              </div>

              {/* Education completion */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-[#95D5B2] text-sm">Education</span>
                  <span className="text-[#95D5B2] text-sm">90%</span>
                </div>
                <div className="w-full bg-[#081C15] rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="bg-[#95D5B2] h-1.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "90%" }}
                    transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                  ></motion.div>
                </div>
              </div>

              {/* Awards completion */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-[#95D5B2] text-sm">Awards</span>
                  <span className="text-[#95D5B2] text-sm">60%</span>
                </div>
                <div className="w-full bg-[#081C15] rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="bg-[#95D5B2] h-1.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "60%" }}
                    transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                  ></motion.div>
                </div>
              </div>

              {/* Events completion */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-[#95D5B2] text-sm">Events</span>
                  <span className="text-[#95D5B2] text-sm">50%</span>
                </div>
                <div className="w-full bg-[#081C15] rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="bg-[#95D5B2] h-1.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "50%" }}
                    transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
                  ></motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Statistics container */}
          <motion.div
            className="bg-[#1B4332] rounded-lg p-5 shadow-sm"
            variants={itemVariants}
            whileHover={{ boxShadow: "0 4px 20px rgba(149, 213, 178, 0.1)" }}
          >
            <h2 className="text-white font-medium text-base mb-4">
              Statistics
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                className="bg-[#2D6A4F] p-3 rounded-md cursor-pointer"
                whileHover={{
                  y: -2,
                  backgroundColor: "rgba(45, 106, 79, 0.9)",
                }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <p className="text-xs text-[#95D5B2] mb-1">Degrees</p>
                <motion.p
                  className="text-lg font-medium text-white"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.3 }}
                >
                  3
                </motion.p>
              </motion.div>
              <motion.div
                className="bg-[#2D6A4F] p-3 rounded-md cursor-pointer"
                whileHover={{
                  y: -2,
                  backgroundColor: "rgba(45, 106, 79, 0.9)",
                }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <p className="text-xs text-[#95D5B2] mb-1">Certifications</p>
                <motion.p
                  className="text-lg font-medium text-white"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9, duration: 0.3 }}
                >
                  8
                </motion.p>
              </motion.div>
              <motion.div
                className="bg-[#2D6A4F] p-3 rounded-md cursor-pointer"
                whileHover={{
                  y: -2,
                  backgroundColor: "rgba(45, 106, 79, 0.9)",
                }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <p className="text-xs text-[#95D5B2] mb-1">Awards</p>
                <motion.p
                  className="text-lg font-medium text-white"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1, duration: 0.3 }}
                >
                  5
                </motion.p>
              </motion.div>
              <motion.div
                className="bg-[#2D6A4F] p-3 rounded-md cursor-pointer"
                whileHover={{
                  y: -2,
                  backgroundColor: "rgba(45, 106, 79, 0.9)",
                }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <p className="text-xs text-[#95D5B2] mb-1">Events</p>
                <motion.p
                  className="text-lg font-medium text-white"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.1, duration: 0.3 }}
                >
                  12
                </motion.p>
              </motion.div>
            </div>
          </motion.div>

          {/* Certificate Expirations container */}
          <motion.div
            className="bg-[#1B4332] rounded-lg p-5 shadow-sm"
            variants={itemVariants}
            whileHover={{ boxShadow: "0 4px 20px rgba(149, 213, 178, 0.1)" }}
          >
            <h2 className="text-white font-medium text-base mb-4">
              Certificate Expirations
            </h2>
            <motion.div
              className="space-y-3"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {expiringCertificates.map((cert, index) => (
                <motion.div
                  key={index}
                  className="bg-[#2D6A4F] p-3 rounded-md cursor-pointer"
                  variants={itemVariants}
                  whileHover={{
                    scale: 1.02,
                    backgroundColor: "rgba(45, 106, 79, 0.9)",
                  }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm text-white">{cert.name}</h3>
                      <div className="flex items-center mt-1">
                        <Clock size={12} className="text-[#95D5B2] mr-1.5" />
                        <span className="text-xs text-[#95D5B2]">
                          {cert.expires}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        cert.daysLeft < 30
                          ? "bg-[#081C15] text-[#F3A95A]"
                          : "bg-[#081C15] text-[#95D5B2]"
                      }`}
                    >
                      {cert.daysLeft} days
                    </span>
                  </div>
                </motion.div>
              ))}
              <motion.button
                className="flex items-center justify-center w-full text-xs text-[#95D5B2] group mt-2 py-1"
                whileHover={{ color: "white" }}
              >
                View all certificates
                <motion.span
                  whileHover={{ x: 3 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <ChevronRight size={14} className="ml-1" />
                </motion.span>
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      </>
    );
  };

  const display = () => {
    switch (showDisplay) {
      case "dashboard":
        return mydashboard();
      case "education":
        return <LoadingScreen />;
      case "awards":
        return <LoadingScreen />;
      case "events":
        return <LoadingScreen />;
      default:
        return mydashboard();
    }
  };

  return (
    <motion.main
      className="grid grid-cols-[240px_1fr] flex-grow min-h-screen bg-[#081C15]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Sidebar */}
      <div className="border-r border-[#1B4332] py-6 flex flex-col">
        <motion.div
          className="px-6 mb-8"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <h1 className="text-[#95D5B2] font-medium text-lg">
            Faculty Profile
          </h1>
        </motion.div>
        <nav className="flex-1">
          <motion.ul
            className="space-y-1 px-3"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {buttons.map((button, index) => (
              <motion.li
                key={index}
                variants={itemVariants}
                whileHover={{ x: 5 }}
              >
                <button
                  onClick={() => setshowDisplay(button.value)}
                  className={`cursor-pointer flex items-center w-full px-4 py-2.5 rounded-md text-sm
  ${showDisplay === button.value ? "bg-[#1B4332] text-[#95D5B2]" : "text-white hover:bg-[#1B4332] hover:text-[#95D5B2]"} 
  transition-colors duration-200`}
                >
                  <motion.span className="mr-3" whileHover={{ scale: 1.1 }}>
                    {button.icon}
                  </motion.span>
                  <span>{button.name}</span>
                </button>
              </motion.li>
            ))}
          </motion.ul>
        </nav>
      </div>

      <div className="flex flex-col">{display()}</div>
    </motion.main>
  );
}
