"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";

// Typewriter component
function Typewriter({
  text,
  onComplete,
  speed = 100,
}: {
  text: string;
  onComplete?: () => void;
  speed?: number;
}) {
  const [displayedText, setDisplayedText] = useState("");
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let index = 0;
    setDisplayedText("");

    const interval = setInterval(() => {
      if (index < text.length) {
        index++;
        setDisplayedText(text.slice(0, index));
      } else {
        clearInterval(interval);
        onCompleteRef.current?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return <span>{displayedText}</span>;
}

export default function EasterEgg() {
  const [showImage, setShowImage] = useState(false);
  const fontStyle = { fontFamily: "'Anonymous Pro', monospace" };

  return (
    <div
      style={{
        minHeight: "100dvh",
        backgroundColor: "#fffefa",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: "0 24px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          maxWidth: 400,
        }}
      >
        {/* Heart animation */}
        <div
          style={{
            width: 80,
            height: 80,
            marginBottom: 24,
            animation: "heartbeatContinuous 1.5s ease-in-out infinite",
          }}
        >
          <Image
            src="/heart.png"
            alt="Heart"
            width={80}
            height={80}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
            priority
          />
        </div>

        {/* Message */}
        <p
          style={{
            textAlign: "center",
            color: "#171717",
            fontSize: 18,
            lineHeight: 1.8,
            marginBottom: 32,
            ...fontStyle,
          }}
        >
          <Typewriter
            text="A tiny gesture from us to you... This hackathon was amazing! Thank you for being part of it"
            onComplete={() => setShowImage(true)}
            speed={80}
          />
        </p>

        {/* Image reveal */}
        {showImage && (
          <div
            style={{
              opacity: showImage ? 1 : 0,
              transition: "opacity 1s ease",
              width: "100%",
              maxWidth: 350,
            }}
          >
            <Image
              src="/easter-egg-image.png"
              alt="A tiny gesture for you"
              width={350}
              height={350}
              style={{
                width: "100%",
                height: "auto",
                borderRadius: 12,
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              }}
              priority
            />
          </div>
        )}
      </div>

      {/* Small heart at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <Image
          src="/heart.png"
          alt=""
          width={40}
          height={40}
          style={{ objectFit: "contain" }}
        />
      </div>
    </div>
  );
}
