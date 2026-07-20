"use client";

import { useState, useEffect } from "react";

export function useAiAccess() {
  const [aiAccess, setAiAccess] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        setAiAccess(data.user?.isPro ?? false);
      })
      .catch(() => {
        setAiAccess(false);
      });
  }, []);

  return aiAccess;
}
