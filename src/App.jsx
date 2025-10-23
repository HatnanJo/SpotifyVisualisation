// src/App.jsx
import React, { useState } from "react";
import dayjs from "dayjs";
import FileUpload from "./components/FileUpload";
import Dashboard from "./components/Dashboard";
import Spinner from "./components/Spinner";
import "./App.css";

const MS_TO_MIN = (ms) => (Number(ms) || 0) / 1000 / 60;

function normalizeRecord(r) {
  const ts = r.ts || r.endTime || r.time || null;
  const ms = r.ms_played ?? r.msPlayed ?? r.ms ?? 0;
  const artist =
    r.master_metadata_album_artist_name ||
    r.artistName ||
    r.artist ||
    r.episode_show_name ||
    "Unknown Artist";
  const track =
    r.master_metadata_track_name ||
    r.trackName ||
    r.episode_name ||
    r.track ||
    "Unknown Track";

  let dateObj = ts ? new Date(ts) : null;

  return {
    ts: dateObj,
    minutes: MS_TO_MIN(ms),
    artist: String(artist).trim(),
    track: String(track).trim(),
    song_artist: `${track} — ${artist}`,
  };
}

export default function App() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const handleFiles = async (filesList) => {
    setLoading(true);
    setData(null);
    setError(null);
    try {
      const files = Array.from(filesList);
      const texts = await Promise.all(files.map((f) => f.text()));
      const parsed = texts.map((t) => JSON.parse(t));

      const records = [];
      parsed.forEach((p) => {
        if (Array.isArray(p)) records.push(...p);
        else if (typeof p === "object") {
          Object.values(p)
            .filter(Array.isArray)
            .forEach((a) => records.push(...a));
        }
      });

      if (!records.length) {
        setError("No records found in the uploaded files.");
        setLoading(false);
        return;
      }

      const norm = records.map(normalizeRecord);

      // Summary
      const totalPlays = norm.length;
      const totalMinutes = norm.reduce((s, r) => s + (r.minutes || 0), 0);
      const uniqueArtists = new Set(norm.map((r) => r.artist)).size;
      const uniqueSongs = new Set(norm.map((r) => r.track)).size;

      const summary = {
        totalPlays,
        totalMinutes: Math.round(totalMinutes),
        totalHours: Math.round(totalMinutes / 60),
        uniqueArtists,
        uniqueSongs,
      };

      // Monthly aggregation
      const monthlyMap = new Map();
      norm.forEach((r) => {
        if (!r.ts) return;
        const key = `${r.ts.getFullYear()}-${String(r.ts.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
        monthlyMap.set(key, (monthlyMap.get(key) || 0) + (r.minutes || 0));
      });
      const monthly = Array.from(monthlyMap.entries())
        .sort((a, b) => new Date(a[0] + "-01") - new Date(b[0] + "-01"))
        .map(([ym, mins]) => ({ month: ym, hours: mins / 60 }));

      // Top artists & songs
      const artistMinutes = new Map();
      const artistFirst = new Map();
      const songMinutes = new Map();
      const songFirst = new Map();

      norm.forEach((r) => {
        const a = r.artist || "Unknown Artist";
        const s = r.song_artist;
        artistMinutes.set(a, (artistMinutes.get(a) || 0) + (r.minutes || 0));
        songMinutes.set(s, (songMinutes.get(s) || 0) + (r.minutes || 0));

        if (r.ts) {
          if (!artistFirst.has(a) || r.ts < artistFirst.get(a)) artistFirst.set(a, r.ts);
          if (!songFirst.has(s) || r.ts < songFirst.get(s)) songFirst.set(s, r.ts);
        }
      });

      const topArtists = Array.from(artistMinutes.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([artist, mins]) => ({
          label: `${artist} (First: ${
            artistFirst.has(artist) ? dayjs(artistFirst.get(artist)).format("MMM YYYY") : "N/A"
          })`,
          minutes: Math.round(mins),
        }));

      const topSongs = Array.from(songMinutes.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([song, mins]) => ({
          label: `${song} (First: ${
            songFirst.has(song) ? dayjs(songFirst.get(song)).format("MMM YYYY") : "N/A"
          })`,
          minutes: Math.round(mins),
        }));

      setData({ summary, monthly, topArtists, topSongs });
    } catch (err) {
      console.error(err);
      setError("An error occurred while parsing the files. Please ensure they are valid JSON.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Spotify Visualizer</h1>
      <FileUpload onFiles={handleFiles} disabled={loading} />
      {loading && <Spinner />}
      {error && <p className="error">{error}</p>}
      <Dashboard data={data} />
    </div>
  );
}
