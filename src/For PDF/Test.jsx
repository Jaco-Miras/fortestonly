import JSZip from "jszip";
import React, { useEffect, useState } from "react";

export const Test = () => {
  const [filesByYearAndQuarter, setFilesByYearAndQuarter] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedQuarter, setSelectedQuarter] = useState("all");

  useEffect(() => {
    const fetchAndProcessFiles = async () => {
      try {
        const response = await fetch("/for pdf/for pdf.zip");
        if (!response.ok) {
          throw new Error("Failed to fetch ZIP file");
        }
        const zipData = await response.arrayBuffer();
        const zip = await JSZip.loadAsync(zipData);

        const processZipEntries = async (folder, parentFolder = "") => {
          const files = [];

          for (const path in folder.files) {
            const entry = folder.files[path];
            const fullPath = parentFolder ? `${parentFolder}/${path}` : path;

            if (!entry.dir && fullPath.endsWith(".pdf")) {
              const data = await entry.async("blob");
              const [year, quarter] = fullPath.split("/").slice(1, 3); // Extract year and quarter
              files.push({
                name: fullPath,
                blob: new Blob([data], { type: "application/pdf" }),
                url: URL.createObjectURL(
                  new Blob([data], { type: "application/pdf" })
                ),
                type: "application/pdf",
                year: year,
                quarter: quarter,
              });
            }
          }

          return files;
        };

        const files = await processZipEntries(zip);

        // Group files by year and quarter
        const groupedFiles = {};

        // Initialize all quarters for each year
        const currentYear = new Date().getFullYear();
        for (let year = 2023; year <= currentYear; year++) {
          groupedFiles[year] = {
            "1st Quarter": [],
            "2nd Quarter": [],
            "3rd Quarter": [],
            "4th Quarter": [],
          };
        }

        // Fill in data
        files.forEach((file) => {
          const { year, quarter } = file;
          groupedFiles[year][quarter].push(file);
        });

        // Set the state with grouped files
        setFilesByYearAndQuarter(groupedFiles);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAndProcessFiles();
  }, []);

  // Handle year selection change
  const handleYearSelectChange = (event) => {
    const selectedYear = parseInt(event.target.value);
    setSelectedYear(selectedYear);
    setSelectedQuarter("all"); // Reset quarter to "All" when year changes
  };

  // Handle quarter selection change
  const handleQuarterSelectChange = (event) => {
    const selectedQuarter = event.target.value;
    setSelectedQuarter(selectedQuarter);
  };

  return (
    <div>
      {filesByYearAndQuarter && (
        <div>
          <label htmlFor="yearSelect">Select Year:</label>
          <select
            id="yearSelect"
            onChange={handleYearSelectChange}
            defaultValue={selectedYear}
          >
            <option value="">-- Select Year --</option>
            {Object.keys(filesByYearAndQuarter)?.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="quarterSelect">Select Quarter:</label>
        {filesByYearAndQuarter && ( // Check if filesByYearAndQuarter is not null
          <select
            id="quarterSelect"
            onChange={handleQuarterSelectChange}
            defaultValue={selectedQuarter}
          >
            <option value="all">All</option>
            {selectedYear &&
              Object?.keys(filesByYearAndQuarter[selectedYear])?.map(
                (quarter) => (
                  <option key={quarter} value={quarter}>
                    {quarter}
                  </option>
                )
              )}
          </select>
        )}
      </div>

      {selectedQuarter !== "all" && filesByYearAndQuarter && (
        <div>
          <ul>
            {filesByYearAndQuarter[selectedYear][selectedQuarter].map(
              (file, index) => (
                <li key={index}>
                  <span>{file.name}</span>
                  <a href={file.url} target="_blank" rel="noopener noreferrer">
                    Download
                  </a>
                </li>
              )
            )}
          </ul>
        </div>
      )}

      {selectedQuarter === "all" && filesByYearAndQuarter && (
        <div>
          {Object.entries(filesByYearAndQuarter[selectedYear]).map(
            ([quarter, files]) => (
              <div key={quarter}>
                <ul>
                  {files.map((file, index) => (
                    <li key={index}>
                      <span>{file.name}</span>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Test;
