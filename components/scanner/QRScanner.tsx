"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function QRScanner() {
  const scannerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    type ScannerInstance = { clear: () => Promise<void>; render: (s: (t: string) => void, e: () => void) => void };
    let scanner: ScannerInstance | null = null;

    async function init() {
      const { Html5QrcodeScanner } = await import("html5-qrcode");
      scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      ) as unknown as ScannerInstance;

      scanner.render(
        (decodedText: string) => {
          try {
            const data = JSON.parse(decodedText);
            if (data.objectId) {
              scanner?.clear();
              router.push(`/quest/${data.objectId}`);
            }
          } catch {
            // not a valid QR for this app — ignore
          }
        },
        () => {}
      );
    }

    init();

    return () => {
      scanner?.clear().catch(() => {});
    };
  }, [router]);

  return (
    <div>
      <div id="qr-reader" ref={scannerRef} className="rounded-2xl overflow-hidden" />
      <p className="text-center text-sm text-zinc-500 mt-4">
        Point at the QR code next to any painting in your quest
      </p>
    </div>
  );
}
