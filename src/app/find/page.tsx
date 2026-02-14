"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useRef, useState } from "react";

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

function generateCode() {
  const words = ["ROSE", "LOVE", "KISS", "HEART", "BLUSH"];
  const word = words[Math.floor(Math.random() * words.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${word}-${num}`;
}

function getUserToken() {
  let token = localStorage.getItem("tg_user_token");
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem("tg_user_token", token);
  }
  return token;
}

function formatDistance(km: number) {
  if (km < 0.01) return "Nearby";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export default function FindPage() {
  const [screen, setScreen] = useState<"home" | "connected">("home");
  const [code, setCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [myLocation, setMyLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [theirLocation, setTheirLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);
  const [copied, setCopied] = useState(false);

  const watchIdRef = useRef<number | null>(null);
  const userToken = useRef("");
  const sessionIdRef = useRef("");

  useEffect(() => {
    userToken.current = getUserToken();
  }, []);

  useEffect(() => {
    if (myLocation && theirLocation) {
      setDistance(
        haversineKm(myLocation.lat, myLocation.lon, theirLocation.lat, theirLocation.lon)
      );
    }
  }, [myLocation, theirLocation]);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  async function createSession() {
    setError("");
    const newCode = generateCode();
    const { data, error: err } = await supabase
      .from("sessions")
      .insert({ code: newCode })
      .select()
      .single();
    if (err) { setError(err.message); return; }
    setCode(newCode);
    sessionIdRef.current = data.id;
    startTracking(data.id);
    setScreen("connected");
  }

  async function joinSession() {
    setError("");
    const { data, error: err } = await supabase
      .from("sessions")
      .select()
      .eq("code", inputCode.trim().toUpperCase())
      .single();
    console.log("joinSession result:", { data, err });
    if (err || !data) { setError(err?.message ?? "Session not found — check the code and try again"); return; }
    setCode(inputCode.trim().toUpperCase());
    sessionIdRef.current = data.id;
    startTracking(data.id);
    setScreen("connected");
  }

  async function startTracking(sid: string) {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser");
      return;
    }

    // Fetch any locations already in the session (handles late joiners)
    const { data: existing } = await supabase
      .from("locations")
      .select()
      .eq("session_id", sid);
    if (existing) {
      for (const row of existing) {
        if (row.user_token !== userToken.current) {
          setTheirLocation({ lat: row.latitude, lon: row.longitude });
          setConnected(true);
        }
      }
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setMyLocation({ lat, lon });
        await supabase.from("locations").upsert(
          {
            session_id: sid,
            user_token: userToken.current,
            latitude: lat,
            longitude: lon,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "session_id,user_token" }
        );
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    supabase
      .channel(`locations-${sid}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "locations",
          filter: `session_id=eq.${sid}`,
        },
        (payload) => {
          const row = payload.new as {
            user_token: string;
            latitude: number;
            longitude: number;
          };
          if (row.user_token !== userToken.current) {
            setTheirLocation({ lat: row.latitude, lon: row.longitude });
            setConnected(true);
          }
        }
      )
      .subscribe();
  }

  function copyCode() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (screen === "home") {
    return (
      <main className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6 gap-8">
        <div className="text-center">
          <div className="text-5xl mb-3">🫶</div>
          <h1 className="text-3xl font-bold text-gray-900">Find each other</h1>
          <p className="text-gray-500 mt-2">See how close you are in real-time</p>
        </div>

        <div className="w-full max-w-sm flex flex-col gap-4">
          <button
            onClick={createSession}
            className="w-full bg-rose-500 text-white font-semibold py-4 rounded-2xl shadow-md hover:bg-rose-600 active:scale-95 transition-all"
          >
            Create a session
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-sm">or join one</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="LOVE-1234"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && joinSession()}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 font-mono uppercase tracking-widest"
            />
            <button
              onClick={joinSession}
              className="bg-gray-900 text-white font-semibold px-5 rounded-xl hover:bg-gray-700 active:scale-95 transition-all"
            >
              Join
            </button>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6 gap-8">
      <div className="text-center">
        <div className="text-5xl mb-3">{connected ? "💑" : "⏳"}</div>
        <h1 className="text-3xl font-bold text-gray-900">
          {connected ? "Connected!" : "Waiting..."}
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          {connected
            ? "Both of you are being tracked"
            : "Share the code so the other person can join"}
        </p>
      </div>

      {/* Session code */}
      <div className="w-full max-w-sm">
        <p className="text-xs text-gray-400 text-center mb-2">Session code</p>
        <button
          onClick={copyCode}
          className="w-full bg-white border border-gray-200 rounded-2xl py-4 flex items-center justify-center gap-3 shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
        >
          <span className="font-mono text-2xl font-bold text-gray-900 tracking-widest">
            {code}
          </span>
          <span className="text-gray-400 text-sm">{copied ? "Copied!" : "Copy"}</span>
        </button>
      </div>

      {/* Distance */}
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl p-8 shadow-sm text-center">
        {distance !== null ? (
          <>
            <p className="text-6xl font-bold text-rose-500 mb-2">
              {formatDistance(distance)}
            </p>
            <p className="text-gray-400 text-sm">apart from each other</p>
          </>
        ) : (
          <p className="text-gray-400">
            {connected
              ? "Waiting for GPS fix..."
              : "Waiting for the other person to join..."}
          </p>
        )}
      </div>

      {/* GPS status */}
      <div className="flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${myLocation ? "bg-green-400" : "bg-gray-300"}`} />
          <span className="text-gray-500">You</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${theirLocation ? "bg-green-400" : "bg-gray-300"}`} />
          <span className="text-gray-500">Them</span>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </main>
  );
}
