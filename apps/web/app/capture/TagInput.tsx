"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions: string[];
}

function normalize(s: string): string {
  return s.trim().replace(/\s+/g, " ").toLowerCase();
}

export function TagInput({ value, onChange, suggestions }: TagInputProps) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const valueLower = useMemo(() => new Set(value.map((v) => v.toLowerCase())), [value]);
  const matches = useMemo(() => {
    const inputN = normalize(input);
    if (!inputN) return suggestions.filter((s) => !valueLower.has(s.toLowerCase())).slice(0, 6);
    return suggestions
      .filter((s) => s.toLowerCase().includes(inputN) && !valueLower.has(s.toLowerCase()))
      .slice(0, 6);
  }, [input, suggestions, valueLower]);

  function commitTag(raw: string) {
    const clean = raw.trim().replace(/\s+/g, " ");
    if (!clean) return;
    if (valueLower.has(clean.toLowerCase())) {
      setInput("");
      return;
    }
    onChange([...value, clean]);
    setInput("");
  }

  function removeTag(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      if (input.trim()) {
        e.preventDefault();
        commitTag(input);
      }
    } else if (e.key === "Backspace" && input === "" && value.length > 0) {
      removeTag(value.length - 1);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold">Tags</label>
      <div
        ref={wrapRef}
        style={{
          position: "relative",
          minHeight: 40,
          padding: "6px 8px",
          border: "1.5px solid var(--recipe-line)",
          borderRadius: 8,
          background: "#fff",
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          alignItems: "center",
        }}
      >
        {value.map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "4px 8px",
              background: "var(--recipe-secondary)",
              borderRadius: 100,
              fontSize: 13,
            }}
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(i)}
              aria-label={`remove tag ${tag}`}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                fontSize: 16,
                lineHeight: 1,
                color: "var(--recipe-stone)",
              }}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder={value.length === 0 ? "weeknight, dessert, …" : ""}
          style={{
            flex: 1,
            minWidth: 80,
            border: "none",
            outline: "none",
            font: "inherit",
            background: "transparent",
            padding: "2px 0",
          }}
        />
        {showSuggestions && matches.length > 0 && (
          <ul
            role="listbox"
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              marginTop: 4,
              listStyle: "none",
              padding: 4,
              background: "#fff",
              border: "1px solid var(--recipe-line)",
              borderRadius: 8,
              boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
              zIndex: 5,
              maxHeight: 240,
              overflowY: "auto",
            }}
          >
            {matches.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => commitTag(s)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "6px 8px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    font: "inherit",
                    borderRadius: 6,
                  }}
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="text-xs text-stone">Press Enter or comma to add a tag.</p>
    </div>
  );
}
