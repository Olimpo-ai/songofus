"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { content } from "@/lib/content";
import { events } from "@/lib/analytics";
import { getUtm } from "@/lib/utm";
import type { Briefing } from "@/lib/types";

const STORAGE_KEY = "tuneofus_draft";
const MODAL_SEEN_KEY = "tuneofus_finish_modal_seen";
const f = content.form;

type Draft = Partial<Briefing> & { step?: number; customStyle?: string };

const STEP_NAMES = ["recipient", "occasion", "names", "story", "vibe", "delivery"] as const;
const TOTAL_STEPS = STEP_NAMES.length;

function loadDraft(): Draft {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

/** Fill {name} in adaptive copy; falls back to "them" when unknown. */
function interp(str: string, name?: string): string {
  return str.replace(/\{name\}/g, name?.trim() || "them");
}

/** Occasions adapt to the chosen recipient (no more mixing concepts). */
function occasionOptions(recipient?: string): string[] {
  if (recipient && f.steps.occasion.byRecipient[recipient]) {
    return f.steps.occasion.byRecipient[recipient];
  }
  return f.steps.occasion.default;
}

/** Story title, hint and rotating prompts adapt to the recipient + tone. */
function storyConfig(recipient?: string) {
  if (recipient && f.steps.story.byRecipient[recipient]) {
    return f.steps.story.byRecipient[recipient];
  }
  return f.steps.story.default;
}

/** Progress bar styled as a filling soundwave. */
function SoundwaveProgress({ step }: { step: number }) {
  const bars = 28;
  const filled = Math.round(((step + 1) / TOTAL_STEPS) * bars);
  const heights = Array.from({ length: bars }, (_, i) => 8 + ((i * 37) % 17));
  return (
    <div
      className="flex h-8 items-center gap-[3px]"
      role="progressbar"
      aria-valuenow={step + 1}
      aria-valuemin={1}
      aria-valuemax={TOTAL_STEPS}
      aria-label={`${f.progressLabel}: step ${step + 1} of ${TOTAL_STEPS}`}
    >
      {heights.map((h, i) => (
        <span
          key={i}
          className={`w-[3px] rounded-full transition-colors duration-300 ${
            i < filled ? "bg-burgundy" : "bg-burgundy/15"
          }`}
          style={{ height: h }}
        />
      ))}
    </div>
  );
}

function ChipGrid({
  options,
  value,
  onPick,
}: {
  options: string[];
  value?: string;
  onPick: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onPick(o)}
          aria-pressed={value === o}
          className={`rounded-2xl border-2 px-4 py-4 text-left text-[15px] font-semibold transition-colors ${
            value === o
              ? "border-burgundy bg-blush-soft text-burgundy-deep"
              : "border-burgundy/15 bg-linen-warm text-ink hover:border-burgundy/40"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

/** Small, secondary pill group (mood, singer) — one tap, low friction. */
function PillGroup({
  options,
  value,
  onPick,
}: {
  options: string[];
  value?: string;
  onPick: (v: string) => void;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={value === o}
          onClick={() => onPick(o)}
          className={`rounded-full border-2 px-4 py-2.5 text-[14px] font-semibold transition-colors ${
            value === o
              ? "border-burgundy bg-blush-soft text-burgundy-deep"
              : "border-burgundy/15 bg-linen-warm text-ink hover:border-burgundy/40"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export default function Wizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>({});
  const [hydrated, setHydrated] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [showNudge, setShowNudge] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewRef = useRef<HTMLAudioElement>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout>>();

  // Hydrate: resume a saved draft, else honor deep-link params from the
  // landing occasion cards (recipient / occasion) and skip ahead.
  useEffect(() => {
    const saved = loadDraft();
    const rParam = searchParams.get("recipient");
    const oParam = searchParams.get("occasion");
    const resuming = typeof saved.step === "number" && saved.step > 0;

    if (!resuming) {
      if (rParam) saved.recipient = rParam;
      if (oParam) saved.occasion = oParam;
      // start where the deep-link leaves off
      let start = 0;
      if (rParam && oParam) start = 2;
      else if (rParam) start = 1;
      else if (oParam) start = 1;
      setStep(start);
    } else if (saved.step! < TOTAL_STEPS) {
      setStep(saved.step!);
    }

    setDraft(saved);
    setHydrated(true);
    events.startForm();
  }, [searchParams]);

  const save = useCallback((next: Draft) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const update = (patch: Draft) => {
    setDraft((d) => {
      const next = { ...d, ...patch, step: d.step ?? step };
      save(next);
      return next;
    });
  };

  const storyCfg = storyConfig(draft.recipient);

  // Rotating, recipient-aware story placeholders
  useEffect(() => {
    if (step !== 3) return;
    setPlaceholderIdx(0);
    const t = setInterval(
      () => setPlaceholderIdx((i) => (i + 1) % storyCfg.placeholders.length),
      4000
    );
    return () => clearInterval(t);
  }, [step, storyCfg.placeholders.length]);

  // Finish-later modal: after step 3, once ever
  useEffect(() => {
    if (step < 3 || showModal) return;
    if (localStorage.getItem(MODAL_SEEN_KEY)) return;

    const trigger = () => {
      if (localStorage.getItem(MODAL_SEEN_KEY)) return;
      localStorage.setItem(MODAL_SEEN_KEY, "1");
      setShowModal(true);
    };

    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const resetIdle = () => {
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(trigger, isTouch ? 45_000 : 30_000);
    };
    resetIdle();
    const activity = ["touchstart", "keydown", "scroll", "mousemove"] as const;
    activity.forEach((e) => window.addEventListener(e, resetIdle, { passive: true }));

    const onExitIntent = (e: MouseEvent) => {
      if (!isTouch && e.clientY <= 0) trigger();
    };
    document.addEventListener("mouseout", onExitIntent);

    return () => {
      clearTimeout(idleTimer.current);
      activity.forEach((e) => window.removeEventListener(e, resetIdle));
      document.removeEventListener("mouseout", onExitIntent);
    };
  }, [step, showModal]);

  const goTo = (n: number) => {
    events.completeStep(step + 1, STEP_NAMES[step]);
    setStep(n);
    setDraft((d) => {
      const nd = { ...d, step: n };
      save(nd);
      return nd;
    });
    window.scrollTo({ top: 0 });
  };

  const next = () => goTo(Math.min(step + 1, TOTAL_STEPS - 1));
  const back = () => {
    const n = Math.max(step - 1, 0);
    setStep(n);
    setDraft((d) => {
      const nd = { ...d, step: n };
      save(nd);
      return nd;
    });
  };

  const playPreview = (src: string) => {
    const el = previewRef.current;
    if (!el) return;
    el.src = src;
    el.play().catch(() => {});
  };

  const canContinue = (): boolean => {
    switch (step) {
      case 0: return !!draft.recipient;
      case 1: return !!draft.occasion;
      case 2: return !!draft.theirName?.trim() && !!draft.yourName?.trim();
      case 3: return !!draft.story?.trim();
      case 4: return (!!draft.style || !!draft.customStyle?.trim()) && !!draft.mood;
      case 5: return !!draft.email && /.+@.+\..+/.test(draft.email);
      default: return false;
    }
  };

  const handleStoryNext = () => {
    const len = draft.story?.trim().length ?? 0;
    if (len < f.steps.story.minChars && !showNudge) {
      setShowNudge(true); // friendly nudge, not a hard error — second tap proceeds
      return;
    }
    setShowNudge(false);
    next();
  };

  const submit = async () => {
    if (!canContinue() || submitting) return;
    setSubmitting(true);
    setError(null);
    events.completeStep(6, "delivery");
    const briefing: Briefing = {
      recipient: draft.recipient!,
      occasion: draft.occasion!,
      theirName: draft.theirName!.trim(),
      yourName: draft.yourName!.trim(),
      story: draft.story!.trim(),
      style: (draft.customStyle?.trim() || draft.style)!,
      mood: draft.mood!,
      voice: draft.voice || "Surprise me",
      email: draft.email!.trim(),
      phone: draft.phone?.trim() || undefined,
    };
    const utm = getUtm();
    let orderId = crypto.randomUUID();
    try {
      const res = await fetch("/api/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ briefing, utm }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.orderId) orderId = data.orderId;
      }
    } catch {
      /* offline save — the localStorage copy below carries the order */
    }
    try {
      localStorage.setItem("tuneofus_order", JSON.stringify({ orderId, briefing, utm }));
    } catch {}
    router.push(`/review?oid=${orderId}`);
  };

  if (!hydrated) {
    return <div className="min-h-[50vh]" aria-busy="true" />;
  }

  const reinforce = interp(f.reinforce[step] ?? "", draft.theirName);

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-5 pb-10 pt-6">
      <div className="flex items-center justify-between gap-4">
        <Link href="/" className="inline-flex items-center gap-2 font-display text-lg font-semibold text-burgundy">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo/logo-mark.png" alt="" width={402} height={340} className="h-7 w-auto" />
          {content.brand.name}
        </Link>
        <SoundwaveProgress step={step} />
      </div>

      {/* Progress count + emotional reinforcement */}
      <div className="mt-3">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-burgundy/60">
          Step {step + 1} of {TOTAL_STEPS}
        </span>
        <p className="mt-0.5 font-script text-lg leading-tight text-burgundy">{reinforce}</p>
      </div>

      <div className="mt-8 grow">
        {step === 0 && (
          <section aria-labelledby="q-recipient">
            <h1 id="q-recipient" className="font-display text-3xl font-semibold leading-tight text-burgundy-deep">
              {f.steps.recipient.question}
            </h1>
            <p className="mt-2 text-[15px] text-ink-soft">{f.steps.recipient.subtitle}</p>
            <div className="mt-6">
              <ChipGrid
                options={f.steps.recipient.options.map((o) => o.value)}
                value={draft.recipient}
                onPick={(v) => {
                  // changing recipient invalidates a now-irrelevant occasion
                  const keepOccasion = occasionOptions(v).includes(draft.occasion ?? "");
                  update({ recipient: v, occasion: keepOccasion ? draft.occasion : undefined });
                  setTimeout(next, 200);
                }}
              />
            </div>
          </section>
        )}

        {step === 1 && (
          <section aria-labelledby="q-occasion">
            <h1 id="q-occasion" className="font-display text-3xl font-semibold leading-tight text-burgundy-deep">
              {f.steps.occasion.question}
            </h1>
            <p className="mt-2 text-[15px] text-ink-soft">{f.steps.occasion.subtitle}</p>
            <div className="mt-6">
              <ChipGrid
                options={occasionOptions(draft.recipient)}
                value={draft.occasion}
                onPick={(v) => {
                  update({ occasion: v });
                  setTimeout(next, 200);
                }}
              />
            </div>
          </section>
        )}

        {step === 2 && (
          <section aria-labelledby="q-names">
            <h1 id="q-names" className="font-display text-3xl font-semibold leading-tight text-burgundy-deep">
              {f.steps.names.question}
            </h1>
            <p className="mt-2 text-[15px] text-ink-soft">{f.steps.names.subtitle}</p>
            <div className="mt-6 space-y-5">
              <label className="block">
                <span className="text-sm font-bold text-ink">{f.steps.names.theirName}</span>
                <input
                  type="text"
                  value={draft.theirName ?? ""}
                  onChange={(e) => update({ theirName: e.target.value })}
                  placeholder={f.steps.names.theirPlaceholder}
                  autoComplete="off"
                  className="mt-1.5 w-full rounded-xl border-2 border-burgundy/20 bg-linen-warm px-4 py-3.5 text-lg text-ink placeholder:text-ink-soft/50 focus:border-burgundy focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-ink">{f.steps.names.yourName}</span>
                <input
                  type="text"
                  value={draft.yourName ?? ""}
                  onChange={(e) => update({ yourName: e.target.value })}
                  placeholder={f.steps.names.yourPlaceholder}
                  autoComplete="name"
                  className="mt-1.5 w-full rounded-xl border-2 border-burgundy/20 bg-linen-warm px-4 py-3.5 text-lg text-ink placeholder:text-ink-soft/50 focus:border-burgundy focus:outline-none"
                />
              </label>
            </div>
          </section>
        )}

        {step === 3 && (
          <section aria-labelledby="q-story">
            <h1 id="q-story" className="font-display text-3xl font-semibold leading-tight text-burgundy-deep">
              {interp(storyCfg.question, draft.theirName)}
            </h1>
            <p className="mt-2 text-sm text-ink-soft">{interp(storyCfg.hint, draft.theirName)}</p>
            <textarea
              value={draft.story ?? ""}
              onChange={(e) => {
                update({ story: e.target.value });
                if (e.target.value.trim().length >= f.steps.story.minChars) setShowNudge(false);
              }}
              placeholder={interp(storyCfg.placeholders[placeholderIdx], draft.theirName)}
              rows={8}
              className="mt-5 w-full rounded-xl border-2 border-burgundy/20 bg-linen-warm px-4 py-3.5 text-[16px] leading-relaxed text-ink placeholder:text-ink-soft/50 focus:border-burgundy focus:outline-none"
            />
            <div className="mt-1.5 flex items-center justify-between text-xs text-ink-soft">
              <span>{draft.story?.trim().length ?? 0} characters</span>
              {(draft.story?.trim().length ?? 0) >= f.steps.story.minChars && (
                <span className="font-script text-base text-burgundy">perfect, keep going</span>
              )}
            </div>
            {showNudge && (
              <p className="mt-2 rounded-lg bg-blush-soft px-3 py-2 text-sm font-medium text-burgundy-deep" role="status">
                {f.steps.story.nudge}
              </p>
            )}
          </section>
        )}

        {step === 4 && (
          <section aria-labelledby="q-vibe">
            <h1 id="q-vibe" className="font-display text-3xl font-semibold leading-tight text-burgundy-deep">
              {f.steps.vibe.question}
            </h1>
            <p className="mt-2 text-[15px] text-ink-soft">{f.steps.vibe.subtitle}</p>

            <p className="mt-5 text-sm font-bold text-ink">{f.steps.vibe.styleLabel}</p>
            <div className="mt-2 grid grid-cols-2 gap-2.5">
              {f.steps.vibe.styles.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  aria-pressed={draft.style === s.value && !draft.customStyle?.trim()}
                  onClick={() => {
                    update({ style: s.value, customStyle: "" });
                    playPreview(s.preview);
                  }}
                  className={`flex items-center justify-between rounded-2xl border-2 px-4 py-3.5 text-[15px] font-semibold transition-colors ${
                    draft.style === s.value && !draft.customStyle?.trim()
                      ? "border-burgundy bg-blush-soft text-burgundy-deep"
                      : "border-burgundy/15 bg-linen-warm text-ink hover:border-burgundy/40"
                  }`}
                >
                  {s.value}
                  <svg className="text-burgundy/60" width="12" height="12" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
                    <path d="M4 2.5v13l11-6.5-11-6.5z" />
                  </svg>
                </button>
              ))}
            </div>
            <label className="mt-3 block">
              <span className="text-sm font-medium text-ink-soft">{f.steps.vibe.customStyleLabel}</span>
              <input
                type="text"
                value={draft.customStyle ?? ""}
                onChange={(e) => update({ customStyle: e.target.value })}
                placeholder={f.steps.vibe.customStylePlaceholder}
                className="mt-1.5 w-full rounded-xl border-2 border-burgundy/20 bg-linen-warm px-4 py-3 text-[15px] text-ink placeholder:text-ink-soft/50 focus:border-burgundy focus:outline-none"
              />
            </label>

            <p className="mt-5 text-sm font-bold text-ink">{f.steps.vibe.moodLabel}</p>
            <PillGroup options={f.steps.vibe.moods} value={draft.mood} onPick={(m) => update({ mood: m })} />

            <p className="mt-5 text-sm font-bold text-ink">{f.steps.vibe.voiceLabel}</p>
            <PillGroup options={f.steps.vibe.voices} value={draft.voice} onPick={(v) => update({ voice: v })} />

            <audio ref={previewRef} preload="none" />
          </section>
        )}

        {step === 5 && (
          <section aria-labelledby="q-delivery">
            <h1 id="q-delivery" className="font-display text-3xl font-semibold leading-tight text-burgundy-deep">
              {f.steps.delivery.question}
            </h1>
            <p className="mt-2 text-[15px] text-ink-soft">{f.steps.delivery.subtitle}</p>
            <div className="mt-6 space-y-5">
              <label className="block">
                <span className="text-sm font-bold text-ink">{f.steps.delivery.emailLabel}</span>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  value={draft.email ?? ""}
                  onChange={(e) => update({ email: e.target.value })}
                  placeholder={f.steps.delivery.emailPlaceholder}
                  className="mt-1.5 w-full rounded-xl border-2 border-burgundy/20 bg-linen-warm px-4 py-3.5 text-lg text-ink placeholder:text-ink-soft/50 focus:border-burgundy focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-ink">
                  {f.steps.delivery.phoneLabel}{" "}
                  <span className="font-normal text-ink-soft">— {f.steps.delivery.phoneHint}</span>
                </span>
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={draft.phone ?? ""}
                  onChange={(e) => update({ phone: e.target.value })}
                  placeholder={f.steps.delivery.phonePlaceholder}
                  className="mt-1.5 w-full rounded-xl border-2 border-burgundy/20 bg-linen-warm px-4 py-3.5 text-lg text-ink placeholder:text-ink-soft/50 focus:border-burgundy focus:outline-none"
                />
              </label>
            </div>
            <p className="mt-4 text-center text-xs font-medium text-ink-soft">{f.steps.delivery.reassurance}</p>
            {error && (
              <p className="mt-4 rounded-lg bg-blush-soft px-3 py-2 text-sm font-semibold text-burgundy-deep" role="alert">
                {error}
              </p>
            )}
          </section>
        )}
      </div>

      {/* Nav buttons (chip steps auto-advance) */}
      <div className="mt-8 flex items-center gap-3">
        {step > 0 && (
          <button type="button" onClick={back} className="btn-ghost px-5 py-3 text-sm">
            {f.back}
          </button>
        )}
        {step === 2 && (
          <button type="button" onClick={next} disabled={!canContinue()} className="btn-gold grow px-6 py-3.5 disabled:opacity-40">
            {f.next}
          </button>
        )}
        {step === 3 && (
          <button type="button" onClick={handleStoryNext} disabled={!canContinue()} className="btn-gold grow px-6 py-3.5 disabled:opacity-40">
            {f.next}
          </button>
        )}
        {step === 4 && (
          <button type="button" onClick={next} disabled={!canContinue()} className="btn-gold grow px-6 py-3.5 disabled:opacity-40">
            {f.next}
          </button>
        )}
        {step === 5 && (
          <button type="button" onClick={submit} disabled={!canContinue() || submitting} className="btn-gold grow px-6 py-3.5 disabled:opacity-40">
            {submitting ? "Saving…" : f.submit}
          </button>
        )}
      </div>

      {/* Finish-later modal — shown at most once, ever */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-burgundy-deep/50 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="finish-title">
          <div className="card-paper w-full max-w-sm p-6 text-center">
            <h2 id="finish-title" className="mt-2 font-display text-2xl font-semibold text-burgundy-deep">
              {f.saveExitModal.title}
            </h2>
            <p className="mt-2 text-sm text-ink-soft">{f.saveExitModal.body}</p>
            <button type="button" onClick={() => setShowModal(false)} className="btn-gold mt-5 w-full px-6 py-3.5">
              {f.saveExitModal.cta}
            </button>
            <button type="button" onClick={() => setShowModal(false)} className="mt-3 text-sm font-medium text-ink-soft underline underline-offset-4">
              {f.saveExitModal.dismiss}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
