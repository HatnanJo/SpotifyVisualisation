// src/components/StatsCard.jsx
import React from "react";

function formatInt(n) {
  return (typeof n === "number" ? Math.round(n) : n).toLocaleString();
}

export default function StatsCard({ summary }) {
  if (!summary) return null;

  return (
    <div className="stats-card">
      <h2>Summary</h2>
      <ul className="stats-list">
        <li><strong>Total plays:</strong> {formatInt(summary.totalPlays)}</li>
        <li><strong>Total minutes:</strong> {formatInt(summary.totalMinutes)}</li>
        <li><strong>Total hours:</strong> {formatInt(summary.totalHours)}</li>
        <li><strong>Unique artists:</strong> {formatInt(summary.uniqueArtists)}</li>
        <li><strong>Unique songs:</strong> {formatInt(summary.uniqueSongs)}</li>
      </ul>
    </div>
  );
}
