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
  Briefcase
} from "lucide-react";
import { motion } from "framer-motion";
import { useState , useRef} from "react";

interface Education {
  id: number;
  degree: string;
  institution: string;
  year: string;
  description: string;
  gpa: string;
}

interface Experience {
  id: number;
  title: string;
  employmentType: string;
  company: string;
  isCurrentRole: boolean;
  startDate: string;
  endDate: string | null;
  location: string;
  locationType: string;
  description: string;
}

interface Certification {
  id: number;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expirationDate: string | null;
  credentialId: string;
  credentialURL: string | null;
  certificationType: string;
  skills: string[];
  description: string;
  imageUrl?: string;
  status: 'active' | 'expired' | 'expiring';
}



export default function Home() {
  const [showDisplay, setshowDisplay] = useState("dashboard");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEducation, setSelectedEducation] = useState<Education | null>(null);

  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);

  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [selectedCertification, setSelectedCertification] = useState<Certification | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);



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
      name: "Experiences",
      icon: <Briefcase size={18} />,
      value: "experiences",
    },
    {
      name: "Certifications",
      icon: <Award size={18} />,
      value: "certifications",
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

  const certificationsData: Certification[] = [
    {
      id: 1,
      name: "AWS Certified Solutions Architect - Professional",
      issuingOrganization: "Amazon Web Services (AWS)",
      issueDate: "2023-05-15",
      expirationDate: "2026-05-15",
      credentialId: "AWS-CSAP-12345",
      credentialURL: "https://aws.amazon.com/verification",
      certificationType: "Professional",
      skills: ["Cloud Architecture", "AWS Services", "Security", "Networking"],
      description: "Validates advanced knowledge of AWS architecture design and implementation.",
      imageUrl: "https://example.com/aws-cert.jpg",
      status: 'active'
    },{
      id: 2,
      name: "Project Management Professional (PMP)",
      issuingOrganization: "Project Management Institute",
      issueDate: "2022-11-10",
      expirationDate: "2025-11-10",
      credentialId: "PMP-123456",
      credentialURL: "https://pmi.org/certifications/verify",
      certificationType: "Professional",
      skills: ["Project Management", "Leadership", "Risk Management", "Scheduling"],
      description: "Internationally recognized professional designation for project managers.",
      imageUrl: "https://example.com/pmp-cert.jpg",
      status: 'expiring'
    },
    {
      id: 3,
      name: "Certified Information Systems Security Professional (CISSP)",
      issuingOrganization: "ISC²",
      issueDate: "2021-08-22",
      expirationDate: "2024-08-22",
      credentialId: "CISSP-987654",
      credentialURL: "https://isc2.org/verify",
      certificationType: "Security",
      skills: ["Information Security", "Risk Management", "Network Security", "Cryptography"],
      description: "An advanced-level certification for IT security professionals.",
      imageUrl: "https://example.com/cissp-cert.jpg",
      status: 'expiring'
    }
  ];

  const handleEditCertification = (certification: Certification) => {
    setSelectedCertification(certification);
    setPreviewImage(certification.imageUrl || null);
    setIsCertModalOpen(true);
  };
  
  const handleAddNewCertification = () => {
    setSelectedCertification(null);
    setPreviewImage(null);
    setIsCertModalOpen(true);
  };
  
  const closeCertModal = () => {
    setIsCertModalOpen(false);
    setPreviewImage(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        // In the future, this is where you could call an OCR service
        // to extract information from the certificate image
      };
      reader.readAsDataURL(file);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getCertStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-[#2D6A4F] text-[#95D5B2]';
      case 'expiring':
        return 'bg-[#5A4303] text-[#F3A95A]';
      case 'expired':
        return 'bg-[#8B0000] text-[#FFB3B3]';
      default:
        return 'bg-[#2D6A4F] text-[#95D5B2]';
    }
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

   
    // Mock education data
    const educationData = [
      {
        id: 1,
        degree: "Ph.D. in Computer Science",
        institution: "Stanford University",
        year: "2018-2022",
        description: "Research focus on artificial intelligence and machine learning algorithms.",
        gpa: "3.92/4.0"
      },
      {
        id: 2,
        degree: "Master of Science in Data Analytics",
        institution: "MIT",
        year: "2016-2018",
        description: "Specialized in big data processing and statistical analysis.",
        gpa: "3.85/4.0"
      },
      {
        id: 3,
        degree: "Bachelor of Engineering in Computer Science",
        institution: "University of California, Berkeley",
        year: "2012-2016",
        description: "Focus on software engineering and database systems.",
        gpa: "3.78/4.0"
      }
    ];
    
    const handleEditEducation = (education: Education) => {
      setSelectedEducation(education);
      setIsEditModalOpen(true);
    };
    
    const handleAddNew = () => {
      setSelectedEducation(null);
      setIsEditModalOpen(true);
    };
    
    const closeModal = () => {
      setIsEditModalOpen(false);
    };



  const educationSection = () => {
    return (
      <>
        <motion.header
          className="flex items-center justify-between px-6 py-4 border-b border-[#1B4332]"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-[#95D5B2] text-xl font-medium">My Education</h1>
          <motion.button
            className="inline-flex items-center gap-2 bg-[#95D5B2] text-[#081C15] px-4 py-2 rounded-md text-sm font-medium"
            whileHover={{
              y: -2,
              boxShadow: "0 10px 15px -3px rgba(149, 213, 178, 0.2)",
            }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={handleAddNew}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Add Education
          </motion.button>
        </motion.header>

        {/* Main content area */}
        <motion.div
          className="p-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <div className="grid grid-cols-1 gap-6">
            {educationData.map((education, index) => (
              <motion.div
                key={education.id}
                className="bg-[#1B4332] rounded-lg p-5 shadow-sm"
                variants={itemVariants}
                whileHover={{ boxShadow: "0 4px 20px rgba(149, 213, 178, 0.1)" }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-white font-medium text-lg">{education.degree}</h2>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <BookOpen size={14} className="text-[#95D5B2] mr-2" />
                        <p className="text-[#95D5B2] text-sm">{education.institution}</p>
                      </div>
                      <div className="flex items-center">
                        <CalendarSearch size={14} className="text-[#95D5B2] mr-2" />
                        <p className="text-[#95D5B2] text-sm">{education.year}</p>
                      </div>
                      <div className="flex items-center">
                        <Award size={14} className="text-[#95D5B2] mr-2" />
                        <p className="text-[#95D5B2] text-sm">GPA: {education.gpa}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-white text-sm">{education.description}</p>
                  </div>
                  <motion.button
                    className="bg-[#2D6A4F] hover:bg-[#3B8F6F] text-white p-2 rounded-md"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEditEducation(education)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                      <path d="m15 5 4 4"></path>
                    </svg>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Edit Education Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div 
              className="bg-[#1B4332] rounded-lg p-6 w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h2 className="text-white text-xl font-medium mb-4">
                {selectedEducation ? "Edit Education" : "Add New Education"}
              </h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-[#95D5B2] text-sm mb-1">Degree</label>
                  <input 
                    type="text" 
                    className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                    defaultValue={selectedEducation?.degree || ""}
                  />
                </div>
                <div>
                  <label className="block text-[#95D5B2] text-sm mb-1">Institution</label>
                  <input 
                    type="text" 
                    className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                    defaultValue={selectedEducation?.institution || ""}
                  />
                </div>
                <div>
                  <label className="block text-[#95D5B2] text-sm mb-1">Year</label>
                  <input 
                    type="text" 
                    className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                    defaultValue={selectedEducation?.year || ""}
                  />
                </div>
                <div>
                  <label className="block text-[#95D5B2] text-sm mb-1">GPA</label>
                  <input 
                    type="text" 
                    className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                    defaultValue={selectedEducation?.gpa || ""}
                  />
                </div>
                <div>
                  <label className="block text-[#95D5B2] text-sm mb-1">Description</label>
                  <textarea 
                    className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2] min-h-[100px]"
                    defaultValue={selectedEducation?.description || ""}
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <motion.button
                    type="button"
                    className="bg-[#081C15] text-white px-4 py-2 rounded-md"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={closeModal}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="bg-[#95D5B2] text-[#081C15] px-4 py-2 rounded-md font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Save
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </>
    );
  };

  const experiencesData: Experience[] = [
    {
      id: 1,
      title: "Senior Software Engineer",
      employmentType: "Full-time",
      company: "Tech Innovations Inc.",
      isCurrentRole: true,
      startDate: "Jan 2022",
      endDate: null,
      location: "San Francisco, CA",
      locationType: "On-site",
      description: "Leading development of cloud-based applications using React, Node.js, and AWS. Managing a team of 5 engineers and coordinating with product managers for feature development."
    },
    {
      id: 2,
      title: "Software Developer",
      employmentType: "Full-time",
      company: "DataSync Systems",
      isCurrentRole: false,
      startDate: "Mar 2019",
      endDate: "Dec 2021",
      location: "Boston, MA",
      locationType: "Hybrid",
      description: "Developed and maintained backend services for data synchronization products. Improved system performance by 40% through code optimization and architectural improvements."
    },
    {
      id: 3,
      title: "Junior Developer",
      employmentType: "Contract",
      company: "WebFront Solutions",
      isCurrentRole: false,
      startDate: "Jun 2017",
      endDate: "Feb 2019",
      location: "Remote",
      locationType: "Remote",
      description: "Built responsive web interfaces for various clients using HTML5, CSS3, and JavaScript frameworks. Collaborated with design teams to implement pixel-perfect designs."
    }
  ];

  const handleEditExperience = (experience: Experience) => {
    setSelectedExperience(experience);
    setIsExperienceModalOpen(true);
  };
  
  const handleAddNewExperience = () => {
    setSelectedExperience(null);
    setIsExperienceModalOpen(true);
  };
  
  const closeExperienceModal = () => {
    setIsExperienceModalOpen(false);
  };

  const experiencesSection = () => {
    return (
      <>
        <motion.header
          className="flex items-center justify-between px-6 py-4 border-b border-[#1B4332]"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-[#95D5B2] text-xl font-medium">My Experiences</h1>
          <motion.button
            className="inline-flex items-center gap-2 bg-[#95D5B2] text-[#081C15] px-4 py-2 rounded-md text-sm font-medium"
            whileHover={{
              y: -2,
              boxShadow: "0 10px 15px -3px rgba(149, 213, 178, 0.2)",
            }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={handleAddNewExperience}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Add Experience
          </motion.button>
        </motion.header>
  
        {/* Main content area */}
        <motion.div
          className="p-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <div className="grid grid-cols-1 gap-6">
            {experiencesData.map((experience) => (
              <motion.div
                key={experience.id}
                className="bg-[#1B4332] rounded-lg p-5 shadow-sm"
                variants={itemVariants}
                whileHover={{ boxShadow: "0 4px 20px rgba(149, 213, 178, 0.1)" }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <h2 className="text-white font-medium text-lg">{experience.title}</h2>
                      {experience.isCurrentRole && (
                        <span className="ml-3 text-xs bg-[#2D6A4F] text-[#95D5B2] py-0.5 px-2 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <Briefcase size={14} className="text-[#95D5B2] mr-2" />
                        <p className="text-[#95D5B2] text-sm">{experience.company}</p>
                        <span className="mx-2 text-[#95D5B2] text-xs">•</span>
                        <p className="text-[#95D5B2] text-sm">{experience.employmentType}</p>
                      </div>
                      <div className="flex items-center">
                        <CalendarSearch size={14} className="text-[#95D5B2] mr-2" />
                        <p className="text-[#95D5B2] text-sm">
                          {experience.startDate} - {experience.endDate || 'Present'}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#95D5B2] mr-2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <p className="text-[#95D5B2] text-sm">{experience.location}</p>
                        <span className="mx-2 text-[#95D5B2] text-xs">•</span>
                        <p className="text-[#95D5B2] text-sm">{experience.locationType}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-white text-sm">{experience.description}</p>
                  </div>
                  <motion.button
                    className="bg-[#2D6A4F] hover:bg-[#3B8F6F] text-white p-2 rounded-md"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEditExperience(experience)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                      <path d="m15 5 4 4"></path>
                    </svg>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
  
        {/* Experience Form Modal */}
        {isExperienceModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div 
              className="bg-[#1B4332] rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar" 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h2 className="text-white text-xl font-medium mb-4">
                {selectedExperience ? "Edit Experience" : "Add New Experience"}
              </h2>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-[#95D5B2] text-sm mb-1">Title</label>
                  <input 
                    type="text" 
                    className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                    defaultValue={selectedExperience?.title || ""}
                  />
                </div>
                
                <div>
                  <label className="block text-[#95D5B2] text-sm mb-1">Employment Type</label>
                  <select 
                    className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                    defaultValue={selectedExperience?.employmentType || ""}
                  >
                    <option value="">Select employment type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Volunteer">Volunteer</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-[#95D5B2] text-sm mb-1">Company/Organization</label>
                  <input 
                    type="text" 
                    className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                    defaultValue={selectedExperience?.company || ""}
                  />
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="isCurrentRole"
                    className="bg-[#2D6A4F] border-[#95D5B2] rounded text-[#95D5B2] focus:ring-[#95D5B2] h-4 w-4"
                    defaultChecked={selectedExperience?.isCurrentRole || false}
                  />
                  <label htmlFor="isCurrentRole" className="ml-2 text-[#95D5B2] text-sm">
                    I am currently working in this role
                  </label>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#95D5B2] text-sm mb-1">Start Date</label>
                    <input 
                      type="month" 
                      className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                      defaultValue={selectedExperience?.startDate || ""}
                    />
                  </div>
                  <div>
                    <label className="block text-[#95D5B2] text-sm mb-1">End Date</label>
                    <input 
                      type="month" 
                      className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                      defaultValue={selectedExperience?.endDate || ""}
                      disabled={selectedExperience?.isCurrentRole || false}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[#95D5B2] text-sm mb-1">Location</label>
                  <input 
                    type="text" 
                    className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                    defaultValue={selectedExperience?.location || ""}
                  />
                </div>
                
                <div>
                  <label className="block text-[#95D5B2] text-sm mb-1">Location Type</label>
                  <select 
                    className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                    defaultValue={selectedExperience?.locationType || ""}
                  >
                    <option value="">Select location type</option>
                    <option value="On-site">On-site</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-[#95D5B2] text-sm mb-1">Description</label>
                  <textarea 
                    className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2] min-h-[100px]"
                    defaultValue={selectedExperience?.description || ""}
                    placeholder="Describe your responsibilities, achievements, and the skills you utilized in this role."
                  ></textarea>
                </div>
                
                <div className="flex justify-end space-x-3 pt-2">
                  <motion.button
                    type="button"
                    className="bg-[#081C15] text-white px-4 py-2 rounded-md"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={closeExperienceModal}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="bg-[#95D5B2] text-[#081C15] px-4 py-2 rounded-md font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Save
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </>
    );
  };

  const certificationsSection = () => {
    return (
      <>
        <motion.header
          className="flex items-center justify-between px-6 py-4 border-b border-[#1B4332]"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-[#95D5B2] text-xl font-medium">My Certifications</h1>
          <motion.button
            className="inline-flex items-center gap-2 bg-[#95D5B2] text-[#081C15] px-4 py-2 rounded-md text-sm font-medium"
            whileHover={{
              y: -2,
              boxShadow: "0 10px 15px -3px rgba(149, 213, 178, 0.2)",
            }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={handleAddNewCertification}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Add Certification
          </motion.button>
        </motion.header>
  
        {/* Main content area */}
        <motion.div
          className="p-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <div className="grid grid-cols-1 gap-6">
            {certificationsData.map((cert) => (
              <motion.div
                key={cert.id}
                className="bg-[#1B4332] rounded-lg p-5 shadow-sm"
                variants={itemVariants}
                whileHover={{ boxShadow: "0 4px 20px rgba(149, 213, 178, 0.1)" }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-2">
                      <h2 className="text-white font-medium text-lg">{cert.name}</h2>
                      <span className={`text-xs py-0.5 px-2 rounded-full ${getCertStatusColor(cert.status)}`}>
                        {cert.status === 'active' ? 'Active' : cert.status === 'expiring' ? 'Expiring Soon' : 'Expired'}
                      </span>
                    </div>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <Award size={14} className="text-[#95D5B2] mr-2" />
                        <p className="text-[#95D5B2] text-sm">{cert.issuingOrganization}</p>
                        <span className="mx-2 text-[#95D5B2] text-xs">•</span>
                        <p className="text-[#95D5B2] text-sm">{cert.certificationType}</p>
                      </div>
                      <div className="flex items-center">
                        <CalendarSearch size={14} className="text-[#95D5B2] mr-2" />
                        <p className="text-[#95D5B2] text-sm">
                          Issued: {new Date(cert.issueDate).toLocaleDateString()}
                          {cert.expirationDate && (
                            <>
                              <span className="mx-1">•</span>
                              Expires: {new Date(cert.expirationDate).toLocaleDateString()}
                            </>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <FileText size={14} className="text-[#95D5B2] mr-2" />
                        <p className="text-[#95D5B2] text-sm">ID: {cert.credentialId}</p>
                        {cert.credentialURL && (
                          <a 
                            href={cert.credentialURL} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-2 text-[#95D5B2] underline text-xs hover:text-white"
                          >
                            Verify
                          </a>
                        )}
                      </div>
                      {cert.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {cert.skills.map((skill, index) => (
                            <span 
                              key={index} 
                              className="bg-[#2D6A4F] text-[#95D5B2] text-xs py-0.5 px-2 rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="mt-3 text-white text-sm">{cert.description}</p>
                  </div>
                  {cert.imageUrl && (
                    <div className="ml-4 mb-auto">
                      <div className="h-16 w-16 bg-[#2D6A4F] rounded-md overflow-hidden flex items-center justify-center">
                        <motion.img
                          src={cert.imageUrl}
                          alt={cert.name}
                          className="max-h-full max-w-full object-contain"
                          whileHover={{ scale: 1.1 }}
                        />
                      </div>
                    </div>
                  )}
                  <motion.button
                    className="bg-[#2D6A4F] hover:bg-[#3B8F6F] text-white p-2 rounded-md ml-4"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEditCertification(cert)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                      <path d="m15 5 4 4"></path>
                    </svg>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
  
        {/* Certification Form Modal */}
        {isCertModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div 
              className="bg-[#1B4332] rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"  
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="p-6 border-b border-[#2D6A4F] sticky top-0 bg-[#1B4332] z-10">
        <h2 className="text-white text-xl font-medium">
          {selectedCertification ? "Edit Certification" : "Add New Certification"}
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-4">

              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="md:col-span-2">
                    {/* Certificate Image Upload */}
                    <div className="flex flex-col items-center border-2 border-dashed border-[#2D6A4F] rounded-md p-4 mb-4">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      
                      {previewImage ? (
                        <div className="relative">
                          <img 
                            src={previewImage} 
                            alt="Certificate Preview" 
                            className="max-h-48 mb-2"
                            onError={() => setPreviewImage(null)}
                          />
                          <motion.button
                            type="button"
                            className="absolute top-0 right-0 bg-[#081C15] rounded-full p-1"
                            whileHover={{ scale: 1.1 }}
                            onClick={() => setPreviewImage(null)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#95D5B2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 6 6 18M6 6l12 12"/>
                            </svg>
                          </motion.button>
                        </div>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#95D5B2" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5.52 19c.64-2.2 1.84-3 3.22-3h6.52c1.38 0 2.58.8 3.22 3"/>
                          <circle cx="12" cy="10" r="3"/>
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                        </svg>
                      )}
                      
                      <motion.button
                        type="button"
                        className="mt-3 flex items-center gap-2 bg-[#2D6A4F] text-white px-4 py-2 rounded-md text-sm"
                        whileHover={{ scale: 1.02, backgroundColor: "#3B8F6F" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={triggerFileInput}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="17 8 12 3 7 8"/>
                          <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        Upload Certificate Image
                      </motion.button>
                      <p className="text-xs text-[#95D5B2] mt-2 text-center">
                        Upload an image of your certificate <br/> 
                        (We'll use OCR to extract information automatically)
                      </p>
                    </div>
                  
                    <div>
                      <label className="block text-[#95D5B2] text-sm mb-1">Certificate Name</label>
                      <input 
                        type="text" 
                        className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                        defaultValue={selectedCertification?.name || ""}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[#95D5B2] text-sm mb-1">Issuing Organization</label>
                    <input 
                      type="text" 
                      className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                      defaultValue={selectedCertification?.issuingOrganization || ""}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[#95D5B2] text-sm mb-1">Type/Level</label>
                    <select 
                      className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                      defaultValue={selectedCertification?.certificationType || ""}
                    >
                      <option value="">Select type</option>
                      <option value="Associate">Associate</option>
                      <option value="Professional">Professional</option>
                      <option value="Expert">Expert</option>
                      <option value="Security">Security</option>
                      <option value="Developer">Developer</option>
                      <option value="Administrator">Administrator</option>
                      <option value="Architect">Architect</option>
                      <option value="Specialty">Specialty</option>
                      <option value="Fundamental">Fundamental</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-[#95D5B2] text-sm mb-1">Issue Date</label>
                    <input 
                      type="date" 
                      className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                      defaultValue={selectedCertification?.issueDate || ""}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[#95D5B2] text-sm mb-1">Expiration Date</label>
                    <input 
                      type="date" 
                      className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                      defaultValue={selectedCertification?.expirationDate || ""}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[#95D5B2] text-sm mb-1">Credential ID</label>
                    <input 
                      type="text" 
                      className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                      defaultValue={selectedCertification?.credentialId || ""}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[#95D5B2] text-sm mb-1">Verification URL (optional)</label>
                    <input 
                      type="url" 
                      className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                      defaultValue={selectedCertification?.credentialURL || ""}
                      placeholder="https://..."
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-[#95D5B2] text-sm mb-1">Skills (comma separated)</label>
                    <input 
                      type="text" 
                      className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                      defaultValue={selectedCertification?.skills.join(", ") || ""}
                      placeholder="Cloud Computing, Security, DevOps"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-[#95D5B2] text-sm mb-1">Description</label>
                    <textarea 
                      className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2] min-h-[80px]"
                      defaultValue={selectedCertification?.description || ""}
                      placeholder="Describe what this certification covers and its significance."
                    ></textarea>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <motion.button
                    type="button"
                    className="bg-[#081C15] text-white px-4 py-2 rounded-md"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={closeCertModal}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="bg-[#95D5B2] text-[#081C15] px-4 py-2 rounded-md font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Save
                  </motion.button>
                </div>
              </form>
              </div>

            </motion.div>
          </div>
          
        )}
      </>
    );
  };
  
  

  const display = () => {
    switch (showDisplay) {
      case "dashboard":
        return mydashboard();
      case "education":
        return educationSection();
      case "experiences":
        return experiencesSection();
      case "certifications":
        return certificationsSection();
      case "events":
        return <LoadingScreen />;
      default:
        return mydashboard();
    }
  };

  console.log("Session Data", session);

  return (
    <motion.main
      className="grid grid-cols-[240px_1fr] flex-grow  bg-[#081C15]"
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
