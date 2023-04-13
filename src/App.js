import React, { useState } from "react";
import axios from "axios";
import ReactPlayer from 'react-player'
import "./App.css";

function App() {
  const [inputUrl, setInputUrl] = useState("");
  const [videoSrc, setVideoSrc] = useState("");
  const [thumbnailSrc, setThumbnailSrc] = useState("");

  const handleChange = (e) => {
    setInputUrl(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const docId = inputUrl.split('/').pop();

    try {
      const response = await axios.get(`http://localhost:8080/?url=${docId}`);
      const data = response.data;
      setVideoSrc("http://localhost:8080/proxy-video/"+data.uniqueId);
      setThumbnailSrc("http://localhost:8080/proxy-thumbnail/"+data.uniqueId);
    } catch (error) {
      console.error("Error fetching data from API server: ", error);
    }
  };

  return (
    <div className="App">
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
              {/* <video width="320" height="180" controls> */}
              <ReactPlayer url={videoSrc}  controls="true"/>
              {/* <ReactPlayer url='{videoSrc}' type="video/mp4" />
                Your browser does not support the video tag.
              </video> */}
              <textarea readOnly value={videoSrc} />
            </div>
            <div className="panel thumbnail-panel">
              <h2>Thumbnail</h2>
              {thumbnailSrc && <img src={thumbnailSrc} alt="Thumbnail" />}
              <textarea readOnly value={thumbnailSrc} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
