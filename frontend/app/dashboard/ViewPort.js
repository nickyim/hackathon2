"use client";
import { useState } from "react";
import axios from "axios";
import { Chart as ChartJS } from 'chart.js/auto' 
import { Doughnut } from "react-chartjs-2"
import { useUser } from '@clerk/nextjs';

//CSS
import styles from "./ViewPort.module.css";

export default function ViewPort() {
  const [prompt, setPrompt] = useState("");
  const { user } = useUser(); // Fetch the current user's info 
  const [complaint, setComplaint] = useState({product: 'Credit Card', subProduct: 'Store credit card', summary: "A customer is writing to Macy's to address ongoing issues with their Macy's credit account. Despite multiple attempts to resolve these issues over the phone, the customer has not received adequate assistance. The main concerns include a disputed charge of $31, incorrect late fee reporting, and inaccuracies in credit reporting that have negatively impacted the customer's credit score and led to an increase in auto insurance premiums. The customer requests a thorough review of the account, correction of inaccuracies, and removal of the disputed by consumer note from their credit report. Additionally, they ask not to receive any more Macy's advertisements."})
  const [complaints, setComplaints] = useState([
    { id: 1, product: "Credit Card", sub_product: "Store credit card" },
    { id: 2, product: "Debit Card", sub_product: "Store debit card" },
  ]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [data, setData] = useState([203, 331]);

  const handlePromptSubmit = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:5000/api/textQuery", {
        prompt: prompt,
        clerkId: user?.id || "example-clerk-id",
      });
      console.log("TEST: ", response.data);
    } catch (e) {
      console.log("ERROR: ", e);
    }
  };

  const handlePromptChange = (e) => {
    const { value } = e.target;
    setPrompt(value);
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleFileSubmit = async () => {
    if (!selectedFile) return;

    try {
      const formData = new FormData();
      formData.append("audioFile", selectedFile);

      // Log file details for debugging
      console.log("Selected file:", selectedFile);
      console.log("File type:", selectedFile.type);

      const response = await axios.post(
        "http://127.0.0.1:5000/api/audioQuery",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Audio file submitted:", response.data);
    } catch (e) {
      console.log("ERROR: ", e);
    }
  };

  return (
    <div className={styles.ViewPort}>
      <div className={styles.ViewPort_Header}>
        <h2>Dashboard</h2>
      </div>
      <div className={styles.ViewPort_Content}>
        <div className={styles.ViewPort_Top}>
          <div className={styles.ViewPort_Complaint}>
            <div className={styles.ViewPort_Complaint_Title}>
              <h4>{complaint.product}</h4>
              <h4 className={styles.ViewPort_Complaint_Title_Subproduct}>{complaint.subProduct}</h4>
            </div>
            <p className={styles.ViewPort_Complaint_Summary}>{complaint.summary}</p>
          </div>
          <div className={styles.ViewPort_Chart}>
            <Doughnut
              data={{
                labels: ["Non-Complaints", "Complaints"],
                datasets: [
                  {
                    data: data,
                    backgroundColor: ["#8cbdac", "#e9e3a6"],
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          </div>
          {/* <div className={styles.ViewPort_Prompt}>
            <input type="text" value={prompt} onChange={handlePromptChange} />
            <button onClick={handlePromptSubmit}>Submit</button>
          </div> */}
        </div>
        <div className={styles.ViewPort_Data}>
          <div className={styles.ViewPort_List}>
            <div className={styles.ViewPort_List_Title}>
              <h4>List of Complaints</h4>
            </div>
            <div className={styles.ViewPort_List_Content}>
              <div className={styles.ViewPort_List_Content_Tab}>
                <p className={styles.ViewPort_List_Content_ID}>ID</p>
                <p className={styles.ViewPort_List_Content_Product}>Product</p>
                <p className={styles.ViewPort_List_Content_Sub_Product}>
                  Sub-Product
                </p>
              </div>
              {complaints.map((complaint, idx) => (
                <div
                  key={idx}
                  className={
                    styles.ViewPort_List_Content_Tab +
                    " " +
                    styles.ViewPort_List_Content_Tab_Complaints
                  }
                >
                  <p className={styles.ViewPort_List_Content_ID}>{complaint.id}</p>
                  <p className={styles.ViewPort_List_Content_Product}>
                    {complaint.product}
                  </p>
                  <p className={styles.ViewPort_List_Content_Sub_Product}>
                    {complaint.sub_product}
                  </p>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
