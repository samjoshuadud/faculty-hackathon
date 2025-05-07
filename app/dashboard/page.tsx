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
  Briefcase,
  ContactRound
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import CertificationScanner from "../components/Scanner";
import axios from 'axios';

interface FacultyMember {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  joinDate: string;
  sectionsCompleted: number;
  totalSections: number;
  profileImage: string;
}

interface Document {
  id: number;
  title: string;
  description: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  uploadDate: string;
  fileUrl: string;
  tags: string[];
}

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
  const [showDisplay, setshowDisplay] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEducation, setSelectedEducation] = useState<Education | null>(null);
  const [educationData, setEducationData] = useState<Education[]>([]);
  const [experiencesData, setExperiencesData] = useState<Experience[]>([]);
  const [certificationsData, setCertificationsData] = useState<Certification[]>([]);

  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);

  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [selectedCertification, setSelectedCertification] = useState<Certification | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<Certification>>({});

  const [autoFillingFields, setAutoFillingFields] = useState(false);

  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const documentFileRef = useRef<HTMLInputElement>(null);

  const [filterType, setFilterType] = useState<'all' | 'complete' | 'incomplete'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember | null>(null);
  const [isProfileViewOpen, setIsProfileViewOpen] = useState(false);

  const [certificationsFilter, setCertificationsFilter] = useState<'all' | 'valid' | 'expiring' | 'expired'>('all');

  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportType, setReportType] = useState<'faculty' | 'certification'>('faculty');

  const [isAddFacultyModalOpen, setIsAddFacultyModalOpen] = useState(false);
  const [newFacultyData, setNewFacultyData] = useState({
    name: '',
    email: '',
    department: '',
    role: 'Faculty'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean, message: string } | null>(null);

  const [filterTypetwo, setFilterTypetwo] = useState<'all' | 'education' | 'experience' | 'certification'>('all');
  const [processingItem, setProcessingItem] = useState<number | null>(null);

  
// In your component declaration, add:
const [isLoading, setIsLoading] = useState(true);

const { data: session, status } = useSession();

// Add these to your state declarations:
const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
const [educationToDelete, setEducationToDelete] = useState<Education | null>(null);
const [isDeleting, setIsDeleting] = useState(false);
const [documentsData, setDocumentsData] = useState<Document[]>([]);


// Add these helper functions at the top of your file, after imports:

const localStorageKeys = {
  education: 'fpms_education',
  experience: 'fpms_experience', 
  certifications: 'fpms_certifications',
  documents: 'fpms_documents'
};

const getFromStorage = <T,>(key: string, initialData: T[]): T[] => {
  if (typeof window === 'undefined') return initialData;
  
  try {
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : initialData;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return initialData;
  }
};

const saveToStorage = <T,>(key: string, data: T[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};




// Add these functions to your component:
const handleDeleteEducation = (education: Education) => {
  setEducationToDelete(education);
  setIsDeleteModalOpen(true);
};

const closeDeleteModal = () => {
  setIsDeleteModalOpen(false);
  setEducationToDelete(null);
};

const confirmDeleteEducation = async () => {
  if (!educationToDelete) return;
  
  setIsDeleting(true);
  
  try {
    // Get current data
    const currentData = getFromStorage(localStorageKeys.education, []);
    
    // Filter out the item to delete
    const updatedData = currentData.filter(edu => edu._id !== educationToDelete._id);
    
    // Save to localStorage
    saveToStorage(localStorageKeys.education, updatedData);
    
    // Update state
    setEducationData(updatedData);
    
    closeDeleteModal();
  } catch (error) {
    console.error("Error deleting education:", error);
  } finally {
    setIsDeleting(false);
  }
};


// Then update your useEffect that fetches data:
// Replace your useEffect for fetching data with this:
useEffect(() => {
  // Load initial data from localStorage
  const loadLocalData = () => {
    setIsLoading(true);
    try {
      // Get initial sample data or existing localStorage data
      const typedEducationData = getFromStorage(localStorageKeys.education, [
        {
          _id: '1',
          degree: "Ph.D. in Computer Science",
          institution: "Stanford University",
          year: "2018-2022",
          description: "Research focus on artificial intelligence and machine learning algorithms.",
          gpa: "3.92/4.0"
        },
        {
          _id: '2',
          degree: "Master of Science in Data Analytics",
          institution: "MIT",
          year: "2016-2018",
          description: "Specialized in big data processing and statistical analysis.",
          gpa: "3.85/4.0"
        },
        {
          _id: '3',
          degree: "Bachelor of Engineering in Computer Science",
          institution: "University of California, Berkeley",
          year: "2012-2016",
          description: "Focus on software engineering and database systems.",
          gpa: "3.78/4.0"
        }
      ]);

      
      
      const typedExperienceData = getFromStorage(localStorageKeys.experience, [
        {
          _id: '1',
          title: "Senior Software Engineer",
          employmentType: "Full-time",
          company: "Tech Innovations Inc.",
          isCurrentRole: true,
          startDate: "Jan 2022",
          endDate: null,
          location: "San Francisco, CA",
          locationType: "On-site",
          description: "Leading development of cloud-based applications using React, Node.js, and AWS. Managing a team of 5 engineers."
        },
        {
          _id: '2',
          title: "Software Developer",
          employmentType: "Full-time",
          company: "DataSync Systems",
          isCurrentRole: false,
          startDate: "Mar 2019",
          endDate: "Dec 2021",
          location: "Boston, MA",
          locationType: "Hybrid",
          description: "Developed and maintained backend services for data synchronization products."
        },
        {
          _id: '3',
          title: "Junior Developer",
          employmentType: "Contract",
          company: "WebFront Solutions",
          isCurrentRole: false,
          startDate: "Jun 2017",
          endDate: "Feb 2019",
          location: "Remote",
          locationType: "Remote",
          description: "Built responsive web interfaces for various clients using HTML5, CSS3, and JavaScript frameworks."
        }
      ]);

      const mappedExperienceData = typedExperienceData.map(exp => ({
        id: parseInt(exp._id) || Math.floor(Math.random() * 10000),
        title: exp.title || '',
        employmentType: exp.employmentType || '',
        company: exp.company || '',
        isCurrentRole: exp.isCurrentRole || false,
        startDate: exp.startDate || '',
        endDate: exp.endDate,
        location: exp.location || '',
        locationType: exp.locationType || '',
        description: exp.description || ''
      }));

      const mappedEducationData = typedEducationData.map(edu => ({
        id: parseInt(edu._id) || Math.floor(Math.random() * 10000),
        degree: edu.degree || '',
        institution: edu.institution || '',
        year: edu.year || '',
        description: edu.description || '',
        gpa: edu.gpa || ''
      }));
      
      const typedCertificationsData = getFromStorage(localStorageKeys.certifications, [
        {
          _id: '1',
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
        },
        {
          _id: '2',
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
          _id: '3',
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
      ]);

      const mappedCertificationsData = typedCertificationsData.map(cert => ({
        id: parseInt(cert._id) || Math.floor(Math.random() * 10000),
        name: cert.name || '',
        issuingOrganization: cert.issuingOrganization || '',
        issueDate: cert.issueDate || '',
        expirationDate: cert.expirationDate,
        credentialId: cert.credentialId || '',
        credentialURL: cert.credentialURL,
        certificationType: cert.certificationType || '',
        skills: cert.skills || [],
        description: cert.description || '',
        imageUrl: cert.imageUrl,
        status: cert.status || 'active'
      }));

      const typedDocumentsData = getFromStorage(localStorageKeys.documents, documentsData);
      
      const mappedDocumentsData = typedDocumentsData.map(doc => ({
        id: parseInt(doc._id) || Math.floor(Math.random() * 10000),
        title: doc.title || '',
        description: doc.description || '',
        fileName: doc.fileName || '',
        fileType: doc.fileType || '',
        fileSize: doc.fileSize || '',
        uploadDate: doc.uploadDate || new Date().toISOString().split('T')[0],
        fileUrl: doc.fileUrl || '',
        tags: doc.tags || []
      }));

      setDocumentsData(mappedDocumentsData);


      setEducationData(mappedEducationData);
      setExperiencesData(mappedExperienceData);
      setCertificationsData(mappedCertificationsData);
      
    } catch (error) {
      console.error('Error loading local data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  loadLocalData();
}, []);


  // useEffect(() => {
  //   if (!session) return; // Wait for session to be available

  //   const fetchData = async () => {
  //     try {
  //       const resEducation = await axios.get(`/api/education?userID=${session?.user?.id}`);
  //       const resExperience = await axios.get(`/api/experience?userID=${session?.user?.id}`);
  //       const resCertifications = await axios.get(`/api/certifications?userID=${session?.user?.id}`);

  //       setEducationData(resEducation.data);
  //       setExperiencesData(resExperience.data);
  //       setCertificationsData(resCertifications.data);
  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //     }
  //   }

  //   fetchData();
  // }, [session]);


  if (status == "loading") return <LoadingScreen />;

  if (!session) {
    redirect("/");
    return null;
  }

  const handleEducationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    const newEducation = {
      _id: selectedEducation?._id || String(Date.now()), // Use existing ID or create new one
      degree: form.degree.value,
      institution: form.institution.value,
      year: form.year.value,
      gpa: form.gpa.value,
      description: form.description.value,
    };
  
    try {
      const currentData = getFromStorage(localStorageKeys.education, []);
      let updatedData;
      
      if (selectedEducation) {
        // Update existing education
        updatedData = currentData.map(item => 
          item._id === selectedEducation._id ? newEducation : item
        );
      } else {
        // Add new education
        updatedData = [...currentData, newEducation];
      }
      
      // Save to localStorage
      saveToStorage(localStorageKeys.education, updatedData);
      
      // Update state
      setEducationData(updatedData);
      
      // Close the modal
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error submitting education:", error);
    }
  };

  const handleExperienceSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Use FormData to reliably get form values
    const formData = new FormData(e.currentTarget);
    
    const newExperience = {
      _id: selectedExperience?._id || String(Date.now()),
      title: formData.get('title') as string || '',
      employmentType: formData.get('employmentType') as string || '',
      company: formData.get('company') as string || '',
      isCurrentRole: formData.get('isCurrentRole') === 'on',
      startDate: formData.get('startDate') as string || '',
      endDate: formData.get('endDate') as string || '',
      location: formData.get('location') as string || '',
      locationType: formData.get('locationType') as string || '',
      description: formData.get('description') as string || '',
    };
  
    try {
      const currentData = getFromStorage(localStorageKeys.experience, []);
      let updatedData;
      
      if (selectedExperience) {
        // Update existing experience
        updatedData = currentData.map(item => 
          item._id === selectedExperience._id ? newExperience : item
        );
      } else {
        // Add new experience
        updatedData = [...currentData, newExperience];
      }
      
      // Save to localStorage
      saveToStorage(localStorageKeys.experience, updatedData);
      
      // Update state
      setExperiencesData(updatedData);
      
      // Close the modal
      setIsExperienceModalOpen(false);
    } catch (error) {
      console.error('Error submitting experience:', error);
    }
  };
  const handleCertificationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    // Extract skills from comma-separated string
    const skillsInput = form.skills.value;
    const skillsArray = skillsInput.split(',').map(skill => skill.trim()).filter(Boolean);
  
    const newCertification = {
      _id: selectedCertification?._id || String(Date.now()),
      name: form.name.value,
      issuingOrganization: form.issuingOrganization.value,
      issueDate: form.issueDate.value,
      expirationDate: form.expirationDate.value,
      credentialId: form.credentialId.value,
      credentialURL: form.credentialURL.value,
      certificationType: form.certificationType.value,
      skills: skillsArray,
      description: form.description.value,
      imageUrl: previewImage,
      status: getExpirationStatus(form.expirationDate.value)
    };
  
    try {
      const currentData = getFromStorage(localStorageKeys.certifications, []);
      let updatedData;
      
      if (selectedCertification) {
        // Update existing certification
        updatedData = currentData.map(item => 
          item._id === selectedCertification._id ? newCertification : item
        );
      } else {
        // Add new certification
        updatedData = [...currentData, newCertification];
      }
      
      // Save to localStorage
      saveToStorage(localStorageKeys.certifications, updatedData);
      
      // Update state
      setCertificationsData(updatedData);
      
      // Close the modal
      setIsCertModalOpen(false);
    } catch (error) {
      console.error("Error submitting certification:", error);
    }
  };
  
  // Helper function to determine certification status
  const getExpirationStatus = (expirationDate: string): 'active' | 'expiring' | 'expired' => {
    if (!expirationDate) return 'active';
    
    const today = new Date();
    const expiry = new Date(expirationDate);
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(today.getDate() + 90);
  
    if (expiry < today) {
      return 'expired';
    } else if (expiry <= ninetyDaysFromNow) {
      return 'expiring';
    } else {
      return 'active';
    }
  };

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
      name: "Documents",
      icon: <FileText size={18} />,
      value: "documents",
    },

  ];

  const buttons_admin = [
    {
      name: "Dashboard",
      icon: <House size={18} />,
      value: "dashboard_admin",
    },
    {
      name: "Manage Faculty",
      icon: <ContactRound size={18} />,
      value: "manage_faculty",
    },
    {
      name: "Certifications",
      icon: <Award size={18} />,
      value: "admin_certifications",
    },
    {
      name: "Pending Approvals",
      icon: <Clock size={18} />,
      value: "pending_approvals",
    },
    {
      name: "Reports",
      icon: <FileText size={18} />,
      value: "reports",
    },

  ];

  const pending_approvals = () => {
    // Sample pending approval data
    const pendingItems = [
      {
        id: 1,
        type: 'education',
        facultyName: 'Dr. Sarah Johnson',
        facultyId: 1,
        preview: 'Ph.D. in Artificial Intelligence',
        details: 'Stanford University, 2018-2022',
        submittedDate: '2025-05-01',
        facultyImage: 'https://randomuser.me/api/portraits/women/22.jpg'
      },
      {
        id: 2,
        type: 'experience',
        facultyName: 'Prof. David Lee',
        facultyId: 2,
        preview: 'Research Scientist',
        details: 'Google AI Research',
        submittedDate: '2025-05-02',
        facultyImage: 'https://randomuser.me/api/portraits/men/32.jpg'
      },
      {
        id: 3,
        type: 'certification',
        facultyName: 'Dr. Maria Garcia',
        facultyId: 3,
        preview: 'AWS Solutions Architect - Professional',
        details: 'Amazon Web Services',
        submittedDate: '2025-05-03',
        facultyImage: 'https://randomuser.me/api/portraits/women/56.jpg'
      },
      {
        id: 4,
        type: 'education',
        facultyName: 'Dr. Robert Chen',
        facultyId: 4,
        preview: 'Master of Science in Data Analytics',
        details: 'MIT, 2015-2017',
        submittedDate: '2025-05-04',
        facultyImage: 'https://randomuser.me/api/portraits/men/41.jpg'
      },
      {
        id: 5,
        type: 'certification',
        facultyName: 'Prof. Amelia Williams',
        facultyId: 5,
        preview: 'Microsoft Certified: Azure Developer Associate',
        details: 'Microsoft',
        submittedDate: '2025-05-05',
        facultyImage: 'https://randomuser.me/api/portraits/women/45.jpg'
      }
    ];


    // Filter pending items based on search and type filter
    const filteredItems = pendingItems.filter(item => {
      const matchesFilter =
        filterTypetwo === 'all' ||
        item.type === filterTypetwo;

      const matchesSearch =
        item.facultyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.preview.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });

    const handleApprove = (itemId: number) => {
      setProcessingItem(itemId);

      // Simulate API call to approve item
      setTimeout(() => {
        console.log(`Approved item ${itemId}`);
        // In a real app, you would make an API call to update the status
        // and then refresh the data

        setProcessingItem(null);
        // Here you would typically remove the item from the list or refresh the data
      }, 1000);
    };

    const handleReject = (itemId: number) => {
      setProcessingItem(itemId);

      // Simulate API call to reject item
      setTimeout(() => {
        console.log(`Rejected item ${itemId}`);
        // In a real app, you would make an API call to update the status
        // and then refresh the data

        setProcessingItem(null);
        // Here you would typically remove the item from the list or refresh the data
      }, 1000);
    };

    const getTypeIcon = (type: string) => {
      switch (type) {
        case 'education':
          return <BookOpen size={16} className="text-[#95D5B2]" />;
        case 'experience':
          return <Briefcase size={16} className="text-[#95D5B2]" />;
        case 'certification':
          return <Award size={16} className="text-[#95D5B2]" />;
        default:
          return <FileText size={16} className="text-[#95D5B2]" />;
      }
    };

    const getTypeBadge = (type: string) => {
      switch (type) {
        case 'education':
          return "bg-[#1B4332] text-[#95D5B2]";
        case 'experience':
          return "bg-[#5A4303] text-[#F3A95A]";
        case 'certification':
          return "bg-[#3B4858] text-[#7EB6FF]";
        default:
          return "bg-[#1B4332] text-[#95D5B2]";
      }
    };

    return (
      <>
        <motion.header
          className="flex items-center justify-between px-6 py-4 border-b border-[#1B4332]"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-[#95D5B2] text-xl font-medium">Pending Approvals</h1>
          <div className="flex gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search approvals..."
                className="bg-[#1B4332] text-white pl-9 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#95D5B2] w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#95D5B2]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <select
              className="bg-[#1B4332] text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
              value={filterType}
              onChange={(e) => setFilterTypetwo(e.target.value as 'all' | 'education' | 'experience' | 'certification')}
            >
              <option value="all">All Types</option>
              <option value="education">Education</option>
              <option value="experience">Experience</option>
              <option value="certification">Certification</option>
            </select>
          </div>
        </motion.header>

        {/* Main content area */}
        <motion.div
          className="p-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <div className="bg-[#1B4332] rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2D6A4F]">
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#95D5B2] uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#95D5B2] uppercase tracking-wider">
                      Faculty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#95D5B2] uppercase tracking-wider">
                      Preview
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#95D5B2] uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[#95D5B2] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D6A4F]">
                  {filteredItems.map((item) => (
                    <motion.tr
                      key={item.id}
                      className="text-white"
                      variants={itemVariants}
                      whileHover={{ backgroundColor: "rgba(45, 106, 79, 0.3)" }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getTypeBadge(item.type)}`}>
                          <span className="mr-1.5">{getTypeIcon(item.type)}</span>
                          <span className="capitalize">{item.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                            <img
                              src={item.facultyImage}
                              alt={item.facultyName}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium">{item.facultyName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium">{item.preview}</div>
                        <div className="text-sm text-[#95D5B2]">{item.details}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {new Date(item.submittedDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end space-x-3">
                          <motion.button
                            className="bg-[#2D6A4F] hover:bg-[#3B8F6F] text-white py-1 px-3 rounded-md text-xs flex items-center"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleApprove(item.id)}
                            disabled={processingItem === item.id}
                          >
                            {processingItem === item.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            )}
                            Approve
                          </motion.button>
                          <motion.button
                            className="bg-[#8B0000] hover:bg-[#A52A2A] text-white py-1 px-3 rounded-md text-xs flex items-center"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleReject(item.id)}
                            disabled={processingItem === item.id}
                          >
                            {processingItem === item.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            )}
                            Reject
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}

                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-[#95D5B2]">
                        <div className="flex flex-col items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 mb-3 text-[#2D6A4F]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <p className="text-lg">No pending approvals found</p>
                          <p className="text-sm mt-1">All items have been reviewed</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
            <motion.div
              className="bg-[#1B4332] rounded-lg p-5 shadow-sm"
              variants={itemVariants}
              whileHover={{
                boxShadow: "0 4px 20px rgba(149, 213, 178, 0.15)",
                y: -3
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#95D5B2] text-sm font-medium">Education Entries</p>
                  <h3 className="text-white text-2xl font-bold mt-2">
                    {pendingItems.filter(item => item.type === 'education').length}
                  </h3>
                </div>
                <div className="bg-[#2D6A4F] p-3 rounded-full">
                  <BookOpen size={20} className="text-[#95D5B2]" />
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-[#1B4332] rounded-lg p-5 shadow-sm"
              variants={itemVariants}
              whileHover={{
                boxShadow: "0 4px 20px rgba(149, 213, 178, 0.15)",
                y: -3
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#95D5B2] text-sm font-medium">Experience Entries</p>
                  <h3 className="text-white text-2xl font-bold mt-2">
                    {pendingItems.filter(item => item.type === 'experience').length}
                  </h3>
                </div>
                <div className="bg-[#2D6A4F] p-3 rounded-full">
                  <Briefcase size={20} className="text-[#95D5B2]" />
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-[#1B4332] rounded-lg p-5 shadow-sm"
              variants={itemVariants}
              whileHover={{
                boxShadow: "0 4px 20px rgba(149, 213, 178, 0.15)",
                y: -3
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#95D5B2] text-sm font-medium">Certification Entries</p>
                  <h3 className="text-white text-2xl font-bold mt-2">
                    {pendingItems.filter(item => item.type === 'certification').length}
                  </h3>
                </div>
                <div className="bg-[#2D6A4F] p-3 rounded-full">
                  <Award size={20} className="text-[#95D5B2]" />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </>
    );
  };

  const dashboard_admin = () => {
    // Sample admin dashboard data
    const adminData = {
      totalFaculty: 42,
      completeProfiles: 35,
      incompleteProfiles: 7,
      expiringCertifications: 8,
    };

    return (
      <>
        <motion.header
          className="flex items-center justify-between px-6 py-4 border-b border-[#1B4332]"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-[#95D5B2] text-xl font-medium">Admin Dashboard</h1>
          <motion.button
            className="inline-flex items-center gap-2 bg-[#95D5B2] text-[#081C15] px-4 py-2 rounded-md text-sm font-medium"
            whileHover={{
              y: -2,
              boxShadow: "0 10px 15px -3px rgba(149, 213, 178, 0.2)",
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <FileText size={16} />
            Generate Report
          </motion.button>
        </motion.header>

        {/* Main content area */}
        <motion.div
          className="p-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Faculty Card */}
            <motion.div
              className="bg-[#1B4332] rounded-lg p-5 shadow-sm"
              variants={itemVariants}
              whileHover={{
                boxShadow: "0 4px 20px rgba(149, 213, 178, 0.15)",
                y: -3
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#95D5B2] text-sm font-medium">Total Faculty</p>
                  <h3 className="text-white text-2xl font-bold mt-2">{adminData.totalFaculty}</h3>
                </div>
                <div className="bg-[#2D6A4F] p-3 rounded-full">
                  <ContactRound size={20} className="text-[#95D5B2]" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-xs bg-[#2D6A4F] text-[#95D5B2] py-0.5 px-2 rounded-full">
                  Active
                </span>
              </div>
            </motion.div>

            {/* Complete Profiles Card */}
            <motion.div
              className="bg-[#1B4332] rounded-lg p-5 shadow-sm"
              variants={itemVariants}
              whileHover={{
                boxShadow: "0 4px 20px rgba(149, 213, 178, 0.15)",
                y: -3
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#95D5B2] text-sm font-medium">Complete Profiles</p>
                  <h3 className="text-white text-2xl font-bold mt-2">{adminData.completeProfiles}</h3>
                </div>
                <div className="bg-[#2D6A4F] p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#95D5B2]">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-xs text-[#95D5B2]">
                  {Math.round((adminData.completeProfiles / adminData.totalFaculty) * 100)}% of total
                </span>
              </div>
            </motion.div>

            {/* Incomplete Profiles Card */}
            <motion.div
              className="bg-[#1B4332] rounded-lg p-5 shadow-sm"
              variants={itemVariants}
              whileHover={{
                boxShadow: "0 4px 20px rgba(149, 213, 178, 0.15)",
                y: -3
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#95D5B2] text-sm font-medium">Incomplete Profiles</p>
                  <h3 className="text-white text-2xl font-bold mt-2">{adminData.incompleteProfiles}</h3>
                </div>
                <div className="bg-[#2D6A4F] p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#95D5B2]">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-xs bg-[#5A4303] text-[#F3A95A] py-0.5 px-2 rounded-full">
                  Needs attention
                </span>
              </div>
            </motion.div>

            {/* Expiring Certifications Card */}
            <motion.div
              className="bg-[#1B4332] rounded-lg p-5 shadow-sm"
              variants={itemVariants}
              whileHover={{
                boxShadow: "0 4px 20px rgba(149, 213, 178, 0.15)",
                y: -3
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#95D5B2] text-sm font-medium">Expiring Certifications</p>
                  <h3 className="text-white text-2xl font-bold mt-2">{adminData.expiringCertifications}</h3>
                </div>
                <div className="bg-[#2D6A4F] p-3 rounded-full">
                  <AlertTriangle size={20} className="text-[#F3A95A]" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-xs bg-[#5A4303] text-[#F3A95A] py-0.5 px-2 rounded-full">
                  Expires within 30 days
                </span>
              </div>
            </motion.div>
          </div>

          {/* Recent Activity Section */}
          <motion.div
            className="mt-8 bg-[#1B4332] rounded-lg p-5 shadow-sm"
            variants={itemVariants}
          >
            <h2 className="text-white font-medium text-lg mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {/* Activity items */}
              <div className="flex items-center py-2 border-b border-[#2D6A4F]">
                <div className="bg-[#2D6A4F] p-2 rounded-full mr-3">
                  <Award size={16} className="text-[#95D5B2]" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">Dr. Sarah Johnson added a new certification</p>
                  <p className="text-[#95D5B2] text-xs mt-1">AWS Solutions Architect - Professional</p>
                </div>
                <span className="text-[#95D5B2] text-xs">2h ago</span>
              </div>

              <div className="flex items-center py-2 border-b border-[#2D6A4F]">
                <div className="bg-[#2D6A4F] p-2 rounded-full mr-3">
                  <BookOpen size={16} className="text-[#95D5B2]" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">Prof. David Lee updated education profile</p>
                  <p className="text-[#95D5B2] text-xs mt-1">Added Ph.D. in Computer Science</p>
                </div>
                <span className="text-[#95D5B2] text-xs">5h ago</span>
              </div>

              <div className="flex items-center py-2 border-b border-[#2D6A4F]">
                <div className="bg-[#2D6A4F] p-2 rounded-full mr-3">
                  <FileText size={16} className="text-[#95D5B2]" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">Dr. Maria Garcia uploaded a new document</p>
                  <p className="text-[#95D5B2] text-xs mt-1">Research Publication: ML in Healthcare</p>
                </div>
                <span className="text-[#95D5B2] text-xs">Yesterday</span>
              </div>

              <div className="flex items-center py-2">
                <div className="bg-[#2D6A4F] p-2 rounded-full mr-3">
                  <ContactRound size={16} className="text-[#95D5B2]" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">Prof. James Wilson completed profile setup</p>
                  <p className="text-[#95D5B2] text-xs mt-1">Profile is now 100% complete</p>
                </div>
                <span className="text-[#95D5B2] text-xs">2d ago</span>
              </div>
            </div>

            <motion.button
              className="flex items-center justify-center w-full text-xs text-[#95D5B2] group mt-4 py-1"
              whileHover={{ color: "white" }}
            >
              View all activity
              <motion.span
                whileHover={{ x: 3 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <ChevronRight size={14} className="ml-1" />
              </motion.span>
            </motion.button>
          </motion.div>
        </motion.div>
      </>
    );
  };


  // ...existing code...

  const handleEditDocument = (document: Document) => {
    setSelectedDocument(document);
    setIsDocModalOpen(true);
  };

  const handleAddNewDocument = () => {
    setSelectedDocument(null);
    setDocumentFile(null);
    setIsDocModalOpen(true);
  };

  const closeDocModal = () => {
    setIsDocModalOpen(false);
    setDocumentFile(null);
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentFile(file);
    }
  };

  // Add this to your localStorageKeys:
// localStorageKeys = {
//   education: 'fpms_education',
//   experience: 'fpms_experience', 
//   certifications: 'fpms_certifications',
//   documents: 'fpms_documents'  // Ensure this exists
// };

const handleDocumentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const form = e.currentTarget;
  
  const fileNameDisplay = documentFile ? documentFile.name : '';
  const fileTypeDisplay = documentFile ? documentFile.type.split('/')[1].toUpperCase() : '';
  const fileSizeDisplay = documentFile ? 
    `${(documentFile.size / (1024 * 1024)).toFixed(2)} MB` : '';

  const newDocument = {
    _id: selectedDocument?._id || String(Date.now()),
    title: form.title.value,
    description: form.description.value,
    fileName: fileNameDisplay,
    fileType: fileTypeDisplay,
    fileSize: fileSizeDisplay,
    uploadDate: new Date().toISOString().split('T')[0],
    fileUrl: selectedDocument?.fileUrl || URL.createObjectURL(documentFile),
    tags: form.tags.value.split(',').map((tag: string) => tag.trim()).filter(Boolean)
  };

  try {
    // Get current data
    const currentData = getFromStorage(localStorageKeys.documents, []);
    let updatedData;
    
    if (selectedDocument) {
      // Update existing document
      updatedData = currentData.map(item => 
        item._id === selectedDocument._id ? newDocument : item
      );
    } else {
      // Add new document
      updatedData = [...currentData, newDocument];
    }
    
    // Save to localStorage
    saveToStorage(localStorageKeys.documents, updatedData);
    
    // Map the new document to match your state interface
    const stateDocument = {
      id: parseInt(newDocument._id) || Math.floor(Math.random() * 10000),
      title: newDocument.title,
      description: newDocument.description,
      fileName: newDocument.fileName,
      fileType: newDocument.fileType,
      fileSize: newDocument.fileSize,
      uploadDate: newDocument.uploadDate,
      fileUrl: newDocument.fileUrl,
      tags: newDocument.tags,
    };
    
    // Update the documents state
    setDocumentsData(prev => {
      if (selectedDocument) {
        return prev.map(doc => doc.id === selectedDocument.id ? stateDocument : doc);
      } else {
        return [...prev, stateDocument];
      }
    });
    
    // Reset form fields and close modal
    setDocumentFile(null);
    closeDocModal();
  } catch (error) {
    console.error("Error submitting document:", error);
  }
};

  const triggerDocumentFileInput = () => {
    documentFileRef.current?.click();
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#FF5252]">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <path d="M9 15v-2h6v2"></path>
            <path d="M11 11v6"></path>
            <path d="M9 11h4"></path>
          </svg>
        );
      case 'word':
      case 'docx':
      case 'doc':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#4285F4]">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <path d="M16 13H8"></path>
            <path d="M16 17H8"></path>
            <path d="M10 9H8"></path>
          </svg>
        );
      case 'powerpoint':
      case 'pptx':
      case 'ppt':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#FF8A65]">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <path d="M9 13h6"></path>
            <path d="M9 17h6"></path>
            <path d="M9 9h1"></path>
          </svg>
        );
      case 'image':
      case 'jpg':
      case 'jpeg':
      case 'png':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#4CAF50]">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        );
    }
  };

  // ...existing code...

  const documentsSection = () => {
    return (
      <>
        <motion.header
          className="flex items-center justify-between px-6 py-4 border-b border-[#1B4332]"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-[#95D5B2] text-xl font-medium">My Documents</h1>
          <motion.button
            className="inline-flex items-center gap-2 bg-[#95D5B2] text-[#081C15] px-4 py-2 rounded-md text-sm font-medium"
            whileHover={{
              y: -2,
              boxShadow: "0 10px 15px -3px rgba(149, 213, 178, 0.2)",
            }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={handleAddNewDocument}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Upload Document
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
            {documentsData.map((doc) => (
              <motion.div
                key={doc.id}
                className="bg-[#1B4332] rounded-lg p-5 shadow-sm"
                variants={itemVariants}
                whileHover={{ boxShadow: "0 4px 20px rgba(149, 213, 178, 0.1)" }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {getFileIcon(doc.fileType)}
                      </div>
                      <div>
                        <h2 className="text-white font-medium text-lg">{doc.title}</h2>
                        <p className="text-sm text-[#95D5B2]">{doc.description}</p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-y-2 text-sm">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#95D5B2] mr-2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                        <span className="text-[#95D5B2]">{doc.fileName}</span>
                      </div>

                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#95D5B2] mr-2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                        <span className="text-[#95D5B2]">{doc.fileSize}</span>
                      </div>

                      <div className="flex items-center">
                        <CalendarSearch size={14} className="text-[#95D5B2] mr-2" />
                        <span className="text-[#95D5B2]">
                          {new Date(doc.uploadDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {doc.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-[#2D6A4F] text-[#95D5B2] text-xs py-0.5 px-2 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex ml-4">
                    <motion.a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#2D6A4F] hover:bg-[#3B8F6F] text-white p-2 rounded-md mr-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                    </motion.a>
                    <motion.button
                      className="bg-[#2D6A4F] hover:bg-[#3B8F6F] text-white p-2 rounded-md"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEditDocument(doc)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                        <path d="m15 5 4 4"></path>
                      </svg>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Document Upload/Edit Modal */}
        {isDocModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              className="bg-[#1B4332] rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="p-6 border-b border-[#2D6A4F] sticky top-0 bg-[#1B4332] z-10">
                <h2 className="text-white text-xl font-medium">
                  {selectedDocument ? "Edit Document Details" : "Upload New Document"}
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-4">
                <form className="space-y-4" onSubmit={handleDocumentSubmit}>
                  {!selectedDocument && (
                    <div className="flex flex-col items-center border-2 border-dashed border-[#3B8F6F] rounded-md p-8 mb-6">
                      <input
                        type="file"
                        ref={documentFileRef}
                        onChange={handleDocumentUpload}
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt,.xls,.xlsx"
                        className="hidden"
                      />

                      {!documentFile ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#95D5B2" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <path d="M12 12v6"></path>
                            <path d="M9 15h6"></path>
                          </svg>
                          <motion.button
                            type="button"
                            className="mt-4 flex items-center gap-2 bg-[#1B4332] text-white px-4 py-2 rounded-md text-sm"
                            whileHover={{ scale: 1.02, backgroundColor: "#3B8F6F" }}
                            whileTap={{ scale: 0.98 }}
                            onClick={triggerDocumentFileInput}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                              <polyline points="17 8 12 3 7 8"></polyline>
                              <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                            Choose File
                          </motion.button>
                          <p className="text-xs text-[#95D5B2] mt-2 text-center">
                            Supports: PDF, Word, PowerPoint, Excel, Images, Text files<br />
                            Maximum size: 20MB
                          </p>
                        </>
                      ) : (
                        <div className="flex flex-col items-center">
                          {documentFile.type.includes('image') ? (
                            <div className="h-48 w-48 relative mb-4">
                              <img
                                src={URL.createObjectURL(documentFile)}
                                alt="Document preview"
                                className="h-full w-full object-contain"
                              />
                            </div>
                          ) : (
                            <div className="h-24 w-24 flex items-center justify-center mb-4">
                              {getFileIcon(documentFile.name.split('.').pop() || '')}
                            </div>
                          )}
                          <p className="text-white mb-1">{documentFile.name}</p>
                          <p className="text-[#95D5B2] text-sm mb-3">
                            {(documentFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                          <motion.button
                            type="button"
                            className="flex items-center gap-2 bg-[#081C15] text-[#95D5B2] px-3 py-1 rounded-md text-sm"
                            whileHover={{ scale: 1.02, backgroundColor: "#0a241c" }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setDocumentFile(null)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 6 6 18M6 6l12 12" />
                            </svg>
                            Change File
                          </motion.button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-[#95D5B2] text-sm mb-1">Document Title</label>
                      <input
                        type="text"
                        className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                        name="title"
                        defaultValue={selectedDocument?.title || ""}
                        placeholder="Enter a title for this document"
                      />
                    </div>

                    <div>
                      <label className="block text-[#95D5B2] text-sm mb-1">Description</label>
                      <textarea
                        className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2] min-h-[80px]"
                        name="description"
                        defaultValue={selectedDocument?.description || ""}
                        placeholder="Describe the document contents and purpose"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-[#95D5B2] text-sm mb-1">Tags (comma separated)</label>
                      <input
                        type="text"
                        name="tags"
                        className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                        defaultValue={selectedDocument?.tags.join(", ") || ""}
                        placeholder="Research, Teaching, Administrative, etc."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <motion.button
                      type="button"
                      className="bg-[#081C15] text-white px-4 py-2 rounded-md"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={closeDocModal}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      className="bg-[#95D5B2] text-[#081C15] px-4 py-2 rounded-md font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {selectedDocument ? "Save Changes" : "Upload Document"}
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

  // const certificationsData: Certification[] = [
  //   {
  //     id: 1,
  //     name: "AWS Certified Solutions Architect - Professional",
  //     issuingOrganization: "Amazon Web Services (AWS)",
  //     issueDate: "2023-05-15",
  //     expirationDate: "2026-05-15",
  //     credentialId: "AWS-CSAP-12345",
  //     credentialURL: "https://aws.amazon.com/verification",
  //     certificationType: "Professional",
  //     skills: ["Cloud Architecture", "AWS Services", "Security", "Networking"],
  //     description: "Validates advanced knowledge of AWS architecture design and implementation.",
  //     imageUrl: "https://example.com/aws-cert.jpg",
  //     status: 'active'
  //   }, {
  //     id: 2,
  //     name: "Project Management Professional (PMP)",
  //     issuingOrganization: "Project Management Institute",
  //     issueDate: "2022-11-10",
  //     expirationDate: "2025-11-10",
  //     credentialId: "PMP-123456",
  //     credentialURL: "https://pmi.org/certifications/verify",
  //     certificationType: "Professional",
  //     skills: ["Project Management", "Leadership", "Risk Management", "Scheduling"],
  //     description: "Internationally recognized professional designation for project managers.",
  //     imageUrl: "https://example.com/pmp-cert.jpg",
  //     status: 'expiring'
  //   },
  //   {
  //     id: 3,
  //     name: "Certified Information Systems Security Professional (CISSP)",
  //     issuingOrganization: "ISC²",
  //     issueDate: "2021-08-22",
  //     expirationDate: "2024-08-22",
  //     credentialId: "CISSP-987654",
  //     credentialURL: "https://isc2.org/verify",
  //     certificationType: "Security",
  //     skills: ["Information Security", "Risk Management", "Network Security", "Cryptography"],
  //     description: "An advanced-level certification for IT security professionals.",
  //     imageUrl: "https://example.com/cissp-cert.jpg",
  //     status: 'expiring'
  //   }
  // ];

  const handleEditCertification = (certification: Certification) => {
    setSelectedCertification(certification);
    setPreviewImage(certification.imageUrl || null);
    setFormData(certification); // Initialize form data with selected certification
    setIsCertModalOpen(true);
  };

  const handleAddNewCertification = () => {
    setSelectedCertification(null);
    setPreviewImage(null);
    setFormData({}); // Clear form data
    setIsCertModalOpen(true);
  };

  const closeCertModal = () => {
    setIsCertModalOpen(false);
    setPreviewImage(null);
    setFormData({}); // Clear form data when closing modal
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
                      className={`text-xs px-2 py-0.5 rounded-full ${cert.daysLeft < 30
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

  const reports = () => {


    const generateCSV = async (type: 'faculty' | 'certification') => {
      setIsGeneratingReport(true);

      try {
        // In a real application, this would be an API call
        // For this demonstration, we'll simulate a server request with a timeout
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Generate CSV content based on report type
        let csvContent = "";

        if (type === 'faculty') {
          // Header row
          csvContent = "Faculty ID,Name,Email,Department,Role,Join Date,Profile Completion %,Status\n";

          // Sample data rows
          const facultyData = [
            { id: 1, name: "Dr. Sarah Johnson", email: "s.johnson@university.edu", department: "Computer Science", role: "Associate Professor", joinDate: "2019-08-15", completion: 80, status: "Incomplete" },
            { id: 2, name: "Prof. David Lee", email: "d.lee@university.edu", department: "Engineering", role: "Assistant Professor", joinDate: "2020-01-10", completion: 100, status: "Complete" },
            { id: 3, name: "Dr. Maria Garcia", email: "m.garcia@university.edu", department: "Data Science", role: "Full Professor", joinDate: "2015-09-01", completion: 60, status: "Incomplete" },
            { id: 4, name: "Dr. Robert Chen", email: "r.chen@university.edu", department: "Information Systems", role: "Assistant Professor", joinDate: "2021-08-20", completion: 40, status: "Incomplete" },
            { id: 5, name: "Prof. Amelia Williams", email: "a.williams@university.edu", department: "Computer Science", role: "Associate Professor", joinDate: "2018-01-15", completion: 100, status: "Complete" },
            { id: 6, name: "Dr. James Wilson", email: "j.wilson@university.edu", department: "Artificial Intelligence", role: "Assistant Professor", joinDate: "2022-01-15", completion: 20, status: "Incomplete" },
          ];

          // Add data rows
          facultyData.forEach(faculty => {
            csvContent += `${faculty.id},"${faculty.name}",${faculty.email},"${faculty.department}","${faculty.role}",${faculty.joinDate},${faculty.completion}%,${faculty.status}\n`;
          });

        } else if (type === 'certification') {
          // Header row
          csvContent = "Faculty Name,Certification Name,Issuing Organization,Issue Date,Expiry Date,Status\n";

          // Sample data rows
          const certificationData = [
            { facultyName: "Dr. Sarah Johnson", certName: "AWS Certified Solutions Architect - Professional", issuer: "Amazon Web Services", issueDate: "2023-05-15", expiryDate: "2026-05-15", status: "Valid" },
            { facultyName: "Prof. David Lee", certName: "Project Management Professional (PMP)", issuer: "Project Management Institute", issueDate: "2022-11-10", expiryDate: "2025-06-10", status: "Expiring Soon" },
            { facultyName: "Dr. Maria Garcia", certName: "Certified Information Systems Security Professional", issuer: "ISC²", issueDate: "2021-08-22", expiryDate: "2024-08-22", status: "Expiring Soon" },
            { facultyName: "Dr. Robert Chen", certName: "Microsoft Certified: Azure Solutions Architect Expert", issuer: "Microsoft", issueDate: "2022-02-15", expiryDate: "2023-02-15", status: "Expired" },
            { facultyName: "Prof. Amelia Williams", certName: "Google Professional Cloud Architect", issuer: "Google Cloud", issueDate: "2024-01-20", expiryDate: "2027-01-20", status: "Valid" },
            { facultyName: "Dr. James Wilson", certName: "Cisco Certified Network Professional", issuer: "Cisco", issueDate: "2020-06-05", expiryDate: "2023-06-05", status: "Expired" },
            { facultyName: "Dr. Sarah Johnson", certName: "Certified Kubernetes Administrator", issuer: "Cloud Native Computing Foundation", issueDate: "2023-09-10", expiryDate: "2026-09-10", status: "Valid" },
            { facultyName: "Prof. David Lee", certName: "CompTIA Security+", issuer: "CompTIA", issueDate: "2022-03-25", expiryDate: "2025-03-25", status: "Valid" },
          ];

          // Add data rows
          certificationData.forEach(cert => {
            csvContent += `"${cert.facultyName}","${cert.certName}","${cert.issuer}",${cert.issueDate},${cert.expiryDate},${cert.status}\n`;
          });
        }

        // Create a download link for the CSV file
        const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${type === 'faculty' ? 'faculty_completion' : 'certification_status'}_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

      } catch (error) {
        console.error("Error generating report:", error);
        // In a real app, you'd show an error message to the user
      } finally {
        setIsGeneratingReport(false);
      }
    };

    const handleGenerateReport = () => {
      generateCSV(reportType);
    };

    return (
      <>
        <motion.header
          className="flex items-center justify-between px-6 py-4 border-b border-[#1B4332]"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-[#95D5B2] text-xl font-medium">Reports</h1>
        </motion.header>

        {/* Main content area */}
        <motion.div
          className="p-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div
            className="bg-[#1B4332] rounded-lg p-6 shadow-sm"
            variants={itemVariants}
          >
            <h2 className="text-white text-lg font-medium mb-4">Generate Reports</h2>
            <p className="text-[#95D5B2] mb-6">
              Export faculty data and certification information as CSV files for further analysis or record-keeping.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Faculty Completion Report */}
              <motion.div
                className="bg-[#2D6A4F] rounded-lg p-5 relative overflow-hidden"
                whileHover={{
                  boxShadow: "0 4px 20px rgba(149, 213, 178, 0.15)",
                  y: -3
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-[#95D5B2]">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>

                <h3 className="text-white font-medium text-lg mb-2">Faculty Completion Report</h3>
                <p className="text-[#95D5B2] text-sm mb-4">
                  Download a comprehensive list of all faculty members with their profile completion status.
                </p>

                <ul className="text-[#95D5B2] text-sm mb-6 space-y-1">
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Faculty details and contact information
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Profile completion percentages
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Department and role information
                  </li>
                </ul>

                <motion.button
                  className="flex items-center gap-2 bg-[#081C15] text-white px-4 py-2 rounded-md text-sm w-full justify-center"
                  whileHover={{ backgroundColor: "#0c2a20" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setReportType('faculty')}
                  disabled={isGeneratingReport}
                >
                  <input
                    type="radio"
                    name="reportType"
                    checked={reportType === 'faculty'}
                    onChange={() => setReportType('faculty')}
                    className="mr-2"
                    disabled={isGeneratingReport}
                  />
                  Select Faculty Report
                </motion.button>
              </motion.div>

              {/* Certification Status Report */}
              <motion.div
                className="bg-[#2D6A4F] rounded-lg p-5 relative overflow-hidden"
                whileHover={{
                  boxShadow: "0 4px 20px rgba(149, 213, 178, 0.15)",
                  y: -3
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-[#95D5B2]">
                    <circle cx="12" cy="8" r="7"></circle>
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                  </svg>
                </div>

                <h3 className="text-white font-medium text-lg mb-2">Certification Status Report</h3>
                <p className="text-[#95D5B2] text-sm mb-4">
                  Download a detailed list of all faculty certifications with their current status.
                </p>

                <ul className="text-[#95D5B2] text-sm mb-6 space-y-1">
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    All faculty certifications
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Expiration dates and status
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Issuing organizations
                  </li>
                </ul>

                <motion.button
                  className="flex items-center gap-2 bg-[#081C15] text-white px-4 py-2 rounded-md text-sm w-full justify-center"
                  whileHover={{ backgroundColor: "#0c2a20" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setReportType('certification')}
                  disabled={isGeneratingReport}
                >
                  <input
                    type="radio"
                    name="reportType"
                    checked={reportType === 'certification'}
                    onChange={() => setReportType('certification')}
                    className="mr-2"
                    disabled={isGeneratingReport}
                  />
                  Select Certification Report
                </motion.button>
              </motion.div>
            </div>

            <div className="mt-8 flex justify-end">
              <motion.button
                className="inline-flex items-center gap-2 bg-[#95D5B2] text-[#081C15] px-6 py-3 rounded-md text-sm font-medium"
                whileHover={{
                  y: -2,
                  boxShadow: "0 10px 15px -3px rgba(149, 213, 178, 0.2)",
                }}
                transition={{ type: "spring", stiffness: 300 }}
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
              >
                {isGeneratingReport ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#081C15]"></div>
                    <span>Generating Report...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span>Download CSV Report</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Report Statistics */}
          <motion.div
            className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={containerVariants}
          >
            <motion.div
              className="bg-[#1B4332] rounded-lg p-5 shadow-sm"
              variants={itemVariants}
              whileHover={{
                boxShadow: "0 4px 20px rgba(149, 213, 178, 0.15)",
                y: -3
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#95D5B2] text-sm font-medium">Total Reports Generated</p>
                  <h3 className="text-white text-2xl font-bold mt-2">42</h3>
                </div>
                <div className="bg-[#2D6A4F] p-3 rounded-full">
                  <FileText size={20} className="text-[#95D5B2]" />
                </div>
              </div>
              <p className="text-[#95D5B2] text-xs mt-4">Last report: 2 days ago</p>
            </motion.div>

            <motion.div
              className="bg-[#1B4332] rounded-lg p-5 shadow-sm"
              variants={itemVariants}
              whileHover={{
                boxShadow: "0 4px 20px rgba(149, 213, 178, 0.15)",
                y: -3
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#95D5B2] text-sm font-medium">Faculty Reports</p>
                  <h3 className="text-white text-2xl font-bold mt-2">24</h3>
                </div>
                <div className="bg-[#2D6A4F] p-3 rounded-full">
                  <ContactRound size={20} className="text-[#95D5B2]" />
                </div>
              </div>
              <p className="text-[#95D5B2] text-xs mt-4">57% of all reports</p>
            </motion.div>

            <motion.div
              className="bg-[#1B4332] rounded-lg p-5 shadow-sm"
              variants={itemVariants}
              whileHover={{
                boxShadow: "0 4px 20px rgba(149, 213, 178, 0.15)",
                y: -3
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#95D5B2] text-sm font-medium">Certification Reports</p>
                  <h3 className="text-white text-2xl font-bold mt-2">18</h3>
                </div>
                <div className="bg-[#2D6A4F] p-3 rounded-full">
                  <Award size={20} className="text-[#95D5B2]" />
                </div>
              </div>
              <p className="text-[#95D5B2] text-xs mt-4">43% of all reports</p>
            </motion.div>
          </motion.div>

          {/* Report History */}
          <motion.div
            className="mt-6 bg-[#1B4332] rounded-lg p-5 shadow-sm"
            variants={itemVariants}
          >
            <h2 className="text-white font-medium text-lg mb-4">Recent Report History</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2D6A4F]">
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#95D5B2] uppercase tracking-wider">Report Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#95D5B2] uppercase tracking-wider">Generated By</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#95D5B2] uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#95D5B2] uppercase tracking-wider">File Size</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D6A4F]">
                  <tr className="text-white">
                    <td className="px-4 py-3 whitespace-nowrap text-sm">Faculty Completion Report</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">Admin User</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">May 5, 2025</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">12.4 KB</td>
                  </tr>
                  <tr className="text-white">
                    <td className="px-4 py-3 whitespace-nowrap text-sm">Certification Status Report</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">Admin User</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">May 2, 2025</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">18.7 KB</td>
                  </tr>
                  <tr className="text-white">
                    <td className="px-4 py-3 whitespace-nowrap text-sm">Faculty Completion Report</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">Admin User</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">Apr 28, 2025</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">11.9 KB</td>
                  </tr>
                  <tr className="text-white">
                    <td className="px-4 py-3 whitespace-nowrap text-sm">Certification Status Report</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">Admin User</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">Apr 21, 2025</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">17.2 KB</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      </>
    );
  };


  // Mock education data
  // const educationData = [
  //   {
  //     id: 1,
  //     degree: "Ph.D. in Computer Science",
  //     institution: "Stanford University",
  //     year: "2018-2022",
  //     description: "Research focus on artificial intelligence and machine learning algorithms.",
  //     gpa: "3.92/4.0"
  //   },
  //   {
  //     id: 2,
  //     degree: "Master of Science in Data Analytics",
  //     institution: "MIT",
  //     year: "2016-2018",
  //     description: "Specialized in big data processing and statistical analysis.",
  //     gpa: "3.85/4.0"
  //   },
  //   {
  //     id: 3,
  //     degree: "Bachelor of Engineering in Computer Science",
  //     institution: "University of California, Berkeley",
  //     year: "2012-2016",
  //     description: "Focus on software engineering and database systems.",
  //     gpa: "3.78/4.0"
  //   }
  // ];

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
              <path d="M12 5v14M5 12h14" />
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
  {isLoading ? (
    <div className="flex justify-center items-center h-40">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#95D5B2]"></div>
    </div>
  ) : educationData.length > 0 ? (
    educationData.map((education, index) => (
// Inside educationSection function, in the education card:

<motion.div
  key={index} // Update to use education._id when available
  className="bg-[#1B4332] rounded-lg p-5 shadow-sm"
  variants={itemVariants}
  whileHover={{ boxShadow: "0 4px 20px rgba(149, 213, 178, 0.1)" }}
>
  <div className="flex justify-between items-start">
    <div>
      <h2 className="text-white font-medium text-lg">{education.degree || "Untitled Degree"}</h2>
      <div className="mt-2 space-y-2">
        <div className="flex items-center">
          <BookOpen size={14} className="text-[#95D5B2] mr-2" />
          <p className="text-[#95D5B2] text-sm">{education.institution || "Unknown Institution"}</p>
        </div>
        <div className="flex items-center">
          <CalendarSearch size={14} className="text-[#95D5B2] mr-2" />
          <p className="text-[#95D5B2] text-sm">{education.year || "N/A"}</p>
        </div>
        {education.gpa && (
          <div className="flex items-center">
            <Award size={14} className="text-[#95D5B2] mr-2" />
            <p className="text-[#95D5B2] text-sm">GPA: {education.gpa}</p>
          </div>
        )}
      </div>
      {education.description && (
        <p className="mt-3 text-white text-sm">{education.description}</p>
      )}
    </div>
    <div className="flex space-x-2">
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
      
      {/* Delete Button */}
      <motion.button
        className="bg-[#8B0000] hover:bg-[#A52A2A] text-white p-2 rounded-md"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleDeleteEducation(education)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18"></path>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </motion.button>
    </div>
  </div>
</motion.div>
    ))
  ) : (
    <div className="text-center py-10">
      <BookOpen size={40} className="mx-auto text-[#2D6A4F] mb-2" />
      <p className="text-[#95D5B2] text-lg">No education records found</p>
      <p className="text-[#95D5B2] text-sm mt-1">Add your first education record</p>
      <button
        onClick={handleAddNew}
        className="mt-4 bg-[#2D6A4F] hover:bg-[#3B8F6F] text-white py-2 px-4 rounded-md text-sm inline-flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add Education
      </button>
    </div>
  )}
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
            <form onSubmit={handleEducationSubmit} className="space-y-4">
              {/* Form Fields */}
              <div>
                <label className="block text-[#95D5B2] text-sm mb-1">Degree</label>
                <input
                  type="text"
                  name="degree"
                  className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                  defaultValue={selectedEducation?.degree || ""}
                  placeholder="e.g., Bachelor of Science in Computer Science"
                />
              </div>
              <div>
                <label className="block text-[#95D5B2] text-sm mb-1">Institution</label>
                <input
                  type="text"
                  name="institution"
                  className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                  defaultValue={selectedEducation?.institution || ""}
                  placeholder="e.g., Stanford University"
                /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#95D5B2] text-sm mb-1">Year</label>
                    <input
                      type="text"
                      name="year"
                      className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                      defaultValue={selectedEducation?.year || ""}
                      placeholder="e.g., 2018-2022"
                    />
                  </div>
                  <div>
                    <label className="block text-[#95D5B2] text-sm mb-1">GPA</label>
                    <input
                      type="text"
                      name="gpa"
                      className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                      defaultValue={selectedEducation?.gpa || ""}
                      placeholder="e.g., 3.8/4.0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[#95D5B2] text-sm mb-1">Description</label>
                  <textarea
                    name="description"
                    className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2] min-h-[100px]"
                    defaultValue={selectedEducation?.description || ""}
                    placeholder="Describe your academic achievements, research focus, or notable activities"
                  ></textarea>
                </div>{/* Submit Status */}
              <div className="h-6">
                {/* This will be used to show submission status/errors */}
                {false && (
                  <p className="text-[#95D5B2] text-sm">Education record saved successfully!</p>
                )}
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
                  className="bg-[#95D5B2] text-[#081C15] px-4 py-2 rounded-md font-medium flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>
                    {selectedEducation ? "Update" : "Add"} Education
                  </span>
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

{/* Delete Confirmation Modal */}
{isDeleteModalOpen && educationToDelete && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <motion.div
      className="bg-[#1B4332] rounded-lg p-6 w-full max-w-md"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <h2 className="text-white text-xl font-medium mb-4">Confirm Deletion</h2>
      
      <p className="text-[#95D5B2] mb-6">
        Are you sure you want to delete "{educationToDelete.degree}" from {educationToDelete.institution}? 
        This action cannot be undone.
      </p>
      
      <div className="flex justify-end space-x-3 pt-2">
        <motion.button
          type="button"
          className="bg-[#081C15] text-white px-4 py-2 rounded-md"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={closeDeleteModal}
          disabled={isDeleting}
        >
          Cancel
        </motion.button>
        <motion.button
          type="button"
          className="bg-[#8B0000] text-white px-4 py-2 rounded-md font-medium flex items-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={confirmDeleteEducation}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              <span>Deleting...</span>
            </>
          ) : (
            <span>Delete</span>
          )}
        </motion.button>
      </div>
    </motion.div>
  </div>
)}


      </>
    );
  };

  // const experiencesData: Experience[] = [
  //   {
  //     id: 1,
  //     title: "Senior Software Engineer",
  //     employmentType: "Full-time",
  //     company: "Tech Innovations Inc.",
  //     isCurrentRole: true,
  //     startDate: "Jan 2022",
  //     endDate: null,
  //     location: "San Francisco, CA",
  //     locationType: "On-site",
  //     description: "Leading development of cloud-based applications using React, Node.js, and AWS. Managing a team of 5 engineers and coordinating with product managers for feature development."
  //   },
  //   {
  //     id: 2,
  //     title: "Software Developer",
  //     employmentType: "Full-time",
  //     company: "DataSync Systems",
  //     isCurrentRole: false,
  //     startDate: "Mar 2019",
  //     endDate: "Dec 2021",
  //     location: "Boston, MA",
  //     locationType: "Hybrid",
  //     description: "Developed and maintained backend services for data synchronization products. Improved system performance by 40% through code optimization and architectural improvements."
  //   },
  //   {
  //     id: 3,
  //     title: "Junior Developer",
  //     employmentType: "Contract",
  //     company: "WebFront Solutions",
  //     isCurrentRole: false,
  //     startDate: "Jun 2017",
  //     endDate: "Feb 2019",
  //     location: "Remote",
  //     locationType: "Remote",
  //     description: "Built responsive web interfaces for various clients using HTML5, CSS3, and JavaScript frameworks. Collaborated with design teams to implement pixel-perfect designs."
  //   }
  // ];

  const handleEditExperience = (experience: Experience) => {
    // Make sure we're setting the correct data
    setSelectedExperience(experience);
    // This should open the modal
    setIsExperienceModalOpen(true);
    
    // For debugging
    console.log("Opening modal with experience:", experience);
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
              <path d="M12 5v14M5 12h14" />
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
            {experiencesData.map((experience, index) => (
              <motion.div
                key={index}
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
              <form className="space-y-4" onSubmit={handleExperienceSubmit}>
                <div>
                  <label className="block text-[#95D5B2] text-sm mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                    defaultValue={selectedExperience?.title || ""}
                  />
                </div>

                <div>
                  <label className="block text-[#95D5B2] text-sm mb-1">Employment Type</label>
                  <select
                    name="employmentType"
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
                    name="company"
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
                      name="startDate"
                      className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                      defaultValue={selectedExperience?.startDate || ""}
                    />
                  </div>
                  <div>
                    <label className="block text-[#95D5B2] text-sm mb-1">End Date</label>
                    <input
                      type="month"
                      name="endDate"
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
    name="location" // Change this from 'locationType' to 'location'
    className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
    defaultValue={selectedExperience?.location || ""}
  />
</div>

<div>
  <label className="block text-[#95D5B2] text-sm mb-1">Location Type</label>
  <select
    name="locationType" // Add this name attribute
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
                    name="description"
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
          </div >
        )
        }
      </>
    );
  };

  const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return '';

    // Check if it's already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;

    // Convert from MM/DD/YYYY to YYYY-MM-DD
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const [month, day, year] = parts;
      return `${year} - ${month.padStart(2, '0')} - ${day.padStart(2, '0')}`;
    }

    return '';
  };

  const certificationsSection = () => {
    const handleScanResults = (results: {
      name: string,
      expirationDate: string,
      issuingOrganization?: string,
      credentialId?: string,
      issueDate?: string
    }) => {
      console.log("Scan results:", results);

      // Show loading state
      setAutoFillingFields(true);

      // Use setTimeout to give a visual indication that something is happening
      setTimeout(() => {
        setFormData(prevData => ({
          ...prevData,
          name: results.name || prevData.name,
          expirationDate: formatDateForInput(results.expirationDate) || prevData.expirationDate,
          issuingOrganization: results.issuingOrganization || prevData.issuingOrganization,
          credentialId: results.credentialId || prevData.credentialId,
          issueDate: formatDateForInput(results.issueDate) || prevData.issueDate,
        }));

        // Hide loading state after data is updated
        setAutoFillingFields(false);
      }, 500); // Short delay to show loading animation
    };

    const handleImageChange = (imageUrl: string | null) => {
      setPreviewImage(imageUrl);
    };
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
              <path d="M12 5v14M5 12h14" />
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
            {certificationsData.map((cert, index) => (
              <motion.div
                key={cert._id}
                className="bg-[#1B4332] rounded-lg p-5 shadow-sm"
                variants={itemVariants}
                whileHover={{ boxShadow: "0 4px 20px rgba(149, 213, 178, 0.1)" }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-2">
                      <h2 className="text-white font-medium text-lg">{cert.name}</h2>
                      <span className={`text-xs py-0.5 px-2 rounded-full ${getCertStatusColor(cert.status)
                        }`}>
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
                      {cert?.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {cert?.skills.map((skill, index) => (
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

                <CertificationScanner
                  onResultsChange={handleScanResults}
                  showPreview={true}
                  className="mb-6"
                />

                {autoFillingFields && (
                  <div className="bg-[#2D6A4F] text-[#95D5B2] text-sm p-2 rounded-md mb-4 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#95D5B2] mr-2"></div>
                    <span>Auto-filling certificate details...</span>
                  </div>
                )}

                <form className="space-y-4" onSubmit={handleCertificationSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="md:col-span-2">
                      {/* Certificate Image Upload */}

                      <div>
                        <label className="block text-[#95D5B2] text-sm mb-1">Certificate Name</label>
                        <input
                          type="text"
                          name="name"
                          className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                          value={formData.name || selectedCertification?.name || ""}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        {autoFillingFields && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#95D5B2]"></div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[#95D5B2] text-sm mb-1">Issuing Organization</label>
                      <input
                        type="text"
                        name="issuingOrganization"
                        className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                        value={formData.issuingOrganization || selectedCertification?.issuingOrganization || ""}
                        onChange={(e) => setFormData({ ...formData, issuingOrganization: e.target.value })}
                      />
                      {autoFillingFields && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#95D5B2]"></div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[#95D5B2] text-sm mb-1">Type/Level</label>
                      <select
                         name="certificationType"
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
                        name="issueDate"
                        type="date"
                        className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                        value={formData.issueDate || selectedCertification?.issueDate || ""}
                        onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}

                      />
                      {autoFillingFields && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#95D5B2]"></div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[#95D5B2] text-sm mb-1">Expiration Date</label>
                      <input
                      name="expirationDate"
                        type="date"
                        className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                        value={formData.expirationDate || selectedCertification?.expirationDate || ""}
                        onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                      />
                      {autoFillingFields && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#95D5B2]"></div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[#95D5B2] text-sm mb-1">Credential ID</label>
                      <input
                        type="text"
                        name="credentialId"
                        className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                        defaultValue={selectedCertification?.credentialId || ""}
                      />
                    </div>

                    <div>
                      <label className="block text-[#95D5B2] text-sm mb-1">Verification URL (optional)</label>
                      <input
                        type="url"
                        name="credentialURL"
                        className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                        defaultValue={selectedCertification?.credentialURL || ""}
                        placeholder="https://..."
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[#95D5B2] text-sm mb-1">Skills (comma separated)</label>
                      <input
                      name="skills"
                        type="text"
                        className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                        defaultValue={selectedCertification?.skills.join(", ") || ""}
                        placeholder="Cloud Computing, Security, DevOps"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[#95D5B2] text-sm mb-1">Description</label>
                      <textarea
                      name="description"
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

  const admin_certifications = () => {


    // Sample data for faculty certifications
    const facultyCertifications = [
      {
        id: 1,
        facultyName: "Dr. Sarah Johnson",
        facultyId: 1,
        certificationName: "AWS Certified Solutions Architect - Professional",
        issuingOrganization: "Amazon Web Services",
        issueDate: "2023-05-15",
        expiryDate: "2026-05-15", // Future date - Valid
        facultyImage: "https://randomuser.me/api/portraits/women/22.jpg"
      },
      {
        id: 2,
        facultyName: "Prof. David Lee",
        facultyId: 2,
        certificationName: "Project Management Professional (PMP)",
        issuingOrganization: "Project Management Institute",
        issueDate: "2022-11-10",
        expiryDate: "2025-06-10", // Date within next 90 days - Expiring Soon
        facultyImage: "https://randomuser.me/api/portraits/men/32.jpg"
      },
      {
        id: 3,
        facultyName: "Dr. Maria Garcia",
        facultyId: 3,
        certificationName: "Certified Information Systems Security Professional (CISSP)",
        issuingOrganization: "ISC²",
        issueDate: "2021-08-22",
        expiryDate: "2024-08-22", // Date within next 90 days - Expiring Soon
        facultyImage: "https://randomuser.me/api/portraits/women/56.jpg"
      },
      {
        id: 4,
        facultyName: "Dr. Robert Chen",
        facultyId: 4,
        certificationName: "Microsoft Certified: Azure Solutions Architect Expert",
        issuingOrganization: "Microsoft",
        issueDate: "2022-02-15",
        expiryDate: "2023-02-15", // Past date - Expired
        facultyImage: "https://randomuser.me/api/portraits/men/41.jpg"
      },
      {
        id: 5,
        facultyName: "Prof. Amelia Williams",
        facultyId: 5,
        certificationName: "Google Professional Cloud Architect",
        issuingOrganization: "Google Cloud",
        issueDate: "2024-01-20",
        expiryDate: "2027-01-20", // Future date - Valid
        facultyImage: "https://randomuser.me/api/portraits/women/45.jpg"
      },
      {
        id: 6,
        facultyName: "Dr. James Wilson",
        facultyId: 6,
        certificationName: "Cisco Certified Network Professional (CCNP)",
        issuingOrganization: "Cisco",
        issueDate: "2020-06-05",
        expiryDate: "2023-06-05", // Past date - Expired
        facultyImage: "https://randomuser.me/api/portraits/men/55.jpg"
      },
      {
        id: 7,
        facultyName: "Dr. Sarah Johnson",
        facultyId: 1,
        certificationName: "Certified Kubernetes Administrator",
        issuingOrganization: "Cloud Native Computing Foundation",
        issueDate: "2023-09-10",
        expiryDate: "2026-09-10", // Future date - Valid
        facultyImage: "https://randomuser.me/api/portraits/women/22.jpg"
      },
      {
        id: 8,
        facultyName: "Prof. David Lee",
        facultyId: 2,
        certificationName: "CompTIA Security+",
        issuingOrganization: "CompTIA",
        issueDate: "2022-03-25",
        expiryDate: "2025-03-25", // Future date - Valid
        facultyImage: "https://randomuser.me/api/portraits/men/32.jpg"
      }
    ];

    // Function to determine certification status based on expiry date
    const getCertificationStatus = (expiryDate: string): 'valid' | 'expiring' | 'expired' => {
      const today = new Date();
      const expiry = new Date(expiryDate);
      const ninetyDaysFromNow = new Date();
      ninetyDaysFromNow.setDate(today.getDate() + 90);

      if (expiry < today) {
        return 'expired';
      } else if (expiry <= ninetyDaysFromNow) {
        return 'expiring';
      } else {
        return 'valid';
      }
    };

    // Function to get badge styles based on certification status
    const getStatusBadgeClasses = (status: 'valid' | 'expiring' | 'expired'): string => {
      switch (status) {
        case 'valid':
          return 'bg-[#2D6A4F] text-[#95D5B2]';
        case 'expiring':
          return 'bg-[#5A4303] text-[#F3A95A]';
        case 'expired':
          return 'bg-[#8B0000] text-[#FFB3B3]';
        default:
          return 'bg-[#2D6A4F] text-[#95D5B2]';
      }
    };

    // Filter certifications based on search and status filter
    const filteredCertifications = facultyCertifications.filter(cert => {
      const status = getCertificationStatus(cert.expiryDate);

      const matchesFilter =
        certificationsFilter === 'all' ||
        status === certificationsFilter;

      const matchesSearch =
        cert.facultyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.certificationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.issuingOrganization.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });

    return (
      <>
        <motion.header
          className="flex items-center justify-between px-6 py-4 border-b border-[#1B4332]"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-[#95D5B2] text-xl font-medium">Faculty Certifications</h1>
          <div className="flex gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search certifications..."
                className="bg-[#1B4332] text-white pl-9 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#95D5B2] w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#95D5B2]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <select
              className="bg-[#1B4332] text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
              value={certificationsFilter}
              onChange={(e) => setCertificationsFilter(e.target.value as 'all' | 'valid' | 'expiring' | 'expired')}
            >
              <option value="all">All Certifications</option>
              <option value="valid">Valid</option>
              <option value="expiring">Expiring Soon</option>
              <option value="expired">Expired</option>
            </select>
            <motion.button
              className="inline-flex items-center gap-2 bg-[#95D5B2] text-[#081C15] px-4 py-2 rounded-md text-sm font-medium"
              whileHover={{
                y: -2,
                boxShadow: "0 10px 15px -3px rgba(149, 213, 178, 0.2)",
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <FileText size={16} />
              Export Report
            </motion.button>
          </div>
        </motion.header>

        {/* Main content area */}
        <motion.div
          className="p-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <div className="bg-[#1B4332] rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2D6A4F]">
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#95D5B2] uppercase tracking-wider">
                      Faculty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#95D5B2] uppercase tracking-wider">
                      Certification
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#95D5B2] uppercase tracking-wider">
                      Issuing Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#95D5B2] uppercase tracking-wider">
                      Issue Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#95D5B2] uppercase tracking-wider">
                      Expiry Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#95D5B2] uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D6A4F]">
                  {filteredCertifications.map((certification, index) => {
                    const certStatus = getCertificationStatus(certification.expiryDate);
                    const statusBadgeClasses = getStatusBadgeClasses(certStatus);

                    return (
                      <motion.tr
                        key={certification.id}
                        className="text-white"
                        variants={itemVariants}
                        whileHover={{ backgroundColor: "rgba(45, 106, 79, 0.3)" }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                              <img
                                src={certification.facultyImage}
                                alt={certification.facultyName}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium">{certification.facultyName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">{certification.certificationName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {certification.issuingOrganization}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {new Date(certification.issueDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {new Date(certification.expiryDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-xs py-0.5 px-2 rounded-full ${statusBadgeClasses}`}>
                            {certStatus === 'valid' ? 'Valid' :
                              certStatus === 'expiring' ? 'Expiring Soon' :
                                'Expired'}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}

                  {filteredCertifications.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-[#95D5B2]">
                        <div className="flex flex-col items-center">
                          <Award
                            size={48}
                            className="mb-3 text-[#2D6A4F]"
                          />
                          <p className="text-lg">No certifications found</p>
                          <p className="text-sm mt-1">Try adjusting your search or filter</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
            <motion.div
              className="bg-[#1B4332] rounded-lg p-5 shadow-sm"
              variants={itemVariants}
              whileHover={{
                boxShadow: "0 4px 20px rgba(149, 213, 178, 0.15)",
                y: -3
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#95D5B2] text-sm font-medium">Valid Certifications</p>
                  <h3 className="text-white text-2xl font-bold mt-2">
                    {facultyCertifications.filter(cert => getCertificationStatus(cert.expiryDate) === 'valid').length}
                  </h3>
                </div>
                <div className="bg-[#2D6A4F] p-3 rounded-full">
                  <Award size={20} className="text-[#95D5B2]" />
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-[#1B4332] rounded-lg p-5 shadow-sm"
              variants={itemVariants}
              whileHover={{
                boxShadow: "0 4px 20px rgba(149, 213, 178, 0.15)",
                y: -3
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#95D5B2] text-sm font-medium">Expiring Soon</p>
                  <h3 className="text-white text-2xl font-bold mt-2">
                    {facultyCertifications.filter(cert => getCertificationStatus(cert.expiryDate) === 'expiring').length}
                  </h3>
                </div>
                <div className="bg-[#2D6A4F] p-3 rounded-full">
                  <AlertTriangle size={20} className="text-[#F3A95A]" />
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-[#1B4332] rounded-lg p-5 shadow-sm"
              variants={itemVariants}
              whileHover={{
                boxShadow: "0 4px 20px rgba(149, 213, 178, 0.15)",
                y: -3
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#95D5B2] text-sm font-medium">Expired Certifications</p>
                  <h3 className="text-white text-2xl font-bold mt-2">
                    {facultyCertifications.filter(cert => getCertificationStatus(cert.expiryDate) === 'expired').length}
                  </h3>
                </div>
                <div className="bg-[#2D6A4F] p-3 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[#FFB3B3]"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4" />
                    <path d="M12 16h.01" />
                  </svg>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </>
    );
  };

  const manage_faculty = () => {

    // Sample faculty data - would come from API in real app
    const facultyData: FacultyMember[] = [
      {
        id: 1,
        name: "Dr. Sarah Johnson",
        email: "s.johnson@university.edu",
        department: "Computer Science",
        role: "Associate Professor",
        joinDate: "2019-08-15",
        sectionsCompleted: 4, // education, experience, certifications, documents
        totalSections: 5,
        profileImage: "https://randomuser.me/api/portraits/women/22.jpg"
      },
      {
        id: 2,
        name: "Prof. David Lee",
        email: "d.lee@university.edu",
        department: "Engineering",
        role: "Assistant Professor",
        joinDate: "2020-01-10",
        sectionsCompleted: 5,
        totalSections: 5,
        profileImage: "https://randomuser.me/api/portraits/men/32.jpg"
      },
      {
        id: 3,
        name: "Dr. Maria Garcia",
        email: "m.garcia@university.edu",
        department: "Data Science",
        role: "Full Professor",
        joinDate: "2015-09-01",
        sectionsCompleted: 3,
        totalSections: 5,
        profileImage: "https://randomuser.me/api/portraits/women/56.jpg"
      },
      {
        id: 4,
        name: "Dr. Robert Chen",
        email: "r.chen@university.edu",
        department: "Information Systems",
        role: "Assistant Professor",
        joinDate: "2021-08-20",
        sectionsCompleted: 2,
        totalSections: 5,
        profileImage: "https://randomuser.me/api/portraits/men/41.jpg"
      },
      {
        id: 5,
        name: "Prof. Amelia Williams",
        email: "a.williams@university.edu",
        department: "Computer Science",
        role: "Associate Professor",
        joinDate: "2018-01-15",
        sectionsCompleted: 5,
        totalSections: 5,
        profileImage: "https://randomuser.me/api/portraits/women/45.jpg"
      },
      {
        id: 6,
        name: "Dr. James Wilson",
        email: "j.wilson@university.edu",
        department: "Artificial Intelligence",
        role: "Assistant Professor",
        joinDate: "2022-01-15",
        sectionsCompleted: 1,
        totalSections: 5,
        profileImage: "https://randomuser.me/api/portraits/men/55.jpg"
      },
    ];

    // Filter and search faculty data
    const filteredFaculty = facultyData.filter(faculty => {
      const matchesFilter =
        filterType === 'all' ||
        (filterType === 'complete' && faculty.sectionsCompleted === faculty.totalSections) ||
        (filterType === 'incomplete' && faculty.sectionsCompleted < faculty.totalSections);

      const matchesSearch =
        faculty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faculty.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faculty.department.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });

    const handleViewProfile = (faculty: FacultyMember) => {
      setSelectedFaculty(faculty);
      setIsProfileViewOpen(true);
    };

    const closeProfileView = () => {
      setIsProfileViewOpen(false);
      setSelectedFaculty(null);
    };

    const openAddFacultyModal = () => {
      setIsAddFacultyModalOpen(true);
      setSubmitResult(null);
    };

    const closeAddFacultyModal = () => {
      setIsAddFacultyModalOpen(false);
      setNewFacultyData({
        name: '',
        email: '',
        department: '',
        role: 'Faculty'
      });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setNewFacultyData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleAddFaculty = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      setSubmitResult(null);


      try {
        // Here you would make an API call to save to MongoDB
        // For demonstration purposes, we're simulating a network request
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log("Faculty data to save:", newFacultyData);

        // Success simulation
        setSubmitResult({
          success: true,
          message: `Faculty ${newFacultyData.name} has been added successfully. They will need to sign in with Google.`
        });

        // In a real app, after success you might:
        // 1. Reset the form
        // 2. Refresh the faculty list
        // 3. Close the modal after a delay
        setTimeout(() => {
          closeAddFacultyModal();
        }, 2000);

      } catch (error) {
        console.error("Error adding faculty:", error);
        setSubmitResult({
          success: false,
          message: "Failed to add faculty member. Please try again."
        });
      } finally {
        setIsSubmitting(false);
      }
    };


    return (
      <>
        <motion.header
          className="flex items-center justify-between px-6 py-4 border-b border-[#1B4332]"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-[#95D5B2] text-xl font-medium">Manage Faculty</h1>
          <div className="flex gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search faculty..."
                className="bg-[#1B4332] text-white pl-9 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#95D5B2] w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#95D5B2]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              ><path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <select
              className="bg-[#1B4332] text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'complete' | 'incomplete')}
            >
              <option value="all">All Profiles</option>
              <option value="complete">Complete Profiles</option>
              <option value="incomplete">Incomplete Profiles</option>
            </select>
            <motion.button
              className="inline-flex items-center gap-2 bg-[#95D5B2] text-[#081C15] px-4 py-2 rounded-md text-sm font-medium"
              whileHover={{
                y: -2,
                boxShadow: "0 10px 15px -3px rgba(149, 213, 178, 0.2)",
              }}
              transition={{ type: "spring", stiffness: 300 }}
              onClick={openAddFacultyModal}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <line x1="19" y1="8" x2="19" y2="14"></line>
                <line x1="16" y1="11" x2="22" y2="11"></line>
              </svg>
              Add Faculty
            </motion.button>
          </div>
        </motion.header>
        {/* Main content area */}
        <motion.div
          className="p-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <div className="bg-[#1B4332] rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2D6A4F]">
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#95D5B2] uppercase tracking-wider">
                      Faculty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#95D5B2] uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#95D5B2] uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#95D5B2] uppercase tracking-wider">
                      Profile Completion
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[#95D5B2] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D6A4F]">
                  {filteredFaculty.map((faculty, index) => (
                    <motion.tr
                      key={faculty.id}
                      className="text-white"
                      variants={itemVariants}
                      whileHover={{ backgroundColor: "rgba(45, 106, 79, 0.3)" }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                            <img
                              src={faculty.profileImage}
                              alt={faculty.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium">{faculty.name}</div>
                            <div className="text-sm text-[#95D5B2]">{faculty.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {faculty.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {faculty.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-full bg-[#081C15] rounded-full h-1.5 mr-2 max-w-[120px]">
                            <div
                              className={`h-1.5 rounded-full ${faculty.sectionsCompleted === faculty.totalSections
                                ? "bg-[#95D5B2]"
                                : faculty.sectionsCompleted / faculty.totalSections > 0.6
                                  ? "bg-[#95D5B2]"
                                  : "bg-[#F3A95A]"
                                }`}
                              style={{
                                width: `${(faculty.sectionsCompleted / faculty.totalSections) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm">
                            {Math.round((faculty.sectionsCompleted / faculty.totalSections) * 100)}%
                          </span>
                          {faculty.sectionsCompleted === faculty.totalSections ? (
                            <span className="ml-2 bg-[#2D6A4F] text-[#95D5B2] text-xs py-0.5 px-2 rounded-full">
                              Complete
                            </span>
                          ) : (
                            <span className="ml-2 bg-[#5A4303] text-[#F3A95A] text-xs py-0.5 px-2 rounded-full">
                              Incomplete
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <motion.button
                          className="bg-[#2D6A4F] hover:bg-[#3B8F6F] text-white py-1 px-3 rounded-md text-xs"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleViewProfile(faculty)}
                        >
                          View Profile
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}

                  {filteredFaculty.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-[#95D5B2]">
                        <div className="flex flex-col items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 mb-3 text-[#2D6A4F]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <p className="text-lg">No faculty members found</p>
                          <p className="text-sm mt-1">Try adjusting your search or filter</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {isAddFacultyModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              className="bg-[#1B4332] rounded-lg p-6 w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h2 className="text-white text-xl font-medium mb-4">Add New Faculty</h2>

              {submitResult && (
                <div className={`mb-4 p-3 rounded-md ${submitResult.success ? 'bg-[#2D6A4F] text-[#95D5B2]' : 'bg-[#8B0000] text-[#FFB3B3]'}`}>
                  {submitResult.message}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleAddFaculty}>
                <div>
                  <label className="block text-[#95D5B2] text-sm mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newFacultyData.name}
                    onChange={handleInputChange}
                    className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#95D5B2] text-sm mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={newFacultyData.email}
                    onChange={handleInputChange}
                    className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                    required
                  />
                  <p className="text-xs text-[#95D5B2] mt-1">
                    Must be the email they'll use to sign in with Google
                  </p>
                </div>

                <div>
                  <label className="block text-[#95D5B2] text-sm mb-1">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={newFacultyData.department}
                    onChange={handleInputChange}
                    className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                  />
                </div>
                <div>
                  <label className="block text-[#95D5B2] text-sm mb-1">Role</label>
                  <select
                    name="role"
                    value={newFacultyData.role}
                    onChange={handleInputChange}
                    className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                  >
                    <option value="faculty">Faculty</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end space-x-3">
                  <motion.button
                    type="button"
                    className="bg-[#081C15] text-white px-4 py-2 rounded-md"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={closeAddFacultyModal}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="bg-[#95D5B2] text-[#081C15] px-4 py-2 rounded-md font-medium flex items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#081C15] mr-2"></div>
                        <span>Adding...</span>
                      </>
                    ) : (
                      <span>Add Faculty</span>
                    )}
                  </motion.button>
                </div>

                <div className="pt-2 border-t border-[#2D6A4F] mt-4">
                  <p className="text-xs text-[#95D5B2] text-center">
                    New faculty will need to sign in with Google using the provided email.
                    <br />
                    Their profile will be created automatically on first login.
                  </p>
                </div>
              </form>
            </motion.div>
          </div>
        )}


        {/* Faculty Profile View Modal */}
        {isProfileViewOpen && selectedFaculty && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              className="bg-[#1B4332] rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* Header with close button */}
              <div className="p-6 border-b border-[#2D6A4F] sticky top-0 bg-[#1B4332] z-10 flex justify-between items-center">
                <h2 className="text-white text-xl font-medium flex items-center">
                  <span className="mr-2">Faculty Profile</span>
                  {selectedFaculty.sectionsCompleted === selectedFaculty.totalSections ? (
                    <span className="bg-[#2D6A4F] text-[#95D5B2] text-xs py-0.5 px-2 rounded-full">
                      Complete
                    </span>
                  ) : (
                    <span className="bg-[#5A4303] text-[#F3A95A] text-xs py-0.5 px-2 rounded-full">
                      Incomplete
                    </span>
                  )}
                </h2>
                <button
                  onClick={closeProfileView}
                  className="text-[#95D5B2] hover:text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Profile content */}
              <div className="p-6">
                {/* Faculty info */}
                <div className="flex flex-col md:flex-row items-center md:items-start mb-8">
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-4 md:mb-0 md:mr-6">
                    <img
                      src={selectedFaculty.profileImage}
                      alt={selectedFaculty.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-white text-xl font-medium">{selectedFaculty.name}</h3>
                    <p className="text-[#95D5B2] mt-1">{selectedFaculty.role}</p>
                    <div className="flex flex-wrap mt-3 gap-y-2">
                      <div className="w-full md:w-1/2 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-[#95D5B2] mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-white text-sm">{selectedFaculty.email}</span>
                      </div>
                      <div className="w-full md:w-1/2 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-[#95D5B2] mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                          />
                        </svg>
                        <span className="text-white text-sm">{selectedFaculty.department}</span>
                      </div>
                      <div className="w-full md:w-1/2 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-[#95D5B2] mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-white text-sm">
                          Joined {new Date(selectedFaculty.joinDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile completion */}
                <div className="bg-[#2D6A4F] rounded-lg p-4 mb-8">
                  <h4 className="text-white text-sm font-medium mb-3">Profile Completion</h4>
                  <div className="w-full bg-[#081C15] rounded-full h-2 mb-4">
                    <div
                      className="h-2 rounded-full bg-[#95D5B2]"
                      style={{
                        width: `${(selectedFaculty.sectionsCompleted / selectedFaculty.totalSections) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-[#95D5B2]">
                    <span>{selectedFaculty.sectionsCompleted} of {selectedFaculty.totalSections} sections complete</span>
                    <span>
                      {Math.round((selectedFaculty.sectionsCompleted / selectedFaculty.totalSections) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Mock sections - these would be populated from actual data in a real implementation */}
                <div className="space-y-6">
                  {/* Education Section */}
                  <div className="border-b border-[#2D6A4F] pb-6">
                    <h4 className="text-white font-medium mb-4 flex items-center">
                      <BookOpen size={16} className="mr-2 text-[#95D5B2]" />
                      Education
                      {Math.random() > 0.3 ? (
                        <span className="ml-2 bg-[#2D6A4F] text-[#95D5B2] text-xs py-0.5 px-2 rounded-full">
                          Complete
                        </span>
                      ) : (
                        <span className="ml-2 bg-[#5A4303] text-[#F3A95A] text-xs py-0.5 px-2 rounded-full">
                          Incomplete
                        </span>
                      )}
                    </h4>
                    <div className="space-y-3">
                      <div className="bg-[#081C15] bg-opacity-40 p-3 rounded">
                        <div className="text-white text-sm font-medium">Ph.D. in Computer Science</div>
                        <div className="text-[#95D5B2] text-xs mt-1">Stanford University, 2015-2019</div>
                      </div>
                      <div className="bg-[#081C15] bg-opacity-40 p-3 rounded">
                        <div className="text-white text-sm font-medium">Master of Science in AI</div>
                        <div className="text-[#95D5B2] text-xs mt-1">MIT, 2013-2015</div>
                      </div>
                    </div>
                  </div>

                  {/* Certifications Section */}
                  <div className="border-b border-[#2D6A4F] pb-6">
                    <h4 className="text-white font-medium mb-4 flex items-center">
                      <Award size={16} className="mr-2 text-[#95D5B2]" />
                      Certifications
                      {Math.random() > 0.3 ? (
                        <span className="ml-2 bg-[#2D6A4F] text-[#95D5B2] text-xs py-0.5 px-2 rounded-full">
                          Complete
                        </span>
                      ) : (
                        <span className="ml-2 bg-[#5A4303] text-[#F3A95A] text-xs py-0.5 px-2 rounded-full">
                          Incomplete
                        </span>
                      )}
                    </h4>
                    <div className="space-y-3">
                      <div className="bg-[#081C15] bg-opacity-40 p-3 rounded">
                        <div className="text-white text-sm font-medium">AWS Certified Solutions Architect</div>
                        <div className="text-[#95D5B2] text-xs mt-1">Amazon Web Services, Expires Jun 2025</div>
                      </div>
                      <div className="bg-[#081C15] bg-opacity-40 p-3 rounded">
                        <div className="text-white text-sm font-medium">CISSP</div>
                        <div className="text-[#95D5B2] text-xs mt-1">ISC², Expires Nov 2023</div>
                      </div>
                    </div>
                  </div>

                  {/* Documents Section */}
                  <div>
                    <h4 className="text-white font-medium mb-4 flex items-center">
                      <FileText size={16} className="mr-2 text-[#95D5B2]" />
                      Documents
                      {Math.random() > 0.3 ? (
                        <span className="ml-2 bg-[#2D6A4F] text-[#95D5B2] text-xs py-0.5 px-2 rounded-full">
                          Complete
                        </span>
                      ) : (
                        <span className="ml-2 bg-[#5A4303] text-[#F3A95A] text-xs py-0.5 px-2 rounded-full">
                          Incomplete
                        </span>
                      )}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-[#081C15] bg-opacity-40 p-3 rounded flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-[#FF5252] mr-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
                          />
                        </svg>
                        <div>
                          <div className="text-white text-sm">Research Publication</div>
                          <div className="text-[#95D5B2] text-xs">research-neural-networks.pdf</div>
                        </div>
                      </div>
                      <div className="bg-[#081C15] bg-opacity-40 p-3 rounded flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-[#4285F4] mr-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
                          />
                        </svg>
                        <div>
                          <div className="text-white text-sm">Course Syllabus</div>
                          <div className="text-[#95D5B2] text-xs">ai-course-outline.docx</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer with close button */}
              <div className="p-6 border-t border-[#2D6A4F] sticky bottom-0 bg-[#1B4332] flex justify-end">
                <motion.button
                  className="bg-[#2D6A4F] hover:bg-[#3B8F6F] text-white py-2 px-4 rounded-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={closeProfileView}
                >
                  Close
                </motion.button>
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
      case "documents":
        return documentsSection();
      // Admin-specific sections
      case "dashboard_admin":
        return dashboard_admin();
      case "manage_faculty":
        return manage_faculty();
      case "admin_certifications":
        return admin_certifications();
      case "pending_approvals":
        return pending_approvals();
      case "reports":
        return reports();

      default:
        return session?.user?.role === 'admin' ? dashboard_admin() : mydashboard();
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
            {session?.user?.role === 'admin'
              ? 'Admin Profile'
              : session?.user?.role === 'faculty'
                ? 'Faculty Profile'
                : 'User Profile'}
          </h1>
        </motion.div>
        <nav className="flex-1">
          <motion.ul
            className="space-y-1 px-3"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {(session?.user?.role === 'admin' ? buttons_admin : buttons).map((button, index) => (
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
