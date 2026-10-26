"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,Info,Bug,Shield,Sparkles, Ban,HelpCircle,Cloud,MapPin,UploadCloud,X,Check,ChevronRight,Droplets, ClipboardCheck,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { getTheme, riskColor } from "@/lib/theme";
import {OBSERVER_TYPES, BIO_CONDITIONS, classifyParam,
} from "@/lib/mockData";
import { fetchStreams, createObservation, buildObservationPayload } from "@/lib/api";
import { addLocalItem, STORAGE_KEYS } from "@/lib/localStore"; // drafts only - real submits go to the backend
import DashboardShell from "@/components/layout/DashboardShell";
import { TextInput, SelectInput } from "@/components/ui/FormField";

const STEPS = [
  {
    key: "water",
    label: "Water Quality",
    sub: "8 parameters",
    icon: Droplets,
  },
  {
    key: "bio",
    label: "Biodiversity",
    sub: "Organism indicators",
    icon: Bug,
  },
  {
    key: "obs",
    label: "Observations",
    sub: "Visual & sensory",
    icon: Cloud,
  },
  {
    key: "location",
    label: "Location & Photos",
    sub: "Where & evidence",
    icon: MapPin,
  },
  {
    key: "review",
    label: "Review & Submit",
    sub: "Final confirmation",
    icon: ClipboardCheck,
  },
];

const WQ_FIELDS = [
  {
    key: "ph",
    label: "pH",
    range: "0 - 14",
    min: 0,
    max: 14,
    step: 0.1,
    ideal: "6.5 - 8.5",
  },
  {
    key: "turbidity",
    label: "Turbidity (NTU)",
    range: "0 - 1000",
    min: 0,
    max: 1000,
    step: 1,
    ideal: "< 25 NTU",
  },
  {
    key: "oxygen",
    label: "Dissolved Oxygen (mg/L)",
    range: "0 - 20",
    min: 0,
    max: 20,
    step: 0.1,
    ideal: "> 5 mg/L",
  },
  {
    key: "temperature",
    label: "Temperature (°C)",
    range: "-5 - 40",
    min: -5,
    max: 40,
    step: 0.1,
    ideal: "18 - 28°C",
  },
  {
    key: "conductivity",
    label: "Conductivity (µS/cm)",
    range: "0 - 5000",
    min: 0,
    max: 5000,
    step: 10,
    ideal: "< 800 µS/cm",
  },
  {
    key: "tds",
    label: "Total Dissolved Solids (mg/L)",
    range: "0 - 2000",
    min: 0,
    max: 2000,
    step: 10,
    ideal: "< 500 mg/L",
  },
  {
    key: "nitrate",
    label: "Nitrate (mg/L)",
    range: "0 - 50",
    min: 0,
    max: 50,
    step: 0.1,
    ideal: "< 10 mg/L",
  },
  {
    key: "phosphate",
    label: "Phosphate (mg/L)",
    range: "0 - 10",
    min: 0,
    max: 10,
    step: 0.1,
    ideal: "< 1 mg/L",
  },
];

const ORGANISMS = [
  {
    key: "mayfly",
    name: "Mayfly / Stonefly",
    note: "Healthy indicators",
    icon: Bug,
    level: "good",
  },
  {
    key: "tolerant",
    name: "Other tolerant organisms",
    note: "Neutral indicators",
    icon: Shield,
    level: "good",
  },
  {
    key: "worms",
    name: "Worms / Leeches",
    note: "Degraded indicators",
    icon: Bug,
    level: "bad",
  },
  {
    key: "mixed",
    name: "Mixed organisms",
    note: "Varied indicators",
    icon: Sparkles,
    level: "warn",
  },
  {
    key: "none",
    name: "No organisms observed",
    note: "Possible severe degradation",
    icon: Ban,
    level: "bad",
  },
  {
    key: "unknown",
    name: "Unknown / Not observed",
    note: "Not assessed this visit",
    icon: HelpCircle,
    level: "muted",
  },
];

function organismColors(t, level) {
  if (level === "good") return { fg: t.good, bg: t.goodSoft };
  if (level === "warn") return { fg: t.warn, bg: t.warnSoft };
  if (level === "bad") return { fg: t.bad, bg: t.badSoft };

  return {
    fg: t.textMuted,
    bg: t.borderSoft,
  };
}

function nowLocalISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());

  return d.toISOString().slice(0, 16);
}

