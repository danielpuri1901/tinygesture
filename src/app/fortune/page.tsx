"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

// Animation stages using the pixel art sprites from the PDF:
// Fortune 1.png - Closed cookie (whole)
// Fortune 2.png - Cookie cracking apart with crumbs
// Fortune 3.png - Halves separating, paper strip emerging
// Fortune 5.png - Halves apart, blank paper visible
// Fortune 6.png - Halves further apart, larger paper
// Fortune 7.png - Fully open, big paper (text overlaid via clipped div)

type Stage = 0 | 1 | 2 | 3 | 4 | 5;

const SPRITES = [
  "/Fortune 1.png", // 0: closed
  "/Fortune 2.png", // 1: cracking
  "/Fortune 3.png", // 2: splitting
  "/Fortune 5.png", // 3: halves apart
  "/Fortune 6.png", // 4: more apart
  "/Fortune 7.png", // 5: fully open (message)
];

// All sprites are 1536x1024. The paper strip in Fortune 7
// sits at these coordinates (measured from the image):
// left: 27.5%, top: 35.8%, right: 75.4%, bottom: 49.2%
// We inset a bit so text doesn't touch the paper edges.
const PAPER_CLIP = {
  left: 29,
  top: 38,
  right: 74,
  bottom: 49,
};

function SmallHeart() {
  return (
    <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)" }}>
      <Image src="/heart.png" alt="" width={40} height={40} style={{ objectFit: "contain" }} />
    </div>
  );
}

export default function FortuneCookie() {
  const [stage, setStage] = useState<Stage>(0);
  const [showTapHint, setShowTapHint] = useState(true);
  const [messageRevealed, setMessageRevealed] = useState(0);

  const fortuneMessages = [
    "You're gonna have a great day",
    "Someone is thinking of you",
    "Good things are coming your way",
    "You are loved more than you know",
    "A beautiful surprise awaits you",
    "Your smile brightens someone's day",
    "The best is yet to come",
    "You make the world a better place",
    "A hug is on its way to you",
    "You deserve all the good things",
    "Today is your lucky day",
    "Something wonderful is about to happen",
    "You are stronger than you think",
    "Happiness is closer than you realize",
    "A kind word will find you soon",
    "Your heart knows the way",
    "The universe is rooting for you",
    "A new friendship is around the corner",
    "Trust the timing of your life",
    "You are exactly where you need to be",
  ];

  const [message, setMessage] = useState(() =>
    fortuneMessages[Math.floor(Math.random() * fortuneMessages.length)]
  );

  // Preload all sprites
  useEffect(() => {
    SPRITES.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, []);

  // Typewriter effect for the fortune message
  useEffect(() => {
    if (stage === 5 && messageRevealed < message.length) {
      const timer = setTimeout(() => {
        setMessageRevealed((prev) => prev + 1);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [stage, messageRevealed, message]);

  const handleTap = () => {
    if (stage >= 5) return;
    setShowTapHint(false);

    if (stage === 0) {
      setStage(1);
      setTimeout(() => setStage(2), 500);
      setTimeout(() => setStage(3), 1000);
      setTimeout(() => setStage(4), 1400);
      setTimeout(() => setStage(5), 1800);
    }
  };

  const handleReset = () => {
    setStage(0);
    setShowTapHint(true);
    setMessageRevealed(0);
    setMessage(fortuneMessages[Math.floor(Math.random() * fortuneMessages.length)]);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "#fffefa" }}
    >
      {/* Title */}
      <h1
        className="text-lg font-bold mb-16 tracking-wide"
        style={{ color: "#1a56db", fontFamily: "var(--font-anonymous-pro), 'Anonymous Pro', monospace" }}
      >
        Fortune cookie
      </h1>

      {/* Cookie container - fixed aspect ratio matches all sprites (1536x1024 = 3:2) */}
      <div
        className="relative cursor-pointer select-none"
        onClick={handleTap}
        style={{ width: "min(90vw, 360px)", aspectRatio: "1536 / 1024" }}
      >
        {/* Cookie sprite */}
        <div
          className={stage === 0 ? "animate-idle" : stage === 1 ? "animate-shake" : "animate-pop"}
          key={stage}
          style={{ width: "100%", height: "100%", position: "relative" }}
        >
          <Image
            src={SPRITES[stage]}
            alt="Fortune cookie"
            fill
            style={{
              objectFit: "contain",
              imageRendering: "pixelated",
            }}
            priority
          />

          {/* Text overlay clipped to the paper strip area */}
          {stage === 5 && (
            <div
              style={{
                position: "absolute",
                left: `${PAPER_CLIP.left}%`,
                top: `${PAPER_CLIP.top}%`,
                width: `${PAPER_CLIP.right - PAPER_CLIP.left}%`,
                height: `${PAPER_CLIP.bottom - PAPER_CLIP.top}%`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                pointerEvents: "none",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-anonymous-pro), 'Anonymous Pro', monospace",
                  fontSize: "clamp(7px, 2vw, 11px)",
                  color: "#4a4540",
                  textAlign: "center",
                  lineHeight: 1.3,
                  padding: "0 4px",
                }}
              >
                {message.slice(0, messageRevealed)}
                {messageRevealed < message.length && <span className="animate-blink">|</span>}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tap hint */}
      {showTapHint && (
        <p
          className="mt-12 text-sm animate-pulse"
          style={{ color: "#999", fontFamily: "var(--font-anonymous-pro), 'Anonymous Pro', monospace" }}
        >
          tap the cookie...
        </p>
      )}

      {/* Reset button after reveal */}
      {stage === 5 && messageRevealed >= message.length && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleReset();
          }}
          className="mt-12 px-6 py-3 rounded-xl text-sm font-medium transition-transform active:scale-95 animate-fadeIn"
          style={{
            background: "#1a56db",
            color: "white",
            fontFamily: "var(--font-anonymous-pro), 'Anonymous Pro', monospace",
          }}
        >
          Crack another one
        </button>
      )}

      <SmallHeart />

      <style jsx>{`
        .animate-idle {
          animation: idleBob 2s ease-in-out infinite;
        }

        @keyframes idleBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          15% { transform: translateX(-8px) rotate(-3deg); }
          30% { transform: translateX(6px) rotate(2deg); }
          45% { transform: translateX(-6px) rotate(-2deg); }
          60% { transform: translateX(4px) rotate(1deg); }
          75% { transform: translateX(-2px) rotate(-1deg); }
        }

        .animate-pop {
          animation: popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
