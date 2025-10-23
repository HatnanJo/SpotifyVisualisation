// src/components/Dashboard.jsx
import React from "react";
import StatsCard from "./StatsCard";
import TopArtistsChart from "./TopArtistsChart";
import TopTracksChart from "./TopTracksChart";
import ActivityChart from "./ActivityChart";

export default function Dashboard({ data }) {
  if (!data) return null;

  const { summary, monthly, topArtists, topSongs } = data;

  return (
    <div>
      <StatsCard summary={summary} />
      <ActivityChart monthly={monthly} />
      <TopArtistsChart topArtists={topArtists} />
      <TopTracksChart topSongs={topSongs} />
    </div>
  );
}
