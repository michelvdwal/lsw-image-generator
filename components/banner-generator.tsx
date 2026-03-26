"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import {
  BannerPreview,
  PAGE_CAPS_LETTER_SPACING,
} from "@/components/banner-preview";
import {
  BANNER_PRESETS,
  CLEAR_PRESET_ID,
  CLEAR_PRESET_REF_HEIGHT,
  CLEAR_PRESET_REF_WIDTH,
  CUSTOM_PRESET_ID,
  DEFAULT_PRESET_ID,
  DIMENSION_LIMITS,
  heightFromWidth,
  ratioLayoutDesignForPreset,
  ratioLayoutReferenceForPreset,
  widthFromHeight,
  WIKI_PRESET_ID,
  type BannerPreset,
} from "@/lib/banner-presets";
import type { BannerThemeId } from "@/lib/banner-theme";
import { bannerThemes } from "@/lib/banner-theme";

const LSW = "#27348B";
const LABELMuted = "#AAB6CA";
const ORANGE = "#F18700";

const DEFAULT_HEADLINE = "Main heading here";
const DEFAULT_SUB = "Put your subheading here";

function clampSize(n: number): number {
  return Math.min(
    DIMENSION_LIMITS.max,
    Math.max(DIMENSION_LIMITS.min, Math.round(n)),
  );
}


const DEFAULT_DOWNLOAD_BASENAME = "lsw-partner-banner";

