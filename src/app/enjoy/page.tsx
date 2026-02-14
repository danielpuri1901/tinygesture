"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";

// Types
type RecipientStep =
  | "intro"
  | "message1"
  | "message2"
  | "circles"
  | "gesture1"
  | "gesture2"
  | "gesture3";

type CirclePhase = "hidden" | "one" | "three" | "choose";

// Typewriter component - identical to sender
function Typewriter({
  text,
  onComplete,
  speed = 100,
  showDots = true,
}: {
  text: string;
  onComplete?: () => void;
  speed?: number;
  showDots?: boolean;
}) {
  const [displayedText, setDisplayedText] = useState("");
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const fullText = showDots ? text + "..." : text;
    let index = 0;
    setDisplayedText("");

    const interval = setInterval(() => {
      if (index < fullText.length) {
        index++;
        setDisplayedText(fullText.slice(0, index));
      } else {
        clearInterval(interval);
        onCompleteRef.current?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, showDots]);

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

// 8-bit Compass Icon
function CompassIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 16 16" fill="white">
      <rect x="4" y="2" width="8" height="1" fill="white" />
      <rect x="3" y="3" width="1" height="1" fill="white" />
      <rect x="12" y="3" width="1" height="1" fill="white" />
      <rect x="2" y="4" width="1" height="8" fill="white" />
      <rect x="13" y="4" width="1" height="8" fill="white" />
      <rect x="3" y="12" width="1" height="1" fill="white" />
      <rect x="12" y="12" width="1" height="1" fill="white" />
      <rect x="4" y="13" width="8" height="1" fill="white" />
      <rect x="7" y="4" width="2" height="3" fill="white" />
      <rect x="6" y="7" width="4" height="2" fill="white" />
    </svg>
  );
}

// Animated circles component that transitions through phases
function AnimatedCircles({
  phase,
  onSelect,
}: {
  phase: CirclePhase;
  onSelect: (gesture: 1 | 2 | 3) => void;
}) {
  const isClickable = phase === "choose";

  // Circle positions based on phase - all circles always visible, just repositioned
  const getCircleStyle = (index: 0 | 1 | 2) => {
    const baseStyle: React.CSSProperties = {
      width: 70,
      height: 70,
      borderRadius: "50%",
      backgroundColor: "#171717",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
      cursor: isClickable ? "pointer" : "default",
      position: "absolute" as const,
    };

    // Calculate horizontal offset based on phase
    // In "hidden" and "one" - all stacked in center
    // In "three" - spread with small gap
    // In "choose" - spread with larger gap and icons

    if (phase === "hidden" || phase === "one") {
      // All circles stacked in center
      return {
        ...baseStyle,
        transform: "translateX(0)",
        zIndex: index === 1 ? 3 : index === 0 ? 2 : 1,
      };
    }

    if (phase === "three") {
      // Spread apart with small gaps
      const offset = index === 0 ? -90 : index === 2 ? 90 : 0;
      return {
        ...baseStyle,
        transform: `translateX(${offset}px)`,
        zIndex: 1,
      };
    }

    if (phase === "choose") {
      // Spread apart with larger gaps for icons
      const offset = index === 0 ? -110 : index === 2 ? 110 : 0;
      return {
        ...baseStyle,
        transform: `translateX(${offset}px)`,
        zIndex: 1,
      };
    }

    return baseStyle;
  };

  const handleClick = (gesture: 1 | 2 | 3) => {
    if (isClickable) {
      onSelect(gesture);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        width: 300,
        height: 70,
        marginTop: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Left circle */}
      <div
        style={getCircleStyle(0)}
        onClick={() => handleClick(1)}
        role={isClickable ? "button" : undefined}
        tabIndex={isClickable ? 0 : undefined}
      >
        <div style={{
          opacity: phase === "choose" ? 1 : 0,
          transition: "opacity 0.4s ease 0.3s"
        }}>
          <CameraIcon />
        </div>
      </div>

      {/* Left arrow */}
      <span
        style={{
          position: "absolute",
          left: phase === "three" ? 95 : 130,
          fontSize: 24,
          opacity: phase === "three" ? 1 : 0,
          transition: "all 0.5s ease",
          color: "#171717",
          zIndex: 10,
        }}
      >
        ←
      </span>

      {/* Middle circle */}
      <div
        style={getCircleStyle(1)}
        onClick={() => handleClick(2)}
        role={isClickable ? "button" : undefined}
        tabIndex={isClickable ? 0 : undefined}
      >
        <div style={{
          opacity: phase === "choose" ? 1 : 0,
          transition: "opacity 0.4s ease 0.3s"
        }}>
          <MicrophoneIcon />
        </div>
      </div>

      {/* Right arrow */}
      <span
        style={{
          position: "absolute",
          right: phase === "three" ? 95 : 130,
          fontSize: 24,
          opacity: phase === "three" ? 1 : 0,
          transition: "all 0.5s ease",
          color: "#171717",
          zIndex: 10,
        }}
      >
        →
      </span>

      {/* Right circle */}
      <div
        style={getCircleStyle(2)}
        onClick={() => handleClick(3)}
        role={isClickable ? "button" : undefined}
        tabIndex={isClickable ? 0 : undefined}
      >
        <div style={{
          opacity: phase === "choose" ? 1 : 0,
          transition: "opacity 0.4s ease 0.3s"
        }}>
          <CompassIcon />
        </div>
      </div>
    </div>
  );
}

