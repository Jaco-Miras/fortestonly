import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import JSZip from "jszip";

function Test3() {
  const [folderData, setFolderData] = useState([]);

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

            // Skip entries under "practice/test 1/folder 1/"
            if (
              fullPath.startsWith("practice/test 1/folder 1/") ||
              fullPath.startsWith("practice/test 1/folder 2/") ||
              fullPath.startsWith("practice/test 1/folder 3/") ||
              fullPath.startsWith("practice/test 1/folder 4/") ||
              fullPath.startsWith("practice/test 1/folder 5/")
            ) {
              continue;
            }

            if (parentFolder === "" && entry.dir) {
              // If it's the root folder and the entry is a directory
              folders.push({ name: fullPath });
            } else if (entry.dir) {
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
                  type: "pdf",
                });
              }
            }
          }

          return { folders, files };
        };

        const { folders, files } = await processZipEntries(zip);
        setFolderData(folders);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAndProcessFiles();
  }, []);

  console.log(folderData);
  return (
    <>
      <div>
        {folderData.map((folder, index) => (
          <li key={index}>
            <Link
              to={`/folder/${encodeURIComponent(folder.name)}`}
              state={{ folderName: folder.name }}
            >
              {folder.name}
            </Link>
          </li>
        ))}
      </div>
    </>
  );
}

export default Test3;
