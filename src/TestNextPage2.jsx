import JSZip from "jszip";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export const TestNextPage2 = () => {
  const { folderName } = useParams();

  const [filesData1, setFilesData1] = useState([]);
  const [filesData2, setFilesData2] = useState([]);

  const [filteredFiles, setFilteredFiles] = useState([]);

  useEffect(() => {
    // Filter files based on folderName
    const filtered = filesData1.filter((file) =>
      decodeURIComponent(file.name).startsWith(folderName)
    );

    // Check if there are any images in the folder
    const hasImagesInFolder = filesData2.some((file) =>
      decodeURIComponent(file.name).startsWith(folderName)
    );

    // If there are no images in the folder and subfolders, filter out all files
    if (!hasImagesInFolder) {
      setFilteredFiles([]);
      return; // Exit early if no images in the folder
    }

    // If the folder contains subfolders, show only subfolders
    if (filesData1 && filesData1.length > 0) {
      // Get the list of subfolders for the current folder
      const subFolders = filesData1.filter((file) =>
        file.name.startsWith(folderName)
      );

      // If there are subfolders, show only subfolders
      if (subFolders.length > 0) {
        setFilteredFiles(subFolders);
      } else {
        // If no subfolders, show all files (images)
        setFilteredFiles(filtered);
      }
    } else {
      // If no subfolders, show all files (images)
      setFilteredFiles(filtered);
    }

    // If the folder contains image files, add them to the filtered files
    if (filesData2 && filesData2.length > 0) {
      const imageFiles = filesData2.filter((file) =>
        decodeURIComponent(file.name).startsWith(folderName)
      );
      setFilteredFiles((prevFiles) => [...prevFiles, ...imageFiles]);
    }
  }, [folderName, filesData1]);

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
            if (entry.dir) {
              const nestedData = await processZipEntries(entry, fullPath);
              folders.push(...nestedData.folders);
              files.push(...nestedData.files);
              folders.push({ name: fullPath });
            } else {
              const data = await entry.async("blob");
              if (fullPath.match(/\.(jpg|jpeg|png|gif)$/i)) {
                files.push({
                  name: fullPath,
                  blob: URL.createObjectURL(data),
                  type: "image",
                });
              } else if (fullPath.endsWith(".pdf")) {
                files.push({
                  name: fullPath,
                  blob: URL.createObjectURL(data),
                  type: "application/pdf",
                });
              }
            }
          }
          return { folders, files };
        };

        const { folders, files } = await processZipEntries(zip);
        // Filter filesData2 based on the folderName
        const filteredFilesData2 = files.filter((file) =>
          decodeURIComponent(file.name).startsWith(folderName)
        );
        setFilesData1(folders);
        setFilesData2(filteredFilesData2);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAndProcessFiles();
  }, [folderName]);

  console.log("files", filesData2);

  console.log(folderName);
  return (
    <div>
      {filteredFiles.map((file, index) => (
        <div key={index}>
          {file.type === "image" && <img src={file.blob} alt={file.name} />}
          {file.type === "application/pdf" && (
            <a href={file.blob} target="_blank" rel="noopener noreferrer">
              {file.name}
            </a>
          )}
          {file.type !== "image" && file.type !== "application/pdf" && (
            <Link
              to={`/folder/${encodeURIComponent(file.name)}`}
              state={{ folderName: file.name }}
            >
              {file.name}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
};
