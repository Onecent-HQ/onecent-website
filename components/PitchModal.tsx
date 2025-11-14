"use client";

import { useState, useCallback } from "react";
import { X, Upload, FileText } from "lucide-react";
import Button from "./Button";
import Input from "./Input";
import Textarea from "./Textarea";
import Toast from "./Toast";
import { useUser } from "@civic/auth/react";

interface PitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  investorId: string;
  investorName: string;
}

export default function PitchModal({
  isOpen,
  onClose,
  investorId,
  investorName,
}: PitchModalProps) {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    senderName: user?.name || "",
    senderTwitter: user?.username || "",
    projectName: "",
    projectDescription: "",
    deckFile: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [deckUrl, setDeckUrl] = useState<string | null>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setToast({ message: "Only PDF files are allowed", type: "error" });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setToast({ message: "File size must be less than 10MB", type: "error" });
      return;
    }

    setFormData((prev) => ({ ...prev, deckFile: file }));
  }, []);

  const handleUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Upload failed");
    }

    const data = await response.json();
    return data.deckUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.senderName || !formData.senderTwitter || !formData.projectName || !formData.projectDescription) {
      setToast({ message: "Please fill all required fields", type: "error" });
      return;
    }

    if (!formData.deckFile && !deckUrl) {
      setToast({ message: "Please upload a pitch deck", type: "error" });
      return;
    }

    setIsSubmitting(true);

    try {
      let finalDeckUrl = deckUrl;

      if (formData.deckFile) {
        finalDeckUrl = await handleUpload(formData.deckFile);
      }

      if (!finalDeckUrl) {
        throw new Error("No deck URL available");
      }

      const response = await fetch("/api/pitches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          investorId,
          senderName: formData.senderName,
          senderTwitter: formData.senderTwitter,
          projectName: formData.projectName,
          projectDescription: formData.projectDescription,
          deckUrl: finalDeckUrl,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit pitch");
      }

      setToast({ message: "Pitch submitted successfully!", type: "success" });
      
      // Reset form
      setFormData({
        senderName: user?.name || "",
        senderTwitter: user?.username || "",
        projectName: "",
        projectDescription: "",
        deckFile: null,
      });
      setDeckUrl(null);

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      setToast({ message: error.message || "Failed to submit pitch", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl ss-glass !p-0 rounded-3xl border border-white/15 bg-black/80 shadow-[0_24px_80px_rgba(0,0,0,0.85)] max-h-[90vh] overflow-y-auto">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        <div className="sticky top-0 bg-black/80 border-b border-white/10 px-6 py-4 flex items-center justify-between z-10 backdrop-blur">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Send a pitch to {investorName}
          </h2>
            <p className="text-xs text-white/60 mt-1">
              A short, clear intro plus a PDF deck gives them the best signal.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors p-1"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <Input
            label="Your Name"
            variant="dark"
            value={formData.senderName}
            onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
            required
          />

          <Input
            label="Your Twitter Handle"
            variant="dark"
            value={formData.senderTwitter}
            onChange={(e) =>
              setFormData({ ...formData, senderTwitter: e.target.value.replace("@", "") })
            }
            required
          />

          <Input
            label="Project Name"
            variant="dark"
            value={formData.projectName}
            onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
            required
          />

          <Textarea
            label="Project Description"
            variant="dark"
            value={formData.projectDescription}
            onChange={(e) =>
              setFormData({ ...formData, projectDescription: e.target.value })
            }
            required
            rows={4}
          />

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Pitch Deck (PDF)
            </label>
            <div className="relative">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="deck-upload"
              />
              <label
                htmlFor="deck-upload"
                className="flex items-center gap-3 p-4 border border-white/20 rounded-lg bg-white/5 hover:bg-white/10 hover:border-white/30 cursor-pointer transition-colors"
              >
                {formData.deckFile ? (
                  <>
                    <FileText className="w-5 h-5 text-white" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{formData.deckFile.name}</p>
                      <p className="text-xs text-white/60">
                        {(formData.deckFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-white/60" />
                    <div>
                      <p className="text-sm font-medium text-white/80">Click to upload PDF</p>
                      <p className="text-xs text-white/50">Max 10MB</p>
                    </div>
                  </>
                )}
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Submitting..." : "Submit Pitch"}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

