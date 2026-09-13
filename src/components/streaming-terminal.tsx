"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Copy, Check, Terminal as TerminalIcon, Zap, Shield, Cpu, Activity } from "lucide-react";

export type TerminalLogLevel = "info" | "success" | "interrupt" | "p0" | "warn" | "error";

export type TerminalLog = {
  id: string;
  timestamp: string;
  level: TerminalLogLevel;
  message: string;
  tag?: string;
};

export type StreamingTerminalProps = {
  logs: TerminalLog[];
  activeState?: "idle" | "running" | "interrupt" | "completed";
  activeTask?: string | null;
  progress?: number;
  tokenCount?: number;
  connectionSummary?: React.ReactNode;
};

export function StreamingTerminal({
  logs,
  activeState = "idle",
  activeTask,
  progress = 0,
  tokenCount = 0,
  connectionSummary,
}: StreamingTerminalProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const consoleBottomRef = useRef<HTMLDivElement>(null);

  const latestLog = logs[logs.length - 1] ?? {
    id: "init",
    timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
    level: "info",
    message: "Master Orchestration Engine standing by. Event loop active.",
    tag: "INIT",
  };

  useEffect(() => {
    if (expanded && consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs.length, expanded]);

  function copyLogs() {
    const text = logs
      .map((log) => `[${log.timestamp}] [${(log.tag ?? log.level).toUpperCase()}] ${log.message}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const beaconColor =
    activeState === "interrupt"
      ? "beacon-amber"
      : activeState === "running"
      ? "beacon-blue"
      : activeState === "completed"
      ? "beacon-green"
      : "beacon-green";

  return (
    <div className={`streaming-terminal-container ${expanded ? "expanded" : ""}`}>
      {/* Top Bar Ticker */}
      <div className="streaming-terminal-bar" onClick={() => setExpanded((prev) => !prev)} role="button" tabIndex={0}>
        <div className="terminal-left">
          <div className={`terminal-beacon ${beaconColor}`} />
          <div className="terminal-header-title">
            <TerminalIcon size={14} className="terminal-icon" />
            <span className="terminal-title-text">Activity</span>
          </div>

          <div className="terminal-ticker-wrap">
            <span className="terminal-ticker-tag" data-level={latestLog.level}>
              {latestLog.tag ?? latestLog.level.toUpperCase()}
            </span>
            <span className="terminal-ticker-message">{latestLog.message}</span>
          </div>
        </div>

        <div className="terminal-right" onClick={(e) => e.stopPropagation()}>
          {progress > 0 && progress < 100 && (
            <div className="terminal-progress-pill" title={`${progress}% background queue complete`}>
              <span className="terminal-progress-bar" style={{ width: `${progress}%` }} />
              <span className="terminal-progress-text">{progress}%</span>
            </div>
          )}

          {tokenCount > 0 && (
            <div className="terminal-stat-pill" title="Tokens consumed this session">
              <Cpu size={12} />
              <span>{tokenCount.toLocaleString("en-US")} tkn</span>
            </div>
          )}

          {connectionSummary && <div className="terminal-connection-wrap">{connectionSummary}</div>}

          <button
            type="button"
            className="terminal-expand-toggle"
            onClick={() => setExpanded((prev) => !prev)}
            aria-label={expanded ? "Collapse terminal console" : "Expand terminal console"}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expandable Retro Console Drawer */}
      {expanded && (
        <div className="streaming-terminal-console">
          <div className="console-header">
            <div className="console-title">
              <Activity size={13} />
              <span>Autonomous Agent Event Bus &amp; Execution Log</span>
              <span className="console-event-count">{logs.length} events logged</span>
            </div>
            <div className="console-controls">
              {activeTask && (
                <span className="console-active-task">
                  <Zap size={12} className="pulse-icon" />
                  <strong>Active:</strong> {activeTask}
                </span>
              )}
              <button
                type="button"
                className="console-copy-btn"
                onClick={copyLogs}
                title="Copy full log stream"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "Copied" : "Copy Stream"}
              </button>
            </div>
          </div>

          <div className="console-log-stream">
            {logs.map((log) => (
              <div key={log.id} className={`console-log-line log-${log.level}`}>
                <span className="log-time">{log.timestamp}</span>
                <span className={`log-badge badge-${log.level}`}>
                  {log.tag ?? log.level.toUpperCase()}
                </span>
                <span className="log-msg">{log.message}</span>
              </div>
            ))}
            <div ref={consoleBottomRef} />
          </div>
        </div>
      )}
    </div>
  );
}
