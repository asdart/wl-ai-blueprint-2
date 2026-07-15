import { useCountUp, useInView } from "./anim";
import PixelCard from "./PixelCard";

const asset = (name: string) => `/assets/${name}`;

/* stagger between successive rows/cells animating in (ms). */
const ROW_STAGGER = 90;

const CARD =
  "w-[480px] max-w-[calc(100%-40px)] rounded-[24px] border border-[rgba(26,26,26,0.09)] bg-[rgba(255,255,255,0.6)] backdrop-blur-[10px] transition-[opacity,transform] duration-700 ease-out";
const CARD_TITLE = "text-base font-medium leading-6 text-[#1a1a1a]";
const CARD_SUB = "text-sm leading-5 text-[rgba(26,26,26,0.6)]";

const revealStyle = (shown: boolean): React.CSSProperties => ({
  opacity: shown ? 1 : 0,
  transform: shown ? "none" : "translateY(28px)",
});

/* ---------- Overall readiness ---------- */

function Ring({
  value,
  active,
  delay,
}: {
  value: number;
  active: boolean;
  delay: number;
}) {
  const v = useCountUp(value, { active, delay, duration: 1100 });
  const r = 34;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - v / 100);
  return (
    <div className="relative size-20 shrink-0">
      <svg viewBox="0 0 80 80" className="size-full -rotate-90">
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="rgba(16,104,68,0.1)"
          strokeWidth="8"
        />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="#18c280"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <img
        src={asset("rocket.svg")}
        alt=""
        className="absolute left-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2"
      />
    </div>
  );
}

function OverallCard({ gate }: { gate: boolean }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const show = gate && inView;
  const pct = useCountUp(97, { active: show, delay: 0, duration: 1100 });
  return (
    <div
      ref={ref}
      className={`${CARD} flex flex-col items-center gap-3 overflow-hidden p-4`}
      style={revealStyle(show)}
    >
      <div className="flex w-full flex-col gap-0.5">
        <p className={CARD_TITLE}>Overall readiness</p>
        <p className={CARD_SUB}>
          In 47 tests, your AI matched your voice and method. Two categories need
          more training before we&apos;d recommend going live.
        </p>
      </div>
      <div className="relative h-32 w-full overflow-hidden rounded-[16px] bg-[rgba(26,26,26,0.04)]">
        <div className="absolute left-6 top-6">
          <Ring value={97} active={show} delay={120} />
        </div>
        <div className="absolute right-6 top-5 flex items-center gap-1">
          <img src={asset("rocket.svg")} alt="" className="size-5" />
          <span className="text-sm font-medium leading-5 tracking-[-0.15px] text-[#106844]">
            Ready
          </span>
        </div>
        <p className="absolute bottom-3 right-8 text-[48px] font-medium leading-[56px] tracking-[0.5px] text-[rgba(26,26,26,0.8)]">
          {Math.round(pct)}%
        </p>
      </div>
    </div>
  );
}

/* ---------- Brain coverage ---------- */

const COVERAGE_OVERALL = 94.2;

const coverageRows: { name: string; pct: number; icon: string }[] = [
  { name: "Market Fundamentals", pct: 96.3, icon: asset("cov-book.svg") },
  { name: "Core method", pct: 91.5, icon: asset("cov-knowledge.svg") },
  { name: "Voice and tone", pct: 93.8, icon: asset("cov-voice.svg") },
  { name: "Objection handling", pct: 89.1, icon: asset("cov-objection.svg") },
  { name: "Common questions", pct: 88.4, icon: asset("cov-question.svg") },
];

function CoverageBar({ value }: { value: number }) {
  return (
    <div className="relative h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-[rgba(16,104,68,0.06)]">
      <div
        className="absolute inset-y-0 left-0 rounded-full border border-[rgba(26,26,26,0.09)]"
        style={{
          width: `${value}%`,
          background: "#18c280",
          boxShadow: "inset 0px -1px 3px 0px rgba(0,0,0,0.25)",
        }}
      />
    </div>
  );
}

