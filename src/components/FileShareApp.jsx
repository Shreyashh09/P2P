import React, { useState, useEffect } from 'react';
import { Upload, Users, Send, X } from 'lucide-react';

const FileShareApp = () => {
  // ... keeping all the existing state and handlers the same ...
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [peers, setPeers] = useState([]);
  const [selectedPeer, setSelectedPeer] = useState("");

  // Keeping all the existing handlers and functions
  useEffect(() => {
    const fetchPeers = async () => {
      try {
        const response = await fetch(`http://${window.location.hostname}:5000/peers`);
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

  const handleFileSelection = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);

    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleFileChange = (event) => {
    handleFileSelection(event.target.files[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    handleFileSelection(event.dataTransfer.files[0]);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setUploadProgress(0);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const sendFile = async () => {
    if (!file || !selectedPeer) {
      alert("Please select both a file and a peer.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("receiver_ip", selectedPeer);

    try {
      const response = await fetch(`http://${window.location.hostname}:5000/send`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setUploadProgress(100);
        setTimeout(() => {
          alert("File sent successfully!");
          clearFile();
          setSelectedPeer("");
          setUploadProgress(0);
        }, 1000);
      } else {
        alert("Error sending file.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to send file.");
    }
  };

  return (
    <div 
      className="min-h-screen min-w-[2000px] relative flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{
        // backgroundImage: 'url("https://api.deepai.org/job-view-file/641d3444-7deb-4483-aa12-50e8417b85d7/outputs/output.jpg")',
        backgroundImage: 'url("https://api.deepai.org/job-view-file/71a692ac-c91a-483b-bb45-441c4abec975/outputs/output.jpg")',
        // backgroundImage: 'url("https://api.deepai.org/job-view-file/0f9d32c6-58e0-4176-b436-9517d60c7da6/outputs/output.jpg")',
        // backgroundImage: 'url("https://api.deepai.org/job-view-file/3c1f30b2-63d5-41ba-a51a-e704236a61a6/outputs/output.jpg")',
        // backgroundImage: 'url("https://api.deepai.org/job-view-file/f32c7302-211e-4015-8c0b-3aab5b61bed0/outputs/output.jpg")',
      }}
    >
      {/* Blur overlay */}
      <div className="absolute inset-0 backdrop-blur-sm bg-black/50" />
      
      {/* Main content */}
      <div className="relative w-full max-w-md bg-gray-800/90 rounded-xl shadow-2xl p-6 border border-green-500/30 backdrop-blur-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-mono font-bold text-center flex items-center justify-center gap-2 text-green-400">
            <Upload className="w-6 h-6" />
            CYBER_TRANSFER v1.0
          </h1>
        </div>

        {/* Peer Selection */}
        <div className="mb-6">
          <label className="block text-sm font-mono font-medium text-green-400 mb-2">
            <Users className="w-4 h-4 inline mr-2" />
            SELECT_TARGET_NODE
          </label>
          <select
            value={selectedPeer}
            onChange={(e) => setSelectedPeer(e.target.value)}
            className="w-full p-2 border bg-gray-900/90 border-green-500/50 rounded-lg text-green-400 font-mono focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">SCANNING_NETWORK...</option>
            {peers.map((peer, index) => (
              <option key={index} value={peer}>NODE_{peer}</option>
            ))}
          </select>
        </div>

        {/* File Drop Zone */}
        <div
          className={`relative w-full p-8 text-center border-2 border-dashed rounded-lg cursor-pointer transition-all ${
            dragging
              ? "border-green-400 bg-green-900/20"
              : "border-green-500/30 hover:border-green-400"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput').click()}
        >
          {file && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="absolute top-2 right-2 p-1 bg-gray-700/90 rounded-full hover:bg-gray-600"
            >
              <X className="w-4 h-4 text-green-400" />
            </button>
          )}
          
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-32 object-cover rounded-lg opacity-80"
            />
          ) : file ? (
            <div className="flex flex-col items-center">
              <Upload className="w-12 h-12 text-green-400 mb-2" />
              <p className="text-sm text-green-400 font-mono">{file.name}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-12 h-12 text-green-500/50 mb-2" />
              <p className="text-green-500/50 font-mono">DRAG_DROP || CLICK_SELECT</p>
            </div>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          onChange={handleFileChange}
          className="hidden"
          id="fileInput"
        />

        {/* Enhanced Upload Progress */}
        {uploadProgress > 0 && (
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm text-green-400 font-mono">
              <span>UPLOADING: {file.name}</span>
              <span>{uploadProgress}%</span>
            </div>
            
            <div className="relative w-full h-4 bg-gray-900/90 rounded-full overflow-hidden border border-green-500/30">
              {/* Background pulse animation */}
              <div 
                className="absolute inset-0 bg-green-900/30 animate-pulse"
                style={{ 
                  transform: `translateX(${uploadProgress - 100}%)`,
                  transition: 'transform 0.5s ease-out'
                }}
              />
              
              {/* Main progress bar */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-400"
                style={{ 
                  transform: `translateX(${uploadProgress - 100}%)`,
                  transition: 'transform 0.5s ease-out'
                }}
              />
              
              {/* Shine effect */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-green-200 to-transparent opacity-20"
                style={{ 
                  transform: `translateX(${uploadProgress - 100}%)`,
                  transition: 'transform 0.5s ease-out'
                }}
              />
            </div>

            {file && (
              <div className="flex justify-between text-xs text-green-500/70 font-mono">
                <span>{formatFileSize(file.size)}</span>
                <span>{uploadProgress === 100 ? 'TRANSFER_COMPLETE' : 'TRANSFERRING...'}</span>
              </div>
            )}
          </div>
        )}

        {/* Send Button */}
        <button
          onClick={sendFile}
          disabled={!file || !selectedPeer || uploadProgress > 0}
          className={`mt-6 w-full py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all font-mono ${
            uploadProgress > 0
              ? "bg-green-600 text-black cursor-not-allowed"
              : file && selectedPeer
              ? "bg-green-500 hover:bg-green-400 text-black"
              : "bg-gray-700/90 text-gray-500 cursor-not-allowed"
          }`}
        >
          {uploadProgress > 0 ? (
            <>
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent" />
              TRANSMITTING...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              INITIATE_TRANSFER
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FileShareApp;