"use client";

import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { UserButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import styles from "./ComplaintTab.module.css";
import AudioModal from "../../Components/audioModal.js";

export default function ComplaintTab() {
  const [viewTabs, setViewTabs] = useState(["Dashboard", "Settings"]);
  const [tabs, setTabs] = useState(["Text", "Audio", "Video"]);
  const [viewActive, setViewActive] = useState(0);
  const [active, setActive] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedInput, setSelectedInput] = useState("textQuery");
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const { user } = useUser();
  const router = useRouter(); // Initialize useRouter

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (input) => {
    if (!selectedFile) {
      alert("No file selected");
      return;
    } // probably want to throw a better alert here

    const clerkId = user?.id || "";

    try {
      const formData = new FormData();
      formData.append("complaintFile", selectedFile);

      console.log("the selected input", input);

      const response = await fetch(`http://127.0.0.1:5000/api/${input}`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${clerkId}`,
        },
      });

      const result = await response.json();
      console.log("Text file submitted:", result);
    } catch (e) {
      console.log("ERROR: ", e);
    }
  };

  const handleAudioSubmit = async () => {
    setShowModal(true); // Show modal
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleModalSelect = (service) => {
    let newSelectedInput;
    if (service === "assemblyAI") {
      newSelectedInput = "assemblyaiAudioQuery";
    } else if (service === "googleCloud") {
      newSelectedInput = "googleAudioQuery";
    }
    setShowModal(false);
    handleSubmit(newSelectedInput); // Call the submit function after setting the endpoint
  };

  const handleFileSubmit = (active) => {
    if (active === 0) {
      handleSubmit("textQuery");
    } else if (active === 1) {
      handleAudioSubmit();
    }
  };

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  // Function to handle tab clicks and navigation
  const handleViewTabClick = (idx) => {
    setViewActive(idx);
  };

  // Function to handle tab clicks and navigation
  const handleTabClick = (idx) => {
    setActive(idx);
    if (idx === 0) {
      setSelectedInput("textQuery");
    } else if (idx === 1) {
      setSelectedInput("audioQuery");
    } else if (idx === 2) {
      setSelectedInput("videoQuery");
    }
  };

  return (
    <div
      className={`${styles.ComplaintTab} ${collapsed ? styles.Collapsed : ""}`}
    >
      <div className={styles.ComplaintTab_Header}>
        <div style={{ display: "flex", alignItems: "center" }}>
          {!collapsed && <UserButton />}
          {!collapsed && (
            <div style={{ paddingLeft: "1vw" }}>
              <h3>{user?.fullName || user?.firstName}</h3>
              <p>{user?.emailAddresses[0].emailAddress}</p>
            </div>
          )}
        </div>
        <div className={styles.CollapseButton} onClick={toggleCollapse}>
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </div>
      </div>
      <div
        className={`${styles.ComplaintTab_Tabs} ${
          collapsed ? styles.Hidden : ""
        }`}
      >
        <div className={styles.ComplaintTab_Tabs_ViewTabs}>
          {viewTabs.map((tab, idx) => (
            <button
              key={idx}
              className={
                idx === viewActive
                  ? styles.ComplaintTab_Tabs_Active
                  : styles.ComplaintTab_Tabs_Inactive
              }
              onClick={() => handleViewTabClick(idx)} // Handle tab click
            >
              {tab}
            </button>
          ))}
        </div>
        <div className={styles.ComplaintTab_Tabs_InputTabs}>
          {tabs.map((tab, idx) => (
            <button
              key={idx}
              className={
                idx === active
                  ? styles.Input_Tabs_Active
                  : styles.Input_Tabs_Inactive
              }
              onClick={() => handleTabClick(idx)} // Handle tab click
            >
              {tab}
            </button>
          ))}
          <div className={styles.ComplaintTab_Tabs_File}>
            <label htmlFor="file-upload">Upload</label>
            <input id="file-upload" type="file" onChange={handleFileChange} />
            {selectedFile && <p>Selected file: {selectedFile.name}</p>}{" "}
            {/* Display selected file name */}
            <button
              className={styles.ComplaintTab_Tabs_Submit}
              onClick={() => handleFileSubmit(active)}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
      <AudioModal
        show={showModal}
        onClose={handleModalClose}
        onSelect={handleModalSelect}
      />
    </div>
  );
}
