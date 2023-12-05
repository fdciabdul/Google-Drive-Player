import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactPlayer from "react-player";
import "./App.css";

function App() {
  const [inputUrl, setInputUrl] = useState("");
  const [videoSrc, setVideoSrc] = useState("");
  const [thumbnailSrc, setThumbnailSrc] = useState("");
  const showToastError = (message) => {
    toast.error(message, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

 const showToastSuccess = (message) => {
    toast.success(message, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      draggable: true,
      progress: undefined,
    });
  };

  const handleChange = (e) => {
    setInputUrl(e.target.value);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Multiple regex patterns to match different Google Drive URL formats
    const regexPatterns = [
      /\/file\/d\/([a-zA-Z0-9_-]+)\//,
      /\/open\?id=([a-zA-Z0-9_-]+)/,
      /^([a-zA-Z0-9_-]+)$/, // This pattern matches input containing only the media ID
    ];
  
    // Find a match using any of the regex patterns
    const match = regexPatterns.reduce((foundMatch, pattern) => {
      return foundMatch || inputUrl.match(pattern);
    }, null);
  
    if (!match || !match[1]) {
      showToastError("Invalid URL. Please provide a valid Google Drive URL.");
      return;
    }
  
    const docId = match[1];
  
    try {
    
      const response = await axios.get(`https://gdrive.demo.imtaqin.id/?url=${docId}`);
      showToastSuccess("Fetching data from API server...");
      const data = response.data;
      setVideoSrc(`https://gdrive.demo.imtaqin.id/proxy-video/${data.uniqueId}`);
      setThumbnailSrc(`https://gdrive.demo.imtaqin.id/proxy-thumbnail/${data.uniqueId}`);
    } catch (error) {
      showToastError("Error fetching data from API server: ", error);
    }
  };
  
  
  

  return (
    <div className="App">
       <ToastContainer />
      <h1>Google Drive Video Player</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="input-url"
          placeholder="Enter Google Drive URL"
          value={inputUrl}
          onChange={handleChange}
        />
        <button type="submit">Submit</button>
      </form>
      <div className="media-panels">
        {videoSrc && (
          <>
            <div className="panel video-panel">
              <h2>Video</h2>
              <div className="video-wrapper">
                 <ReactPlayer url={videoSrc} controls />
              </div>
              <textarea readOnly value={videoSrc} />
            </div>
            <div className="panel thumbnail-panel">
              <h2>Thumbnail</h2>
              {thumbnailSrc && <img src={thumbnailSrc} alt="Thumbnail" className="thumb" />}
              <textarea readOnly value={thumbnailSrc} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
