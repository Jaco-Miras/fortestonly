import React, { useEffect, useState } from "react";
import JSZip from "jszip";

export const Test = () => {
  const [fileData, setFileData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAndProcessFiles = async () => {
      try {
        // Fetch the zip file containing the images and text files
        const response = await fetch("uploads/123.zip");
        if (!response.ok) {
          throw new Error("Failed to fetch files");
        }
        const zipData = await response.arrayBuffer();

        // Decompress the zip file
        const zip = await JSZip.loadAsync(zipData);

        // Extract the files from the specific folders within the zip
        const folder1 = zip.folder("Folder1");
        const folder2 = zip.folder("Folder2");

        if (!folder1 || !folder2) {
          throw new Error("One or both folders not found");
        }

        // Function to extract files from a folder
        const extractFilesFromFolder = async (folder) => {
          const files = [];
          folder.forEach(async (relativePath, file) => {
            if (!file.dir) {
              files.push({
                name: file.name,
                type: file.name.split(".").pop().toLowerCase(),
                blob: await file.async("blob"),
                content:
                  file.name.split(".").pop().toLowerCase() === "txt"
                    ? await file.async("text")
                    : null,
              });
            }
          });
          return files;
        };

        const files1 = await extractFilesFromFolder(folder1);
        const files2 = await extractFilesFromFolder(folder2);

        const files = [...files1, ...files2];
        setFileData(files);
      } catch (error) {
        setError(error);
      }
    };

    fetchAndProcessFiles();
  }, []);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  console.log(fileData);

  return (
    <div>
      <h1>Files in Folders:</h1>
      {fileData.map((file, index) => (
        <div key={index}>
          <h2>{file.name}</h2>
          {file.type === "txt" ? (
            <pre>{file.content}</pre>
          ) : (
            <img src={URL.createObjectURL(file.blob)} alt={file.name} />
          )}
        </div>
      ))}
    </div>
  );
};
