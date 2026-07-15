import { useLayoutEffect, useRef, useState } from "react";
import { CoverageCard, TestsCard } from "./Breakdown";
import { useCountUp, useInView } from "./anim";

const asset = (name: string) => `/assets/${name}`;

type TabId = "score" | "coverage" | "tests";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "score", label: "Score", icon: asset("tab-score.svg") },
  { id: "coverage", label: "Coverage", icon: asset("tab-coverage.svg") },
  { id: "tests", label: "Test results", icon: asset("tab-tests.svg") },
];

/* ---------- tab bar ---------- */

function TabBar({
  active,
  onChange,
}: {
  active: TabId;
  onChange: (id: TabId) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>({
    score: null,
    coverage: null,
    tests: null,
  });
  // the sliding white pill: measured from the active tab so it smoothly
  // resizes + translates between tabs (like an animated tab indicator).
  const [indicator, setIndicator] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });

  useLayoutEffect(() => {
    const measure = () => {
      const el = tabRefs.current[active];
      const list = listRef.current;
      if (!el || !list) return;
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    // re-measure once web fonts settle (label widths can shift) and on resize
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [active]);

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label="Breakdown"
      className="relative flex items-center gap-1.5 rounded-[16px] bg-[rgba(26,26,26,0.04)] p-1"
    >
      {/* sliding active-tab pill */}
      <span
        aria-hidden
        className="absolute bottom-1 top-1 z-0 rounded-[12px] bg-white shadow-[0_1px_2px_rgba(26,26,26,0.06)] transition-[width,transform] duration-200 ease-in-out"
        style={{
          width: indicator.width,
          transform: `translateX(${indicator.left}px)`,
          left: 0,
        }}
      />
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            ref={(node) => {
              tabRefs.current[tab.id] = node;
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className="relative z-10 flex items-center justify-center gap-1.5 rounded-[12px] py-1.5 pl-2 pr-3"
          >
            <span
              className="size-5 shrink-0 transition-opacity duration-200"
              style={{ opacity: isActive ? 0.8 : 0.36 }}
            >
              <img src={tab.icon} alt="" className="block size-full" />
            </span>
            <span
              className={`whitespace-nowrap text-sm font-medium leading-5 transition-colors duration-200 ${
                isActive
                  ? "text-[rgba(26,26,26,0.8)]"
                  : "text-[rgba(26,26,26,0.36)]"
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Score window (Overall readiness) ---------- */

function ScoreRing({ active }: { active: boolean }) {
  const pct = useCountUp(97, { active, delay: 120, duration: 1100 });
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct / 100);
  return (
    <div className="relative size-[120px] shrink-0">
      <svg viewBox="0 0 120 120" className="size-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="rgba(16,104,68,0.1)"
          strokeWidth="9"
        />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="#18c280"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[32px] font-semibold leading-10 text-[rgba(26,26,26,0.8)]">
        {Math.round(pct)}%
      </span>
    </div>
  );
}

function ScoreWindow({ gate }: { gate: boolean }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const show = gate && inView;
  return (
    <div
      ref={ref}
      className="flex w-[476px] max-w-[calc(100%-40px)] flex-col items-center gap-6 rounded-[24px] border border-[rgba(26,26,26,0.09)] bg-[rgba(255,255,255,0.6)] p-6 backdrop-blur-[10px] transition-[opacity,transform] duration-700 ease-out"
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "none" : "translateY(28px)",
      }}
    >
      <div className="flex w-full flex-col gap-0.5">
        <p className="text-base font-medium leading-6 text-[#1a1a1a]">
          Overall readiness
        </p>
        <p className="text-sm font-medium leading-5 text-[rgba(26,26,26,0.6)]">
          In 47 tests, your AI matched your voice and method. Two categories need
          more training before we&apos;d recommend going live.
        </p>
      </div>
      <div
        className="flex h-[168px] w-full items-center justify-center rounded-[16px] p-6"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(24,194,128,0) 0%, rgba(24,194,128,0.1) 100%), linear-gradient(90deg, rgba(26,26,26,0.04) 0%, rgba(26,26,26,0.04) 100%)",
        }}
      >
        <ScoreRing active={show} />
      </div>
    </div>
  );
}

/* ---------- tab view ---------- */

export default function TabView({ gate = true }: { gate?: boolean }) {
  const [active, setActive] = useState<TabId>("score");
  return (
    <div className="flex w-full flex-col items-center gap-6">
      <TabBar active={active} onChange={setActive} />
      {/* remount on tab change so the in-window count-ups / reveals replay */}
      <div key={active} className="flex w-full justify-center">
        {active === "score" && <ScoreWindow gate={gate} />}
        {active === "coverage" && <CoverageCard gate={gate} />}
        {active === "tests" && <TestsCard gate={gate} />}
      </div>
    </div>
  );
}
