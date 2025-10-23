// src/components/FileUpload.jsx
import React, { useState } from "react";

export default function FileUpload({ onFiles, disabled }) {
  const [fileCount, setFileCount] = useState(0);

  const handleChange = (e) => {
    const files = e.target.files;
    setFileCount(files.length);
    onFiles(files);
  };

  return (
    <div className="file-input-container">
      <label htmlFor="file-upload" className="file-label">
        Choose Files
      </label>
      <input
        id="file-upload"
        type="file"
        multiple
        accept=".json"
        onChange={handleChange}
        disabled={disabled}
      />
      {fileCount > 0 && <span style={{ color: "#B3B3B3" }}>{fileCount} files selected</span>}
    </div>
  );
}
