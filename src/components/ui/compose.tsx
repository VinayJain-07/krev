"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export type ComposeMention = {
  id: string;
  label: string;
  sublabel?: string;
  avatar?: string;
};

export type ComposeCommand = {
  id: string;
  label: string;
  hint?: string;
  icon?: React.ReactNode;
};

export type ComposeProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onCommand?: (command: ComposeCommand) => void;
  mentions?: ComposeMention[];
  commands?: ComposeCommand[];
  placeholder?: string;
  maxLength?: number;
  submitLabel?: string;
  autoFocus?: boolean;
  className?: string;
  "aria-label"?: string;
};

type Trigger = { type: "@" | "/"; start: number; query: string };

const CARET_PROPS = [
  "boxSizing",
  "width",
  "height",
  "overflowX",
  "overflowY",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "fontStyle",
  "fontVariant",
  "fontWeight",
  "fontStretch",
  "fontSize",
  "lineHeight",
  "fontFamily",
  "textAlign",
  "textTransform",
  "textIndent",
  "letterSpacing",
  "wordSpacing",
  "tabSize",
  "whiteSpace",
  "wordWrap",
  "wordBreak",
] as const;

function caretCoords(el: HTMLTextAreaElement, pos: number) {
  if (typeof window === "undefined" || !document) {
    return { left: 0, top: 0, lineHeight: 20 };
  }
  const doc = document.createElement("div");
  const s = doc.style;
  const cs = window.getComputedStyle(el);
  s.position = "absolute";
  s.visibility = "hidden";
  s.whiteSpace = "pre-wrap";
  s.wordWrap = "break-word";
  s.top = "0";
  s.left = "-9999px";
  for (const p of CARET_PROPS) {
    s[p] = cs[p];
  }
  s.height = "auto";
  s.overflow = "hidden";
  doc.textContent = el.value.slice(0, pos);
  const marker = document.createElement("span");
  marker.textContent = el.value.slice(pos) || ".";
  doc.appendChild(marker);
  document.body.appendChild(doc);
  const x = marker.offsetLeft;
  const y = marker.offsetTop;
  const lh = parseInt(cs.lineHeight, 10) || parseInt(cs.fontSize, 10) * 1.2 || 20;
  document.body.removeChild(doc);
  return { left: x, top: y, lineHeight: lh };
}

