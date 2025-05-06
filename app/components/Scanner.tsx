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
    <div className={`p-4 bg-white rounded-lg shadow-sm ${className}`}>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Upload Certificate Image</label>
        <input 
          type="file" 
          onChange={handleFileChange} 
          className="w-full border border-gray-300 rounded p-2"
          accept="image/*"
          disabled={isProcessing}
        />
      </div>
      
      {isProcessing && (
        <div className="flex items-center justify-center py-4">
          <div className="text-blue-500">Processing...</div>
        </div>
      )}
      
      {showPreview && imagePreview && (
        <div className="mb-4">
          <div className="border border-gray-300 rounded-lg overflow-hidden">
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

