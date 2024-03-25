import React, { useEffect, useState } from "react";
import Test3 from "../Test3";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Test3NextPage1 from "../Test3NextPage1";
import { TestNextPage2 } from "../TestNextPage2";

export const Routers = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Test3 />} />
          <Route path="/folder/:folderName" element={<Test3NextPage1 />} />
          <Route
            path="/folder/:folderName/:folderName2"
            element={<TestNextPage2 />}
          />
        </Routes>
      </Router>
    </>
  );
};
