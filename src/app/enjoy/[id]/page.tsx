"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type RecipientStep = "intro" | "message1" | "message2" | "circles" | "voice" | "photo" | "end";
type CirclePhase = "hidden" | "one" | "three" | "choose";

interface GestureData {
  id: string;
  voice_url: string | null;
  photo_url: string | null;
  recipient_email: string | null;
}

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

// Small decorative heart at bottom
function SmallHeart() {
  return (
    <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)" }}>
      <Image
        src="/heart.png"
        alt=""
        width={40}
        height={40}
        style={{ objectFit: "contain" }}
      />
    </div>
  );
}

// 8-bit Microphone Icon
function MicrophoneIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 16 16" fill="white">
      <rect x="6" y="2" width="4" height="7" fill="white" />
      <rect x="5" y="9" width="6" height="1" fill="white" />
      <rect x="4" y="7" width="1" height="3" fill="white" />
      <rect x="11" y="7" width="1" height="3" fill="white" />
      <rect x="7" y="10" width="2" height="2" fill="white" />
      <rect x="5" y="12" width="6" height="2" fill="white" />
    </svg>
  );
}

// 8-bit Camera Icon
function CameraIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 16 16" fill="white">
      <rect x="2" y="5" width="12" height="9" fill="white" />
      <rect x="5" y="3" width="6" height="2" fill="white" />
      <rect x="6" y="7" width="4" height="4" fill="black" />
      <rect x="7" y="8" width="2" height="2" fill="white" />
    </svg>
  );
}

// 8-bit Heart Icon
function HeartIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 16 16" fill="white">
      <rect x="2" y="4" width="3" height="2" fill="white" />
      <rect x="5" y="3" width="2" height="1" fill="white" />
      <rect x="9" y="3" width="2" height="1" fill="white" />
      <rect x="11" y="4" width="3" height="2" fill="white" />
      <rect x="1" y="6" width="5" height="2" fill="white" />
      <rect x="10" y="6" width="5" height="2" fill="white" />
      <rect x="2" y="8" width="12" height="2" fill="white" />
      <rect x="3" y="10" width="10" height="2" fill="white" />
      <rect x="5" y="12" width="6" height="2" fill="white" />
      <rect x="7" y="14" width="2" height="1" fill="white" />
    </svg>
  );
}