export default function Enjoy() {
  const [step, setStep] = useState<RecipientStep>("intro");
  const [fadeState, setFadeState] = useState<"in" | "out">("in");
  const [typewriterDone, setTypewriterDone] = useState(false);

  // Circle animation phase
  const [circlePhase, setCirclePhase] = useState<CirclePhase>("hidden");
  const [circleText, setCircleText] = useState("");
  const [circleTextSuffix, setCircleTextSuffix] = useState("");
  const circleAnimationStarted = useRef(false);

  const fontStyle = { fontFamily: "'Anonymous Pro', monospace" };

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
      }, 3000);
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
      }, 2500);
      return () => clearTimeout(timer);
    }

    if (step === "message2") {
      const timer = setTimeout(() => {
        setFadeState("out");
        setTimeout(() => {
          setStep("circles");
          setFadeState("in");
          setTypewriterDone(false);
          setCircleText("Here is one Tiny Gesture");
          setCircleTextSuffix("");
        }, 500);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [typewriterDone, step]);

  // Handle circle phase transitions
  useEffect(() => {
    if (step !== "circles") return;
    if (!typewriterDone) return;
    if (circleAnimationStarted.current) return;

    // Mark animation as started so it doesn't restart
    circleAnimationStarted.current = true;

    // Show one circle
    setCirclePhase("one");

    // After delay, show three
    const timer1 = setTimeout(() => {
      setCircleText("Nevermind here are three");
      setCircleTextSuffix("...!!");
      setCirclePhase("three");
    }, 2500);

    // After more delay, show choose
    const timer2 = setTimeout(() => {
      setCircleText("Choose one carefully");
      setCircleTextSuffix("...!!!");
      setCirclePhase("choose");
    }, 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [step, typewriterDone]);

  // Handle gesture selection
  const handleGestureSelect = (gesture: 1 | 2 | 3) => {
    setFadeState("out");
    setTimeout(() => {
      setStep(`gesture${gesture}` as RecipientStep);
      setFadeState("in");
    }, 500);
  };

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
          <div
            style={{
              width: 100,
              height: 100,
              animation: "heartbeatContinuous 1.5s ease-in-out infinite",
            }}
          >
            <Image
              src="/heart.png"
              alt="Heart"
              width={100}
              height={100}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
              priority
            />
          </div>
          <h1
            style={{
              marginTop: 32,
              fontSize: 20,
              textAlign: "center",
              color: "#171717",
              ...fontStyle,
            }}
          >
            <Typewriter
              text="A Tiny Gesture"
              onComplete={() => setTypewriterDone(true)}
              speed={200}
            />
          </h1>
        </div>
      )}

      {/* MESSAGE 1 */}
      {step === "message1" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            maxWidth: 400,
            opacity: fadeState === "in" ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        >
          <p
            style={{
              textAlign: "center",
              color: "#171717",
              fontSize: 18,
              lineHeight: 1.6,
              ...fontStyle,
            }}
          >
            <Typewriter
              text="Im thinking about you today"
              onComplete={() => setTypewriterDone(true)}
              speed={100}
              showDots={false}
            />
            {typewriterDone && <span>... &lt;3</span>}
          </p>
          <SmallHeart />
        </div>
      )}

      {/* MESSAGE 2 */}
      {step === "message2" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            maxWidth: 400,
            opacity: fadeState === "in" ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        >
          <p
            style={{
              textAlign: "center",
              color: "#171717",
              fontSize: 18,
              lineHeight: 1.6,
              ...fontStyle,
            }}
          >
            <Typewriter
              text="And I wanted to give you a Tiny Gesture"
              onComplete={() => setTypewriterDone(true)}
              speed={100}
            />
          </p>
          <SmallHeart />
        </div>
      )}

      {/* CIRCLES STEP - One, Three, and Choose all happen here */}
      {step === "circles" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            maxWidth: 400,
            opacity: fadeState === "in" ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        >
          <p
            style={{
              textAlign: "center",
              color: "#171717",
              fontSize: 18,
              lineHeight: 1.6,
              ...fontStyle,
              minHeight: 30,
            }}
          >
            {circlePhase === "hidden" ? (
              <Typewriter
                text={circleText}
                onComplete={() => setTypewriterDone(true)}
                speed={100}
              />
            ) : (
              <>
                {circleText}
                {circleTextSuffix}
              </>
            )}
          </p>

          <AnimatedCircles phase={circlePhase} onSelect={handleGestureSelect} />

          <SmallHeart />
        </div>
      )}

      {/* GESTURE 1 - Camera */}
      {step === "gesture1" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            maxWidth: 400,
            opacity: fadeState === "in" ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        >
          <p
            style={{
              textAlign: "center",
              color: "#171717",
              fontSize: 18,
              lineHeight: 1.6,
              ...fontStyle,
            }}
          >
            Tiny Gesture number 1
          </p>
          <p
            style={{
              textAlign: "center",
              color: "#666",
              fontSize: 14,
              marginTop: 16,
              ...fontStyle,
            }}
          >
            Camera gesture coming soon...
          </p>
          <SmallHeart />
        </div>
      )}

      {/* GESTURE 2 - Microphone */}
      {step === "gesture2" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            maxWidth: 400,
            opacity: fadeState === "in" ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        >
          <p
            style={{
              textAlign: "center",
              color: "#171717",
              fontSize: 18,
              lineHeight: 1.6,
              ...fontStyle,
            }}
          >
            Tiny Gesture number 2
          </p>
          <p
            style={{
              textAlign: "center",
              color: "#666",
              fontSize: 14,
              marginTop: 16,
              ...fontStyle,
            }}
          >
            Microphone gesture coming soon...
          </p>
          <SmallHeart />
        </div>
      )}

      {/* GESTURE 3 - Compass */}
      {step === "gesture3" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            maxWidth: 400,
            opacity: fadeState === "in" ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        >
          <p
            style={{
              textAlign: "center",
              color: "#171717",
              fontSize: 18,
              lineHeight: 1.6,
              ...fontStyle,
            }}
          >
            Tiny Gesture number 3
          </p>
          <p
            style={{
              textAlign: "center",
              color: "#666",
              fontSize: 14,
              marginTop: 16,
              ...fontStyle,
            }}
          >
            Compass gesture coming soon...
          </p>
          <SmallHeart />
        </div>
      )}
    </div>
  );
}
