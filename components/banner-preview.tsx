"use client";

import { forwardRef, useMemo } from "react";
import {
  type RatioLayoutDesign,
  type RatioLayoutReference,
  RATIO_LAYOUT_DESIGN_2_3,
} from "@/lib/banner-presets";
import type { BannerThemeId } from "@/lib/banner-theme";
import { bannerThemes } from "@/lib/banner-theme";

export type BannerPreviewProps = {
  width: number;
  height: number;
  theme: BannerThemeId;
  headline: string;
  subheading: string;
  /**
   * When set, padding and type scale from this reference export size (geometric mean of
   * width and height scale vs ref).
   */
  ratioLayoutRef?: RatioLayoutReference | null;
  /** Typography tokens at ref size; defaults to ratio-preset tokens when omitted. */
  ratioLayoutDesign?: RatioLayoutDesign | null;
};

/** Figma node 8219:21523 — uppercase subheading tracking (4.8px at 20px type). */
export const BANNER_CAPS_LETTER_SPACING = "4.8px";

/** Half of `BANNER_CAPS_LETTER_SPACING` — theme tabs, download label, etc. */
export const PAGE_CAPS_LETTER_SPACING = "2.4px";

/** Figma "Inverted v2" (8219:21520): 64px inset; clamp so tiny export sizes still layout. */
const BANNER_PAD_TARGET = 64;
const BANNER_STACK_GAP = 16;
const HEADLINE_PX = 64;
const HEADLINE_LINE_PX = 72;
const SUB_PX = 20;
const SUB_LINE_PX = 24;

export const BannerPreview = forwardRef<HTMLDivElement, BannerPreviewProps>(
  function BannerPreview(
    {
      width,
      height,
      theme,
      headline,
      subheading,
      ratioLayoutRef: ratioRef,
      ratioLayoutDesign,
    },
    ref,
  ) {
    const colors = bannerThemes[theme];

    const layout = useMemo(() => {
      if (
        ratioRef != null &&
        ratioRef.width > 0 &&
        ratioRef.height > 0
      ) {
        const sx = width / ratioRef.width;
        const sy = height / ratioRef.height;
        const s = Math.sqrt(Math.max(1e-12, sx * sy));
        const q = (v: number, floor = 1) =>
          Math.max(floor, Math.round(v * s));
        const d = ratioLayoutDesign ?? RATIO_LAYOUT_DESIGN_2_3;
        return {
          pad: q(d.padding, 8),
          gap: q(d.stackGap, 4),
          headlineFont: q(d.headlineFont, 8),
          headlineLine: q(d.headlineLine, 9),
          subFont: q(d.subFont, 6),
          subLine: q(d.subLine, 8),
          subLetterSpacing: "0.24em",
        };
      }
      const minDim = Math.min(width, height);
      const pad = Math.min(
        BANNER_PAD_TARGET,
        Math.max(8, Math.floor(minDim / 2) - 40),
      );
      return {
        pad,
        gap: BANNER_STACK_GAP,
        headlineFont: HEADLINE_PX,
        headlineLine: HEADLINE_LINE_PX,
        subFont: SUB_PX,
        subLine: SUB_LINE_PX,
        subLetterSpacing: BANNER_CAPS_LETTER_SPACING,
      };
    }, [width, height, ratioRef, ratioLayoutDesign]);

    return (
      <div
        ref={ref}
        data-banner-capture
        style={{
          width,
          height,
          boxSizing: "border-box",
          backgroundColor: colors.background,
          color: colors.foreground,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: layout.gap,
          padding: layout.pad,
          fontFamily: "var(--font-outfit), ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontWeight: 800,
            fontSize: layout.headlineFont,
            lineHeight: `${layout.headlineLine}px`,
          }}
        >
          {headline}
        </h1>
        <p
          style={{
            margin: 0,
            marginLeft: 2,
            fontWeight: 700,
            fontSize: layout.subFont,
            lineHeight: `${layout.subLine}px`,
            textTransform: "uppercase",
            letterSpacing: layout.subLetterSpacing,
            maxWidth: "100%",
          }}
        >
          {subheading}
        </p>
      </div>
    );
  },
);
