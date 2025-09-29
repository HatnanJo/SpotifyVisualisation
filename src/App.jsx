// src/App.jsx
import React, { useState } from "react";
import Plot from "react-plotly.js";
import dayjs from "dayjs";

const MS_TO_MIN = (ms) => (Number(ms) || 0) / 1000 / 60;

function formatInt(n) {
  return (typeof n === "number" ? Math.round(n) : n).toLocaleString();
}

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
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [topSongs, setTopSongs] = useState([]);

  const handleFiles = async (filesList) => {
    setLoading(true);
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
        alert("No records found in files.");
        setLoading(false);
        return;
      }

      const norm = records.map(normalizeRecord);

      // Summary
      const totalPlays = norm.length;
      const totalMinutes = norm.reduce((s, r) => s + (r.minutes || 0), 0);
      const uniqueArtists = new Set(norm.map((r) => r.artist)).size;
      const uniqueSongs = new Set(norm.map((r) => r.track)).size;

      setSummary({
        totalPlays,
        totalMinutes: Math.round(totalMinutes),
        totalHours: Math.round(totalMinutes / 60),
        uniqueArtists,
        uniqueSongs,
      });

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
      const monthlyArr = Array.from(monthlyMap.entries())
        .sort((a, b) => new Date(a[0] + "-01") - new Date(b[0] + "-01"))
        .map(([ym, mins]) => ({ month: ym, hours: mins / 60 }));
      setMonthly(monthlyArr);

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

      const topArtistsArr = Array.from(artistMinutes.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 50)
        .map(([artist, mins]) => ({
          label: `${artist} (First: ${
            artistFirst.has(artist) ? dayjs(artistFirst.get(artist)).format("MMM YYYY") : "N/A"
          })`,
          minutes: Math.round(mins),
        }));

      const topSongsArr = Array.from(songMinutes.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 50)
        .map(([song, mins]) => ({
          label: `${song} (First: ${
            songFirst.has(song) ? dayjs(songFirst.get(song)).format("MMM YYYY") : "N/A"
          })`,
          minutes: Math.round(mins),
        }));

      setTopArtists(topArtistsArr);
      setTopSongs(topSongsArr);
    } catch (err) {
      console.error(err);
      alert("Error parsing files.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", color: "#222" }}>
      <h1>Spotify Visualizer</h1>
      <input type="file" multiple accept=".json" onChange={(e) => handleFiles(e.target.files)} />
      {loading && <p>Parsing files...</p>}

      {summary && (
        <div>
          <h2>Summary</h2>
          <ul>
            <li>Total plays: {formatInt(summary.totalPlays)}</li>
            <li>Total minutes: {formatInt(summary.totalMinutes)}</li>
            <li>Total hours: {formatInt(summary.totalHours)}</li>
            <li>Unique artists: {formatInt(summary.uniqueArtists)}</li>
            <li>Unique songs: {formatInt(summary.uniqueSongs)}</li>
          </ul>
        </div>
      )}

      {monthly.length > 0 && (
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
            layout={{ height: 400, margin: { l: 50, r: 30, t: 30, b: 50 } }}
          />
        </div>
      )}

      {topArtists.length > 0 && (
        <div>
          <h2>Top 50 Artists</h2>
          <Plot
            data={[
              {
                x: topArtists.map((a) => a.minutes),
                y: topArtists.map((a) => a.label),
                type: "bar",
                orientation: "h",
              },
            ]}
            layout={{ height: 50 * topArtists.length, margin: { l: 300 } }}
          />
        </div>
      )}

      {topSongs.length > 0 && (
        <div>
          <h2>Top 50 Songs</h2>
          <Plot
            data={[
              {
                x: topSongs.map((s) => s.minutes),
                y: topSongs.map((s) => s.label),
                type: "bar",
                orientation: "h",
              },
            ]}
            layout={{ height: 50 * topSongs.length, margin: { l: 300 } }}
          />
        </div>
      )}
    </div>
  );
}