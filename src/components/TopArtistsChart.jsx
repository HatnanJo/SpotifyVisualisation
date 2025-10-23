// src/components/TopArtistsChart.jsx
import React from "react";
import Plot from "react-plotly.js";

export default function TopArtistsChart({ topArtists }) {
  if (!topArtists || topArtists.length === 0) return null;

  return (
    <div>
      <h2>Top Artists</h2>
      <Plot
        data={[
          {
            x: topArtists.map((a) => a.minutes),
            y: topArtists.map((a) => a.label),
            type: "bar",
            orientation: "h",
            marker: { color: "#1DB954" },
          },
        ]}
        layout={{
          height: 400,
          margin: { l: 300, r: 30, t: 30, b: 50 },
          yaxis: { automargin: true },
          plot_bgcolor: "#121212",
          paper_bgcolor: "#121212",
          font: {
            color: "#B3B3B3"
          }
        }}
      />
    </div>
  );
}
