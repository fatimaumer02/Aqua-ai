"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, MapPin, Check } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { getTheme } from "@/lib/theme";
import {
  STREAM_TYPES,
  WATER_SOURCES,
  FLOW_TYPES,
  LAND_USE_OPTIONS,
  POLLUTION_LEVELS,
} from "@/lib/mockData";
import { createStream } from "@/lib/api";
import WizardShell from "@/components/layout/WizardShell";
import {
  TextInput,
  SelectInput,
  TextArea,
  StepFooter,
} from "@/components/ui/FormField";

const STEPS = ["Basic Info", "Location", "Stream Details", "Review"];

const INITIAL_FORM = {
  name: "",
  code: "",
  type: "",
  org: "",
  description: "",
  photoName: "",
  country: "Pakistan",
  province: "Punjab",
  city: "Lahore",
  area: "",
  lat: "31.5497",
  lng: "74.3436",
  width: "",
  depth: "",
  length: "",
  catchment: "",
  waterSource: "",
  flowType: "",
  landUse: "",
  pollutionPressure: "",
  notes: "",
};

export default function AddStream() {
  const { mode, accent } = useTheme();
  const t = getTheme(mode, accent);
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));

    if (errors[field]) {
      setErrors((e) => ({ ...e, [field]: null }));
    }
  }

  function validateStep(current) {
    const e = {};

    if (current === 1) {
      if (!form.name.trim()) e.name = "Stream name is required";
      if (!form.type) e.type = "Select a stream type";
    }

    if (current === 2) {
      if (!form.city.trim()) e.city = "City is required";
      if (!form.lat.trim()) e.lat = "Latitude is required";
      if (!form.lng.trim()) e.lng = "Longitude is required";
    }

    if (current === 3) {
      if (!form.waterSource)
        e.waterSource = "Select a primary water source";
      if (!form.flowType) e.flowType = "Select a flow type";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function goNext() {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, 4));
    }
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 1));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateStep(3)) return;

    setSubmitting(true);
    setSubmitError("");

    const location = [form.area, form.city].filter(Boolean).join(", ") || form.city;

    try {
      await createStream({
        name: form.name.trim(),
        region: location,
        latitude: parseFloat(form.lat) || undefined,
        longitude: parseFloat(form.lng) || undefined,
      });
      router.push("/streams");
    } catch (err) {
      console.error("Failed to create stream:", err);
      setSubmitError(err.message || "Could not create stream. Is the backend running?");
      setSubmitting(false);
    }
  }

  return (
    <WizardShell
      t={t}
      active="/streams"
      title="Add Stream"
      subtitle="Urban Stream Health"
      backHref="/streams"
      backLabel="Back to Streams"
      steps={STEPS}
      currentStep={step}
    >
      <form onSubmit={handleSubmit}>
        {/* =========================
            STEP 1: BASIC INFORMATION
        ========================== */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <h3
              className="m-0 font-[family-name:var(--font-display)] text-[15px] font-semibold"
              style={{ color: t.textPrimary }}
            >
              Basic Information
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextInput
                t={t}
                label="Stream Name"
                required
                value={form.name}
                error={errors.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g. Ravi Stream - Shahdara"
              />

              <TextInput
                t={t}
                label="Stream Code (Optional)"
                value={form.code}
                onChange={(e) => update("code", e.target.value)}
                placeholder="e.g. RS-SHD-001"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SelectInput
                t={t}
                label="Stream Type"
                required
                value={form.type}
                error={errors.type}
                onChange={(e) => update("type", e.target.value)}
              >
                <option value="">Select Type</option>

                {STREAM_TYPES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </SelectInput>

              <TextInput
                t={t}
                label="Managing Organization (Optional)"
                value={form.org}
                onChange={(e) => update("org", e.target.value)}
                placeholder="e.g. LWMC"
              />
            </div>

            <TextArea
              t={t}
              label="Description"
              maxLength={500}
              rows={3}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Brief description about the stream..."
            />

            {/* Upload Stream Photo */}
            <div>
              <label
                className="mb-[5px] block text-xs font-medium"
                style={{ color: t.textSecondary }}
              >
                Upload Stream Photo (Optional)
              </label>

              <label
                htmlFor="stream-photo"
                className="flex cursor-pointer flex-col items-center gap-1.5 rounded-[10px] border-[1.5px] border-dashed px-3 py-6"
                style={{
                  borderColor: t.border,
                  background: t.surfaceRaised,
                }}
              >
                <UploadCloud size={20} color={t.textMuted} />

                <span
                  className="text-[12.5px]"
                  style={{ color: t.textSecondary }}
                >
                  {form.photoName ||
                    "Drag & drop image here or click to browse"}
                </span>

                <span
                  className="text-[10.5px]"
                  style={{ color: t.textMuted }}
                >
                  PNG, JPG up to 5MB
                </span>

                <input
                  id="stream-photo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    update("photoName", e.target.files?.[0]?.name || "")
                  }
                />
              </label>
            </div>
          </div>
        )}

        {/* =========================
            STEP 2: LOCATION
        ========================== */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <h3
              className="m-0 font-[family-name:var(--font-display)] text-[15px] font-semibold"
              style={{ color: t.textPrimary }}
            >
              Location Information
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextInput
                t={t}
                label="Country"
                value={form.country}
                onChange={(e) => update("country", e.target.value)}
              />

              <TextInput
                t={t}
                label="Province"
                value={form.province}
                onChange={(e) => update("province", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextInput
                t={t}
                label="City"
                required
                value={form.city}
                error={errors.city}
                onChange={(e) => update("city", e.target.value)}
              />

              <TextInput
                t={t}
                label="Area / District"
                value={form.area}
                onChange={(e) => update("area", e.target.value)}
                placeholder="e.g. Shahdara"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextInput
                t={t}
                label="Latitude"
                required
                value={form.lat}
                error={errors.lat}
                onChange={(e) => update("lat", e.target.value)}
              />

              <TextInput
                t={t}
                label="Longitude"
                required
                value={form.lng}
                error={errors.lng}
                onChange={(e) => update("lng", e.target.value)}
              />
            </div>

            {/* Map Preview */}
            <div
              className="relative h-[180px] overflow-hidden rounded-[10px] border"
              style={{
                background:
                  mode === "dark" ? "#0D1A1E" : "#EAF3EF",
                borderColor: t.borderSoft,
              }}
            >
              <svg
                width="100%"
                height="100%"
                className="absolute inset-0"
              >
                <defs>
                  <pattern
                    id="addstream-grid"
                    width="26"
                    height="26"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 26 0 L 0 0 0 26"
                      fill="none"
                      stroke={t.borderSoft}
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>

                <rect
                  width="100%"
                  height="100%"
                  fill="url(#addstream-grid)"
                />
              </svg>

              {/* Map Marker */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
                <MapPin
                  size={26}
                  color={t.primary}
                  fill={t.primarySoft}
                  strokeWidth={1.8}
                />
              </div>

              <span
                className="absolute bottom-2 left-2.5 text-[10.5px]"
                style={{ color: t.textMuted }}
              >
                Drag the marker to exact location
              </span>
            </div>
          </div>
        )}

        {/* =========================
            STEP 3: STREAM DETAILS
        ========================== */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <h3
              className="m-0 font-[family-name:var(--font-display)] text-[15px] font-semibold"
              style={{ color: t.textPrimary }}
            >
              Stream Details
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextInput
                t={t}
                label="Average Width (m)"
                type="number"
                value={form.width}
                onChange={(e) => update("width", e.target.value)}
              />

              <TextInput
                t={t}
                label="Average Depth (m)"
                type="number"
                value={form.depth}
                onChange={(e) => update("depth", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextInput
                t={t}
                label="Stream Length (km)"
                type="number"
                value={form.length}
                onChange={(e) => update("length", e.target.value)}
              />

              <TextInput
                t={t}
                label="Catchment Area (km²)"
                type="number"
                value={form.catchment}
                onChange={(e) => update("catchment", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SelectInput
                t={t}
                label="Primary Water Source"
                required
                value={form.waterSource}
                error={errors.waterSource}
                onChange={(e) =>
                  update("waterSource", e.target.value)
                }
              >
                <option value="">Select Source</option>

                {WATER_SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </SelectInput>

              <SelectInput
                t={t}
                label="Flow Type"
                required
                value={form.flowType}
                error={errors.flowType}
                onChange={(e) =>
                  update("flowType", e.target.value)
                }
              >
                <option value="">Select Type</option>

                {FLOW_TYPES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </SelectInput>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SelectInput
                t={t}
                label="Land Use Around Stream"
                value={form.landUse}
                onChange={(e) =>
                  update("landUse", e.target.value)
                }
              >
                <option value="">Select</option>

                {LAND_USE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </SelectInput>

              <SelectInput
                t={t}
                label="Pollution Pressure"
                value={form.pollutionPressure}
                onChange={(e) =>
                  update("pollutionPressure", e.target.value)
                }
              >
                <option value="">Select</option>

                {POLLUTION_LEVELS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </SelectInput>
            </div>

            <TextArea
              t={t}
              label="Notes (Optional)"
              maxLength={300}
              rows={3}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Additional notes about the stream..."
            />
          </div>
        )}

        {/* =========================
            STEP 4: REVIEW
        ========================== */}
        {step === 4 && (
          <div>
            <h3
              className="mb-4 font-[family-name:var(--font-display)] text-[15px] font-semibold"
              style={{ color: t.textPrimary }}
            >
              Review Stream Information
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ReviewCard
                t={t}
                title="Basic Information"
                rows={[
                  ["Stream Name", form.name || "-"],
                  ["Stream Code", form.code || "-"],
                  ["Stream Type", form.type || "-"],
                  [
                    "Managing Organization",
                    form.org || "-",
                  ],
                ]}
              />

              <ReviewCard
                t={t}
                title="Location"
                rows={[
                  ["Country", form.country],
                  ["Province", form.province],
                  ["City", form.city],
                  ["Area / District", form.area || "-"],
                  ["Coordinates", `${form.lat}, ${form.lng}`],
                ]}
              />

              <ReviewCard
                t={t}
                title="Stream Details"
                rows={[
                  [
                    "Average Width",
                    form.width ? `${form.width} m` : "-",
                  ],
                  [
                    "Average Depth",
                    form.depth ? `${form.depth} m` : "-",
                  ],
                  [
                    "Stream Length",
                    form.length ? `${form.length} km` : "-",
                  ],
                  [
                    "Catchment Area",
                    form.catchment
                      ? `${form.catchment} km²`
                      : "-",
                  ],
                  ["Flow Type", form.flowType || "-"],
                  [
                    "Pollution Pressure",
                    form.pollutionPressure || "-",
                  ],
                ]}
              />

              {/* Photo & Description */}
              <div
                className="rounded-xl border p-4"
                style={{
                  background: t.surfaceRaised,
                  borderColor: t.borderSoft,
                }}
              >
                <p
                  className="mb-2.5 font-[family-name:var(--font-mono)] text-[11px]"
                  style={{ color: t.textMuted }}
                >
                  PHOTO
                </p>

                {form.photoName ? (
                  <div
                    className="flex items-center gap-2 text-[12.5px]"
                    style={{ color: t.textPrimary }}
                  >
                    <Check size={14} color={t.good} />
                    {form.photoName}
                  </div>
                ) : (
                  <p
                    className="m-0 text-[12.5px]"
                    style={{ color: t.textMuted }}
                  >
                    No photo uploaded
                  </p>
                )}

                {form.description && (
                  <>
                    <p
                      className="mb-1.5 mt-3.5 font-[family-name:var(--font-mono)] text-[11px]"
                      style={{ color: t.textMuted }}
                    >
                      DESCRIPTION
                    </p>

                    <p
                      className="m-0 text-[12.5px] leading-[1.5]"
                      style={{ color: t.textSecondary }}
                    >
                      {form.description}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================
            STEP FOOTER
        ========================== */}
        {submitError && (
          <p
            className="m-0 mt-3 text-[11.5px] font-medium"
            style={{ color: t.bad }}
          >
            {submitError}
          </p>
        )}

        <StepFooter
          t={t}
          mode={mode}
          onBack={step > 1 ? goBack : null}
          onNext={step < 4 ? goNext : null}
          nextLabel={
            step < 4
              ? "Next"
              : submitting
                ? "Adding..."
                : "Add Stream"
          }
          submitting={submitting}
        />
      </form>
    </WizardShell>
  );
}

/* =========================
   REVIEW CARD COMPONENT
========================== */

function ReviewCard({ t, title, rows }) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{
        background: t.surfaceRaised,
        borderColor: t.borderSoft,
      }}
    >
      <p
        className="mb-2.5 font-[family-name:var(--font-mono)] text-[11px] tracking-[0.03em]"
        style={{ color: t.textMuted }}
      >
        {title.toUpperCase()}
      </p>

      <div className="flex flex-col gap-2">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-3"
          >
            <span
              className="text-xs"
              style={{ color: t.textSecondary }}
            >
              {label}
            </span>

            <span
              className="text-right text-[12.5px] font-medium"
              style={{ color: t.textPrimary }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}