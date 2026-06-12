"use client";

import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";

interface CelebrationToastProps {
  subject: string;
  onClose: () => void;
}

export default function CelebrationToast({
  subject,
  onClose,
}: CelebrationToastProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/sounds/celebration.mp3");
    audioRef.current.play().catch(() => {});

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("🎉 Goal Achieved!", {
        body: `You matched your planned study time for ${subject}. Keep it up!`,
        icon: "/favicon.ico",
        tag: "celebration",
      });
    }

    const duration = 20 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    intervalRef.current = setInterval(() => {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.5 },
      });
    }, 2000);

    const timeout = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      onClose();
    }, duration);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      clearTimeout(timeout);
    };
  }, [subject, onClose]);

  return (
    <div className="fixed inset-x-0 top-4 z-50 mx-auto max-w-md rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-5 text-center text-white shadow-2xl ring-4 ring-green-300/50">
      <p className="mb-1 text-3xl">🎉</p>
      <p className="text-lg font-bold">Goal Achieved!</p>
      <p className="mt-1 text-sm">
        Your actual study time matched your plan for <strong>{subject}</strong>!
      </p>
      <p className="mt-2 text-xs text-green-100">Keep up the great work!</p>
      <button
        type="button"
        onClick={onClose}
        className="mt-3 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium hover:bg-white/30"
      >
        Dismiss
      </button>
    </div>
  );
}
