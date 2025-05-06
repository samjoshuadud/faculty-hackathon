'use client'
import { useState } from 'react';
import Tesseract from 'tesseract.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

export default function CertificationScanner({ 
  onResultsChange, 
  apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY!,
  showPreview = true,
  className = ''
}) {
  const [file, setFile] = useState(null);
  const [ocrResult, setOcrResult] = useState({ name: '', expirationDate: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Create preview URL for the image if preview is enabled
      if (showPreview) {
        const previewUrl = URL.createObjectURL(selectedFile);
        setImagePreview(previewUrl);
      }
      
      // Auto-process if a file is selected
      processImage(selectedFile);
    }
  };

  const processImage = async (imageFile) => {
    if (!imageFile) return;
    setIsProcessing(true);
    
    try {
      // Perform OCR on the image
      const { data: { text } } = await Tesseract.recognize(imageFile, 'eng', {
        logger: (m) => console.log(m),
      });
      
      console.log('OCR Text:', text);
      
      // Use Google's Generative AI to process the text
      const prompt = `Extract structured information from this OCR text of a certification document. 
      I need the certification name and expiration date.
      Text: ${text}
      Return only the certification name and expiration date in this format:
      Certification Name: [name]
      Expiration Date: [date in MM/DD/YYYY format]`;
      
      const result = await model.generateContent(prompt);
      const processedText = result.response.text ? result.response.text() : '';
      
      console.log('Processed Text:', processedText);
      
      // Extract the information from the processed text
      const expirationDate = extractExpirationDate(processedText);
      const certName = extractCertificationName(processedText);
      
      const results = { name: certName, expirationDate };
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

  const extractExpirationDate = (text) => {
    const regex = /Expiration Date: (\d{2}\/\d{2}\/\d{4})/i;
    const match = text.match(regex);
    return match ? match[1] : '';
  };

  const extractCertificationName = (text) => {
    const regex = /Certification Name: ([^\n]+)/i;
    const match = text.match(regex);
    return match ? match[1] : 'Unknown Certification';
  };

  return (
    <div className={`p-4 bg-[#2D6A4F] rounded-lg ${className}`}>
      <div className="mb-4">
        <label className="block text-[#95D5B2] mb-2 text-sm">Upload Certificate Image</label>
        <input 
          type="file" 
          onChange={handleFileChange} 
          className="w-full border border-[#3B8F6F] rounded p-2 bg-[#1B4332] text-white file:mr-4 file:py-2 file:px-4 file:rounded
          file:border-0 file:text-sm file:font-semibold file:bg-[#3B8F6F] file:text-white
          hover:file:bg-[#4CAF50]"
          accept="image/*"
          disabled={isProcessing}
        />
      </div>
      
      {isProcessing && (
        <div className="flex items-center justify-center py-4">
          <div className="text-[#95D5B2]">Processing...</div>
        </div>
      )}
      
      {showPreview && imagePreview && (
        <div className="mb-4">
          <div className="border border-[#3B8F6F] rounded-lg overflow-hidden">
            <img 
              src={imagePreview} 
              alt="Certificate preview" 
              className="w-full h-64 object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

