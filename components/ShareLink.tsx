"use client";

import { useEffect, useState } from "react";

export function ShareLink({
  url,
  shareTitle,
  shareText,
}: {
  url: string;
  shareTitle: string;
  shareText: string;
}) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  }

  async function share() {
    try {
      await navigator.share({ title: shareTitle, text: shareText, url });
    } catch {
      // user cancelled or share failed — no-op
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50/60 px-3 py-2.5">
        <span className="min-w-0 flex-1 select-all truncate font-mono text-sm text-brand-700">
          {url}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={copy} aria-pressed={copied} className="btn-secondary">
          {copied ? "Copied ✓" : "Copy link"}
        </button>
        {canShare ? (
          <button onClick={share} className="btn-primary">
            Share
          </button>
        ) : (
          <a href={url} target="_blank" rel="noreferrer" className="btn-primary">
            Open page
          </a>
        )}
      </div>

      <div role="status" aria-live="polite" className="sr-only">
        {copied ? "Link copied to clipboard" : ""}
      </div>

      {canShare ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-11 items-center justify-center text-center text-sm font-medium text-muted hover:text-brand-700"
        >
          Open join page →
        </a>
      ) : null}
    </div>
  );
}
