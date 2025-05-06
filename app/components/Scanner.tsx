'use client'
import { ChangeEvent, useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { motion } from "framer-motion";

interface CertificationScannerProps {
  onResultsChange?: (results: ScanResult) => void;
  onImageChange?: (imageUrl: string | null) => void;
  apiKey?: string;
  showPreview?: boolean;
  initialImage?: string | null;
  className?: string;
}

// Define interface for scan results - expand to include issuing organization
interface ScanResult {
  name: string;
  expirationDate: string;
  issuingOrganization?: string; // Add this field
  credentialId?: string;        // Add this optional field too
  issueDate?: string;           // Add this optional field
}

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

export default function CertificationScanner({ 
  onResultsChange, 
  onImageChange,
  initialImage = null,
  apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY!,
  showPreview = true,
  className = ''
}: CertificationScannerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [ocrResult, setOcrResult] = useState<ScanResult>({ name: '', expirationDate: '' });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(initialImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Create preview URL for the image
      const previewUrl = URL.createObjectURL(selectedFile);
      setImagePreview(previewUrl);
      
      // Call the image change callback if provided
      if (onImageChange) {
        onImageChange(previewUrl);
      }
      
      // Auto-process if a file is selected
      processImage(selectedFile);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearImage = () => {
    setImagePreview(null);
    setFile(null);
    if (onImageChange) {
      onImageChange(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processImage = async (imageFile: File) => {
    if (!imageFile) return;
    setIsProcessing(true);
    
    try {
      // Perform OCR on the image
      const { data: { text } } = await Tesseract.recognize(imageFile, 'eng', {
        logger: (m) => console.log(m),
      });
      
      console.log('OCR Text:', text);
      
      // Enhanced prompt to extract more information
      const prompt = `Extract structured information from this OCR text of a certification document. 
      I need to identify the following information:
      1. Certification name
      2. Issuing organization/authority
      3. Expiration date
      4. Issue date (if available)
      5. Credential ID or certificate number (if available)
      
      Text from certificate image: ${text}
      
      Return only the extracted information in this exact format:
      Certification Name: [full name of certification]
      Issuing Organization: [name of organization]
      Issue Date: [date in MM/DD/YYYY format if found, otherwise leave blank]
      Expiration Date: [date in MM/DD/YYYY format if found, otherwise leave blank]
      Credential ID: [ID number if found, otherwise leave blank]`;
      
      const result = await model.generateContent(prompt);
      const processedText = result.response.text ? result.response.text() : '';
      
      console.log('Processed Text:', processedText);
      
      // Extract all the information from the processed text
      const expirationDate = extractField(processedText, /Expiration Date: ([^\n]+)/i);
      const certName = extractField(processedText, /Certification Name: ([^\n]+)/i);
      const issuingOrg = extractField(processedText, /Issuing Organization: ([^\n]+)/i);
      const credentialId = extractField(processedText, /Credential ID: ([^\n]+)/i);
      const issueDate = extractField(processedText, /Issue Date: ([^\n]+)/i);
      
      const results: ScanResult = { 
        name: certName || 'Unknown Certification', 
        expirationDate: expirationDate || '',
        issuingOrganization: issuingOrg || '',
        credentialId: credentialId || '',
        issueDate: issueDate || ''
      };
      
      setOcrResult(results);
      
      // Call the callback with the results if provided
      if (onResultsChange) {
        onResultsChange(results);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Generic field extractor function
  const extractField = (text: string, regex: RegExp): string => {
    const match = text.match(regex);
    return match && match[1] && match[1].trim() !== '' ? match[1].trim() : '';
  };

  return (
    <div className={`bg-[#2D6A4F] rounded-lg ${className}`}>
      <div className="flex flex-col items-center border-2 border-dashed border-[#3B8F6F] rounded-md p-4 mb-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={isProcessing}
        />
        
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#95D5B2] mb-2"></div>
            <div className="text-[#95D5B2]">Processing certificate...</div>
          </div>
        ) : (
          <>
            {imagePreview ? (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Certificate Preview" 
                  className="max-h-48 mb-2"
                  onError={() => setImagePreview(null)}
                />
                <motion.button
                  type="button"
                  className="absolute top-0 right-0 bg-[#081C15] rounded-full p-1"
                  whileHover={{ scale: 1.1 }}
                  onClick={clearImage}
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
              className="mt-3 flex items-center gap-2 bg-[#1B4332] text-white px-4 py-2 rounded-md text-sm"
              whileHover={{ scale: 1.02, backgroundColor: "#3B8F6F" }}
              whileTap={{ scale: 0.98 }}
              onClick={triggerFileInput}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              {imagePreview ? 'Change Certificate Image' : 'Upload Certificate Image'}
            </motion.button>
            <p className="text-xs text-[#95D5B2] mt-2 text-center">
              Upload an image of your certificate <br/> 
              (We'll use OCR to extract information automatically)
            </p>
          </>
        )}
      </div>
    </div>
  );
}