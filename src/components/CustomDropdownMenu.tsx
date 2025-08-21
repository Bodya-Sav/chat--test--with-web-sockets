"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { AlignJustify, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CustomDropdownMenu({
  onLogout,
}: {
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        x: rect.left,
        y: rect.bottom + 8,
      });
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!buttonRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setOpen((p) => !p)}
        style={{
          background: open ? "#e0e0e0" : "transparent",
          border: "none",
          cursor: "pointer",
          width: '40px',
          height: '40px',

          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,

          borderRadius: '50%',
          transition: "background 0.2s, border-radius 0.2s",
        }}
      >
        <AlignJustify size={20} />
      </button>

      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: "absolute",
                  top: coords.y,
                  left: coords.x,
                  zIndex: 1000,
                  width: 160,
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  background: "#fff",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  overflow: "hidden",

                  padding: '4px'
                }}
              >
                <button
                  onClick={() => {
                    onLogout();
                    setOpen(false);
                  }}
                  style={{
                    width: "100%",
                    padding: "8px 16px",
                    textAlign: "left",
                    fontSize: 14,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",

                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f0f0")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  Log out <LogOut size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}