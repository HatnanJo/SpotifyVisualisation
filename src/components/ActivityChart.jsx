// src/components/ActivityChart.jsx
import React from "react";
import Plot from "react-plotly.js";
import dayjs from "dayjs";

export default function ActivityChart({ monthly }) {
  if (!monthly || monthly.length === 0) return null;

  return (
    <div>
      <h2>Listening Over Time (Hours per Month)</h2>
      <Plot
        data={[
          {
            x: monthly.map((m) => dayjs(m.month + "-01").format("MMM YYYY")),
            y: monthly.map((m) => parseFloat(m.hours.toFixed(2))),
            type: "scatter",
            mode: "lines+markers",
            line: { shape: "spline", color: "#1DB954" },
          },
        ]}
        layout={{
          height: 400,
          margin: { l: 50, r: 30, t: 30, b: 50 },
          plot_bgcolor: "#181818",
          paper_bgcolor: "#181818",
          font: {
            color: "#FFFFFF"
          }
        }}
      />
    </div>
  );
}
