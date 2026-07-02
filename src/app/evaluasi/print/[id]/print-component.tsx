"use client";
import { useEffect } from "react";

export default function PrintComponent() {
  useEffect(() => {
    // Small delay to ensure fonts and styles are loaded
    setTimeout(() => {
      window.print();
    }, 500);
  }, []);
  
  return null;
}
