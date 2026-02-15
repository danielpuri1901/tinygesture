"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

// Animation sequence from PDF pages 1-8:
// Slides 1-2: Character with small heart on shirt, "{name} sends you ......"
// Slide 3: Heart starts growing, held in front
// Slides 4-7: Heart grows progressively, engulfing the character
// Slide 8: Just the heart, "A Tiny Gesture..." — then pulse forever

type Stage = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

// Heart size in px at each stage (not using scale to avoid distortion)
// y offset is relative to the character's chest (where the shirt heart is)
const CHEST_Y = 4; // chest position offset from center (just slightly below)
const HEART_SIZES: { w: number; h: number; y: number; visible: boolean }[] = [
  { w: 28, h: 25, y: CHEST_Y, visible: false },    // 0: hidden (on shirt)
  { w: 28, h: 25, y: CHEST_Y, visible: false },    // 1: still hidden
  { w: 60, h: 53, y: CHEST_Y - 2, visible: true }, // 2: emerges from chest
  { w: 90, h: 80, y: CHEST_Y - 6, visible: true }, // 3: growing bigger
  { w: 120, h: 107, y: CHEST_Y - 12, visible: true },  // 4: almost covering
  { w: 150, h: 133, y: CHEST_Y - 18, visible: true },  // 5: bigger still
  { w: 180, h: 160, y: CHEST_Y - 22, visible: true },  // 6: huge
  { w: 200, h: 178, y: CHEST_Y - 24, visible: true },  // 7: just heart
];

const CHARACTER_OPACITY = [1, 1, 1, 1, 0.85, 0.6, 0.3, 0];

export default function GesturePage() {
  const params = useParams();
  const gestureId = params.id as string;

  const [stage, setStage] = useState<Stage>(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [animationDone, setAnimationDone] = useState(false);
  const [senderName, setSenderName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch sender name from Supabase
  useEffect(() => {
    if (!gestureId) return;

    const fetchGesture = async () => {
      const { data } = await supabase
        .from("gestures")
        .select("sender_name")
        .eq("id", gestureId)
        .single();

      setSenderName(data?.sender_name || "Someone");
      setLoading(false);
    };

    fetchGesture();
  }, [gestureId]);

  // Preload images
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      ["/character.png", "/PNG heart.png"].map(
        (src) =>
          new Promise<void>((resolve) => {
            const img = new window.Image();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = src;
          })
      )
    ).then(() => {
      if (!cancelled) setImagesLoaded(true);
    });
    return () => { cancelled = true; };
  }, []);

  // Auto-play the animation once images AND data are loaded
  const runAnimation = useCallback(() => {
    if (!imagesLoaded || loading) return;

    const timings = [0, 800, 1600, 2200, 2700, 3200, 3700, 4200];
    timings.forEach((ms, i) => {
      if (i > 0) {
        setTimeout(() => setStage(i as Stage), ms);
      }
    });
    setTimeout(() => setAnimationDone(true), 4600);
  }, [imagesLoaded, loading]);

  useEffect(() => {
    runAnimation();
  }, [runAnimation]);

  const heartStage = HEART_SIZES[stage];
  const charOpacity = CHARACTER_OPACITY[stage];
  const showText = stage <= 6;
  const showFinalText = stage === 7;
  const ready = imagesLoaded && !loading;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "#fffefa" }}
    >
      {/* Character + Heart container */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: 200, height: 220 }}
      >
        {/* Character - fixed size, never changes dimensions */}
        <div
          style={{
            position: "absolute",
            transition: "opacity 0.5s ease",
            opacity: charOpacity,
            zIndex: 1,
            width: 120,
            height: 160,
          }}
        >
          <Image
            src="/character.png"
            alt="Character"
            width={120}
            height={160}
            unoptimized
            style={{
              objectFit: "contain",
              imageRendering: "pixelated",
            }}
            priority
          />
        </div>

        {/* Heart - grows via width/height, not scale */}
        <div
          className={animationDone ? "heart-pulse" : ""}
          style={{
            position: "absolute",
            transition: "width 0.5s ease-out, height 0.5s ease-out, top 0.5s ease-out, opacity 0.3s ease",
            width: heartStage.w,
            height: heartStage.h,
            top: `calc(50% + ${heartStage.y}px)`,
            left: "50%",
            transform: "translate(-50%, -50%)",
            opacity: heartStage.visible ? 1 : 0,
            zIndex: stage >= 2 ? 2 : 0,
          }}
        >
          <Image
            src="/PNG heart.png"
            alt="Heart"
            fill
            unoptimized
            style={{
              objectFit: "contain",
              imageRendering: "pixelated",
            }}
            priority
          />
        </div>
      </div>

      {/* Text */}
      <div className="mt-6 text-center" style={{ minHeight: 30 }}>
        {showText && (
          <p
            style={{
              fontFamily: "var(--font-anonymous-pro), 'Anonymous Pro', monospace",
              fontSize: 16,
              color: "#171717",
              transition: "opacity 0.4s ease",
              opacity: ready ? 1 : 0,
            }}
          >
            {senderName} sends you ......
          </p>
        )}
        {showFinalText && (
          <p
            className="animate-fadeIn"
            style={{
              fontFamily: "var(--font-anonymous-pro), 'Anonymous Pro', monospace",
              fontSize: 16,
              color: "#171717",
            }}
          >
            A Tiny Gesture...
          </p>
        )}
      </div>

      <style jsx>{`
        .heart-pulse {
          animation: heartPulse 1.2s ease-in-out infinite !important;
          transition: none !important;
        }

        @keyframes heartPulse {
          0%, 100% {
            width: 200px;
            height: 178px;
            top: calc(50% + -6px);
          }
          50% {
            width: 220px;
            height: 196px;
            top: calc(50% + -10px);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }

        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
