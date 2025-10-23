// src/components/FileUpload.jsx
import React from "react";

export default function FileUpload({ onFiles, disabled }) {
  return (
    <input
      type="file"
      multiple
      accept=".json"
      onChange={(e) => onFiles(e.target.files)}
      disabled={disabled}
    />
  );
}
