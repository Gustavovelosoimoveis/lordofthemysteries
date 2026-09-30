import { useState, useEffect, useRef, useCallback } from "react";
import { audioEngine } from "./audioEngine";

export type QuillSpeed = "normal" | "fast" | "instant";

interface UseQuillTypewriterProps {
  messageId: string;
  totalText: string;
  isLatest: boolean;
  isStreaming?: boolean;
  onComplete?: () => void;
}

const SPEED_STORAGE_KEY = "lotm_quill_speed";
const SOUND_STORAGE_KEY = "lotm_quill_sound";

export function useQuillTypewriter({
  messageId,
  totalText,
  isLatest,
  isStreaming = false,
  onComplete,
}: UseQuillTypewriterProps) {
  // Load saved speed preference (default to normal)
  const [speed, setSpeedState] = useState<QuillSpeed>(() => {
    try {
      const saved = localStorage.getItem(SPEED_STORAGE_KEY);
      if (saved === "normal" || saved === "fast" || saved === "instant") {
        return saved;
      }
    } catch (e) {}
    return "normal";
  });

  // Load saved sound preference (default to true)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SOUND_STORAGE_KEY);
      if (saved !== null) {
        return saved === "true";
      }
    } catch (e) {}
    return true;
  });

  // If not latest, historical messages are immediately complete
  const [typedLength, setTypedLength] = useState<number>(() => {
    return isLatest && speed !== "instant" ? 0 : totalText.length;
  });

  const [isComplete, setIsComplete] = useState<boolean>(() => {
    return !isLatest || speed === "instant" || (totalText.length > 0 && typedLength >= totalText.length);
  });

  const timerRef = useRef<number | null>(null);
  const totalTextRef = useRef(totalText);
  totalTextRef.current = totalText;
  const isStreamingRef = useRef(isStreaming);
  isStreamingRef.current = isStreaming;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;
  const speedRef = useRef(speed);
  speedRef.current = speed;

  // Change speed & persist
  const setSpeed = useCallback((newSpeed: QuillSpeed) => {
    setSpeedState(newSpeed);
    speedRef.current = newSpeed;
    try {
      localStorage.setItem(SPEED_STORAGE_KEY, newSpeed);
    } catch (e) {}

    if (newSpeed === "instant") {
      setTypedLength(totalTextRef.current.length);
      setIsComplete(true);
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      onCompleteRef.current?.();
    }
  }, []);

  // Toggle sound & persist
  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      soundEnabledRef.current = next;
      try {
        localStorage.setItem(SOUND_STORAGE_KEY, String(next));
      } catch (e) {}
      return next;
    });
  }, []);

  // Skip immediately to end
  const skip = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setTypedLength(totalTextRef.current.length);
    setIsComplete(true);
    onCompleteRef.current?.();
  }, []);

  // Main typewriter loop for the latest turn
  useEffect(() => {
    if (!isLatest) {
      setTypedLength(totalText.length);
      setIsComplete(true);
      return;
    }

    if (speedRef.current === "instant") {
      setTypedLength(totalText.length);
      setIsComplete(true);
      onCompleteRef.current?.();
      return;
    }

    // Cancel any previous timer
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const tick = () => {
      const currentTotal = totalTextRef.current;
      const targetLen = currentTotal.length;

      setTypedLength((prev) => {
        if (prev >= targetLen) {
          // If streaming, wait for more text
          if (isStreamingRef.current) {
            timerRef.current = window.setTimeout(tick, 60);
            return prev;
          }
          // Completed!
          setIsComplete(true);
          onCompleteRef.current?.();
          return prev;
        }

        // Catch-up logic if text is arriving fast
        const diff = targetLen - prev;
        let step = 1;
        if (speedRef.current === "fast") {
          step = diff > 30 ? 4 : diff > 10 ? 2 : 1;
        } else {
          step = diff > 60 ? 4 : diff > 25 ? 2 : 1;
        }

        const nextLen = Math.min(targetLen, prev + step);

        // Sound effect on parchment friction
        if (soundEnabledRef.current) {
          audioEngine.playQuillScratchSound();
        }

        // Calculate dynamic delay based on punctuation for realistic handwriting cadence
        const currentChar = currentTotal[nextLen - 1] || "";
        let baseDelay = 14;

        if (speedRef.current === "fast") {
          baseDelay = 6;
        }

        if (currentChar === "." || currentChar === "!" || currentChar === "?") {
          // Ink dip pause after sentences
          baseDelay += speedRef.current === "fast" ? 40 : 85;
        } else if (currentChar === "," || currentChar === ";" || currentChar === ":") {
          // Brief pause on commas
          baseDelay += speedRef.current === "fast" ? 20 : 40;
        } else if (currentChar === "\n") {
          // Carriage return / new line pause
          baseDelay += speedRef.current === "fast" ? 30 : 60;
        } else {
          // Natural slight human jitter
          baseDelay += Math.floor(Math.random() * 6);
        }

        timerRef.current = window.setTimeout(tick, baseDelay);
        return nextLen;
      });
    };

    // Start tick
    timerRef.current = window.setTimeout(tick, 50);

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [messageId, isLatest, totalText.length]);

  return {
    typedLength,
    isComplete,
    isTyping: isLatest && !isComplete,
    speed,
    setSpeed,
    soundEnabled,
    toggleSound,
    skip,
  };
}
