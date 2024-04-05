import JSZip from "jszip";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const Test3NextPage1 = () => {
  const { folderName } = useParams();

  const [filesData1, setFilesData1] = useState([]);
  const [filesData2, setFilesData2] = useState([]);

  const [filteredFiles, setFilteredFiles] = useState([]);

  useEffect(() => {
    // Filter files based on folderName
    const filteredFilesData1 = filesData1.filter((file) =>
      decodeURIComponent(file.name).startsWith(folderName)
    );

    // Check if there are any images in the folder
    const hasImagesInFolder = filesData2.some((file) =>
      decodeURIComponent(file.name).startsWith(folderName)
    );

    // If there are no images in the folder, filter out all files except folders
    if (!hasImagesInFolder) {
      const filteredFolders = filteredFilesData1.filter(
        (file) => file.name !== folderName
      );
      setFilteredFiles(filteredFolders);
      return; // Exit early if no images in the folder
    }

    // If the folder contains image files, add them to the filtered files
    const filteredImages = filesData2.filter(
      (file) =>
        decodeURIComponent(file.name).startsWith(folderName) &&
        !file.name.substring(folderName.length + 1).includes("/")
    );
    setFilteredFiles(filteredImages);
  }, [folderName, filesData1, filesData2]);

  useEffect(() => {
    const fetchAndProcessFiles = async () => {
      try {
        const response = await fetch("/practice/practice.zip");
        if (!response.ok) {
          throw new Error("Failed to fetch ZIP file");
        }
        const zipData = await response.arrayBuffer();
        const zip = await JSZip.loadAsync(zipData);

        const processZipEntries = async (folder, parentFolder = "") => {
          const folders = [];
          const files = [];
          for (const path in folder.files) {
            const entry = folder.files[path];
            const fullPath = parentFolder ? `${parentFolder}/${path}` : path;
            if (entry.dir && fullPath.startsWith(folderName)) {
              const nestedData = await processZipEntries(entry, fullPath);
              folders.push(...nestedData.folders);
              files.push(...nestedData.files);
              folders.push({ name: fullPath });
            } else if (!entry.dir && fullPath.startsWith(folderName)) {
              const data = await entry.async("blob");
              if (fullPath.match(/\.(jpg|jpeg|png|gif)$/i)) {
                files.push({
                  name: fullPath,
                  blob: URL.createObjectURL(data),
                  type: "image",
                });
              } else if (fullPath.endsWith(".pdf")) {
                const blob = new Blob([data], { type: "application/pdf" });
                const url = URL.createObjectURL(blob);
                files.push({
                  name: fullPath,
                  blob: blob,
                  url: url,
                  type: "application/pdf",
                });
              }
            }
          }
          return { folders, files };
        };

        const { folders, files } = await processZipEntries(zip);
        setFilesData1(folders);
        setFilesData2(files);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAndProcessFiles();
  }, [folderName]);

  console.log("files", filesData1);

  console.log("ttt", filteredFiles);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-2 gap-y-3">
      {[...filteredFiles, ...filesData1].map((file, index) => (
        <div key={index}>
          {file.type === "image" ? (
            <img src={file.blob} alt={file.name} />
          ) : file.type === "application/pdf" ? (
            <div>
              {/* Open PDF file in a new tab */}
              <a href={file.url} target="_blank" rel="noopener noreferrer">
                {file.name}
              </a>
            </div>
          ) : (
            // Check if the file name is not equal to the folderName (parent folder)
            file.name !== folderName && (
              <Link
                to={`/folder/${encodeURIComponent(file.name)}`}
                state={{ folderName: file.name }}
              >
                {file.name}
              </Link>
            )
          )}
        </div>
      ))}
    </div>
  );
};

export default Test3NextPage1;
