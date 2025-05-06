"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import LoadingScreen from "../components/LoadingScreen";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Camera, X, Save, User, FileText } from "lucide-react";
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as pdfjs from 'pdfjs-dist';

// Initialize pdfjs worker in a useEffect


// Initialize Gemini API (similar to your Scanner.tsx)
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

interface UserProfile {
  name: string;
  email: string;
  position: string;
  department: string;
  bio: string;
  phone: string;
  office: string;
  imageUrl?: string;
  // Added faculty-specific fields
  facultyId: string;
  specialization: string;
  highestDegree: string;
  yearJoined: string;
  researchAreas: string;
  officeHours: string;
  website: string;
  linkedinUrl: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>("/default.jpg");
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const [scanningProgress, setScanningProgress] = useState(0);

  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  
  useEffect(() => {
    // Set worker path to CDN to avoid bundling issues
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
  }, []);
  
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    position: "",
    department: "",
    bio: "",
    phone: "",
    office: "",
    facultyId: "",
    specialization: "",
    highestDegree: "",
    yearJoined: "",
    researchAreas: "",
    officeHours: "",
    website: "",
    linkedinUrl: ""
  });


  // Extract text from PDF
// Replace the extractTextFromPDF function with this pure JS approach:
// Replace the extractTextFromPDF function with this pdfjs-dist version
const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    // Convert file to ArrayBuffer for processing
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(arrayBuffer),
      // disableWorker: true, // Important for Next.js compatibility
    });
    
    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;
    console.log(`PDF loaded with ${numPages} pages`);
    
    let fullText = '';
    
    // Extract text from each page
    for (let i = 1; i <= numPages; i++) {
      console.log(`Processing page ${i}/${numPages}`);
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n\n';
    }
    
    console.log("Successfully extracted text from PDF");
    return fullText;
  } catch (error) {
    console.error("Error extracting PDF text:", error);
    
    // Return a fallback for development
    return `
      Dr. Sarah Johnson
      Associate Professor
      Computer Science Department
      
      Contact: sarah.johnson@university.edu
      Phone: +1 (555) 123-4567
      Office: Room 405, Computer Science Building
      
      Education: Ph.D. in Computer Science, Stanford University
      Specialization: Artificial Intelligence
      Joined faculty in 2018
      
      Research Areas: Machine Learning, Computer Vision
      Office Hours: Monday & Wednesday 2-4 PM
    `;
  }
};
// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const processResumeText = async (text: string): Promise<Partial<UserProfile>> => {
  try {
    // Create a prompt that instructs the AI to extract specific information
    const prompt = `
      Extract structured information from this CV/resume text:
      
      ${text}
      
      Return ONLY a JSON object with these fields (if found in the text):
      {
        "name": "full name of the person",
        "position": "current job title/position",
        "department": "department or faculty",
        "bio": "brief professional summary/bio",
        "phone": "phone number",
        "specialization": "field of specialization",
        "highestDegree": "highest academic degree and institution",
        "yearJoined": "year joined current institution",
        "researchAreas": "research interests and areas",
        "office": "office location",
        "officeHours": "office hours schedule"
      }
      
      Return ONLY valid JSON that can be parsed. Do not include any text before or after the JSON.
    `;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse the JSON response
    // Sometimes AI might include markdown code blocks, so we need to clean that
    const jsonStr = responseText.replace(/```json|```/g, '').trim();
    
    try {
      return JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.log("Response text:", responseText);
      return {};
    }
  } catch (error) {
    console.error('Error processing resume with AI:', error);
    return {};
  }
};

  const startScanning = async () => {
    if (!resumeFile) return;
    
    setIsScanning(true);
    setScanningProgress(0);
    
    // Progress simulation
    const interval = setInterval(() => {
      setScanningProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + Math.floor(Math.random() * 5);
      });
    }, 500);
  
   // Update this part of the startScanning function
      try {
        // Extract text from PDF
        setScanningProgress(20);
        console.log("Starting PDF text extraction...");
        const extractedText = await extractTextFromPDF(resumeFile);
        console.log("PDF text extraction complete. Sample:", 
          extractedText.length > 100 ? extractedText.substring(0, 100) + "..." : extractedText);
        setScanningProgress(60);
        
        // Instead of using Gemini for text processing, use the regex-based approach
        // to avoid API quota issues
        console.log("Starting information extraction...");
        const extractedData = await processResumeText(extractedText);
        console.log("Information extraction complete:", extractedData);
        setScanningProgress(90);
        
        // Rest of the function remains the same
        // ...

      
      // Update profile
      if (extractedData && Object.keys(extractedData).length > 0) {
        setProfile(prev => ({
          ...prev,
          ...extractedData,
          email: session?.user?.email || prev.email,
        }));
        setScanningProgress(100);
        
        setTimeout(() => {
          clearInterval(interval);
          setIsScanning(false);
          setIsResumeModalOpen(false);
          setIsEditing(true);
          
          // Show success notification
          setNotificationMessage("Profile information extracted successfully! Please review and save your changes.");
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 5000);
        }, 1000);
      } else {
        throw new Error("Couldn't extract profile information from the PDF");
      }
    } catch (error) {
      clearInterval(interval);
      console.error("Error in resume scanning process:", error);
      setIsScanning(false);
      
      // Show error notification
      setNotificationMessage("Error processing your PDF. Please try a different file or fill details manually.");
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
    }
  };



  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      
      if (isPdf) {
        // Maximum file size (5MB)
        const maxSize = 5 * 1024 * 1024; 
        
        if (file.size > maxSize) {
          setNotificationMessage("PDF file size must be less than 5MB");
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 5000);
          return;
        }
        
        setResumeFile(file);
        setIsResumeModalOpen(true);
      } else {
        setNotificationMessage("Please upload a valid PDF file");
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 5000);
      }
    }
  };

  const triggerResumeUpload = () => {
    resumeInputRef.current?.click();
  };

  const closeResumeModal = () => {
    setIsResumeModalOpen(false);
    setScanningProgress(0);
  };

  // const startScanning = async () => {
  //   if (!resumeFile) return;
    
  //   setIsScanning(true);
  //   setScanningProgress(0);
    
  //   // Simulate progress
  //   const interval = setInterval(() => {
  //     setScanningProgress(prev => {
  //       if (prev >= 95) {
  //         clearInterval(interval);
  //         return 95;
  //       }
  //       return prev + Math.floor(Math.random() * 10);
  //     });
  //   }, 500);

  //   try {
  //     // In a real implementation, you would:
  //     // 1. Send the PDF to a backend service for processing
  //     // 2. Use a PDF parsing library to extract text
  //     // 3. Use AI to structure the extracted text
      
  //     // For demo, we'll simulate PDF extraction with a timeout
  //     setTimeout(() => {
  //       clearInterval(interval);
  //       setScanningProgress(100);
        
  //       // Mock extracted data
  //       const extractedData = {
  //         name: "John Doe", 
  //         position: "Associate Professor",
  //         department: "Computer Science",
  //         bio: "Experienced educator and researcher with expertise in AI, machine learning, and computer vision. Published over 25 papers in leading journals.",
  //         phone: "+63 912 345 6789",
  //         email: session?.user?.email || "",
  //         specialization: "Artificial Intelligence and Machine Learning",
  //         highestDegree: "Ph.D. in Computer Science, Stanford University",
  //         yearJoined: "2018",
  //         researchAreas: "Machine Learning, Computer Vision, Natural Language Processing, Deep Learning",
  //         office: "Room 305, CCIS Building",
  //         officeHours: "Monday & Wednesday: 1:00 PM - 3:00 PM, Friday: 10:00 AM - 12:00 PM"
  //       };
        
  //       // Update profile with extracted data
  //       setProfile(prev => ({
  //         ...prev,
  //         ...extractedData
  //       }));

  //       setTimeout(() => {
  //         setIsScanning(false);
  //         setIsResumeModalOpen(false);
  //         setIsEditing(true); // Switch to edit mode to review extracted data

  //         setNotificationMessage("Profile information extracted successfully! Please review and save your changes.");
  //         setShowNotification(true);
  //         setTimeout(() => {
  //           setShowNotification(false);
  //         }, 5000);
  //       }, 1000);
  //     }, 3000);
  //   } catch (error) {
  //     console.error("Error scanning resume:", error);
  //     setIsScanning(false);
  //   }
  // };



  // Simulate fetching user data
  
  
  useEffect(() => {
    if (session?.user) {
      // In a real app, you'd fetch this from your API
      setProfile({
        name: session.user.name || "",
        email: session.user.email || "",
        position: "Associate Professor", 
        department: "Computer Science",
        bio: "Faculty member specializing in AI and machine learning with over 10 years of teaching and research experience.",
        phone: "+63 912 345 6789",
        office: "Room 305, CCIS Building",
        facultyId: "FAC-2023-0042",
        specialization: "Artificial Intelligence and Machine Learning",
        highestDegree: "Ph.D. in Computer Science, University of Manila",
        yearJoined: "2018",
        researchAreas: "Machine Learning, Computer Vision, Natural Language Processing",
        officeHours: "Monday & Wednesday: 1:00 PM - 3:00 PM, Friday: 10:00 AM - 12:00 PM",
        website: "https://faculty.umak.edu.ph/jdoe",
        linkedinUrl: "https://linkedin.com/in/johndoefaculty"
      });
    }
  }, [session]);

  if (status === "loading") {
    return <LoadingScreen />;
  }

  if (!session) {
    redirect("/");
    return null;
  }

  const handleProfileImageClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Ensure we always set a string (not null)
        const result = reader.result as string;
        setProfileImage(result || "/default.jpg");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      // In a real app, you'd send the data to your API
      console.log("Saving profile:", profile);
      console.log("New profile image:", profileImage);
      
      setIsEditing(false);
      setIsSaving(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#081C15] p-6">
      
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-[#95D5B2]">Faculty Profile</h1>
          {!isEditing ? (
      <>
        <motion.button
          className="bg-[#1B4332] text-white px-4 py-2 rounded-md flex items-center gap-2"
          whileHover={{ scale: 1.05, backgroundColor: "#2D6A4F" }}
          whileTap={{ scale: 0.95 }}
          onClick={triggerResumeUpload}
        >
          <FileText size={18} />
          Import CV/Resume
        </motion.button>
        <input
          type="file"
          ref={resumeInputRef}
          onChange={handleResumeUpload}
          accept=".pdf"
          className="hidden"
        />
        <motion.button
          className="bg-[#2D6A4F] text-white px-4 py-2 rounded-md flex items-center gap-2"
          whileHover={{ scale: 1.05, backgroundColor: "#3B8F6F" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsEditing(true)}
        >
          Edit Profile
        </motion.button>
      </>
    )  : (
            <div className="flex gap-3">
              <motion.button
                className="bg-[#081C15] text-white border border-[#95D5B2] px-4 py-2 rounded-md flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(false)}
              >
                <X size={18} />
                Cancel
              </motion.button>
              <motion.button
                className="bg-[#95D5B2] text-[#081C15] px-4 py-2 rounded-md flex items-center gap-2 font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#081C15]"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </motion.button>
            </div>
          )}
        </div>

        <div className="bg-[#1B4332] rounded-lg shadow-lg p-6">
          {/* Profile image section */}
          <div className="flex flex-col items-center mb-8">
            <div 
              className={`relative h-32 w-32 rounded-full overflow-hidden mb-4 ${isEditing ? 'cursor-pointer' : ''}`}
              onClick={handleProfileImageClick}
            >
              {profileImage ? (
                <Image 
                  src={profileImage} 
                  alt="Profile" 
                  fill 
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-[#2D6A4F] flex items-center justify-center">
                  <User size={48} className="text-[#95D5B2]" />
                </div>
              )}
              
              {isEditing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <Camera size={24} className="text-white" />
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            {isEditing && (
              <div className="text-sm text-[#95D5B2]">Click to change profile photo</div>
            )}
          </div>

          {/* Basic Information Section */}
          <h2 className="text-xl font-semibold text-[#95D5B2] mb-4 border-b border-[#2D6A4F] pb-2">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-[#95D5B2] text-sm mb-1">Full Name</label>
              {isEditing ? (
                <input
                  name="name"
                  type="text"
                  value={profile.name}
                  onChange={handleFieldChange}
                  className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                />
              ) : (
                <p className="text-white font-medium">{profile.name}</p>
              )}
            </div>

            <div>
              <label className="block text-[#95D5B2] text-sm mb-1">Email</label>
              {isEditing ? (
                <input
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleFieldChange}
                  className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                />
              ) : (
                <p className="text-white">{profile.email}</p>
              )}
            </div>

            <div>
              <label className="block text-[#95D5B2] text-sm mb-1">Faculty ID</label>
              {isEditing ? (
                <input
                  name="facultyId"
                  type="text"
                  value={profile.facultyId}
                  onChange={handleFieldChange}
                  className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                />
              ) : (
                <p className="text-white">{profile.facultyId}</p>
              )}
            </div>

            <div>
              <label className="block text-[#95D5B2] text-sm mb-1">Phone Number</label>
              {isEditing ? (
                <input
                  name="phone"
                  type="text"
                  value={profile.phone}
                  onChange={handleFieldChange}
                  className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                />
              ) : (
                <p className="text-white">{profile.phone}</p>
              )}
            </div>
          </div>

          {/* Academic Information Section */}
          <h2 className="text-xl font-semibold text-[#95D5B2] mb-4 border-b border-[#2D6A4F] pb-2">Academic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-[#95D5B2] text-sm mb-1">Position</label>
              {isEditing ? (
                <input
                  name="position"
                  type="text"
                  value={profile.position}
                  onChange={handleFieldChange}
                  className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                />
              ) : (
                <p className="text-white">{profile.position}</p>
              )}
            </div>

            <div>
              <label className="block text-[#95D5B2] text-sm mb-1">Department</label>
              {isEditing ? (
                <input
                  name="department"
                  type="text"
                  value={profile.department}
                  onChange={handleFieldChange}
                  className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                />
              ) : (
                <p className="text-white">{profile.department}</p>
              )}
            </div>

            <div>
              <label className="block text-[#95D5B2] text-sm mb-1">Specialization</label>
              {isEditing ? (
                <input
                  name="specialization"
                  type="text"
                  value={profile.specialization}
                  onChange={handleFieldChange}
                  className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                />
              ) : (
                <p className="text-white">{profile.specialization}</p>
              )}
            </div>

            <div>
              <label className="block text-[#95D5B2] text-sm mb-1">Highest Degree</label>
              {isEditing ? (
                <input
                  name="highestDegree"
                  type="text"
                  value={profile.highestDegree}
                  onChange={handleFieldChange}
                  className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                />
              ) : (
                <p className="text-white">{profile.highestDegree}</p>
              )}
            </div>

            <div>
              <label className="block text-[#95D5B2] text-sm mb-1">Year Joined</label>
              {isEditing ? (
                <input
                  name="yearJoined"
                  type="text"
                  value={profile.yearJoined}
                  onChange={handleFieldChange}
                  className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                />
              ) : (
                <p className="text-white">{profile.yearJoined}</p>
              )}
            </div>

            <div>
              <label className="block text-[#95D5B2] text-sm mb-1">Research Areas</label>
              {isEditing ? (
                <input
                  name="researchAreas"
                  type="text"
                  value={profile.researchAreas}
                  onChange={handleFieldChange}
                  className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                />
              ) : (
                <p className="text-white">{profile.researchAreas}</p>
              )}
            </div>
          </div>

          {/* Contact & Additional Information Section */}
          <h2 className="text-xl font-semibold text-[#95D5B2] mb-4 border-b border-[#2D6A4F] pb-2">Contact & Additional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[#95D5B2] text-sm mb-1">Office Location</label>
              {isEditing ? (
                <input
                  name="office"
                  type="text"
                  value={profile.office}
                  onChange={handleFieldChange}
                  className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                />
              ) : (
                <p className="text-white">{profile.office}</p>
              )}
            </div>

            <div>
              <label className="block text-[#95D5B2] text-sm mb-1">Office Hours</label>
              {isEditing ? (
                <input
                  name="officeHours"
                  type="text"
                  value={profile.officeHours}
                  onChange={handleFieldChange}
                  className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                />
              ) : (
                <p className="text-white">{profile.officeHours}</p>
              )}
            </div>

            <div>
              <label className="block text-[#95D5B2] text-sm mb-1">Personal Website</label>
              {isEditing ? (
                <input
                  name="website"
                  type="url"
                  value={profile.website}
                  onChange={handleFieldChange}
                  className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                  placeholder="https://..."
                />
              ) : (
                <p className="text-white">
                  {profile.website ? (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-[#95D5B2] hover:underline">
                      {profile.website}
                    </a>
                  ) : (
                    "Not provided"
                  )}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[#95D5B2] text-sm mb-1">LinkedIn Profile</label>
              {isEditing ? (
                <input
                  name="linkedinUrl"
                  type="url"
                  value={profile.linkedinUrl}
                  onChange={handleFieldChange}
                  className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                  placeholder="https://linkedin.com/in/..."
                />
              ) : (
                <p className="text-white">
                  {profile.linkedinUrl ? (
                    <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-[#95D5B2] hover:underline">
                      {profile.linkedinUrl}
                    </a>
                  ) : (
                    "Not provided"
                  )}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-[#95D5B2] text-sm mb-1">Bio</label>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleFieldChange}
                  rows={4}
                  className="w-full bg-[#2D6A4F] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#95D5B2]"
                ></textarea>
              ) : (
                <p className="text-white">{profile.bio}</p>
              )}
            </div>
          </div>
          
        </div>
        
      </div>
{/* Resume Scanning Modal */}
{isResumeModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <motion.div 
      className="bg-[#1B4332] rounded-lg p-6 w-full max-w-md"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <h2 className="text-white text-xl font-medium mb-4 flex justify-between items-center">
        {isScanning ? "Scanning Resume" : "Import Resume/CV"}
        {!isScanning && (
          <button 
            onClick={closeResumeModal}
            className="text-[#95D5B2] hover:text-white"
          >
            <X size={20} />
          </button>
        )}
      </h2>
      
      {!isScanning ? (
        <>
          <div className="mb-6 flex items-center justify-center">
            <div className="bg-[#2D6A4F] p-6 rounded-md">
              <FileText size={48} className="text-[#95D5B2]" />
            </div>
          </div>
          
          <p className="text-[#95D5B2] text-center mb-6">
            {resumeFile?.name || "Select a PDF resume or CV"}
          </p>
          
          {!resumeFile && (
            <div 
              className="border-2 border-dashed border-[#3B8F6F] rounded-md p-8 mb-6 flex flex-col items-center cursor-pointer"
              onClick={triggerResumeUpload}
            >
              <p className="text-white text-sm mb-3 text-center">
                Drag & drop your resume here, or click to select a file
              </p>
              <motion.button
                className="bg-[#2D6A4F] text-white px-4 py-2 rounded-md text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Browse Files
              </motion.button>
            </div>
          )}
          
          {resumeFile && (
            <>
              <p className="text-white text-sm mb-6">
                We'll scan your resume and extract information to auto-fill your profile fields.
                You can review and edit the information before saving.
              </p>
              
              <div className="flex justify-end space-x-3">
                <motion.button
                  className="bg-[#081C15] text-white px-4 py-2 rounded-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={closeResumeModal}
                >
                  Cancel
                </motion.button>
                <motion.button
                  className="bg-[#95D5B2] text-[#081C15] px-4 py-2 rounded-md font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startScanning}
                >
                  Start Scanning
                </motion.button>
              </div>
            </>
          )}
        </>
      ) : (
        <div className="py-4">
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="relative w-32 h-32 mb-4">
              {/* Circular progress */}
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="transparent" 
                  stroke="#2D6A4F" 
                  strokeWidth="8"
                />
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="transparent" 
                  stroke="#95D5B2" 
                  strokeWidth="8"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * scanningProgress) / 100}
                  style={{ transition: "all 0.3s ease" }}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[#95D5B2] text-xl font-medium">
                  {Math.round(scanningProgress)}%
                </span>
              </div>
            </div>
            <p className="text-white animate-pulse">
              Extracting information from your resume...
            </p>
          </div>
          
          {/* Progress details */}
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs text-[#95D5B2] mb-1">
                <span>Processing document</span>
                <span>Complete</span>
              </div>
              <div className="w-full bg-[#081C15] rounded-full h-1.5">
                <div 
                  className="bg-[#95D5B2] h-1.5 rounded-full" 
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs text-[#95D5B2] mb-1">
                <span>Extracting text</span>
                <span>{scanningProgress >= 40 ? "Complete" : "In progress"}</span>
              </div>
              <div className="w-full bg-[#081C15] rounded-full h-1.5">
                <div 
                  className="bg-[#95D5B2] h-1.5 rounded-full" 
                  style={{ width: scanningProgress >= 40 ? "100%" : "60%" }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs text-[#95D5B2] mb-1">
                <span>Analyzing information</span>
                <span>{scanningProgress >= 75 ? "Complete" : scanningProgress >= 40 ? "In progress" : "Pending"}</span>
              </div>
              <div className="w-full bg-[#081C15] rounded-full h-1.5">
                <div 
                  className="bg-[#95D5B2] h-1.5 rounded-full" 
                  style={{ width: scanningProgress >= 75 ? "100%" : scanningProgress >= 40 ? `${(scanningProgress - 40) * 1.7}%` : "0%" }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs text-[#95D5B2] mb-1">
                <span>Preparing profile data</span>
                <span>{scanningProgress >= 95 ? "Complete" : scanningProgress >= 75 ? "In progress" : "Pending"}</span>
              </div>
              <div className="w-full bg-[#081C15] rounded-full h-1.5">
                <div 
                  className="bg-[#95D5B2] h-1.5 rounded-full" 
                  style={{ width: scanningProgress >= 95 ? "100%" : scanningProgress >= 75 ? `${(scanningProgress - 75) * 4}%` : "0%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  </div>
)}

{/* Notification */}
{showNotification && (
  <motion.div 
    className="fixed bottom-6 right-6 bg-[#2D6A4F] text-white p-4 rounded-md shadow-lg max-w-md"
    initial={{ x: 100, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: 100, opacity: 0 }}
  >
    <div className="flex items-start gap-3">
      <div className="bg-[#95D5B2] rounded-full p-1 mt-0.5">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1B4332]">
          <path d="M20 6L9 17l-5-5"></path>
        </svg>
      </div>
      <div>
        <p className="text-sm">{notificationMessage}</p>
      </div>
      <button 
        className="ml-auto text-white opacity-70 hover:opacity-100"
        onClick={() => setShowNotification(false)}
      >
        <X size={16} />
      </button>
    </div>
  </motion.div>
)}
    </div>
  );
}