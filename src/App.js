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
  
    const regex = /\/file\/d\/([a-zA-Z0-9_-]+)\//;
    const match = inputUrl.match(regex);
  
    if (!match || !match[1]) {
      showToastError("Invalid URL. Please provide a valid Google Drive URL.");
      return;
    }
  
    const docId = match[1];
  
    try {
      showToastSuccess("Fetching data from API server...");
      const response = await axios.get(`https://google-drive-player-production.up.railway.app/?url=${docId}`);
      const data = response.data;
      setVideoSrc(`https://google-drive-player-production.up.railway.app/proxy-video/${data.uniqueId}`);
      setThumbnailSrc(`https://google-drive-player-production.up.railway.app/proxy-thumbnail/${data.uniqueId}`);
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
              <ReactPlayer url={videoSrc} controls />
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
