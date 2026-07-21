import { useEffect, useState } from "react";
import OrbSphere from "./OrbSphere";
import TabView from "./TabView";
import ShareModal from "./ShareModal";
import { prefersReducedMotion } from "./anim";

const asset = (name: string) => `/assets/${name}`;

/* the hero intro plays on load; once it settles the tab windows are allowed to
   run their count-up / reveal animations (gated so they sync with the reveal
   instead of firing behind the still-invisible intro). */
const GATE_MS = 6800;

/* ---------- intro helpers ---------- */

function WordReveal({
  text,
  baseDelay = 0,
  step = 0.05,
}: {
  text: string;
  baseDelay?: number;
  step?: number;
}) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, i) => (
        <span
          key={i}
          data-intro
          className="inline-block"
          style={{
            animation: `wordReveal 0.55s cubic-bezier(0.22,1,0.36,1) ${
              baseDelay + i * step
            }s both`,
          }}
        >
          {word}
          {i < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </>
  );
}

const intro = (delay: number, name = "riseFade", duration = 0.55) => ({
  animation: `${name} ${duration}s cubic-bezier(0.22,1,0.36,1) ${delay}s both`,
});

/* the readiness "paths" the dev team can preview. "happy" is the shipping
   experience (score >= 80); "needs-improvement" previews the below-80 state
   (amber theme, reordered CTAs, different tag copy). */
type Path = "happy" | "needs-improvement";

/* ---------- hero CTA ---------- */
/* "dark" = filled neutral gradient (primary), "light" = bordered (secondary).
   the icon variant is chosen by the caller to match the button's fill. */
function Cta({
  variant,
  icon,
  label,
  onClick,
}: {
  variant: "dark" | "light";
  icon: string;
  label: string;
  onClick?: () => void;
}) {
  const dark = variant === "dark";
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        dark
          ? "product-button relative flex items-center justify-center overflow-hidden rounded-[10px] px-2.5 py-2 shadow-[inset_0px_1px_0.5px_0px_rgba(255,255,255,0.28)]"
          : "product-button-light relative flex items-center justify-center overflow-hidden rounded-[10px] border border-[rgba(26,26,26,0.09)] px-2.5 py-2"
      }
    >
      <span className="relative z-10 flex items-center">
        <span className="size-5 shrink-0">
          <img src={asset(icon)} alt="" className="block size-full" />
        </span>
        <span className="flex items-center justify-center px-1">
          <span
            className={`whitespace-nowrap text-center text-sm font-medium tracking-[-0.15px] ${
              dark ? "text-[rgba(255,255,255,0.8)]" : "text-[rgba(26,26,26,0.6)]"
            }`}
          >
            {label}
          </span>
        </span>
      </span>
    </button>
  );
}

/* ---------- dev path selector (top-right) ---------- */

