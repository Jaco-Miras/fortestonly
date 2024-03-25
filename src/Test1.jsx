import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import JSZip from "jszip";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const YourComponent = () => {
  const [pdfData, setPdfData] = useState([]);

  useEffect(() => {
    const fetchAndProcessFiles = async () => {
      try {
        // Fetch the zip file containing the PDFs
        const response = await fetch("uploads/pdf.zip");
        if (!response.ok) {
          throw new Error("Failed to fetch ZIP file");
        }
        const zipData = await response.arrayBuffer();

        // Decompress the zip file
        const zip = await JSZip.loadAsync(zipData);

        // Initialize arrays for PDF data
        const pdfFiles = [];

        // Iterate through each file in the zip
        for (const [fileName, file] of Object.entries(zip.files)) {
          if (fileName.endsWith(".pdf")) {
            // Found a PDF file
            const data = await file.async("blob");
            pdfFiles.push({ name: fileName, blob: URL.createObjectURL(data) });
          }
        }

        // Set state with the fetched PDF data
        setPdfData(pdfFiles);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAndProcessFiles();
  }, []);

  return (
    <div>
      {pdfData.map((pdf, index) => (
        <div key={index}>
          <h2>{pdf.name}</h2>
          <Document file={pdf.blob} onLoadError={console.error}>
            <Page pageNumber={1} />
          </Document>
        </div>
      ))}
    </div>
  );
};

export default YourComponent;