export function Compose({
  value: controlledValue,
  defaultValue = "",
  onChange,
  onSubmit,
  onCommand,
  mentions = [],
  commands = [],
  placeholder = "Message your team… press @ to mention, / for commands",
  maxLength = 500,
  submitLabel = "Send",
  autoFocus = false,
  className = "",
  "aria-label": ariaLabel = "Message composer",
}: ComposeProps) {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const textValue = isControlled ? controlledValue : internalValue;

  const [isFocused, setIsFocused] = React.useState(false);
  const [trigger, setTrigger] = React.useState<Trigger | null>(null);
  const [coords, setCoords] = React.useState<{ left: number; top: number; lineHeight: number }>({
    left: 0,
    top: 0,
    lineHeight: 20,
  });
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const backdropRef = React.useRef<HTMLDivElement>(null);
  const pickerRef = React.useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const handleTextChange = (val: string) => {
    if (maxLength && val.length > maxLength) return;
    if (!isControlled) {
      setInternalValue(val);
    }
    onChange?.(val);
  };

  const detectTrigger = (el: HTMLTextAreaElement) => {
    const sel = el.selectionStart;
    const textBefore = el.value.slice(0, sel);
    const match = /(?:^|\s)([@/])([a-zA-Z0-9_-]*)$/.exec(textBefore);

    if (match) {
      const type = match[1] as "@" | "/";
      const query = match[2];
      const start = sel - query.length - 1;
      setTrigger({ type, start, query });
      setSelectedIndex(0);
      const c = caretCoords(el, start);
      setCoords(c);
    } else {
      setTrigger(null);
    }
  };

  const filteredMentions = React.useMemo(() => {
    if (!trigger || trigger.type !== "@") return [];
    return mentions.filter(
      (m) =>
        m.label.toLowerCase().includes(trigger.query.toLowerCase()) ||
        m.sublabel?.toLowerCase().includes(trigger.query.toLowerCase())
    );
  }, [trigger, mentions]);

  const filteredCommands = React.useMemo(() => {
    if (!trigger || trigger.type !== "/") return [];
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(trigger.query.toLowerCase()) ||
        c.hint?.toLowerCase().includes(trigger.query.toLowerCase())
    );
  }, [trigger, commands]);

  const activeItemsCount = trigger?.type === "@" ? filteredMentions.length : filteredCommands.length;

  const insertMention = (mention: ComposeMention) => {
    if (!trigger || !textareaRef.current) return;
    const el = textareaRef.current;
    const before = el.value.slice(0, trigger.start);
    const after = el.value.slice(el.selectionStart);
    const inserted = `@${mention.label} `;
    const nextVal = before + inserted + after;

    handleTextChange(nextVal);
    setTrigger(null);

    requestAnimationFrame(() => {
      const nextPos = before.length + inserted.length;
      el.focus();
      el.setSelectionRange(nextPos, nextPos);
    });
  };

  const selectCommand = (cmd: ComposeCommand) => {
    if (!trigger || !textareaRef.current) return;
    const el = textareaRef.current;
    const before = el.value.slice(0, trigger.start);
    const after = el.value.slice(el.selectionStart);
    const inserted = `/${cmd.label} `;
    const nextVal = before + inserted + after;

    handleTextChange(nextVal);
    setTrigger(null);
    onCommand?.(cmd);

    requestAnimationFrame(() => {
      const nextPos = before.length + inserted.length;
      el.focus();
      el.setSelectionRange(nextPos, nextPos);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (trigger && activeItemsCount > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % activeItemsCount);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + activeItemsCount) % activeItemsCount);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        if (trigger.type === "@" && filteredMentions[selectedIndex]) {
          insertMention(filteredMentions[selectedIndex]);
        } else if (trigger.type === "/" && filteredCommands[selectedIndex]) {
          selectCommand(filteredCommands[selectedIndex]);
        }
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setTrigger(null);
        return;
      }
    }

    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const trimmed = textValue.trim();
    if (!trimmed) return;
    onSubmit?.(trimmed);
    if (!isControlled) {
      setInternalValue("");
    }
    setTrigger(null);
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (backdropRef.current) {
      backdropRef.current.scrollTop = e.currentTarget.scrollTop;
      backdropRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const renderBackdropHighlights = (text: string) => {
    const parts = text.split(/(@[a-zA-Z0-9_-]+|\/[a-zA-Z0-9_-]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith("@")) {
        return (
          <span
            key={index}
            className="rounded bg-indigo-500/15 text-transparent dark:bg-indigo-400/20"
          >
            {part}
          </span>
        );
      }
      if (part.startsWith("/")) {
        return (
          <span
            key={index}
            className="rounded bg-emerald-500/15 text-transparent dark:bg-emerald-400/20"
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const charPercent = maxLength ? Math.min(100, (textValue.length / maxLength) * 100) : 0;
  const strokeDash = 2 * Math.PI * 7;
  const strokeDashoffset = strokeDash - (charPercent / 100) * strokeDash;

  return (
    <div className={`relative w-full ${className}`}>
      {/* Aurora focus ring container */}
      <div
        className={`relative overflow-hidden rounded-2xl p-[1px] transition-all duration-300 ${
          isFocused
            ? "shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/30"
            : "border border-zinc-200/80 dark:border-zinc-800"
        }`}
      >
        {/* Animated gradient ring */}
        {isFocused && (
          <motion.div
            initial={shouldReduceMotion ? {} : { rotate: 0 }}
            animate={shouldReduceMotion ? {} : { rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="pointer-events-none absolute -inset-[100%] z-0 bg-[conic-gradient(from_0deg,transparent_0_340deg,#8b2ce0_360deg)] opacity-40"
          />
        )}

        <div className="relative z-10 flex flex-col rounded-2xl bg-white dark:bg-zinc-900">
          {/* Editor Area with Stacked Backdrop + Textarea */}
          <div className="relative min-h-[96px] w-full p-3.5">
            {/* Backdrop highlighter */}
            <div
              ref={backdropRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-auto whitespace-pre-wrap break-words p-3.5 font-sans text-[14px] leading-relaxed text-transparent select-none"
            >
              {renderBackdropHighlights(textValue)}
              {textValue.endsWith("\n") && <br />}
            </div>

            {/* Transparent Textarea */}
            <textarea
              ref={textareaRef}
              value={textValue}
              onChange={(e) => {
                handleTextChange(e.target.value);
                detectTrigger(e.target);
              }}
              onKeyUp={(e) => {
                if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
                  detectTrigger(e.currentTarget);
                }
              }}
              onClick={(e) => detectTrigger(e.currentTarget)}
              onKeyDown={handleKeyDown}
              onScroll={handleScroll}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                setIsFocused(false);
                setTimeout(() => setTrigger(null), 200);
              }}
              placeholder={placeholder}
              autoFocus={autoFocus}
              aria-label={ariaLabel}
              rows={3}
              className="relative z-10 w-full resize-none bg-transparent font-sans text-[14px] leading-relaxed text-zinc-900 placeholder-zinc-400 outline-none focus:outline-none dark:text-zinc-100 dark:placeholder-zinc-500"
            />
          </div>

          {/* Action footer */}
          <div className="flex items-center justify-between border-t border-zinc-100 px-3.5 py-2.5 dark:border-zinc-800/80">
            <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
              <span>Press</span>
              <kbd className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                @
              </kbd>
              <span>for people,</span>
              <kbd className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                /
              </kbd>
              <span>for commands</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Circular Character Counter */}
              {maxLength && (
                <div className="relative flex items-center justify-center" title={`${textValue.length}/${maxLength} characters`}>
                  <svg className="h-5 w-5 -rotate-90" viewBox="0 0 18 18">
                    <circle
                      cx="9"
                      cy="9"
                      r="7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-zinc-200 dark:text-zinc-800"
                    />
                    <circle
                      cx="9"
                      cy="9"
                      r="7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray={strokeDash}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className={
                        charPercent > 90
                          ? "text-rose-500 transition-all duration-200"
                          : "text-indigo-500 transition-all duration-200"
                      }
                    />
                  </svg>
                </div>
              )}

              {/* Submit button */}
              <button
                type="button"
                onClick={handleSend}
                disabled={!textValue.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3.5 py-1.5 text-[13px] font-medium text-white shadow-sm transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                <span>{submitLabel}</span>
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Caret-Anchored Picker Dropdown */}
      <AnimatePresence>
        {trigger && activeItemsCount > 0 && (
          <motion.div
            ref={pickerRef}
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              top: Math.min(coords.top + coords.lineHeight + 8, 140),
              left: Math.min(Math.max(coords.left, 8), 300),
              zIndex: 50,
            }}
            className="w-64 overflow-hidden rounded-xl border border-zinc-200/80 bg-white/95 p-1 shadow-xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95"
          >
            <div className="max-h-56 overflow-y-auto">
              {trigger.type === "@" &&
                filteredMentions.map((mention, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <button
                      key={mention.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        insertMention(mention);
                      }}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                        isSelected
                          ? "bg-indigo-50 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-200"
                          : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/60"
                      }`}
                    >
                      {mention.avatar ? (
                        <img
                          src={mention.avatar}
                          alt={mention.label}
                          className="h-5 w-5 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-bold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
                          {mention.label.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col truncate">
                        <span className="font-semibold">{mention.label}</span>
                        {mention.sublabel && (
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                            {mention.sublabel}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}

              {trigger.type === "/" &&
                filteredCommands.map((command, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <button
                      key={command.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectCommand(command);
                      }}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                        isSelected
                          ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200"
                          : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/60"
                      }`}
                    >
                      <span className="flex h-5 w-5 items-center justify-center text-zinc-500 dark:text-zinc-400">
                        {command.icon}
                      </span>
                      <div className="flex flex-col truncate">
                        <span className="font-semibold">/{command.label}</span>
                        {command.hint && (
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                            {command.hint}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const iconProps = {
  className: "h-3.5 w-3.5",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  viewBox: "0 0 24 24",
};

export const MENTIONS: ComposeMention[] = [
  {
    id: "shiawase",
    label: "shiawase",
    sublabel: "Product Designer",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80",
  },
  {
    id: "khushi",
    label: "khushi",
    sublabel: "Engineering Lead",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80",
  },
  {
    id: "alex",
    label: "alex",
    sublabel: "Growth Marketing",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80",
  },
];

export const COMMANDS: ComposeCommand[] = [
  {
    id: "summarize",
    label: "summarize",
    hint: "Summarize the active thread",
    icon: (
      <svg {...iconProps}>
        <path d="M4 6h16M4 12h10M4 18h14" />
      </svg>
    ),
  },
  {
    id: "task",
    label: "task",
    hint: "Create a linked action item",
    icon: (
      <svg {...iconProps}>
        <path
          d="M9 2.8h6a1 1 0 0 1 1 1V6a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3.8a1 1 0 0 1 1-1z"
          fill="currentColor"
          stroke="none"
        />
        <path d="M8.5 14l2.3 2.3 4.7-5" />
      </svg>
    ),
  },
  {
    id: "remind",
    label: "remind",
    hint: "Set a reminder",
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="13" r="7.5" />
        <path d="M12 9.5V13l2.3 1.6" />
        <path d="M4.5 4 2.3 6" />
        <path d="M19.5 4l2.2 2" />
      </svg>
    ),
  },
];

export default function ComposeDemo() {
  const [sent, setSent] = React.useState<string[]>([]);

  return (
    <div className="flex min-h-[560px] w-full items-center justify-center bg-zinc-50 p-6 dark:bg-zinc-950">
      <div className="w-full max-w-[540px]">
        {sent.length > 0 && (
          <div className="mb-4 space-y-2">
            {sent.map((m, i) => (
              <div
                key={i}
                className="ml-auto max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-zinc-900 px-3.5 py-2 text-[14px] text-white dark:bg-white dark:text-zinc-900"
              >
                {m}
              </div>
            ))}
          </div>
        )}
        <Compose
          mentions={MENTIONS}
          commands={COMMANDS}
          maxLength={500}
          defaultValue="Kicking off the redesign - @shiawase can you /summarize the thread for @khushi?"
          placeholder="Message your team… press @ to mention, / for commands"
          onSubmit={(v) => setSent((s) => [...s, v])}
          onCommand={(c) => console.log("command:", c.label)}
          aria-label="Team message"
        />
      </div>
    </div>
  );
}
