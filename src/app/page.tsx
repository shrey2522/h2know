"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const QRCodeSVG = dynamic(
  () => import("qrcode.react").then((mod) => mod.QRCodeSVG),
  { ssr: false, loading: () => <div className="h-[180px] w-[180px]" /> }
);

const USER_ID = "H2KNOW-102";

export default function HomePage() {
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy px-4 text-white">
      <h1 className="mb-2 text-4xl font-bold text-accent-light">H2Know</h1>
      <p className="mb-8 text-slate-300">Drink Smarter with H2Know</p>

          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/10 p-6 backdrop-blur">
            <QRCodeSVG
              value={`${origin}/u/${USER_ID}`}
              size={180}
              bgColor="transparent"
              fgColor="#ffffff"
              level="M"
              includeMargin={false}
            />
            <p className="text-sm font-semibold text-accent-light">{USER_ID}</p>
          </div>

      <p className="mt-6 max-w-md text-center text-sm text-slate-400">
        Scan the QR code with your phone to open your personal study dashboard.
      </p>
    </div>
  );
}