function PathSelector({
  path,
  onChange,
}: {
  path: Path;
  onChange: (p: Path) => void;
}) {
  const options: { id: Path; label: string }[] = [
    { id: "happy", label: "Happy path" },
    { id: "needs-improvement", label: "Needs improvement" },
  ];
  return (
    <div className="flex items-center gap-0.5 rounded-[10px] border border-[rgba(26,26,26,0.09)] bg-[rgba(255,255,255,0.6)] p-0.5 backdrop-blur-[10px]">
      {options.map((opt) => {
        const isActive = opt.id === path;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            aria-pressed={isActive}
            className={`whitespace-nowrap rounded-[8px] px-2.5 py-1 text-xs font-medium tracking-[-0.15px] transition-colors ${
              isActive
                ? "bg-white text-[rgba(26,26,26,0.8)] shadow-[0_1px_2px_rgba(26,26,26,0.06)]"
                : "text-[rgba(26,26,26,0.5)] hover:text-[rgba(26,26,26,0.7)]"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- screen ---------- */

export default function AiBlueprint() {
  const [shareOpen, setShareOpen] = useState(false);
  const [path, setPath] = useState<Path>("happy");
  const needsImprovement = path === "needs-improvement";

  // the tab windows stay dormant until the intro has played, so their first
  // reveal lands in sync with the fade-in rather than behind it.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (prefersReducedMotion()) {
      setReady(true);
      return;
    }
    const t = window.setTimeout(() => setReady(true), GATE_MS);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div
      className={`relative min-h-screen w-full overflow-hidden bg-white font-sans ${
        needsImprovement ? "path-needs-improvement" : ""
      }`}
    >
      {/* top bar */}
      <header className="fixed inset-x-0 top-0 z-30 bg-[rgba(255,255,255,0.75)] px-5 pt-7 backdrop-blur-[4px]">
        <div className="flex flex-1 items-center justify-between pb-4">
          <div className="h-6 w-[98px] shrink-0">
            <img
              src={asset("brand.svg")}
              alt="Kodara"
              className="block size-full object-contain"
            />
          </div>
          {/* dev-facing path preview toggle */}
          <PathSelector path={path} onChange={setPath} />
        </div>
      </header>

      {/* AI sphere — fixed, viewport-anchored ambient backdrop. the intro grows
          it from the center and settles it into the bottom dome. the mask fades
          its bottom edge into the page. NB: no mix-blend-mode here — a blended
          element becomes an isolated backdrop root, which stops the frosted
          cards' backdrop-filter from sampling the orb. over white, multiply and
          normal look the same anyway. */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, #000 0%, #000 78%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, #000 0%, #000 78%, transparent 100%)",
        }}
      >
        <div className="orb-anim absolute inset-0 size-full">
          <OrbSphere className="absolute inset-0 size-full" />
        </div>
      </div>

      {/* soft ambient glow anchored to the bottom of the viewport — green on
          the happy path, amber when previewing the needs-improvement path */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-0 h-[312px]">
        <img
          src={asset(needsImprovement ? "bg-fade-amber.svg" : "bg-fade.svg")}
          alt=""
          className="size-full object-cover"
        />
      </div>

      {/* loading caption shown beneath the small sphere during the intro */}
      <div
        className="loading-copy pointer-events-none fixed left-1/2 top-1/2 z-10"
        style={{ transform: "translate(-50%, 110px)" }}
      >
        <span className="shimmer-text text-[16px] font-medium leading-6">
          Loading your Ai...
        </span>
      </div>

      {/* content */}
      <main className="relative z-10 flex min-h-screen flex-col items-center px-5 pb-32 pt-[107px]">
        {/* hero text */}
        <div className="flex w-[411px] max-w-[calc(100%-40px)] flex-col items-center gap-2 text-center">
          <div
            data-intro
            className="flex items-center rounded-[24px] bg-[rgb(var(--accent-deep-rgb)/0.06)] px-1.5 py-0.5"
            style={intro(6.2)}
          >
            <span className="whitespace-nowrap text-xs font-medium tracking-[-0.15px] text-[color:rgb(var(--accent-deep-rgb))]">
              {needsImprovement ? "Needs improvements" : "Ready to publish"}
            </span>
          </div>
          <h1 className="text-[32px] font-medium leading-10 text-[rgba(26,26,26,0.8)]">
            <WordReveal
              text={
                needsImprovement
                  ? "Lucas, almost there"
                  : "Lucas, you are ready"
              }
              baseDelay={6.3}
            />
          </h1>
          <p
            data-intro
            className="text-sm font-normal leading-5 text-[rgba(26,26,26,0.6)]"
            style={intro(6.7)}
          >
            {needsImprovement ? (
              <>
                In 47 tests, your AI matched your voice in most areas.
                <br />A couple categories need more training.
              </>
            ) : (
              <>
                In 47 tests, your AI matched your voice and method,
                <br />
                deferring appropriately.
              </>
            )}
          </p>
          <div
            data-intro
            className="mt-2 flex items-center justify-center gap-2"
            style={intro(6.8)}
          >
            {needsImprovement ? (
              <>
                {/* below 80: training is primary, sharing is secondary */}
                <Cta
                  variant="dark"
                  icon="search-icon-white.svg"
                  label="Keep training"
                />
                <Cta
                  variant="light"
                  icon="rocket-dark.svg"
                  label="Send to clients"
                  onClick={() => setShareOpen(true)}
                />
              </>
            ) : (
              <>
                <Cta
                  variant="dark"
                  icon="rocket-white.svg"
                  label="Send to clients"
                  onClick={() => setShareOpen(true)}
                />
                <Cta
                  variant="light"
                  icon="search-icon.svg"
                  label="Keep training"
                />
              </>
            )}
          </div>
        </div>

        {/* tabs + active window — opacity-only fade so no transform is left on
            this ancestor (a transformed ancestor would break the cards'
            backdrop-filter). */}
        <div className="mt-10 w-full" data-intro style={intro(6.8, "fadeIn")}>
          <TabView gate={ready} needsImprovement={needsImprovement} />
        </div>
      </main>

      {shareOpen && <ShareModal onClose={() => setShareOpen(false)} />}
    </div>
  );
}