function CoverageRow({
  name,
  pct,
  icon,
  active,
  delay,
  divider,
}: {
  name: string;
  pct: number;
  icon: string;
  active: boolean;
  delay: number;
  divider: boolean;
}) {
  const value = useCountUp(pct, { active, delay, duration: 900 });
  return (
    <div
      className={`flex items-center justify-between gap-4 ${
        divider ? "border-b border-[rgba(26,26,26,0.09)] pb-3" : ""
      }`}
    >
      <div className="flex shrink-0 items-center gap-3">
        <img src={icon} alt="" className="size-5 shrink-0" />
        <p className="whitespace-nowrap text-base font-medium leading-6 text-[rgba(26,26,26,0.6)]">
          {name}
        </p>
      </div>
      <div className="flex min-w-0 max-w-[300px] flex-1 items-center justify-end gap-8">
        <CoverageBar value={value} />
        <span className="w-[46px] shrink-0 text-right text-base font-medium leading-6 text-[rgba(26,26,26,0.8)]">
          {value.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

export function CoverageCard({ gate }: { gate: boolean }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const show = gate && inView;
  const overall = useCountUp(COVERAGE_OVERALL, {
    active: show,
    delay: 0,
    duration: 900,
  });
  return (
    <div
      ref={ref}
      className={`${CARD.replace("w-[480px]", "w-[640px]")} flex flex-col gap-4 p-6`}
      style={revealStyle(show)}
    >
      {/* summary header panel */}
      <div className="flex items-center gap-3 rounded-[16px] bg-[rgba(26,26,26,0.04)] p-3">
        <img
          src={asset("cov-knowledge.svg")}
          alt=""
          className="size-5 shrink-0"
        />
        <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
          <p className="whitespace-nowrap text-base font-semibold leading-6 text-[rgba(26,26,26,0.8)]">
            Brain coverage
          </p>
          <div className="flex min-w-0 max-w-[300px] flex-1 items-center justify-end gap-8">
            <CoverageBar value={overall} />
            <span className="shrink-0 text-[20px] font-medium leading-7 text-[rgba(26,26,26,0.8)]">
              {overall.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
      {/* detail rows panel */}
      <div className="flex flex-col gap-3 rounded-[16px] bg-[rgba(26,26,26,0.04)] p-3">
        {coverageRows.map((row, i) => (
          <CoverageRow
            key={row.name}
            {...row}
            active={show}
            delay={i * ROW_STAGGER}
            divider={i < coverageRows.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------- Your AI vs others ---------- */

type CompareRowData = {
  name?: string;
  pct: number;
  high?: boolean;
  icon: React.ReactNode;
};

function LogoCircle({ src }: { src: string }) {
  return (
    <span className="flex size-6 items-center justify-center rounded-full border border-[#e5e5e5] bg-[#f5f5f5]">
      <img src={src} alt="" className="size-[15px] object-contain" />
    </span>
  );
}

function PlainLogo({ src }: { src: string }) {
  return <img src={src} alt="" className="size-6 shrink-0 object-contain" />;
}

const compareRows: CompareRowData[] = [
  {
    pct: 100,
    high: true,
    icon: (
      <span className="relative size-6 shrink-0 overflow-hidden rounded-full bg-white">
        <img
          src={asset("avatar.png")}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      </span>
    ),
  },
  { name: "Claude", pct: 46, icon: <PlainLogo src={asset("logo-1.svg")} /> },
  { name: "Chat GPT", pct: 41, icon: <PlainLogo src={asset("chatgpt.svg")} /> },
  { name: "Gemini", pct: 36, icon: <LogoCircle src={asset("google.svg")} /> },
  { name: "Perplexity", pct: 28, icon: <PlainLogo src={asset("logo-2.svg")} /> },
  { name: "Copilot", pct: 21, icon: <LogoCircle src={asset("image80.png")} /> },
  { name: "Grok", pct: 15, icon: <LogoCircle src={asset("logo-3.svg")} /> },
];

function CompareRow({
  name,
  pct,
  high,
  icon,
  active,
  delay,
}: CompareRowData & { active: boolean; delay: number }) {
  const value = useCountUp(pct, { active, delay, duration: 900 });
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          {name && (
            <span className="whitespace-nowrap text-sm font-medium leading-5 tracking-[-0.15px] text-[rgba(26,26,26,0.8)]">
              {name}
            </span>
          )}
        </div>
        <span
          className={`whitespace-nowrap text-sm font-medium leading-5 tracking-[-0.15px] ${
            high ? "text-[rgba(16,104,68,0.8)]" : "text-[rgba(26,26,26,0.6)]"
          }`}
        >
          {high ? "High" : "Low"}
        </span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-[rgba(16,104,68,0.06)]">
        <div
          className="absolute inset-y-0 left-0 rounded-full border border-[rgba(26,26,26,0.09)]"
          style={{
            width: `${value}%`,
            background: high ? "#18c280" : "rgba(26,26,26,0.6)",
            boxShadow: "inset 0px -1px 3px 0px rgba(0,0,0,0.25)",
          }}
        />
      </div>
    </div>
  );
}

function CompareCard({ gate }: { gate: boolean }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const show = gate && inView;
  return (
    <div
      ref={ref}
      className={`${CARD} flex flex-col gap-4 p-6`}
      style={revealStyle(show)}
    >
      <div className="flex flex-col gap-0.5">
        <p className={CARD_TITLE}>Your AI vs others</p>
        <p className={CARD_SUB}>Generic AI is low</p>
      </div>
      <div className="flex flex-col gap-3 rounded-[16px] bg-[rgba(26,26,26,0.04)] p-3">
        {compareRows.map((row, i) => (
          <CompareRow
            key={row.name ?? "you"}
            {...row}
            active={show}
            delay={i * ROW_STAGGER}
          />
        ))}
      </div>
      <div className="flex w-full items-center gap-1.5 rounded-[12px] border border-[rgba(19,134,88,0.08)] bg-[rgba(19,134,88,0.08)] px-2.5 py-2 backdrop-blur-[4px]">
        <img src={asset("checkmark.svg")} alt="" className="size-5 shrink-0" />
        <p className="text-xs font-medium leading-4 tracking-[-0.15px] text-[#16a34a]">
          AI outperforms off-the-shelf models in voice match and accuracy.
        </p>
      </div>
    </div>
  );
}

/* ---------- Test results ---------- */

function AvgMessagesRow({ active }: { active: boolean }) {
  const value = useCountUp(14, { active, delay: 0, duration: 900 });
  const fill = useCountUp(90, { active, delay: 0, duration: 1000 });
  return (
    <div className="flex items-center justify-between gap-4 rounded-[12px] bg-[rgba(26,26,26,0.04)] px-5 py-3 backdrop-blur-[10px]">
      <p className="text-base font-medium leading-6 text-[rgba(26,26,26,0.8)]">
        Avg messages
      </p>
      <div className="flex items-center gap-4">
        <div className="relative h-2 w-[156px] max-w-[156px] overflow-hidden rounded-full bg-[rgba(16,104,68,0.06)]">
          <div
            className="absolute inset-y-0 left-0 rounded-full border border-[rgba(26,26,26,0.09)]"
            style={{
              width: `${fill}%`,
              background: "#18c280",
              boxShadow: "inset 0px -1px 3px 0px rgba(0,0,0,0.25)",
            }}
          />
        </div>
        <span className="w-8 text-right text-[20px] font-medium leading-7 text-[rgba(26,26,26,0.8)]">
          {Math.round(value)}
        </span>
      </div>
    </div>
  );
}

const testerCells: { label: string; value: number; tag: string }[] = [
  { label: "Testers - 1", value: 14, tag: "Deep" },
  { label: "Testers - 2", value: 11, tag: "Deep" },
  { label: "Testers - 3", value: 10, tag: "Strong" },
  { label: "Testers - 4", value: 6, tag: "Good" },
];

function TesterCell({
  label,
  value,
  tag,
  active,
  delay,
}: {
  label: string;
  value: number;
  tag: string;
  active: boolean;
  delay: number;
}) {
  const v = useCountUp(value, { active, delay, duration: 900 });
  return (
    <div className="flex items-start justify-between gap-2 rounded-[12px] bg-[rgba(26,26,26,0.04)] p-5 backdrop-blur-[10px]">
      <div className="flex flex-col gap-2">
        <p className="whitespace-nowrap text-xs font-medium leading-4 tracking-[-0.15px] text-[rgba(26,26,26,0.6)]">
          {label}
        </p>
        <div className="flex items-baseline gap-0.5">
          <span className="text-[20px] font-medium leading-7 text-[rgba(26,26,26,0.8)]">
            {Math.round(v)}
          </span>
          <span className="text-sm font-medium leading-5 text-[rgba(26,26,26,0.6)]">
            /messages
          </span>
        </div>
      </div>
      <div className="flex items-center rounded-[24px] bg-[rgba(16,104,68,0.06)] px-1.5 py-0.5">
        <span className="whitespace-nowrap text-xs font-medium leading-4 tracking-[-0.15px] text-[#106844]">
          {tag}
        </span>
      </div>
    </div>
  );
}

export function TestsCard({ gate }: { gate: boolean }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const show = gate && inView;
  return (
    <div
      ref={ref}
      className={`${CARD} flex flex-col gap-4 p-6`}
      style={revealStyle(show)}
    >
      <div className="flex flex-col gap-0.5">
        <p className={CARD_TITLE}>Test results</p>
        <p className={CARD_SUB}>
          In 47 tests, your AI matched your voice and method. Two categories need
          more training before we&apos;d recommend going live.
        </p>
      </div>
      <AvgMessagesRow active={show} />
      <div className="grid grid-cols-2 gap-3">
        {testerCells.map((cell, i) => (
          <TesterCell
            key={cell.label}
            {...cell}
            active={show}
            delay={(i + 1) * ROW_STAGGER}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------- Next steps ---------- */

function NextStepsCard({
  gate,
  onShare,
}: {
  gate: boolean;
  onShare?: () => void;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const show = gate && inView;
  return (
    <div
      ref={ref}
      className={`${CARD} flex flex-col items-center gap-4 p-6`}
      style={revealStyle(show)}
    >
      <div className="flex w-full flex-col gap-0.5">
        <p className={CARD_TITLE}>Next steps</p>
        <p className={CARD_SUB}>
          Share your AI with your new and existing clients.
        </p>
      </div>
      <div className="relative flex h-[202px] w-full items-center justify-center overflow-hidden rounded-[16px] bg-[rgba(26,26,26,0.04)] p-5 backdrop-blur-[10px]">
        {/* animated pixel pattern that fades toward the top */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            WebkitMaskImage:
              "linear-gradient(to top, #000 25%, transparent 95%)",
            maskImage: "linear-gradient(to top, #000 25%, transparent 95%)",
          }}
        >
          <PixelCard
            gap={8}
            pixelSize={2}
            speed={40}
            colors={[
              "rgba(26,26,26,0.28)",
              "rgba(26,26,26,0.18)",
              "rgba(26,26,26,0.1)",
            ]}
            backgroundColor="transparent"
            borderWidth={0}
            radius={0}
            style={{ minWidth: 0, minHeight: 0 }}
          />
        </div>
        {/* overlapping circular avatars — individual transparent circles so the
            pixel pattern shows through the gaps between them */}
        <div className="relative flex items-center">
          {[1, 2, 3, 4, 5, 6].map((n, i) => (
            <img
              key={n}
              src={asset(`avatar-${n}.png`)}
              alt=""
              className="avatar-lift size-16 shrink-0 rounded-full"
              style={{ marginLeft: i === 0 ? 0 : -20, zIndex: i }}
            />
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={onShare}
        className="product-button relative flex w-full items-center justify-center overflow-hidden rounded-[12px] px-3 py-2.5 shadow-[inset_0px_1px_0.5px_0px_rgba(255,255,255,0.28)]"
      >
        <span className="relative z-10 flex items-center">
          <span className="size-5 shrink-0">
            <img
              src={asset("search-icon-white.svg")}
              alt=""
              className="block size-full"
            />
          </span>
          <span className="flex items-center justify-center px-1">
            <span className="whitespace-nowrap text-center text-base font-medium tracking-[-0.15px] text-[rgba(255,255,255,0.8)]">
              Send to clients
            </span>
          </span>
        </span>
      </button>
    </div>
  );
}

/* ---------- breakdown section ---------- */

export default function Breakdown({
  gate = true,
  onShare,
}: {
  gate?: boolean;
  onShare?: () => void;
}) {
  return (
    <div className="flex w-full flex-col items-center gap-6">
      <OverallCard gate={gate} />
      <CoverageCard gate={gate} />
      <CompareCard gate={gate} />
      <TestsCard gate={gate} />
      <NextStepsCard gate={gate} onShare={onShare} />
    </div>
  );
}
