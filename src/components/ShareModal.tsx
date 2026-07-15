import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

function XIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-5">
      <path
        d="M5 5l10 10M15 5L5 15"
        stroke="rgba(26,26,26,0.6)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-5">
      <path
        d="M8.5 11.5a2.5 2.5 0 003.6.1l2.3-2.3a2.5 2.5 0 00-3.5-3.5l-1 .9"
        stroke="rgba(255,255,255,0.85)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.5 8.5a2.5 2.5 0 00-3.6-.1l-2.3 2.3a2.5 2.5 0 003.5 3.5l1-.9"
        stroke="rgba(255,255,255,0.85)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Radio({ checked }: { checked: boolean }) {
  return (
    <span
      className={`flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
        checked
          ? "border-[#1a1a1a] bg-[#1a1a1a]"
          : "border-[rgba(26,26,26,0.2)] bg-[#f5f5f5]"
      }`}
    >
      {checked && <span className="size-1.5 rounded-full bg-white" />}
    </span>
  );
}

function CopyLinkRow({ link }: { link: string }) {
  return (
    <div className="flex w-full items-start gap-2 pl-6">
      <div className="flex min-w-0 flex-1 items-center overflow-hidden rounded-[8px] border border-[rgba(26,26,26,0.09)] bg-white py-1.5 pl-2 pr-1">
        <p className="truncate text-sm font-medium leading-5 text-[rgba(26,26,26,0.8)]">
          {link}
        </p>
      </div>
      <button
        type="button"
        className="product-button relative flex shrink-0 items-center justify-center overflow-hidden rounded-[10px] px-2 py-1.5 shadow-[inset_0px_1px_0.5px_0px_rgba(255,255,255,0.28)]"
      >
        <span className="relative z-10 flex items-center">
          <LinkIcon />
          <span className="flex items-center justify-center px-1">
            <span className="whitespace-nowrap text-sm font-medium tracking-[-0.15px] text-[rgba(255,255,255,0.8)]">
              Copy link
            </span>
          </span>
        </span>
      </button>
    </div>
  );
}

function ShareOption({
  checked,
  onSelect,
  title,
  description,
  link,
}: {
  checked: boolean;
  onSelect: () => void;
  title: string;
  description: string;
  link: string;
}) {
  return (
    <div className="flex w-full flex-col overflow-hidden rounded-[16px] bg-[rgba(26,26,26,0.04)] p-3">
      <button
        type="button"
        onClick={onSelect}
        className="flex w-full items-start gap-2 text-left"
      >
        <span className="pt-0.5">
          <Radio checked={checked} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-px text-sm leading-5">
          <span className="font-medium text-[rgba(26,26,26,0.8)]">{title}</span>
          <span className="font-medium text-[rgba(26,26,26,0.6)]">
            {description}
          </span>
        </span>
      </button>
      {/* grid-rows 0fr→1fr smoothly animates the height from 0 to auto */}
      <div
        className="grid transition-[grid-template-rows,opacity] duration-300 ease-out"
        style={{
          gridTemplateRows: checked ? "1fr" : "0fr",
          opacity: checked ? 1 : 0,
        }}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="pt-3">
            <CopyLinkRow link={link} />
          </div>
        </div>
      </div>
    </div>
  );
}

const SHARE_OPTIONS = [
  {
    title: "Send it to current clients",
    description:
      "Share directly with people who already know you. No quiz, no funnel — just a personal invite to try your AI.",
    link: "brain.kodara.com/sandra-parker/invite",
  },
  {
    title: "Start outreach to new leads",
    description:
      "Cold-lead funnel with a short quiz and your VSL. Best for social posts, ads, or reaching out to prospects.",
    link: "brain.kodara.com/sandra-parker/quiz",
  },
];

export default function ShareModal({ onClose }: { onClose: () => void }) {
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState(0);

  // trigger the enter transition on the frame after mount
  useEffect(() => {
    const id = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const close = () => {
    setShow(false);
    window.setTimeout(onClose, 200);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      role="dialog"
      aria-modal="true"
      aria-label="Share your AI"
    >
      {/* white blurred overlay — tint kept translucent so the frosted blur stays visible */}
      <div
        onClick={close}
        className="absolute inset-0 bg-[rgba(255,255,255,0.6)] backdrop-blur-[10px] transition-opacity duration-200"
        style={{ opacity: show ? 1 : 0 }}
      />
      {/* modal card — scale + fade in */}
      <div
        className="relative w-[480px] max-w-full overflow-hidden rounded-[16px] border border-[rgba(26,26,26,0.09)] bg-[rgba(255,255,255,0.6)] shadow-[0px_24px_15px_0px_rgba(0,0,0,0.02),0px_11px_11px_0px_rgba(0,0,0,0.03),0px_3px_6px_0px_rgba(0,0,0,0.04)] backdrop-blur-[10px] transition-[opacity,transform] duration-200 ease-out"
        style={{
          opacity: show ? 1 : 0,
          transform: show ? "scale(1)" : "scale(0.95)",
        }}
      >
        <div className="relative flex flex-col gap-4 p-6">
          <div className="flex flex-col gap-0.5 pr-8">
            <p className="text-base font-medium leading-6 text-[#1a1a1a]">
              How do you want to share it?
            </p>
            <p className="text-sm leading-5 text-[rgba(26,26,26,0.6)]">
              Select one or both. Start sending it right now.
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 flex items-center rounded-full bg-[rgba(26,26,26,0.06)] p-1 transition-colors hover:bg-[rgba(26,26,26,0.1)]"
          >
            <XIcon />
          </button>

          {SHARE_OPTIONS.map((opt, i) => (
            <ShareOption
              key={opt.title}
              checked={selected === i}
              onSelect={() => setSelected(i)}
              title={opt.title}
              description={opt.description}
              link={opt.link}
            />
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