export default function AddObservation() {
  const { mode, accent } = useTheme();
  const t = getTheme(mode, accent);
  const router = useRouter();

  const [allStreams, setAllStreams] = useState([]);
  const [loadingStreams, setLoadingStreams] = useState(true);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    fetchStreams()
      .then((data) => {
        const mapped = data.map((s) => ({ id: s._id, name: s.name, location: s.region || "-" }));
        setAllStreams(mapped);
        setStreamId((current) => current || mapped[0]?.id || "");
      })
      .catch((err) => console.error("Failed to load streams:", err))
      .finally(() => setLoadingStreams(false));
  }, []);

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showAllParams, setShowAllParams] = useState(false);

  const [wq, setWq] = useState({
    ph: "",
    turbidity: "",
    oxygen: "",
    temperature: "",
    conductivity: "",
    tds: "",
    nitrate: "",
    phosphate: "",
  });

  const [organism, setOrganism] = useState("");
  const [bioCondition, setBioCondition] = useState("Moderate");
  const [bioScore, setBioScore] = useState(0.5);

  const [weather, setWeather] = useState({
    rain24: "",
    rain72: "",
    airTemp: "",
    condition: "Sunny",
    recentRain: "No",
  });

  const [obsInfo, setObsInfo] = useState({
    datetime: nowLocalISO(),
    observerType: "Citizen",
    status: "Submitted",
  });

  const [streamId, setStreamId] = useState(
    allStreams[0]?.id || ""
  );

  const [photos, setPhotos] = useState([]);
  const [notes, setNotes] = useState("");

  const selectedStream =
    allStreams.find((s) => s.id === streamId) || allStreams[0];

  const selectedOrganism = ORGANISMS.find(
    (o) => o.key === organism
  );

  function updateWq(key, value) {
    setWq((f) => ({
      ...f,
      [key]: value,
    }));
  }

  function validateStep(i) {
    const e = {};

    if (i === 3 && !streamId) {
      e.streamId = "Select a stream";
    }

    setErrors(e);

    return Object.keys(e).length === 0;
  }

  function goNext() {
    if (validateStep(step)) {
      setStep((s) =>
        Math.min(s + 1, STEPS.length - 1)
      );
    }
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function jumpTo(i) {
    if (i <= step) {
      setStep(i);
    }
  }

  function computeRisk() {
    const levels = WQ_FIELDS.map((f) =>
      classifyParam(f.key, wq[f.key])
    ).filter(Boolean);

    if (levels.some((l) => l.level === "bad")) {
      return "high";
    }

    if (levels.some((l) => l.level === "warn")) {
      return "medium";
    }

    return "low";
  }

  function buildRecord(status) {
    return {
      id: Date.now(),
      stream: selectedStream?.name || "Unknown Stream",
      location: selectedStream?.location || "-",
      biodiversity: bioCondition,
      risk: computeRisk(),
      time: "just now",
      status,
      details: {
        wq,
        organism,
        bioCondition,
        bioScore,
        weather,
        obsInfo,
        photos: photos.length,
        notes,
      },
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateStep(3)) {
      setStep(3);
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const payload = buildObservationPayload({
        streamId, wq, organism, bioCondition, bioScore, weather, obsInfo,
      });
      await createObservation(payload);
      router.push("/observations");
    } catch (err) {
      console.error("Failed to submit observation:", err);
      setSubmitError(err.message || "Could not submit observation. Is the backend running?");
      setSubmitting(false);
    }
  }

  // Drafts stay local-only (no prediction needed until it's actually submitted).
  function handleSaveDraft() {
    addLocalItem(
      STORAGE_KEYS.observations,
      buildRecord("Draft")
    );

    router.push("/observations");
  }

  function addPhoto(fileList) {
    const names = Array.from(fileList || []).map(
      (f) => f.name
    );

    setPhotos((p) => [...p, ...names]);
  }

  function removePhoto(i) {
    setPhotos((p) =>
      p.filter((_, idx) => idx !== i)
    );
  }

  const tipByStep = [
    "Enter all 8 water quality parameters for a more accurate risk assessment - partial data still works.",
    "Select the organism group you observed and set a biodiversity score between 0 and 1.",
    "Weather conditions help explain sudden shifts in water quality readings.",
    "Add the stream location and any photo evidence you collected.",
    "Review everything carefully - you can jump back to any earlier step before submitting.",
  ];

  return (
    <DashboardShell
      active="/observations"
      title="Add New Observation"
      subtitle="Record stream conditions to help monitor water health and protect our environment."
    >
      {/* Back */}
      <Link
        href="/observations"
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium no-underline"
        style={{
          color: t.textSecondary,
        }}
      >
        <ArrowLeft size={14} />
        Back to Observations
      </Link>

      {/* Slim top step indicator */}
      <div className="mb-5 flex flex-wrap items-center gap-y-2">
        {STEPS.map((s, i) => {
          const isDone = i < step;
          const isActive = i === step;

          return (
            <div
              key={s.key}
              className="flex items-center"
            >
              <button
                type="button"
                onClick={() => jumpTo(i)}
                className={`flex items-center gap-2 border-none bg-transparent p-0 ${
                  i <= step
                    ? "cursor-pointer"
                    : "cursor-default"
                }`}
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold"
                  style={{
                    background: isDone
                      ? t.good
                      : isActive
                        ? t.primary
                        : t.borderSoft,
                    color:
                      isDone || isActive
                        ? "#fff"
                        : t.textMuted,
                  }}
                >
                  {isDone ? <Check size={13} /> : i + 1}
                </span>

                <span
                  className="hidden text-[12.5px] sm:inline"
                  style={{
                    fontWeight: isActive ? 600 : 500,
                    color: isActive
                      ? t.primary
                      : isDone
                        ? t.textPrimary
                        : t.textMuted,
                  }}
                >
                  {s.label}
                </span>
              </button>

              {i < STEPS.length - 1 && (
                <div
                  className="mx-2 h-[1.5px] w-6"
                  style={{
                    background:
                      i < step
                        ? t.good
                        : t.border,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_300px]">
          {/* Main step panel */}
          <div
            className="rounded-2xl border p-[22px]"
            style={{
              background: t.surface,
              borderColor: t.border,
            }}
          >
            {/* STEP 1 */}
            {step === 0 && (
              <div>
                <SectionHeading
                  t={t}
                  title="1. Water Quality Measurements"
                  sub="Enter the measured or observed values of water quality parameters."
                />

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {WQ_FIELDS.map((f) => {
                    const cls = classifyParam(
                      f.key,
                      wq[f.key]
                    );

                    const dotColor = cls
                      ? t[cls.level]
                      : t.border;

                    return (
                      <div
                        key={f.key}
                        className="rounded-[10px] border p-3.5"
                        style={{
                          background: t.surfaceRaised,
                          borderColor: t.borderSoft,
                        }}
                      >
                        <div className="mb-2 flex items-center gap-1.5">
                          <label
                            className="text-xs font-medium"
                            style={{
                              color: t.textSecondary,
                            }}
                          >
                            {f.label}
                          </label>

                          <Info
                            size={11}
                            color={t.textMuted}
                            title={`Valid range: ${f.range}`}
                          />
                        </div>

                        <input
                          type="number"
                          step={f.step}
                          value={wq[f.key]}
                          onChange={(e) =>
                            updateWq(
                              f.key,
                              e.target.value
                            )
                          }
                          placeholder="—"
                          className="mb-2 w-full border-none bg-transparent p-0 font-mono text-lg font-semibold outline-none"
                          style={{
                            color: t.textPrimary,
                          }}
                        />

                        <input
                          type="range"
                          min={f.min}
                          max={f.max}
                          step={f.step}
                          value={
                            wq[f.key] || f.min
                          }
                          onChange={(e) =>
                            updateWq(
                              f.key,
                              e.target.value
                            )
                          }
                          className="mb-1 w-full"
                          style={{
                            accentColor: dotColor,
                          }}
                        />

                        <div className="flex items-center justify-between">
                          <span
                            className="font-mono text-[10px]"
                            style={{
                              color: t.textMuted,
                            }}
                          >
                            {f.min}
                          </span>

                          {cls ? (
                            <span
                              className="rounded-[20px] px-2 py-px text-[10.5px] font-semibold"
                              style={{
                                color:
                                  t[cls.level],
                                background:
                                  t[
                                    cls.level +
                                      "Soft"
                                  ],
                              }}
                            >
                              {cls.label}
                            </span>
                          ) : (
                            <span
                              className="text-[9.5px]"
                              style={{
                                color: t.textMuted,
                              }}
                            >
                              Ideal: {f.ideal}
                            </span>
                          )}

                          <span
                            className="font-mono text-[10px]"
                            style={{
                              color: t.textMuted,
                            }}
                          >
                            {f.max}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 1 && (
              <div>
                <SectionHeading
                  t={t}
                  title="2. Biodiversity Observation"
                  sub="What type of organisms were observed?"
                />

                <p
                  className="mb-2.5 mt-[18px] text-xs font-medium"
                  style={{
                    color: t.textSecondary,
                  }}
                >
                  Observed Organisms
                </p>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {ORGANISMS.map((o) => {
                    const active =
                      organism === o.key;

                    const c = organismColors(
                      t,
                      o.level
                    );

                    const Icon = o.icon;

                    return (
                      <button
                        key={o.key}
                        type="button"
                        onClick={() =>
                          setOrganism(o.key)
                        }
                        className="relative flex cursor-pointer flex-col items-center gap-2 rounded-xl px-2.5 py-[18px] text-center"
                        style={{
                          border: `1.5px solid ${
                            active
                              ? t.primary
                              : t.border
                          }`,
                          background: active
                            ? t.primarySoft
                            : t.surfaceRaised,
                        }}
                      >
                        {active && (
                          <span
                            className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full"
                            style={{
                              background: t.good,
                            }}
                          >
                            <Check
                              size={10}
                              color="#fff"
                            />
                          </span>
                        )}

                        <Icon
                          size={20}
                          color={
                            active
                              ? t.primary
                              : c.fg
                          }
                        />

                        <div>
                          <p
                            className="m-0 text-xs font-semibold"
                            style={{
                              color:
                                t.textPrimary,
                            }}
                          >
                            {o.name}
                          </p>

                          <p
                            className="mb-0 mt-0.5 text-[10px]"
                            style={{
                              color: t.textMuted,
                            }}
                          >
                            {o.note}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <SelectInput
                    t={t}
                    label="Biological Condition"
                    required
                    value={bioCondition}
                    onChange={(e) =>
                      setBioCondition(
                        e.target.value
                      )
                    }
                  >
                    {BIO_CONDITIONS.map((c) => (
                      <option
                        key={c}
                        value={c}
                      >
                        {c}
                      </option>
                    ))}
                  </SelectInput>

                  <div>
                    <div className="mb-1.5 flex items-center gap-1.5">
                      <label
                        className="text-xs font-medium"
                        style={{
                          color:
                            t.textSecondary,
                        }}
                      >
                        Biodiversity Score (0 - 1)
                      </label>

                      <Info
                        size={11}
                        color={t.textMuted}
                      />
                    </div>

                    <input
                      type="number"
                      min={0}
                      max={1}
                      step={0.01}
                      value={bioScore}
                      onChange={(e) =>
                        setBioScore(
                          Math.min(
                            1,
                            Math.max(
                              0,
                              parseFloat(
                                e.target.value
                              ) || 0
                            )
                          )
                        )
                      }
                      className="mb-1.5 w-full rounded-lg border px-[11px] py-2 text-[13px] outline-none"
                      style={{
                        background:
                          t.surfaceRaised,
                        borderColor: t.border,
                        color: t.textPrimary,
                      }}
                    />

                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={bioScore}
                      onChange={(e) =>
                        setBioScore(
                          parseFloat(
                            e.target.value
                          )
                        )
                      }
                      className="mb-1 w-full"
                      style={{
                        accentColor:
                          bioScore < 0.4
                            ? t.bad
                            : bioScore < 0.7
                              ? t.warn
                              : t.good,
                      }}
                    />

                    <div
                      className="flex items-center justify-between text-[10px]"
                      style={{
                        color: t.textMuted,
                      }}
                    >
                      <span>Poor · 0</span>
                      <span>
                        Moderate · 0.5
                      </span>
                      <span>Excellent · 1</span>
                    </div>
                  </div>
                </div>

                <div
                  className="mt-4 flex items-start gap-2 text-[11px]"
                  style={{
                    color: t.textMuted,
                  }}
                >
                  <Info
                    size={12}
                    className="mt-px shrink-0"
                  />

                  Score is a simple biological-health
                  signal and not a scientifically
                  validated index.
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 2 && (
              <div className="flex flex-col gap-5">
                <div>
                  <SectionHeading
                    t={t}
                    title="3. Weather & Environmental Conditions"
                    sub="Recent weather conditions can impact stream health."
                  />

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <TextInput
                      t={t}
                      label="Rainfall - Last 24h (mm)"
                      type="number"
                      value={weather.rain24}
                      onChange={(e) =>
                        setWeather((w) => ({
                          ...w,
                          rain24:
                            e.target.value,
                        }))
                      }
                    />

                    <TextInput
                      t={t}
                      label="Rainfall - Last 72h (mm)"
                      type="number"
                      value={weather.rain72}
                      onChange={(e) =>
                        setWeather((w) => ({
                          ...w,
                          rain72:
                            e.target.value,
                        }))
                      }
                    />

                    <TextInput
                      t={t}
                      label="Air Temperature (°C)"
                      type="number"
                      value={weather.airTemp}
                      onChange={(e) =>
                        setWeather((w) => ({
                          ...w,
                          airTemp:
                            e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <SelectInput
                      t={t}
                      label="Weather Condition"
                      value={weather.condition}
                      onChange={(e) =>
                        setWeather((w) => ({
                          ...w,
                          condition:
                            e.target.value,
                        }))
                      }
                    >
                      {[
                        "Sunny",
                        "Cloudy",
                        "Rain",
                        "Overcast",
                        "Storm",
                      ].map((c) => (
                        <option
                          key={c}
                          value={c}
                        >
                          {c}
                        </option>
                      ))}
                    </SelectInput>

                    <div>
                      <label
                        className="mb-[5px] block text-xs font-medium"
                        style={{
                          color:
                            t.textSecondary,
                        }}
                      >
                        Recent Rainfall?
                      </label>

                      <div className="flex gap-2">
                        {["Yes", "No"].map(
                          (v) => {
                            const active =
                              weather.recentRain ===
                              v;

                            return (
                              <button
                                key={v}
                                type="button"
                                onClick={() =>
                                  setWeather(
                                    (w) => ({
                                      ...w,
                                      recentRain:
                                        v,
                                    })
                                  )
                                }
                                className="flex-1 cursor-pointer rounded-lg py-[9px] text-[12.5px] font-semibold"
                                style={{
                                  border: `1.5px solid ${
                                    active
                                      ? t.good
                                      : t.border
                                  }`,
                                  background:
                                    active
                                      ? t.goodSoft
                                      : t.surfaceRaised,
                                  color: active
                                    ? t.good
                                    : t.textSecondary,
                                }}
                              >
                                {v}
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="border-t pt-[18px]"
                  style={{
                    borderColor: t.borderSoft,
                  }}
                >
                  <SectionHeading
                    t={t}
                    title="4. Time & Observation Info"
                    sub="When and by whom was this observation recorded?"
                  />

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <TextInput
                      t={t}
                      label="Observation Date & Time"
                      type="datetime-local"
                      value={obsInfo.datetime}
                      onChange={(e) =>
                        setObsInfo((o) => ({
                          ...o,
                          datetime:
                            e.target.value,
                        }))
                      }
                    />

                    <SelectInput
                      t={t}
                      label="Observer Type"
                      value={
                        obsInfo.observerType
                      }
                      onChange={(e) =>
                        setObsInfo((o) => ({
                          ...o,
                          observerType:
                            e.target.value,
                        }))
                      }
                    >
                      {OBSERVER_TYPES.map(
                        (s) => (
                          <option
                            key={s}
                            value={s}
                          >
                            {s}
                          </option>
                        )
                      )}
                    </SelectInput>

                    <SelectInput
                      t={t}
                      label="Observation Status"
                      value={obsInfo.status}
                      onChange={(e) =>
                        setObsInfo((o) => ({
                          ...o,
                          status:
                            e.target.value,
                        }))
                      }
                    >
                      {[
                        "Submitted",
                        "Under Review",
                        "Draft",
                      ].map((s) => (
                        <option
                          key={s}
                          value={s}
                        >
                          {s}
                        </option>
                      ))}
                    </SelectInput>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4 */}
            {step === 3 && (
              <div>
                <SectionHeading
                  t={t}
                  title="Location & Photos"
                  sub="Confirm the stream location and attach photo evidence."
                />

                <div className="mt-4">
                  <SelectInput
                    t={t}
                    label="Stream"
                    required
                    value={streamId}
                    error={errors.streamId}
                    onChange={(e) =>
                      setStreamId(
                        e.target.value
                      )
                    }
                  >
                    {allStreams.map((s) => (
                      <option
                        key={s.id}
                        value={s.id}
                      >
                        {s.name}
                      </option>
                    ))}
                  </SelectInput>

                  {!loadingStreams && allStreams.length === 0 && (
                    <p className="mt-1.5 text-[11px]" style={{ color: t.warn }}>
                      No streams found yet.{" "}
                      <Link href="/streams/add" style={{ color: t.primary }}>
                        Add one first
                      </Link>
                      .
                    </p>
                  )}
                </div>

                {selectedStream && (
                  <div
                    className="mt-2 flex items-center gap-2 text-xs"
                    style={{
                      color:
                        t.textSecondary,
                    }}
                  >
                    <MapPin
                      size={13}
                      color={t.textMuted}
                    />

                    {selectedStream.location}
                  </div>
                )}

                <p
                  className="mb-2.5 mt-5 text-xs font-medium"
                  style={{
                    color: t.textSecondary,
                  }}
                >
                  Photo Evidence
                </p>

                <div className="grid max-w-[420px] grid-cols-3 gap-3 sm:grid-cols-4">
                  {photos.map((name, i) => (
                    <div
                      key={i}
                      className="relative flex aspect-square items-center justify-center rounded-[10px] p-1.5"
                      style={{
                        background:
                          t.borderSoft,
                      }}
                    >
                      <span
                        className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-[9px]"
                        style={{
                          color:
                            t.textSecondary,
                        }}
                      >
                        {name}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          removePhoto(i)
                        }
                        className="absolute -right-1.5 -top-1.5 flex h-[18px] w-[18px] cursor-pointer items-center justify-center rounded-full border-none"
                        style={{
                          background: t.bad,
                          color: "#fff",
                        }}
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}

                  <label
                    htmlFor="obs-photo"
                    className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-[10px] border-[1.5px] border-dashed"
                    style={{
                      borderColor: t.border,
                    }}
                  >
                    <UploadCloud
                      size={16}
                      color={t.textMuted}
                    />

                    <span
                      className="text-[9px]"
                      style={{
                        color: t.textMuted,
                      }}
                    >
                      Add photo
                    </span>

                    <input
                      id="obs-photo"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) =>
                        addPhoto(
                          e.target.files
                        )
                      }
                    />
                  </label>
                </div>

                <div className="mt-5">
                  <label
                    className="mb-[5px] block text-xs font-medium"
                    style={{
                      color:
                        t.textSecondary,
                    }}
                  >
                    Notes (Optional)
                  </label>

                  <textarea
                    value={notes}
                    maxLength={300}
                    rows={3}
                    onChange={(e) =>
                      setNotes(e.target.value)
                    }
                    placeholder="Any additional notes about the observation..."
                    className="w-full resize-y rounded-lg border px-[11px] py-[9px] text-[13px] outline-none"
                    style={{
                      background:
                        t.surfaceRaised,
                      borderColor: t.border,
                      color: t.textPrimary,
                      fontFamily:
                        "var(--font-body)",
                    }}
                  />

                  <p
                    className="m-0 mt-[3px] text-right text-[10.5px]"
                    style={{
                      color: t.textMuted,
                    }}
                  >
                    {notes.length}/300
                  </p>
                </div>
              </div>
            )}

            {/* STEP 5 */}
            {step === 4 && (
              <div>
                <SectionHeading
                  t={t}
                  title="Review & Submit"
                  sub="Double-check everything before saving this observation."
                />

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <ReviewCard
                    t={t}
                    title="Water Quality"
                    rows={WQ_FIELDS.map((f) => {
                      const cls =
                        classifyParam(
                          f.key,
                          wq[f.key]
                        );

                      return [
                        f.label,
                        wq[f.key] || "-",
                        cls,
                      ];
                    })}
                    withBadge
                  />

                  <ReviewCard
                    t={t}
                    title="Biodiversity"
                    rows={[
                      [
                        "Observed Organisms",
                        selectedOrganism?.name ||
                          "Not set",
                      ],
                      [
                        "Biological Condition",
                        bioCondition,
                      ],
                      [
                        "Biodiversity Score",
                        bioScore,
                      ],
                    ]}
                  />

                  <ReviewCard
                    t={t}
                    title="Weather & Environment"
                    rows={[
                      [
                        "Rainfall (24h)",
                        weather.rain24
                          ? `${weather.rain24} mm`
                          : "-",
                      ],
                      [
                        "Rainfall (72h)",
                        weather.rain72
                          ? `${weather.rain72} mm`
                          : "-",
                      ],
                      [
                        "Air Temperature",
                        weather.airTemp
                          ? `${weather.airTemp} °C`
                          : "-",
                      ],
                      [
                        "Condition",
                        weather.condition,
                      ],
                      [
                        "Recent Rainfall",
                        weather.recentRain,
                      ],
                    ]}
                  />

                  <ReviewCard
                    t={t}
                    title="Observation Info"
                    rows={[
                      [
                        "Stream",
                        selectedStream?.name ||
                          "-",
                      ],
                      [
                        "Location",
                        selectedStream?.location ||
                          "-",
                      ],
                      [
                        "Date & Time",
                        obsInfo.datetime.replace(
                          "T",
                          " "
                        ),
                      ],
                      [
                        "Observer Type",
                        obsInfo.observerType,
                      ],
                      [
                        "Status",
                        obsInfo.status,
                      ],
                      [
                        "Photos",
                        `${photos.length} attached`,
                      ],
                    ]}
                  />
                </div>

                {notes && (
                  <div
                    className="mt-4 rounded-xl border p-4"
                    style={{
                      background:
                        t.surfaceRaised,
                      borderColor:
                        t.borderSoft,
                    }}
                  >
                    <p
                      className="mb-1.5 font-mono text-[11px]"
                      style={{
                        color: t.textMuted,
                      }}
                    >
                      NOTES
                    </p>

                    <p
                      className="m-0 text-[12.5px] leading-[1.5]"
                      style={{
                        color:
                          t.textSecondary,
                      }}
                    >
                      {notes}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Footer nav */}
            <div
              className="mt-6 flex items-center justify-between border-t pt-5"
              style={{
                borderColor: t.borderSoft,
              }}
            >
              <div className="flex items-center gap-2">
                {step === 0 ? (
                  <Link
                    href="/observations"
                    className="rounded-lg border px-4 py-[9px] text-[12.5px] font-medium no-underline"
                    style={{
                      color:
                        t.textSecondary,
                      borderColor: t.border,
                    }}
                  >
                    Cancel
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={goBack}
                    className="cursor-pointer rounded-lg border bg-transparent px-4 py-[9px] text-[12.5px] font-medium"
                    style={{
                      color:
                        t.textSecondary,
                      borderColor: t.border,
                    }}
                  >
                    ← Previous
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="cursor-pointer rounded-lg border bg-transparent px-4 py-[9px] text-[12.5px] font-medium"
                  style={{
                    color: t.textSecondary,
                    borderColor: t.border,
                  }}
                >
                  Save as Draft
                </button>
              </div>

              {submitError && (
                <p
                  className="m-0 text-[11.5px] font-medium"
                  style={{ color: t.bad }}
                >
                  {submitError}
                </p>
              )}

              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg border-none px-[18px] py-[9px] text-[12.5px] font-semibold"
                  style={{
                    color:
                      mode === "dark"
                        ? "#0B1417"
                        : "#fff",
                    background: t.primary,
                  }}
                >
                  Next Step
                  <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex items-center gap-1.5 rounded-lg border-none px-[18px] py-[9px] text-[12.5px] font-semibold ${
                    submitting
                      ? "cursor-default"
                      : "cursor-pointer"
                  }`}
                  style={{
                    color: "#fff",
                    background: t.good,
                    opacity: submitting
                      ? 0.7
                      : 1,
                  }}
                >
                  {submitting
                    ? "Saving..."
                    : "Save Observation"}

                  <Check size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Persistent live summary sidebar */}
          <div
            className="sticky top-[78px] rounded-2xl border p-[18px]"
            style={{
              background: t.surface,
              borderColor: t.border,
            }}
          >
            <p
              className="mb-[3px] font-[family-name:var(--font-display)] text-sm font-semibold"
              style={{
                color: t.textPrimary,
              }}
            >
              Observation Summary
            </p>

            <p
              className="mb-4 text-[11px]"
              style={{
                color: t.textMuted,
              }}
            >
              Updates live as you fill in each
              step.
            </p>

            <SummarySection
              t={t}
              title="Stream Details"
            >
              <SummaryRow
                t={t}
                label="Stream Name"
                value={
                  selectedStream?.name || "-"
                }
              />

              <SummaryRow
                t={t}
                label="Location"
                value={
                  selectedStream?.location ||
                  "-"
                }
              />
            </SummarySection>

            <SummarySection
              t={t}
              title="Water Quality (Preview)"
            >
              {WQ_FIELDS.slice(
                0,
                showAllParams ? 8 : 4
              ).map((f) => {
                const cls = classifyParam(
                  f.key,
                  wq[f.key]
                );

                return (
                  <div
                    key={f.key}
                    className="flex items-center gap-2 py-0.5"
                  >
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{
                        background: cls
                          ? t[cls.level]
                          : t.border,
                      }}
                    />

                    <span
                      className="flex-1 text-[11.5px]"
                      style={{
                        color:
                          t.textSecondary,
                      }}
                    >
                      {f.label.split(" (")[0]}
                    </span>

                    <span
                      className="font-mono text-[11.5px] font-medium"
                      style={{
                        color:
                          t.textPrimary,
                      }}
                    >
                      {wq[f.key] || "-"}
                    </span>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() =>
                  setShowAllParams(
                    (v) => !v
                  )
                }
                className="cursor-pointer border-none bg-transparent px-0 pt-1.5 text-[11px]"
                style={{
                  color: t.primary,
                }}
              >
                {showAllParams
                  ? "Show fewer parameters"
                  : "Show all parameters (8)"}
              </button>
            </SummarySection>

            <SummarySection
              t={t}
              title="Weather (Preview)"
            >
              <SummaryRow
                t={t}
                label="Rain (24h)"
                value={
                  weather.rain24
                    ? `${weather.rain24} mm`
                    : "-"
                }
              />

              <SummaryRow
                t={t}
                label="Rain (72h)"
                value={
                  weather.rain72
                    ? `${weather.rain72} mm`
                    : "-"
                }
              />

              <SummaryRow
                t={t}
                label="Air Temperature"
                value={
                  weather.airTemp
                    ? `${weather.airTemp} °C`
                    : "-"
                }
              />
            </SummarySection>

            <SummarySection
              t={t}
              title="Biodiversity (Preview)"
            >
              <SummaryRow
                t={t}
                label="Observed"
                value={
                  selectedOrganism?.name ||
                  "-"
                }
              />

              <SummaryRow
                t={t}
                label="Condition"
                value={bioCondition}
                valueColor={riskColor(
                  t,
                  bioCondition === "Degraded"
                    ? "high"
                    : bioCondition ===
                        "Moderate"
                      ? "medium"
                      : "low"
                )}
              />

              <SummaryRow
                t={t}
                label="Score"
                value={bioScore}
              />
            </SummarySection>

            <SummarySection
              t={t}
              title="Media"
              last
            >
              <SummaryRow
                t={t}
                label="Photos"
                value={photos.length}
              />
            </SummarySection>

            <div
              className="mt-1 rounded-[10px] border p-3"
              style={{
                background: t.primarySoft,
                borderColor: `${t.primary}30`,
              }}
            >
              <div className="mb-1 flex items-center gap-1.5">
                <Info
                  size={12}
                  color={t.primary}
                />

                <span
                  className="text-[11.5px] font-semibold"
                  style={{
                    color: t.primary,
                  }}
                >
                  {STEPS[step].label ===
                  "Review & Submit"
                    ? "Almost done"
                    : "Next Step"}
                </span>
              </div>

              <p
                className="m-0 text-[11px] leading-[1.5]"
                style={{
                  color:
                    t.textSecondary,
                }}
              >
                {tipByStep[step]}
              </p>
            </div>
          </div>
        </div>
      </form>

      {/* Bottom big step-nav cards */}
      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
        {STEPS.map((s, i) => {
          const isDone = i < step;
          const isActive = i === step;

          return (
            <button
              key={s.key}
              type="button"
              onClick={() => jumpTo(i)}
              className={`flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-left ${
                i <= step
                  ? "cursor-pointer"
                  : "cursor-default"
              }`}
              style={{
                border: `1.5px solid ${
                  isActive
                    ? t.primary
                    : t.border
                }`,
                background: isActive
                  ? t.primarySoft
                  : t.surface,
                opacity: i > step ? 0.6 : 1,
              }}
            >
              <span
                className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold"
                style={{
                  background: isDone
                    ? t.good
                    : isActive
                      ? t.primary
                      : t.borderSoft,
                  color:
                    isDone || isActive
                      ? "#fff"
                      : t.textMuted,
                }}
              >
                {isDone ? (
                  <Check size={13} />
                ) : (
                  i + 1
                )}
              </span>

              <div className="min-w-0">
                <p
                  className="m-0 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-semibold"
                  style={{
                    color: isActive
                      ? t.primary
                      : t.textPrimary,
                  }}
                >
                  {s.label}
                </p>

                <p
                  className="m-0 text-[10px]"
                  style={{
                    color: t.textMuted,
                  }}
                >
                  {s.sub}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </DashboardShell>
  );
}

function SectionHeading({ t, title, sub }) {
  return (
    <div>
      <h3
        className="mb-[3px] font-[family-name:var(--font-display)] text-[15px] font-semibold"
        style={{
          color: t.textPrimary,
        }}
      >
        {title}
      </h3>

      <p
        className="m-0 text-xs"
        style={{
          color: t.textSecondary,
        }}
      >
        {sub}
      </p>
    </div>
  );
}

function SummarySection({
  t,
  title,
  children,
  last,
}) {
  return (
    <div
      className="mb-3.5 pb-3.5"
      style={{
        borderBottom: last
          ? "none"
          : `1px solid ${t.borderSoft}`,
      }}
    >
      <p
        className="mb-1.5 font-mono text-[10.5px] tracking-[0.03em]"
        style={{
          color: t.textMuted,
        }}
      >
        {title.toUpperCase()}
      </p>

      {children}
    </div>
  );
}

function SummaryRow({
  t,
  label,
  value,
  valueColor,
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-0.5">
      <span
        className="text-[11.5px]"
        style={{
          color: t.textSecondary,
        }}
      >
        {label}
      </span>

      <span
        className="text-right text-[11.5px] font-medium"
        style={{
          color:
            valueColor || t.textPrimary,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function ReviewCard({
  t,
  title,
  rows,
  withBadge,
}) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{
        background: t.surfaceRaised,
        borderColor: t.borderSoft,
      }}
    >
      <p
        className="mb-2.5 font-mono text-[11px] tracking-[0.03em]"
        style={{
          color: t.textMuted,
        }}
      >
        {title.toUpperCase()}
      </p>

      <div className="flex flex-col gap-2">
        {rows.map(([label, value, cls]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-3"
          >
            <span
              className="text-xs"
              style={{
                color:
                  t.textSecondary,
              }}
            >
              {label}
            </span>

            <span className="flex items-center gap-1.5">
              <span
                className="text-[12.5px] font-medium"
                style={{
                  color: t.textPrimary,
                }}
              >
                {value}
              </span>

              {withBadge && cls && (
                <span
                  className="rounded-[20px] px-[7px] py-px text-[9.5px] font-semibold"
                  style={{
                    color: t[cls.level],
                    background:
                      t[
                        cls.level +
                          "Soft"
                      ],
                  }}
                >
                  {cls.label}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}