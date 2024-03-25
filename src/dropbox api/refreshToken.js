import { useState, useEffect } from "react";

const useRefreshAccessToken = () => {
  const cookies = document.cookie.split(";").reduce((prev, curr) => {
    const [name, value] = curr.trim().split("=");
    prev[name] = value;
    return prev;
  }, {});

  const [accessToken, setAccessToken] = useState(
    cookies.newAccessToken
      ? cookies.newAccessToken
      : import.meta.env.VITE_API_DROPBOX_ACCESS_TOKEN
  );

  useEffect(() => {
    const accessTokenExpirationTime = cookies.accessTokenExpirationTime;
    const currentTime = new Date().getTime() / 1000; // Current time in seconds

    // If access token and its expiration time are present
    if (accessTokenExpirationTime && currentTime < accessTokenExpirationTime) {
      // Token is still valid, no need to refresh
      return;
    }

    // Access token has expired or doesn't exist, refresh it
    const refreshToken = cookies.refreshToken;
    if (refreshToken) {
      refreshAccessToken(refreshToken);
    }
  }, [accessToken, cookies.accessTokenExpirationTime]); // Include accessToken and its expiration time as dependencies

  const refreshAccessToken = async (refreshToken) => {
    const clientId = import.meta.env.VITE_API_DROPBOX_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_API_DROPBOX_CLIENT_SECRET;

    const requestBody = new URLSearchParams();
    requestBody.append("grant_type", "refresh_token");
    requestBody.append("refresh_token", refreshToken);
    requestBody.append("client_id", clientId);
    requestBody.append("client_secret", clientSecret);

    try {
      const response = await fetch("https://api.dropboxapi.com/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: requestBody,
      });

      if (!response.ok) {
        throw new Error("Failed to refresh access token");
      }

      const data = await response.json();
      const newAccessToken = data.access_token;
      const expirationTime = new Date().getTime() / 1000 + data.expires_in; // Calculate expiration time

      // Update the new access token and its expiration time
      console.log("New Access Token:", newAccessToken);
      setAccessToken(newAccessToken);
      document.cookie = `newAccessToken=${newAccessToken}; expires=${new Date(
        expirationTime * 1000
      ).toUTCString()}`;
      document.cookie = `accessTokenExpirationTime=${expirationTime}`;
    } catch (error) {
      console.error("Error refreshing access token:", error);
    }
  };

  return { accessToken, refreshAccessToken, setAccessToken };
};

export default useRefreshAccessToken;
