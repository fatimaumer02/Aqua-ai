"use client";
import Link from "next/link";
import {ShieldCheck, Eye, Users2, TrendingDown, Landmark, Leaf, Building2, FlaskConical, Quote, ArrowRight,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { getTheme } from "@/lib/theme";

import WaterBackground from "@/components/three/WaterBackground";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";


// ==========================================
// VALUE PROPOSITIONS
// ==========================================

const VALUE_PROPS = [
  {
    icon: ShieldCheck,
    title: "Built-in liability protection",
    copy: "Every high-risk prediction is routed to a human expert before any action is taken. Nothing is auto-actioned - your team stays the decision-maker of record.",
  },
  {
    icon: Eye,
    title: "Defensible, not a black box",
    copy: "SHAP explains every prediction in plain terms - which readings drove the score, and by how much. Reports hold up under review, not just under demo.",
  },
  {
    icon: Users2,
    title: "Coverage without added headcount",
    copy: "A citizen observation network extends monitoring across sites your team can't physically visit every day, without hiring more field staff.",
  },
  {
    icon: TrendingDown,
    title: "Catch problems while they're cheap",
    copy: "Early-warning anomaly detection surfaces stream stress before it becomes a costly remediation or a compliance incident.",
  },
];


// ==========================================
// TARGET AUDIENCES
// ==========================================

const AUDIENCES = [
  {
    icon: Landmark,
    name: "Municipal water departments",
    copy: "Extend limited field-staff coverage across more monitoring points citywide.",
  },
  {
    icon: Leaf,
    name: "Environmental NGOs & watershed groups",
    copy: "Turn volunteer observations into structured, defensible data.",
  },
  {
    icon: Building2,
    name: "Private utilities & consultancies",
    copy: "Add continuous risk monitoring to existing compliance workflows.",
  },
  {
    icon: FlaskConical,
    name: "Research institutions",
    copy: "Collect long-term, explainable stream-health datasets at scale.",
  },
];


// ==========================================
// SOLUTIONS PAGE
// ==========================================

export default function Solutions() {
  // ========================================
  // THEME
  // ========================================

  const { mode, accent } = useTheme();
  const t = getTheme(mode, accent);


  // ========================================
  // PAGE
  // ========================================

  return (
    <div
      className="
        relative
        min-h-screen
      "
      style={{
        background: t.bg,
      }}
    >
      {/* ====================================
          WATER BACKGROUND
      ==================================== */}

      <WaterBackground mode={mode} />


      {/* ====================================
          PAGE CONTENT
      ==================================== */}

      <div
        className="
          relative
          z-[1]
        "
      >
        {/* ==================================
            NAVBAR
        ================================== */}

        <Navbar active="/solutions" />


        {/* ==================================
            HERO SECTION
        ================================== */}

        <section
          className="
            mx-auto
            max-w-[780px]
            px-6
            pb-11
            pt-16
            text-center
          "
        >
          {/* =================================
              HERO HEADING
          ================================= */}

          <h1
            className="
              m-0
              mb-3.5
              text-[clamp(28px,4vw,40px)]
              font-semibold
              tracking-[-0.02em]
              font-[family-name:var(--font-display)]
            "
            style={{
              color: t.textPrimary,
            }}
          >
            Built to earn trust, not just predictions
          </h1>


          {/* =================================
              HERO DESCRIPTION
          ================================= */}

          <p
            className="
              mx-auto
              my-0
              max-w-[560px]
              text-[15.5px]
              leading-[1.65]
            "
            style={{
              color: t.textSecondary,
            }}
          >
            A monitoring tool is only useful if your team can act on it,
            defend it, and afford to run it. AquaGuard AI is designed
            around all three.
          </p>
        </section>


        {/* ==================================
            VALUE PROPOSITIONS
        ================================== */}

        <section
          className="
            mx-auto
            max-w-[1000px]
            px-6
            pb-16
          "
        >
          <div
            className="
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-2
            "
          >
            {VALUE_PROPS.map((v) => (
              <div
                key={v.title}
                className="
                  rounded-[14px]
                  border
                  p-[22px]
                "
                style={{
                  background: t.surface,
                  borderColor: t.border,
                }}
              >
                {/* ===============================
                    ICON CONTAINER
                =============================== */}

                <div
                  className="
                    mb-4
                    flex
                    h-[38px]
                    w-[38px]
                    items-center
                    justify-center
                    rounded-[10px]
                  "
                  style={{
                    background: t.primarySoft,
                  }}
                >
                  <v.icon
                    size={18}
                    color={t.primary}
                  />
                </div>


                {/* ===============================
                    TITLE
                =============================== */}

                <h3
                  className="
                    m-0
                    mb-2
                    text-[15.5px]
                    font-semibold
                    font-[family-name:var(--font-display)]
                  "
                  style={{
                    color: t.textPrimary,
                  }}
                >
                  {v.title}
                </h3>


                {/* ===============================
                    DESCRIPTION
                =============================== */}

                <p
                  className="
                    m-0
                    text-[13px]
                    leading-[1.6]
                  "
                  style={{
                    color: t.textSecondary,
                  }}
                >
                  {v.copy}
                </p>
              </div>
            ))}
          </div>
        </section>


        {/* ==================================
            TARGET AUDIENCES
        ================================== */}

        <section
          className="
            mx-auto
            max-w-[1000px]
            px-6
            pb-16
          "
        >
          {/* =================================
              SECTION TITLE
          ================================= */}

          <h2
            className="
              m-0
              mb-8
              text-center
              text-[22px]
              font-semibold
              font-[family-name:var(--font-display)]
            "
            style={{
              color: t.textPrimary,
            }}
          >
            Who it's built for
          </h2>


          {/* =================================
              AUDIENCE CARDS
          ================================= */}

          <div
            className="
              grid
              grid-cols-1
              gap-3.5
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >
            {AUDIENCES.map((a) => (
              <div
                key={a.name}
                className="
                  rounded-[14px]
                  border
                  p-5
                "
                style={{
                  background: t.surface,
                  borderColor: t.borderSoft,
                }}
              >
                {/* =============================
                    AUDIENCE ICON
                ============================= */}

                <a.icon
                  size={18}
                  color={t.primary}
                  className="mb-3"
                />


                {/* =============================
                    AUDIENCE NAME
                ============================= */}

                <h3
                  className="
                    m-0
                    mb-1.5
                    text-[14.5px]
                    font-semibold
                    font-[family-name:var(--font-display)]
                  "
                  style={{
                    color: t.textPrimary,
                  }}
                >
                  {a.name}
                </h3>


                {/* =============================
                    AUDIENCE DESCRIPTION
                ============================= */}

                <p
                  className="
                    m-0
                    text-[12.5px]
                    leading-[1.55]
                  "
                  style={{
                    color: t.textSecondary,
                  }}
                >
                  {a.copy}
                </p>
              </div>
            ))}
          </div>
        </section>


        {/* ==================================
            CTA SECTION
        ================================== */}

        <section
          className="
            mx-auto
            max-w-[780px]
            px-6
            pb-[90px]
          "
        >
          <div
            className="
              rounded-2xl
              border
              p-8
              text-center
            "
            style={{
              background: t.primarySoft,
              borderColor: `${t.primary}30`,
            }}
          >
            {/* =================================
                QUOTE ICON
            ================================= */}

            <Quote
              size={20}
              color={t.primary}
              className="mb-3"
            />


            {/* =================================
                CTA DESCRIPTION
            ================================= */}

            <p
              className="
                mx-auto
                mb-[22px]
                max-w-[480px]
                text-[15px]
                leading-[1.6]
              "
              style={{
                color: t.textPrimary,
              }}
            >
              See how AquaGuard AI fits into your monitoring program -
              from a single pilot stream to a citywide network.
            </p>


            {/* =================================
                CTA BUTTON
            ================================= */}

            <Link
              href="/sign-up"
              className="
                inline-flex
                items-center
                gap-[7px]
                rounded-[10px]
                px-[22px]
                py-3
                text-[14px]
                font-semibold
                no-underline
              "
              style={{
                color:
                  mode === "dark"
                    ? "#0B1417"
                    : "#fff",

                background: t.primary,
              }}
            >
              Request a demo

              <ArrowRight size={15} />
            </Link>
          </div>
        </section>


        {/* ==================================
            FOOTER
        ================================== */}

        <Footer />
      </div>
    </div>
  );
}
