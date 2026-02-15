"use client";

import Image from "next/image";
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type RecipientStep = "gesture" | "intro" | "message1" | "message2" | "circles" | "showGesture" | "end";
type CirclePhase = "hidden" | "one" | "three" | "choose";
type GestureStage = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface GestureData {
  id: string;
  voice_url: string | null;
  photo_url: string | null;
  recipient_email: string | null;
  sender_name: string | null;
}

// Gesture animation constants
const CHEST_Y = 4;
const HEART_SIZES: { w: number; h: number; y: number; visible: boolean }[] = [
  { w: 28, h: 25, y: CHEST_Y, visible: false },
  { w: 28, h: 25, y: CHEST_Y, visible: false },
  { w: 60, h: 53, y: CHEST_Y - 2, visible: true },
  { w: 90, h: 80, y: CHEST_Y - 6, visible: true },
  { w: 120, h: 107, y: CHEST_Y - 12, visible: true },
  { w: 150, h: 133, y: CHEST_Y - 18, visible: true },
  { w: 180, h: 160, y: CHEST_Y - 22, visible: true },
  { w: 200, h: 178, y: CHEST_Y - 24, visible: true },
];
const CHARACTER_OPACITY = [1, 1, 1, 1, 0.85, 0.6, 0.3, 0];

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

  const [step, setStep] = useState<RecipientStep>("gesture");
  // The order of gestures to show (dynamic)
  const [gestureOrder, setGestureOrder] = useState<Array<"voice" | "photo" | "fortune">>(["voice", "photo", "fortune"]);
  // Fortune cookie assets and logic
  const FORTUNE_SPRITES = [
    "/Fortune 1.png",
    "/Fortune 2.png",
    "/Fortune 3.png",
    "/Fortune 5.png",
    "/Fortune 6.png",
    "/Fortune 7.png",
  ];
  const FORTUNE_PAPER_CLIP = { left: 29, top: 38, right: 74, bottom: 49 };
  const FORTUNE_MESSAGES = [
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
  // FortuneCookieGesture component (inline, not exported)
  function FortuneCookieGesture({ onContinue }: { onContinue: () => void }) {
    const [stage, setStage] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
    const [showTapHint, setShowTapHint] = useState(true);
    const [messageRevealed, setMessageRevealed] = useState(0);
    const [message, setMessage] = useState(() =>
      FORTUNE_MESSAGES[Math.floor(Math.random() * FORTUNE_MESSAGES.length)]
    );
    const [spritesLoaded, setSpritesLoaded] = useState(false);

    useEffect(() => {
      let cancelled = false;
      Promise.all(
        FORTUNE_SPRITES.map(
          (src) =>
            new Promise<void>((resolve) => {
              const img = new window.Image();
              img.onload = () => resolve();
              img.onerror = () => resolve();
              img.src = src;
            })
        )
      ).then(() => {
        if (!cancelled) setSpritesLoaded(true);
      });
      return () => { cancelled = true; };
    }, []);

    useEffect(() => {
      if (stage === 5 && messageRevealed < message.length) {
        const timer = setTimeout(() => {
          setMessageRevealed((prev) => prev + 1);
        }, 50);
        return () => clearTimeout(timer);
      }
    }, [stage, messageRevealed, message]);

    const handleTap = () => {
      if (!spritesLoaded || stage >= 5) return;
      setShowTapHint(false);
      if (stage === 0) {
        setStage(1);
        setTimeout(() => setStage(2), 500);
        setTimeout(() => setStage(3), 1000);
        setTimeout(() => setStage(4), 1400);
        setTimeout(() => setStage(5), 1800);
      }
    };

    // Continue after reveal
    const canContinue = stage === 5 && messageRevealed >= message.length;

    return (
      <div style={{ width: "100%", maxWidth: 400, minHeight: 420, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <h2 style={{ color: "#1a56db", fontFamily: "var(--font-anonymous-pro), 'Anonymous Pro', monospace", fontSize: 20, marginBottom: 24, marginTop: 0 }}>Fortune cookie</h2>
        <div
          className="fortune-cookie-container"
          onClick={handleTap}
          style={{ width: "min(90vw, 320px)", aspectRatio: "1536 / 1024", position: "relative", cursor: canContinue ? "default" : "pointer" }}
        >
          <div
            className={stage === 0 ? "animate-idle" : stage === 1 ? "animate-shake" : "animate-pop"}
            key={stage}
            style={{ width: "100%", height: "100%", position: "relative" }}
          >
            <Image
              src={FORTUNE_SPRITES[stage]}
              alt="Fortune cookie"
              fill
              style={{ objectFit: "contain", imageRendering: "pixelated" }}
              priority
            />
            {stage === 5 && (
              <div
                style={{
                  position: "absolute",
                  left: `${FORTUNE_PAPER_CLIP.left}%`,
                  top: `${FORTUNE_PAPER_CLIP.top}%`,
                  width: `${FORTUNE_PAPER_CLIP.right - FORTUNE_PAPER_CLIP.left}%`,
                  height: `${FORTUNE_PAPER_CLIP.bottom - FORTUNE_PAPER_CLIP.top}%`,
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
        {showTapHint && (
          <p style={{ color: "#999", fontFamily: "var(--font-anonymous-pro), 'Anonymous Pro', monospace", marginTop: 24, fontSize: 14 }}>tap the cookie...</p>
        )}
        {canContinue && (
          <button onClick={onContinue} style={{ marginTop: 32, padding: "12px 32px", backgroundColor: "#171717", color: "white", border: "none", fontSize: 14, cursor: "pointer", borderRadius: 8, fontFamily: "var(--font-anonymous-pro), 'Anonymous Pro', monospace" }}>
            Continue
          </button>
        )}
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
  const [currentGestureIdx, setCurrentGestureIdx] = useState(0);
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

  // Gesture animation state
  const [gestureStage, setGestureStage] = useState<GestureStage>(0);
  const [gestureImagesLoaded, setGestureImagesLoaded] = useState(false);
  const [gestureAnimationDone, setGestureAnimationDone] = useState(false);

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

  // Preload gesture animation images
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
      if (!cancelled) setGestureImagesLoaded(true);
    });
    return () => { cancelled = true; };
  }, []);

  // Run gesture animation once images and data are loaded
  const runGestureAnimation = useCallback(() => {
    if (!gestureImagesLoaded || loading) return;

    const timings = [0, 800, 1600, 2200, 2700, 3200, 3700, 4200];
    timings.forEach((ms, i) => {
      if (i > 0) {
        setTimeout(() => setGestureStage(i as GestureStage), ms);
      }
    });
    setTimeout(() => setGestureAnimationDone(true), 4600);
  }, [gestureImagesLoaded, loading]);

  useEffect(() => {
    if (step === "gesture") {
      runGestureAnimation();
    }
  }, [step, runGestureAnimation]);

  // Transition from gesture animation to intro after pulse
  useEffect(() => {
    if (!gestureAnimationDone) return;

    const timer = setTimeout(() => {
      setFadeState("out");
      setTimeout(() => {
        setStep("intro");
        setFadeState("in");
      }, 500);
    }, 2500); // pulse for 2.5s then transition

    return () => clearTimeout(timer);
  }, [gestureAnimationDone]);

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

    const timer0 = setTimeout(() => {
      setCirclePhase("one");
    }, 0);

    const timer1 = setTimeout(() => {
      setCircleText("Nevermind here are three...!!");
      setCirclePhase("three");
    }, 2500);

    const timer2 = setTimeout(() => {
      setCircleText("Choose one carefully...!!!");
      setCirclePhase("choose");
    }, 5000);

    return () => {
      clearTimeout(timer0);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [step, typewriterDone]);


  // Handle gesture selection (start the sequence with correct order)
  const handleGestureSelect = (choice: "voice" | "photo" | "fortune") => {
    // Determine the order based on the first choice
    let order: Array<"voice" | "photo" | "fortune"> = [];
    if (choice === "photo") {
      order = ["photo", "voice", "fortune"];
    } else if (choice === "voice") {
      order = ["voice", "photo", "fortune"];
    } else if (choice === "fortune") {
      order = ["fortune", "photo", "voice"];
    }
    setFadeState("out");
    setTimeout(() => {
      setGestureOrder(order);
      setStep("showGesture");
      setFadeState("in");
      setTypewriterDone(false);
      setCurrentGestureIdx(0);
    }, 500);
  };

  // Continue to next gesture or end
  const handleContinue = () => {
    setFadeState("out");
    setTimeout(() => {
      if (currentGestureIdx < gestureOrder.length - 1) {
        setCurrentGestureIdx((idx) => idx + 1);
        setStep("showGesture");
        setFadeState("in");
        setTypewriterDone(false);
      } else {
        setStep("end");
        setFadeState("in");
      }
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

  const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    console.error("Audio playback error:", e);
    setAudioPlaying(false);
    alert("Unable to play audio. The format may not be supported on this device.");
  };

  // No longer needed: goToPhoto, goToEnd

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

  if (loading && step !== "gesture") {
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

  if (!loading && !gesture) {
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
      {/* GESTURE ANIMATION STEP */}
      {step === "gesture" && (
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
          {/* Character + Heart container */}
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 200,
              height: 220,
            }}
          >
            {/* Character */}
            <div
              style={{
                position: "absolute",
                transition: "opacity 0.5s ease",
                opacity: CHARACTER_OPACITY[gestureStage],
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
                style={{ objectFit: "contain", imageRendering: "pixelated" }}
                priority
              />
            </div>

            {/* Heart - grows via width/height */}
            <div
              className={gestureAnimationDone ? "gesture-heart-pulse" : ""}
              style={{
                position: "absolute",
                transition: "width 0.5s ease-out, height 0.5s ease-out, top 0.5s ease-out, opacity 0.3s ease",
                width: HEART_SIZES[gestureStage].w,
                height: HEART_SIZES[gestureStage].h,
                top: `calc(50% + ${HEART_SIZES[gestureStage].y}px)`,
                left: "50%",
                transform: "translate(-50%, -50%)",
                opacity: HEART_SIZES[gestureStage].visible ? 1 : 0,
                zIndex: gestureStage >= 2 ? 2 : 0,
              }}
            >
              <Image
                src="/PNG heart.png"
                alt="Heart"
                fill
                unoptimized
                style={{ objectFit: "contain", imageRendering: "pixelated" }}
                priority
              />
            </div>
          </div>

          {/* Text */}
          <div style={{ marginTop: 24, textAlign: "center", minHeight: 30 }}>
            {gestureStage <= 6 && (
              <p
                style={{
                  fontSize: 16,
                  color: "#171717",
                  transition: "opacity 0.4s ease",
                  opacity: gestureImagesLoaded && !loading ? 1 : 0,
                  ...fontStyle,
                }}
              >
                {gesture?.sender_name || "Someone"} sends you ......
              </p>
            )}
            {gestureStage === 7 && (
              <p
                className="gesture-fade-in"
                style={{ fontSize: 16, color: "#171717", ...fontStyle }}
              >
                A Tiny Gesture...
              </p>
            )}
          </div>
        </div>
      )}

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
            {/* Each circle starts the sequence with its own order */}
            <div
              style={getCircleStyle(0)}
              onClick={() => circlePhase === "choose" && handleGestureSelect("voice")}
              role={circlePhase === "choose" ? "button" : undefined}
            >
              <div style={{ opacity: circlePhase === "choose" ? 1 : 0, transition: "opacity 0.4s ease 0.3s" }}>
                <MicrophoneIcon />
              </div>
            </div>
            <div
              style={getCircleStyle(1)}
              onClick={() => circlePhase === "choose" && handleGestureSelect("photo")}
              role={circlePhase === "choose" ? "button" : undefined}
            >
              <div style={{ opacity: circlePhase === "choose" ? 1 : 0, transition: "opacity 0.4s ease 0.3s" }}>
                <CameraIcon />
              </div>
            </div>
            <div
              style={getCircleStyle(2)}
              onClick={() => circlePhase === "choose" && handleGestureSelect("fortune")}
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


      {/* SHOW GESTURE STEP (voice, photo, heart) */}
      {step === "showGesture" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", maxWidth: 400, opacity: fadeState === "in" ? 1 : 0, transition: "opacity 0.5s ease" }}>
          {gestureOrder[currentGestureIdx] === "voice" && (
            <>
              <p style={{ textAlign: "center", color: "#171717", fontSize: 18, lineHeight: 1.6, marginBottom: 32, ...fontStyle }}>
                <Typewriter text="Listen to their message..." onComplete={() => setTypewriterDone(true)} speed={100} />
              </p>
              {typewriterDone && gesture?.voice_url && (
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
                  <audio ref={audioRef} src={gesture?.voice_url} onEnded={handleAudioEnded} onError={handleAudioError} />
                </div>
              )}
              {typewriterDone && !gesture?.voice_url && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                  <p style={{ color: "#666", fontSize: 14, ...fontStyle }}>No voice message yet</p>
                </div>
              )}
              {typewriterDone && (
                <button onClick={handleContinue} style={{ marginTop: 32, padding: "12px 32px", backgroundColor: "#171717", color: "white", border: "none", fontSize: 14, cursor: "pointer", ...fontStyle }}>
                  Continue
                </button>
              )}
            </>
          )}
          {gestureOrder[currentGestureIdx] === "photo" && (
            <>
              <p style={{ textAlign: "center", color: "#171717", fontSize: 18, lineHeight: 1.6, marginBottom: 24, ...fontStyle }}>
                <Typewriter text="They wanted to show you this..." onComplete={() => setTypewriterDone(true)} speed={100} />
              </p>
              {typewriterDone && gesture?.photo_url && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
                  <img src={gesture?.photo_url} alt="A tiny gesture for you" style={{ width: "100%", maxWidth: 300, borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                </div>
              )}
              {typewriterDone && !gesture?.photo_url && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                  <p style={{ color: "#666", fontSize: 14, ...fontStyle }}>No photo yet</p>
                </div>
              )}
              {typewriterDone && (
                <button onClick={handleContinue} style={{ marginTop: 32, padding: "12px 32px", backgroundColor: "#171717", color: "white", border: "none", fontSize: 14, cursor: "pointer", ...fontStyle }}>
                  Continue
                </button>
              )}
            </>
          )}
          {gestureOrder[currentGestureIdx] === "fortune" && (
            <FortuneCookieGesture onContinue={handleContinue} />
          )}
          <SmallHeart />
        </div>
      )}

      {/* END STEP */}
      {step === "end" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", maxWidth: 400, opacity: fadeState === "in" ? 1 : 0, transition: "opacity 0.5s ease" }}>
          <Link href="/" style={{ marginTop: 32, padding: "12px 32px", backgroundColor: "#171717", color: "white", border: "none", fontSize: 14, cursor: "pointer", textDecoration: "none", ...fontStyle }}>
            Send them one back
          </Link>
          <SmallHeart />
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .gesture-heart-pulse {
          animation: gestureHeartPulse 1.2s ease-in-out infinite !important;
          transition: none !important;
        }

        @keyframes gestureHeartPulse {
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

        .gesture-fade-in {
          animation: gestureFadeIn 0.8s ease-out forwards;
        }

        @keyframes gestureFadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
