"use client";

import { useState, KeyboardEvent } from "react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  maxLength?: number;
  label?: string;
}

export default function TagInput({
  tags,
  onChange,
  maxTags = 20,
  maxLength = 50,
  label,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().slice(0, maxLength);
    if (
      trimmedTag &&
      !tags.includes(trimmedTag) &&
      tags.length < maxTags
    ) {
      onChange([...tags, trimmedTag]);
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="ss-input min-h-[3rem] flex flex-wrap gap-2 items-center">
        {tags.map((tag) => (
          <span key={tag} className="ss-chip">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ss-chip-remove"
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? "Type and press Enter to add..." : ""}
          className="flex-1 min-w-[120px] outline-none bg-transparent"
          maxLength={maxLength}
        />
      </div>
      <p className="mt-1 text-xs text-gray-500">
        {tags.length}/{maxTags} tags • Press Enter or comma to add
      </p>
    </div>
  );
}

