"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function EditClassForm({
  id,
  danceType,
  classDateTimeLocal,
  location,
  spotifyUrl,
  themed,
  capacity,
  closed,
}: {
  id: string;
  danceType: string;
  classDateTimeLocal: string;
  location: string | null;
  spotifyUrl: string | null;
  themed: boolean;
  capacity: number | null;
  closed: boolean;
}) {
  const router = useRouter();
  const submittingRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    setError(null);
    setSaved(false);

    const fd = new FormData(e.currentTarget);
    const payload = {
      danceType: String(fd.get("danceType") || ""),
      classDateTime: String(fd.get("classDateTime") || ""),
      location: String(fd.get("location") || ""),
      spotifyUrl: String(fd.get("spotifyUrl") || ""),
      themed: fd.get("themed") === "on",
      capacity: String(fd.get("capacity") || ""),
      closed: fd.get("closed") === "on",
    };

    try {
      const res = await fetch(`/api/classes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        setError(data?.error || "Could not save changes");
        setLoading(false);
        submittingRef.current = false;
        return;
      }
      setSaved(true);
      setLoading(false);
      submittingRef.current = false;
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
      submittingRef.current = false;
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="e-danceType" className="label">
          Class name / dance type
        </label>
        <input id="e-danceType" name="danceType" className="input" defaultValue={danceType} required />
      </div>
      <div>
        <label htmlFor="e-classDateTime" className="label">
          Date &amp; time
        </label>
        <input
          id="e-classDateTime"
          name="classDateTime"
          type="datetime-local"
          className="input"
          defaultValue={classDateTimeLocal}
          required
        />
      </div>
      <div>
        <label htmlFor="e-location" className="label">
          Location <span className="font-normal text-muted">(optional)</span>
        </label>
        <input id="e-location" name="location" className="input" defaultValue={location ?? ""} />
      </div>
      <div>
        <label htmlFor="e-spotifyUrl" className="label">
          Spotify playlist <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          id="e-spotifyUrl"
          name="spotifyUrl"
          type="url"
          inputMode="url"
          className="input"
          defaultValue={spotifyUrl ?? ""}
          placeholder="https://open.spotify.com/playlist/…"
        />
      </div>
      <div>
        <label htmlFor="e-capacity" className="label">
          Capacity <span className="font-normal text-muted">(blank = unlimited)</span>
        </label>
        <input
          id="e-capacity"
          name="capacity"
          type="number"
          inputMode="numeric"
          min="1"
          step="1"
          className="input"
          defaultValue={capacity ?? ""}
        />
      </div>
      <label className="flex items-center gap-3 py-1">
        <input
          type="checkbox"
          name="themed"
          defaultChecked={themed}
          className="h-5 w-5 rounded border-brand-300 text-brand-600"
        />
        <span className="text-sm text-ink">Themed / special class</span>
      </label>
      <label className="flex items-center gap-3 py-1">
        <input
          type="checkbox"
          name="closed"
          defaultChecked={closed}
          className="h-5 w-5 rounded border-brand-300 text-brand-600"
        />
        <span className="text-sm text-ink">Closed for new bookings</span>
      </label>

      {error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      ) : null}
      {saved ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Saved ✓</p>
      ) : null}

      <button type="submit" className="btn-secondary" disabled={loading}>
        {loading ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
