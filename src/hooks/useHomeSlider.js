import { useState, useEffect } from "react";

import * as Dropbox from "dropbox";
import useRefreshAccessToken from "../dropbox api/refreshToken";

export const useHomeSlider = () => {
  const [files, setFiles] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoadingMayor, setIsLoading] = useState(true);

  const { accessToken, refreshAccessToken, setAccessToken } =
    useRefreshAccessToken();

  const folderPath = "/Maco Website/Municipality/Mayors/History Mayors";
  const dbx = new Dropbox.Dropbox({ accessToken });

  const yourRefreshToken = import.meta.env.VITE_API_DROPBOX_REFRESH_TOKEN;
  useEffect(() => {
    const fetchFunction = async () => {
      setIsModalVisible(true);
      setIsFetching(true);

      dbx
        .usersGetCurrentAccount()
        .then((response) => {
          dbx
            .filesListFolder({ path: folderPath })
            .then(async (response) => {
              const processFilesSequentially = async (files, chunkSize) => {
                const results = [];

                // Chunk the files into arrays of size 'chunkSize'
                const fileChunks = Array.from(
                  { length: Math.ceil(files.length / chunkSize) },
                  (_, index) =>
                    files.slice(index * chunkSize, (index + 1) * chunkSize)
                );

                // Process each chunk sequentially
                for (const chunk of fileChunks) {
                  const chunkResults = await Promise.all(
                    chunk.map(processFile)
                  );
                  results.push(...chunkResults);
                }

                return results;
              };
              const processFile = async (file) => {
                let checker = true;
                do {
                  try {
                    const linksResponse = await dbx.sharingListSharedLinks({
                      path: file.path_display,
                    });
                    console.log(linksResponse);

                    if (linksResponse.result.links.length > 0) {
                      const directLink =
                        linksResponse.result.links[0].url.replace(
                          "www.dropbox.com",
                          "dl.dropboxusercontent.com"
                        );
                      const response = await fetch(directLink);

                      if (!response.ok) {
                      } else {
                        if (file.name.includes(".txt")) {
                          function readFileAsText(file) {
                            return new Promise((resolve, reject) => {
                              const reader = new FileReader();

                              reader.onload = (event) => {
                                const content = event.target.result;
                                resolve(content);
                              };

                              reader.onerror = (error) => {
                                reject(error);
                              };

                              reader.readAsText(file);
                            });
                          }
                          console.log(response);
                          const blob = await response.arrayBuffer();
                          const test = new Blob([blob], {
                            type: "application/txt",
                          });
                          const file2 = new File([test], file.name, {
                            type: "application/txt",
                          });
                          const fileContent = await readFileAsText(file2);
                          const [firstLine, restOfTheString, restOfTheString2] =
                            fileContent.split("\r\n");

                          checker = false;
                          return {
                            ...file,
                            textName: firstLine,
                            textRest: restOfTheString,
                            textRest2: restOfTheString2,
                          };
                        } else {
                          const blob = await response.blob();

                          console.log(blob);

                          checker = false;
                          return { ...file, blobbers: blob };
                        }
                      }
                    }
                    // Create a shareable link
                    const shareResponse =
                      await dbx.sharingCreateSharedLinkWithSettings({
                        path: file.path_display,
                        settings: {
                          requested_visibility: { ".tag": "public" }, // Set the desired access level
                          allow_download: true,
                        },
                      });
                    console.log(shareResponse);

                    // Extract the direct link from the shareable link
                    const directLink = shareResponse.result.url.replace(
                      "www.dropbox.com",
                      "dl.dropboxusercontent.com"
                    );

                    // Fetch the image using the direct link
                    const response = await fetch(directLink);

                    if (!response.ok) {
                      throw new Error("Failed to fetch image");
                    }
                    if (file.name.includes(".txt")) {
                      function readFileAsText(file) {
                        return new Promise((resolve, reject) => {
                          const reader = new FileReader();

                          reader.onload = (event) => {
                            const content = event.target.result;
                            resolve(content);
                          };

                          reader.onerror = (error) => {
                            reject(error);
                          };

                          reader.readAsText(file);
                        });
                      }
                      console.log(response);
                      const blob = await response.arrayBuffer();
                      const test = new Blob([blob], {
                        type: "application/txt",
                      });
                      const file2 = new File([test], file.name, {
                        type: "application/txt",
                      });
                      const fileContent = await readFileAsText(file2);
                      const [firstLine, restOfTheString, restOfTheString2] =
                        fileContent.split("\r\n");

                      checker = false;
                      return {
                        ...file,
                        textName: firstLine,
                        textRest: restOfTheString,
                        textRest2: restOfTheString2,
                      };
                    } else {
                      const blob = await response.blob();

                      console.log(blob);
                      checker = false;

                      return { ...file, blobbers: blob };
                    }
                  } catch (error) {
                    console.error("Error downloading image:", error);
                  }
                } while (checker);
              };

              const files = response.result?.entries || [];

              // Set the chunk size, in this case, 3
              const chunkSize = 10;
              console.log(files);
              // Call the processFilesSequentially function with the array of files and chunk size
              const results = await processFilesSequentially(files, chunkSize);

              setFiles(results);
            })
            .catch((error) => {
              console.error("Error fetching files from Dropbox:", error);
            })
            .finally(() => {
              setIsModalVisible(false);
              setIsLoading(false);
            });

          // Access token is still valid
          console.log("Token is still valid:", response);
        })
        .catch((error) => {
          console.log(error.response);
          // Check if the error is due to an expired token
          if (error.response && error.response.status === 401) {
            // Access token has expired, handle it accordingly
            console.log("Token has expired. You may need to refresh it.");
            refreshAccessToken(yourRefreshToken);
          } else {
            refreshAccessToken(yourRefreshToken);
            // Handle other errors
            console.error("Error:", error);
          }
        })
        .finally(() => {
          setIsFetching(false);
        });
    };
    if (!isFetching) {
      fetchFunction();
    }
  }, [accessToken]);

  return { files, setAccessToken, isModalVisible, isLoadingMayor };
};
