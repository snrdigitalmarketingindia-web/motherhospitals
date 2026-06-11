/**
 * MOTHER HOSPITALS — CENTRALIZED OFFER CONFIGURATION
 * ====================================================
 * To run a new campaign:
 *   1. Add a new object to window.MH_OFFERS below.
 *   2. Set enabled: true, start_datetime, end_datetime.
 *   3. Deploy. No template edits needed.
 *
 * To disable an offer immediately:
 *   Set  enabled: false  — it vanishes site-wide on next page load.
 *
 * Display locations: "top_banner" | "navbar" | "popup"
 */

window.MH_OFFERS = [

  {
    id:          "IVF_JUNE_2026",
    name:        "Special IVF Offer — June 2026",
    enabled:     true,

    /* ISO-8601 strings — browser local time (IST = UTC+5:30) */
    start_datetime: "2026-06-01T00:00:00",
    end_datetime:   "2026-06-30T23:59:59",

    /* UI copy — restored from original campaign (main branch) */
    badge:       "🌟 Limited Time",
    title:       "IVF Package ₹99,000/- Only",
    description: "Stimulation Injections · OPU · ICSI · Consultations · Scans · Valid till 30th June 2026",
    cta_text:    "Enquire Now →",
    cta_url:     "https://wa.me/919052074999",

    /* Popup-only sub-copy */
    popup_subtitle: "Germany-trained specialist · 5,000+ IVF cycles · ART Act 2021 certified",

    /* Where to show this offer */
    display_locations: ["top_banner", "navbar", "popup"],

    /* Popup delay in ms */
    popup_delay_ms: 4000,

    /* Priority — higher number shown first when multiple active offers exist */
    priority: 10
  }

  /* ── Add future offers below ──────────────────────────────────────────────
  ,{
    id:          "IUI_AUG_2026",
    name:        "IUI Awareness Month — August 2026",
    enabled:     false,
    start_datetime: "2026-08-01T00:00:00",
    end_datetime:   "2026-08-31T23:59:59",
    badge:       "August Special",
    title:       "IUI Treatment Offer",
    description: "Affordable IUI treatment package for couples trying naturally.",
    cta_text:    "Know More",
    cta_url:     "/iui-treatment-hyderabad.html",
    display_locations: ["top_banner", "navbar"],
    popup_delay_ms: 5000,
    priority: 5
  }
  ── */

];
