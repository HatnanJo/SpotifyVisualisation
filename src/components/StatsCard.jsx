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
        <li>Total plays: {formatInt(summary.totalPlays)}</li>
        <li>Total minutes: {formatInt(summary.totalMinutes)}</li>
        <li>Total hours: {formatInt(summary.totalHours)}</li>
        <li>Unique artists: {formatInt(summary.uniqueArtists)}</li>
        <li>Unique songs: {formatInt(summary.uniqueSongs)}</li>
      </ul>
    </div>
  );
}
