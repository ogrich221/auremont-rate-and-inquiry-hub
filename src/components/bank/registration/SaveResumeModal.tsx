import React, { useState } from "react";
import {
  Bookmark,
  CheckCircle2,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ApplicationFormData } from "./types";

interface SaveResumeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ApplicationFormData;
  currentStep: number;
  onRestoreData: (saved: ApplicationFormData, step: number) => void;
}

export function SaveResumeModal({
  open,
  onOpenChange,
  data,
  currentStep,
  onRestoreData,
}: SaveResumeModalProps) {
  const [mode, setMode] = useState<"save" | "resume">("save");
  const [resumeToken, setResumeToken] = useState("");
  const [copied, setCopied] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSaveDraft = () => {
    try {
      const token = "DRAFT-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      const payload = {
        token,
        savedAt: new Date().toISOString(),
        step: currentStep,
        data,
      };
      localStorage.setItem("auremont_reg_draft", JSON.stringify(payload));
      localStorage.setItem(`auremont_reg_${token}`, JSON.stringify(payload));
      setResumeToken(token);
      setMessage("Your application draft has been securely saved to this device.");
    } catch {
      setError("Unable to save draft to local device storage.");
    }
  };

  const handleResumeDraft = () => {
    setError("");
    setMessage("");
    const key = inputCode.trim() ? `auremont_reg_${inputCode.trim().toUpperCase()}` : "auremont_reg_draft";
    const raw = localStorage.getItem(key);

    if (!raw) {
      setError("No draft found with the specified token. Please check the code or begin a new application.");
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      if (parsed?.data) {
        onRestoreData(parsed.data, parsed.step || 1);
        setMessage("Application progress successfully restored!");
        setTimeout(() => {
          onOpenChange(false);
        }, 800);
      }
    } catch {
      setError("Draft data was corrupted or incompatible.");
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(resumeToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif font-medium text-foreground flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-primary" />
            <span>Save & Resume Application</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Save your progress to return later or restore a previously saved application session.
          </DialogDescription>
        </DialogHeader>

        {/* Tab Switcher */}
        <div className="flex rounded-lg bg-muted p-1 text-xs">
          <button
            type="button"
            onClick={() => {
              setMode("save");
              setError("");
              setMessage("");
            }}
            className={`flex-1 rounded-md py-1.5 font-medium transition-all cursor-pointer ${
              mode === "save" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Save Current Progress
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("resume");
              setError("");
              setMessage("");
            }}
            className={`flex-1 rounded-md py-1.5 font-medium transition-all cursor-pointer ${
              mode === "resume" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Restore Existing Draft
          </button>
        </div>

        {mode === "save" ? (
          <div className="space-y-4 pt-2">
            <p className="text-xs text-muted-foreground">
              Click below to generate a unique resume token. Drafts preserve your personal, contact, and account preference entries. Sensitive credentials (passwords/PINs) are cleared upon session close.
            </p>

            {resumeToken ? (
              <div className="rounded-lg border border-primary/40 bg-primary/5 p-4 space-y-2">
                <span className="text-[11px] font-semibold text-primary block">
                  Your Unique Resume Token:
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-base text-foreground">
                    {resumeToken}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={copyToken}
                    className="text-xs gap-1 border-primary/40"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Keep this token safe to resume on this browser anytime.
                </p>
              </div>
            ) : (
              <Button
                type="button"
                onClick={handleSaveDraft}
                className="w-full text-xs bg-primary text-primary-foreground font-semibold"
              >
                Save Draft Now
              </Button>
            )}

            {message && (
              <div className="rounded-md bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300 p-2 text-xs flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span>{message}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <p className="text-xs text-muted-foreground">
              Enter your resume token below, or click Restore to recover the latest draft saved on this browser.
            </p>

            <div className="space-y-1.5">
              <Input
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="e.g. DRAFT-X7K9P (or leave blank for latest)"
                className="font-mono text-xs uppercase"
              />
            </div>

            <Button
              type="button"
              onClick={handleResumeDraft}
              className="w-full text-xs bg-primary text-primary-foreground font-semibold gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Restore Application</span>
            </Button>

            {error && (
              <div className="rounded-md bg-destructive/10 text-destructive p-2 text-xs flex items-center gap-1.5 border border-destructive/20">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {message && (
              <div className="rounded-md bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300 p-2 text-xs flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span>{message}</span>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