/** Safe .png basename from user heading (falls back if empty after sanitizing). */
function pngBasenameFromHeadline(headline: string): string {
  const base = headline
    .trim()
    .replace(/[\u0000-\u001f\\/:*?"<>|]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
  const name = base.length > 0 ? base : DEFAULT_DOWNLOAD_BASENAME;
  return `${name}.png`;
}

type AspectLock = { rw: number; rh: number };

export function BannerGenerator() {
  const defaultPreset =
    BANNER_PRESETS.find((p) => p.id === DEFAULT_PRESET_ID) ?? BANNER_PRESETS[0];

  const [presetId, setPresetId] = useState<string>(DEFAULT_PRESET_ID);
  const [aspectLock, setAspectLock] = useState<AspectLock | null>(null);
  const [width, setWidth] = useState(
    defaultPreset.kind === "fixed"
      ? defaultPreset.width
      : defaultPreset.defaultWidth,
  );
  const [height, setHeight] = useState(
    defaultPreset.kind === "fixed"
      ? defaultPreset.height
      : heightFromWidth(
          defaultPreset.defaultWidth,
          defaultPreset.ratioW,
          defaultPreset.ratioH,
        ),
  );

  const initialW =
    defaultPreset.kind === "fixed"
      ? defaultPreset.width
      : defaultPreset.defaultWidth;
  const initialH =
    defaultPreset.kind === "fixed"
      ? defaultPreset.height
      : heightFromWidth(
          defaultPreset.defaultWidth,
          defaultPreset.ratioW,
          defaultPreset.ratioH,
        );

  const [draftW, setDraftW] = useState(String(initialW));
  const [draftH, setDraftH] = useState(String(initialH));

  const [theme, setTheme] = useState<BannerThemeId>("blue");
  const [headline, setHeadline] = useState(DEFAULT_HEADLINE);
  const [subheading, setSubheading] = useState(DEFAULT_SUB);
  const [busy, setBusy] = useState(false);

  const captureRef = useRef<HTMLDivElement>(null);

  const isWikiHeaderPreset = presetId === WIKI_PRESET_ID;
  const ratioLayoutRef = useMemo(
    () => ratioLayoutReferenceForPreset(presetId),
    [presetId],
  );
  const ratioLayoutDesign = useMemo(
    () => ratioLayoutDesignForPreset(presetId),
    [presetId],
  );

  const activeColors = bannerThemes[theme];

  const previewScale = useMemo(() => {
    const maxW = 960;
    const maxH = 640;
    const sx = maxW / width;
    const sy = maxH / height;
    return Math.min(1, sx, sy);
  }, [width, height]);

  const syncDrafts = (w: number, h: number) => {
    setDraftW(String(w));
    setDraftH(String(h));
  };

  const applyPreset = useCallback((p: BannerPreset) => {
    if (p.kind === "fixed") {
      setAspectLock(null);
      const w = clampSize(p.width);
      const h = clampSize(p.height);
      setWidth(w);
      setHeight(h);
      syncDrafts(w, h);
    } else {
      setAspectLock({ rw: p.ratioW, rh: p.ratioH });
      let w = clampSize(p.defaultWidth);
      let h = clampSize(heightFromWidth(w, p.ratioW, p.ratioH));
      const idealH = heightFromWidth(w, p.ratioW, p.ratioH);
      if (h !== idealH) {
        if (idealH > DIMENSION_LIMITS.max) {
          h = DIMENSION_LIMITS.max;
          w = clampSize(widthFromHeight(h, p.ratioW, p.ratioH));
        } else if (idealH < DIMENSION_LIMITS.min) {
          h = DIMENSION_LIMITS.min;
          w = clampSize(widthFromHeight(h, p.ratioW, p.ratioH));
        }
      }
      setWidth(w);
      setHeight(h);
      syncDrafts(w, h);
    }
    setPresetId(p.id);
  }, []);

  const clearPreset = useCallback(() => {
    setAspectLock(null);
    const w = clampSize(CLEAR_PRESET_REF_WIDTH);
    const h = clampSize(CLEAR_PRESET_REF_HEIGHT);
    setWidth(w);
    setHeight(h);
    syncDrafts(w, h);
    setPresetId(CLEAR_PRESET_ID);
  }, []);

  const reconcileFromWidth = (rawW: number) => {
    if (!aspectLock) return;
    let w = clampSize(rawW);
    let h = heightFromWidth(w, aspectLock.rw, aspectLock.rh);
    h = clampSize(h);
    const backH = heightFromWidth(w, aspectLock.rw, aspectLock.rh);
    if (h !== backH) {
      w = clampSize(widthFromHeight(h, aspectLock.rw, aspectLock.rh));
    }
    setWidth(w);
    setHeight(h);
    syncDrafts(w, h);
  };

  const reconcileFromHeight = (rawH: number) => {
    if (!aspectLock) return;
    let h = clampSize(rawH);
    let w = widthFromHeight(h, aspectLock.rw, aspectLock.rh);
    w = clampSize(w);
    const backW = widthFromHeight(h, aspectLock.rw, aspectLock.rh);
    if (w !== backW) {
      h = clampSize(heightFromWidth(w, aspectLock.rw, aspectLock.rh));
    }
    setWidth(w);
    setHeight(h);
    syncDrafts(w, h);
  };

  const onWidthBlur = () => {
    const n = Number.parseInt(draftW, 10);
    if (Number.isNaN(n)) {
      setDraftW(String(width));
      return;
    }
    if (aspectLock) {
      reconcileFromWidth(n);
      return;
    }
    const w = clampSize(n);
    setWidth(w);
    setDraftW(String(w));
    setPresetId(CUSTOM_PRESET_ID);
  };

  const onHeightBlur = () => {
    const n = Number.parseInt(draftH, 10);
    if (Number.isNaN(n)) {
      setDraftH(String(height));
      return;
    }
    if (aspectLock) {
      reconcileFromHeight(n);
      return;
    }
    const h = clampSize(n);
    setHeight(h);
    setDraftH(String(h));
    setPresetId(CUSTOM_PRESET_ID);
  };

  const downloadPng = async () => {
    const node = captureRef.current;
    if (!node) return;
    setBusy(true);
    try {
      await document.fonts.ready;
      const dataUrl = await toPng(node, {
        width,
        height,
        pixelRatio: 1,
        cacheBust: true,
        backgroundColor: activeColors.background,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = pngBasenameFromHeadline(headline);
      a.click();
    } catch (e) {
      console.error(e);
      alert("Could not export PNG. Check the console for details.");
    } finally {
      setBusy(false);
    }
  };

  const fieldClass =
    "mt-1 w-full rounded-[4px] border border-zinc-200 px-4 py-3 text-base font-normal leading-normal text-[#27348B]";

  const sectionTitleClass = "text-base font-bold leading-normal";
  const labelClass = "text-xs font-bold leading-normal";

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 text-[#27348B] sm:px-6">
      <header className="shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/lsw-logo.svg"
          alt="Leaseweb"
          width={156}
          height={32}
          className="h-8 w-auto"
        />
      </header>

      <section className="flex flex-col gap-6 rounded-[4px] border border-[#DDE2EA] bg-white p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="min-w-0">
            <h3 className={`mb-2 ${sectionTitleClass}`} style={{ color: LSW }}>
              Size
            </h3>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <label className={labelClass} style={{ color: LABELMuted }}>
                Width (px)
                <input
                  inputMode="numeric"
                  value={draftW}
                  onChange={(e) => setDraftW(e.target.value)}
                  onBlur={onWidthBlur}
                  disabled={isWikiHeaderPreset}
                  className={`${fieldClass} disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-[#27348B]/60`}
                />
              </label>
              <label className={labelClass} style={{ color: LABELMuted }}>
                Height (px)
                <input
                  inputMode="numeric"
                  value={draftH}
                  onChange={(e) => setDraftH(e.target.value)}
                  onBlur={onHeightBlur}
                  disabled={isWikiHeaderPreset}
                  className={`${fieldClass} disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-[#27348B]/60`}
                />
              </label>
            </div>
            <p className={`mb-2 ${labelClass}`} style={{ color: LABELMuted }}>
              Presets
            </p>
            <div className="flex flex-wrap gap-2">
              {BANNER_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className={`cursor-pointer rounded-[4px] border px-3 py-1.5 text-left text-sm font-normal leading-normal transition-colors ${
                    presetId === p.id
                      ? "border-[#BFE2FF] bg-[#E3F2FF] font-semibold text-[#0084F2]"
                      : "border-zinc-200 bg-white text-[#27348B] hover:border-zinc-300 hover:bg-zinc-50"
                  }`}
                >
                  {p.label}
                </button>
              ))}
              <button
                type="button"
                onClick={clearPreset}
                className={`cursor-pointer rounded-[4px] border px-3 py-1.5 text-left text-sm font-normal leading-normal transition-colors ${
                  presetId === CLEAR_PRESET_ID
                    ? "border-[#BFE2FF] bg-[#E3F2FF] font-semibold text-[#0084F2]"
                    : "border-zinc-200 bg-white text-[#27348B] hover:border-zinc-300 hover:bg-zinc-50"
                }`}
              >
                No preset
              </button>
            </div>
            <p className="mt-2 text-base font-normal leading-normal" style={{ color: LSW }}>
              {isWikiHeaderPreset
                ? `Wiki header is fixed at ${width}×${height}px.`
                : aspectLock
                  ? `Aspect locked to ${aspectLock.rw}∶${aspectLock.rh}. Edit one side to scale the other.`
                  : `Free sizing. Values are clamped to ${DIMENSION_LIMITS.min}–${DIMENSION_LIMITS.max}px.`}
            </p>
          </div>

          <div className="min-w-0">
            <h3 className={`mb-2 ${sectionTitleClass}`} style={{ color: LSW }}>
              Text
            </h3>
            <label className={`block ${labelClass}`} style={{ color: LABELMuted }}>
              Main heading
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className={fieldClass}
              />
            </label>
            <label className={`mt-3 block ${labelClass}`} style={{ color: LABELMuted }}>
              Subheading (shown uppercase in preview)
              <input
                type="text"
                value={subheading}
                onChange={(e) => setSubheading(e.target.value)}
                className={fieldClass}
              />
            </label>
            <button
              type="button"
              onClick={() => {
                setHeadline(DEFAULT_HEADLINE);
                setSubheading(DEFAULT_SUB);
              }}
              className="mt-2 text-base font-normal leading-normal text-[#27348B] underline-offset-2 hover:underline"
            >
              Reset copy
            </button>
            <button
              type="button"
              onClick={() => void downloadPng()}
              disabled={busy}
              style={{
                backgroundColor: ORANGE,
                letterSpacing: PAGE_CAPS_LETTER_SPACING,
              }}
              className="font-sans mt-4 w-full cursor-pointer rounded-[4px] border border-transparent px-4 py-3 text-base font-bold leading-normal text-white uppercase transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "EXPORTING…" : "DOWNLOAD PNG"}
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-[4px] border border-[#DDE2EA] bg-white p-4 sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3
            className="font-sans text-lg font-bold leading-normal sm:text-xl"
            style={{ color: LSW }}
          >
            Preview
          </h3>
          <div
            className="flex w-full overflow-hidden rounded-[4px] border border-zinc-200 sm:w-auto sm:shrink-0"
            role="tablist"
            aria-label="Preview theme"
          >
            {(Object.keys(bannerThemes) as BannerThemeId[]).map((id, i) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={theme === id}
                onClick={() => setTheme(id)}
                className={`min-w-0 flex-1 px-3 py-2 text-center text-xs font-bold uppercase leading-normal transition-colors sm:flex-none sm:px-4 sm:text-sm ${
                  theme === id
                    ? "relative z-[1] border-[#BFE2FF] bg-[#E3F2FF] text-[#0084F2]"
                    : i > 0
                      ? "border-l border-zinc-200 bg-white text-[#27348B] hover:bg-zinc-50"
                      : "bg-white text-[#27348B] hover:bg-zinc-50"
                }`}
                style={{ letterSpacing: PAGE_CAPS_LETTER_SPACING }}
              >
                {bannerThemes[id].label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex min-h-[320px] w-full items-center justify-center overflow-hidden">
          <div
            style={{
              width: width * previewScale,
              height: height * previewScale,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width,
                height,
                transform: `scale(${previewScale})`,
                transformOrigin: "top left",
              }}
            >
              <BannerPreview
                ref={captureRef}
                width={width}
                height={height}
                theme={theme}
                headline={headline}
                subheading={subheading}
                ratioLayoutRef={ratioLayoutRef}
                ratioLayoutDesign={ratioLayoutDesign}
              />
            </div>
          </div>
        </div>
        <p
          className={`mt-2 text-center ${labelClass}`}
          style={{ color: LABELMuted }}
        >
          Export size: {width}×{height}px (Outfit 800 / 700)
        </p>
      </section>
    </div>
  );
}