export default function EnjoyGesture() {
  const params = useParams();
  const gestureId = params.id as string;

  const [step, setStep] = useState<RecipientStep>("intro");
  const [fadeState, setFadeState] = useState<"in" | "out">("in");
  const [typewriterDone, setTypewriterDone] = useState(false);
  const [gesture, setGesture] = useState<GestureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Circle animation state
  const [circlePhase, setCirclePhase] = useState<CirclePhase>("hidden");
  const [circleText, setCircleText] = useState("Here is a Tiny Gesture");
  const circleAnimationStarted = useRef(false);

  const fontStyle = { fontFamily: "'Anonymous Pro', monospace" };

  // Fetch gesture data
  useEffect(() => {
    const fetchGesture = async () => {
      if (!gestureId) return;

      const { data, error } = await supabase
        .from("gestures")
        .select("*")
        .eq("id", gestureId)
        .single();

      if (error) {
        console.error("Error fetching gesture:", error);
      } else {
        setGesture(data);
      }
      setLoading(false);
    };

    fetchGesture();
  }, [gestureId]);

  // Handle step transitions
  useEffect(() => {
    if (!typewriterDone) return;

    if (step === "intro") {
      const timer = setTimeout(() => {
        setFadeState("out");
        setTimeout(() => {
          setStep("message1");
          setFadeState("in");
          setTypewriterDone(false);
        }, 500);
      }, 2000);
      return () => clearTimeout(timer);
    }

    if (step === "message1") {
      const timer = setTimeout(() => {
        setFadeState("out");
        setTimeout(() => {
          setStep("message2");
          setFadeState("in");
          setTypewriterDone(false);
        }, 500);
      }, 2000);
      return () => clearTimeout(timer);
    }

    if (step === "message2") {
      const timer = setTimeout(() => {
        setFadeState("out");
        setTimeout(() => {
          setStep("circles");
          setFadeState("in");
          setTypewriterDone(false);
          setCircleText("Here is a Tiny Gesture");
        }, 500);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [typewriterDone, step]);

  // Handle circle phase transitions
  useEffect(() => {
    if (step !== "circles") return;
    if (!typewriterDone) return;
    if (circleAnimationStarted.current) return;

    circleAnimationStarted.current = true;
    setCirclePhase("one");

    const timer1 = setTimeout(() => {
      setCircleText("Nevermind here are three...!!");
      setCirclePhase("three");
    }, 2500);

    const timer2 = setTimeout(() => {
      setCircleText("Choose one carefully...!!!");
      setCirclePhase("choose");
    }, 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [step, typewriterDone]);

  // Handle gesture selection
  const handleGestureSelect = (choice: "voice" | "photo" | "end") => {
    setFadeState("out");
    setTimeout(() => {
      setStep(choice);
      setFadeState("in");
      setTypewriterDone(false);
    }, 500);
  };

  // Play audio
  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setAudioPlaying(true);
    }
  };

  const handleAudioEnded = () => {
    setAudioPlaying(false);
  };

  const goToPhoto = () => {
    setFadeState("out");
    setTimeout(() => {
      setStep("photo");
      setFadeState("in");
      setTypewriterDone(false);
    }, 500);
  };

  const goToEnd = () => {
    setFadeState("out");
    setTimeout(() => {
      setStep("end");
      setFadeState("in");
    }, 500);
  };

  // Circle styles
  const getCircleStyle = (index: 0 | 1 | 2): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      width: 70,
      height: 70,
      borderRadius: "50%",
      backgroundColor: "#171717",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
      cursor: circlePhase === "choose" ? "pointer" : "default",
      position: "absolute" as const,
    };

    if (circlePhase === "hidden" || circlePhase === "one") {
      return {
        ...baseStyle,
        transform: "translateX(0)",
        zIndex: index === 1 ? 3 : index === 0 ? 2 : 1,
      };
    }

    if (circlePhase === "three") {
      const offset = index === 0 ? -90 : index === 2 ? 90 : 0;
      return { ...baseStyle, transform: `translateX(${offset}px)`, zIndex: 1 };
    }

    if (circlePhase === "choose") {
      const offset = index === 0 ? -110 : index === 2 ? 110 : 0;
      return { ...baseStyle, transform: `translateX(${offset}px)`, zIndex: 1 };
    }

    return baseStyle;
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          backgroundColor: "#fffefa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            animation: "heartbeatContinuous 1.5s ease-in-out infinite",
          }}
        >
          <Image src="/heart.png" alt="Loading" width={60} height={60} style={{ objectFit: "contain" }} />
        </div>
      </div>
    );
  }

  if (!gesture) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          backgroundColor: "#fffefa",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 24px",
        }}
      >
        <p style={{ color: "#171717", fontSize: 18, ...fontStyle }}>Gesture not found...</p>
        <SmallHeart />
      </div>
    );
  }

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
      {/* INTRO STEP */}
      {step === "intro" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: fadeState === "in" ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        >
          <div style={{ width: 100, height: 100, animation: "heartbeatContinuous 1.5s ease-in-out infinite" }}>
            <Image src="/heart.png" alt="Heart" width={100} height={100} style={{ width: "100%", height: "100%", objectFit: "contain" }} priority />
          </div>
          <h1 style={{ marginTop: 32, fontSize: 20, textAlign: "center", color: "#171717", ...fontStyle }}>
            <Typewriter text="A Tiny Gesture..." onComplete={() => setTypewriterDone(true)} speed={150} />
          </h1>
        </div>
      )}

      {/* MESSAGE 1 */}
      {step === "message1" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", maxWidth: 400, opacity: fadeState === "in" ? 1 : 0, transition: "opacity 0.5s ease" }}>
          <p style={{ textAlign: "center", color: "#171717", fontSize: 18, lineHeight: 1.6, ...fontStyle }}>
            <Typewriter text="Someone is thinking about you today..." onComplete={() => setTypewriterDone(true)} speed={100} />
          </p>
          <SmallHeart />
        </div>
      )}

      {/* MESSAGE 2 */}
      {step === "message2" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", maxWidth: 400, opacity: fadeState === "in" ? 1 : 0, transition: "opacity 0.5s ease" }}>
          <p style={{ textAlign: "center", color: "#171717", fontSize: 18, lineHeight: 1.6, ...fontStyle }}>
            <Typewriter text="And they wanted to give you something special..." onComplete={() => setTypewriterDone(true)} speed={100} />
          </p>
          <SmallHeart />
        </div>
      )}

      {/* CIRCLES STEP */}
      {step === "circles" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", maxWidth: 400, opacity: fadeState === "in" ? 1 : 0, transition: "opacity 0.5s ease" }}>
          <p style={{ textAlign: "center", color: "#171717", fontSize: 18, lineHeight: 1.6, marginBottom: 8, minHeight: 30, ...fontStyle }}>
            {circlePhase === "hidden" ? (
              <Typewriter text={circleText} onComplete={() => setTypewriterDone(true)} speed={100} />
            ) : (
              circleText
            )}
          </p>

          <div style={{ position: "relative", width: 300, height: 70, marginTop: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {/* Left circle - Voice */}
            <div
              style={getCircleStyle(0)}
              onClick={() => circlePhase === "choose" && handleGestureSelect("voice")}
              role={circlePhase === "choose" ? "button" : undefined}
            >
              <div style={{ opacity: circlePhase === "choose" ? 1 : 0, transition: "opacity 0.4s ease 0.3s" }}>
                <MicrophoneIcon />
              </div>
            </div>

            {/* Middle circle - Photo */}
            <div
              style={getCircleStyle(1)}
              onClick={() => circlePhase === "choose" && handleGestureSelect("photo")}
              role={circlePhase === "choose" ? "button" : undefined}
            >
              <div style={{ opacity: circlePhase === "choose" ? 1 : 0, transition: "opacity 0.4s ease 0.3s" }}>
                <CameraIcon />
              </div>
            </div>

            {/* Right circle - Heart/End */}
            <div
              style={getCircleStyle(2)}
              onClick={() => circlePhase === "choose" && handleGestureSelect("end")}
              role={circlePhase === "choose" ? "button" : undefined}
            >
              <div style={{ opacity: circlePhase === "choose" ? 1 : 0, transition: "opacity 0.4s ease 0.3s" }}>
                <HeartIcon />
              </div>
            </div>
          </div>

          <SmallHeart />
        </div>
      )}

      {/* VOICE STEP */}
      {step === "voice" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", maxWidth: 400, opacity: fadeState === "in" ? 1 : 0, transition: "opacity 0.5s ease" }}>
          <p style={{ textAlign: "center", color: "#171717", fontSize: 18, lineHeight: 1.6, marginBottom: 32, ...fontStyle }}>
            <Typewriter text="Listen to their message..." onComplete={() => setTypewriterDone(true)} speed={100} />
          </p>

          {typewriterDone && gesture.voice_url && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <button
                onClick={playAudio}
                disabled={audioPlaying}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  backgroundColor: audioPlaying ? "#ef4444" : "#171717",
                  border: "none",
                  cursor: audioPlaying ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: audioPlaying ? "pulse 1s ease-in-out infinite" : "none",
                }}
              >
                <svg width="40" height="40" viewBox="0 0 16 16" fill="white">
                  {audioPlaying ? (
                    <>
                      <rect x="2" y="6" width="2" height="4" fill="white" />
                      <rect x="5" y="4" width="2" height="8" fill="white" />
                      <rect x="8" y="2" width="2" height="12" fill="white" />
                      <rect x="11" y="5" width="2" height="6" fill="white" />
                    </>
                  ) : (
                    <polygon points="4,2 14,8 4,14" fill="white" />
                  )}
                </svg>
              </button>
              <p style={{ color: "#666", fontSize: 14, ...fontStyle }}>{audioPlaying ? "Playing..." : "Tap to play"}</p>
              <audio ref={audioRef} src={gesture.voice_url} onEnded={handleAudioEnded} />
              <button onClick={goToPhoto} style={{ marginTop: 16, padding: "12px 32px", backgroundColor: "#171717", color: "white", border: "none", fontSize: 14, cursor: "pointer", ...fontStyle }}>
                See their photo
              </button>
            </div>
          )}

          {typewriterDone && !gesture.voice_url && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <p style={{ color: "#666", fontSize: 14, ...fontStyle }}>No voice message yet</p>
              <button onClick={goToPhoto} style={{ padding: "12px 32px", backgroundColor: "#171717", color: "white", border: "none", fontSize: 14, cursor: "pointer", ...fontStyle }}>
                See their photo
              </button>
            </div>
          )}

          <SmallHeart />
        </div>
      )}

      {/* PHOTO STEP */}
      {step === "photo" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", maxWidth: 400, opacity: fadeState === "in" ? 1 : 0, transition: "opacity 0.5s ease" }}>
          <p style={{ textAlign: "center", color: "#171717", fontSize: 18, lineHeight: 1.6, marginBottom: 24, ...fontStyle }}>
            <Typewriter text="They wanted to show you this..." onComplete={() => setTypewriterDone(true)} speed={100} />
          </p>

          {typewriterDone && gesture.photo_url && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
              <img src={gesture.photo_url} alt="A tiny gesture for you" style={{ width: "100%", maxWidth: 300, borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
              <button onClick={goToEnd} style={{ padding: "12px 32px", backgroundColor: "#171717", color: "white", border: "none", fontSize: 14, cursor: "pointer", ...fontStyle }}>
                Continue
              </button>
            </div>
          )}

          {typewriterDone && !gesture.photo_url && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <p style={{ color: "#666", fontSize: 14, ...fontStyle }}>No photo yet</p>
              <button onClick={goToEnd} style={{ padding: "12px 32px", backgroundColor: "#171717", color: "white", border: "none", fontSize: 14, cursor: "pointer", ...fontStyle }}>
                Continue
              </button>
            </div>
          )}

          <SmallHeart />
        </div>
      )}

      {/* END STEP */}
      {step === "end" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", maxWidth: 400, opacity: fadeState === "in" ? 1 : 0, transition: "opacity 0.5s ease" }}>
          <div style={{ width: 80, height: 80, marginBottom: 24 }}>
            <Image src="/heart.png" alt="Heart" width={80} height={80} style={{ objectFit: "contain" }} />
          </div>
          <p style={{ textAlign: "center", color: "#171717", fontSize: 18, lineHeight: 1.6, ...fontStyle }}>
            <Typewriter text="Someone loves you very much..." speed={100} />
          </p>
          <a href="/" style={{ marginTop: 32, padding: "12px 32px", backgroundColor: "#171717", color: "white", border: "none", fontSize: 14, cursor: "pointer", textDecoration: "none", ...fontStyle }}>
            Send them one back
          </a>
          <SmallHeart />
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
