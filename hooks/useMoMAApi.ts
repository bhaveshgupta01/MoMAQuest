"use client";

import { useState, useEffect } from "react";
import { MoMADetailedObject } from "@/lib/types";

export function useArtworkDetails(objectId: number | null) {
  const [artwork, setArtwork] = useState<MoMADetailedObject | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!objectId) return;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const r = await fetch(`/api/moma/object/${objectId}`);
        const d = await r.json();
        setArtwork(d.artwork ?? null);
      } catch {
        setError("Failed to load artwork");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [objectId]);

  return { artwork, loading, error };
}
