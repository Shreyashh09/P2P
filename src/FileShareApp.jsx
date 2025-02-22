import { useState, useEffect } from "react";

export default function FileShareApp() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [peers, setPeers] = useState([]);
  const [selectedPeer, setSelectedPeer] = useState("");

  useEffect(() => {
    const fetchPeers = async () => {
      try {
        const response = await fetch("192.168.1.7:5000/peers");
        const data = await response.json();
        setPeers(data);
      } catch (error) {
        console.error("Error fetching peers:", error);
      }
    };

    fetchPeers();
    const interval = setInterval(fetchPeers, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const sendFile = async () => {
    if (!selectedFile || !selectedPeer) {
      alert("Please select a file and a peer.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("receiver_ip", selectedPeer);

    try {
      const response = await fetch("192.168.1.7:5000/send", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("File sent successfully!");
      } else {
        alert("Error sending file.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to send file.");
    }
  };

  return (
    <div className="container">
      <h1>LAN File Sharing</h1>

      <label>Select a Peer:</label>
      <select onChange={(e) => setSelectedPeer(e.target.value)}>
        <option value="">Select a Device</option>
        {peers.map((peer, index) => (
          <option key={index} value={peer}>{peer}</option>
        ))}
      </select>

      <input type="file" onChange={handleFileChange} />
      <button onClick={sendFile}>Send File</button>
    </div>
  );
}
