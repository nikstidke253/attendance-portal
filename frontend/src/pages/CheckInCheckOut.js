import React, { useState } from "react";
import axios from "axios";

export default function CheckIn() {
  const [status, setStatus] = useState("");

  const handleCheckIn = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/checkin",
        {},
        {
          headers: {
            Authorization: token,
          },
        }
      );

      setStatus(res.data.msg);
    } catch (err) {
      setStatus("Error or already checked in");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Check-in Page</h2>

      <button onClick={handleCheckIn}>Check In</button>

      <p>{status}</p>
    </div>
  );
}