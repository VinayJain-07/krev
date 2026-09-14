"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Clock,
  Copy,
  ExternalLink,
  Info,
  Lock,
  Mail,
  MessageCircleMore,
  Phone,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  UserCheck,
  X,
} from "lucide-react";
import {
  extractConversationProspects,
  type ConversationProspect,
} from "@/lib/conversation-mining";

type AgentRun = { agentType: string; output: unknown };

const REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 Hours

export function LiveConversationMining({
  agents,
  running,
  onScan,
  companyId = "default",
  companyName,
  companyIndustry,
}: {
  agents: AgentRun[];
  running: boolean;
  onScan: () => void;
  companyId?: string;
  companyName?: string;
  companyIndustry?: string;
}) {
  const [lastRefreshedAt, setLastRefreshedAt] = useState<number | null>(null);
  const [seenLeadIds, setSeenLeadIds] = useState<string[]>([]);
  const [selectedProspect, setSelectedProspect] = useState<ConversationProspect | null>(null);
  const [copiedHook, setCopiedHook] = useState(false);
  const [lockWarning, setLockWarning] = useState<string | null>(null);
  const [now, setNow] = useState<number | null>(null);

  // Load persistence state from localStorage
  useEffect(() => {
    const loadTimer = setTimeout(() => {
      try {
        const storageKeyTime = `smark_miner_last_refreshed_${companyId}`;
        const storageKeySeen = `smark_miner_seen_${companyId}`;

        const savedTime = localStorage.getItem(storageKeyTime);
        if (savedTime) {
          const timeNum = Number.parseInt(savedTime, 10);
          if (!Number.isNaN(timeNum)) setLastRefreshedAt(timeNum);
        }

        const savedSeen = localStorage.getItem(storageKeySeen);
        if (savedSeen) {
          const parsedSeen = JSON.parse(savedSeen);
          if (Array.isArray(parsedSeen)) setSeenLeadIds(parsedSeen.filter((x): x is string => typeof x === "string"));
        }
      } catch {
        // Ignore storage read errors
      }
    }, 0);
    return () => clearTimeout(loadTimer);
  }, [companyId]);

  // Update timer tick every minute
  useEffect(() => {
    const initialTick = setTimeout(() => setNow(Date.now()), 0);
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => { clearTimeout(initialTick); clearInterval(interval); };
  }, []);

  // Compute 24-hour refresh status
  const elapsedMs = lastRefreshedAt && now !== null ? now - lastRefreshedAt : Number.POSITIVE_INFINITY;
  const canRefresh = !lastRefreshedAt || (now !== null && elapsedMs >= REFRESH_INTERVAL_MS);
  const remainingMs = lastRefreshedAt && now === null ? REFRESH_INTERVAL_MS : Math.max(0, REFRESH_INTERVAL_MS - elapsedMs);

  const hoursLeft = Math.floor(remainingMs / (1000 * 60 * 60));
  const minsLeft = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

  // Extract 5 to 6 active leads while guaranteeing non-repeating history
  const prospects = extractConversationProspects(agents, 6, seenLeadIds, {
    name: companyName,
    industry: companyIndustry,
  });

  const handleRefreshClick = () => {
    if (running) return;

    if (!canRefresh) {
      const notice = `24-Hour Refresh Restriction active. Next scan available in ${hoursLeft}h ${minsLeft}m to prevent duplicate lead discovery.`;
      setLockWarning(notice);
      setTimeout(() => setLockWarning(null), 6000);
      return;
    }

    // Trigger scan
    const newTimestamp = Date.now();
    setLastRefreshedAt(newTimestamp);
    setLockWarning(null);

    // Save newly seen IDs
    const newSeen = Array.from(new Set([...seenLeadIds, ...prospects.map((p) => p.id), ...prospects.map((p) => p.identity.toLowerCase())]));
    setSeenLeadIds(newSeen);

    try {
      localStorage.setItem(`smark_miner_last_refreshed_${companyId}`, newTimestamp.toString());
      localStorage.setItem(`smark_miner_seen_${companyId}`, JSON.stringify(newSeen));
    } catch {
      // Ignore storage write errors
    }

    onScan();
  };

  const copyHookToClipboard = (hookText: string) => {
    navigator.clipboard.writeText(hookText);
    setCopiedHook(true);
    setTimeout(() => setCopiedHook(false), 2500);
  };

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyField = (val: string, key: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <section className="conversation-mining" aria-labelledby="conversation-mining-title">
      <header className="conversation-mining__header">
        <span className="conversation-mining__icon">
          <MessageCircleMore size={14} />
        </span>
        <span className="conversation-mining__title">
          <strong id="conversation-mining-title">Live Conversation Miner</strong>
          <small>
            {prospects.length
              ? `${prospects.length} Verified Contact Leads · 24h Non-Repeating Stream`
              : "Mine active buyer-intent prospects"}
          </small>
        </span>

        <div className="conversation-mining__controls">
          {lastRefreshedAt && (
            <span
              className={`refresh-timer-badge ${canRefresh ? "ready" : "locked"}`}
              title={canRefresh ? "Refresh available" : `Next refresh available in ${hoursLeft}h ${minsLeft}m`}
            >
              {canRefresh ? (
                <>
                  <Sparkles size={10} /> Ready
                </>
              ) : (
                <>
                  <Clock size={10} /> {hoursLeft}h {minsLeft}m
                </>
              )}
            </span>
          )}

          <button
            type="button"
            onClick={handleRefreshClick}
            disabled={running}
            aria-label={canRefresh ? "Refresh active leads (once per 24h)" : `Locked: available in ${hoursLeft}h ${minsLeft}m`}
            title={canRefresh ? "Refresh active leads (once per 24h)" : `Locked: available in ${hoursLeft}h ${minsLeft}m`}
            className={!canRefresh ? "button-locked" : ""}
          >
            {running ? (
              <RefreshCw size={13} className="spin" />
            ) : canRefresh ? (
              <RefreshCw size={13} />
            ) : (
              <Lock size={12} className="lock-icon" />
            )}
          </button>
        </div>
      </header>

      {lockWarning && (
        <div className="conversation-mining__lock-notice" role="alert">
          <Lock size={12} />
          <span>{lockWarning}</span>
          <button type="button" onClick={() => setLockWarning(null)}>
            ×
          </button>
        </div>
      )}

      <div className="conversation-mining__body">
        {prospects.length ? (
          <div className="conversation-prospect-list">
            {prospects.map((prospect) => (
              <article
                key={prospect.id}
                className="conversation-prospect"
                onClick={() => setSelectedProspect(prospect)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setSelectedProspect(prospect);
                }}
              >
                <div className="conversation-prospect__person-row">
                  <div className="conversation-prospect__person-id">
                    <div className="prospect-avatar">
                      {prospect.platform === "LinkedIn" ? (
                        <span className="platform-symbol linkedin">in</span>
                      ) : prospect.platform === "X" ? (
                        <span className="platform-symbol x">𝕏</span>
                      ) : prospect.platform === "Reddit" ? (
                        <span className="platform-symbol reddit">r/</span>
                      ) : (
                        <UserCheck size={12} />
                      )}
                    </div>
                    <div className="prospect-identity-text">
                      <div className="identity-name-line">
                        <strong>{prospect.identity}</strong>
                        <span className="platform-pill">{prospect.platform}</span>
                      </div>
                      {(prospect.personRole || prospect.companyName) && (
                        <small className="identity-role">
                          {prospect.personRole || "Prospect"}
                          {prospect.companyName ? ` · ${prospect.companyName}` : ""}
                        </small>
                      )}
                    </div>
                  </div>
                  <span className="conversation-prospect__chevron" title="Click to view details">
                    <Info size={12} />
                  </span>
                </div>

                <div className="conversation-prospect__contact-card">
                  {/* Phone Number */}
                  <div className={`contact-entry ${prospect.contact.phoneVerified ? "verified" : "unlisted"}`}>
                    <div className="contact-entry__left">
                      <Phone size={11} className="contact-icon" />
                      <span className="contact-type-label">Phone:</span>
                      {prospect.contact.phone ? (
                        <code className="contact-val">{prospect.contact.phone}</code>
                      ) : (
                        <span className="contact-val muted">Unlisted</span>
                      )}
                    </div>
                    <div className="contact-entry__right">
                      {prospect.contact.phoneVerified && prospect.contact.phone ? (
                        <>
                          <span className="verified-badge">
                            <ShieldCheck size={9} /> Verified
                          </span>
                          <button
                            type="button"
                            className="contact-copy-btn"
                            title="Copy phone number"
                            onClick={(e) => copyField(prospect.contact.phone!, `phone-${prospect.id}`, e)}
                          >
                            {copiedKey === `phone-${prospect.id}` ? <Check size={10} /> : <Copy size={10} />}
                          </button>
                        </>
                      ) : (
                        <span className="unlisted-badge">Unlisted</span>
                      )}
                    </div>
                  </div>

                  {/* Email ID */}
                  <div className={`contact-entry ${prospect.contact.emailVerified ? "verified" : "unlisted"}`}>
                    <div className="contact-entry__left">
                      <Mail size={11} className="contact-icon" />
                      <span className="contact-type-label">Email:</span>
                      {prospect.contact.email ? (
                        <code className="contact-val">{prospect.contact.email}</code>
                      ) : (
                        <span className="contact-val muted">Unlisted</span>
                      )}
                    </div>
                    <div className="contact-entry__right">
                      {prospect.contact.emailVerified && prospect.contact.email ? (
                        <>
                          <span className="verified-badge">
                            <ShieldCheck size={9} /> Verified
                          </span>
                          <button
                            type="button"
                            className="contact-copy-btn"
                            title="Copy email ID"
                            onClick={(e) => copyField(prospect.contact.email!, `email-${prospect.id}`, e)}
                          >
                            {copiedKey === `email-${prospect.id}` ? <Check size={10} /> : <Copy size={10} />}
                          </button>
                        </>
                      ) : (
                        <span className="unlisted-badge">Unlisted</span>
                      )}
                    </div>
                  </div>

                  {/* LinkedIn Profile if verified */}
                  {prospect.contact.linkedinVerified && prospect.contact.linkedinUrl && (
                    <div className="contact-entry verified">
                      <div className="contact-entry__left">
                        <ExternalLink size={11} className="contact-icon" />
                        <span className="contact-type-label">LinkedIn:</span>
                        <a
                          href={prospect.contact.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="contact-link"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {prospect.contact.linkedinUrl.replace(/^https?:\/\/(?:www\.)?linkedin\.com\/in\//i, "in/")}
                        </a>
                      </div>
                      <div className="contact-entry__right">
                        <span className="verified-badge">
                          <ShieldCheck size={9} /> Verified Profile
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="conversation-mining__empty">
            <Target size={22} />
            <strong>No active leads mined yet</strong>
            <p>Scan public discussions to rank real prospects by buyer intent, ICP fit, trigger events, and public contact information.</p>
            <button type="button" onClick={handleRefreshClick} disabled={running}>
              <RefreshCw size={12} className={running ? "spin" : ""} />
              {running ? "Scanning…" : "Mine 5-6 Active Leads"}
            </button>
          </div>
        )}
      </div>

      <footer className="conversation-mining__footer">
        <span>Verified direct contact intelligence · Refreshes once per 24 hours</span>
      </footer>

      {/* Prospect Intelligence Modal (Minimal Design) */}
      {selectedProspect && (
        <div className="drawer-backdrop lead-modal-backdrop" onClick={() => setSelectedProspect(null)}>
          <div className="lead-modal lead-modal--minimal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Lead Prospect Contact">
            <header className="lead-modal__header">
              <div className="lead-modal__title-box">
                <span className="platform-pill">{selectedProspect.platform}</span>
                <h2>{selectedProspect.identity}</h2>
                {selectedProspect.companyName && <p className="company-name">{selectedProspect.companyName} {selectedProspect.personRole ? `· ${selectedProspect.personRole}` : ""}</p>}
                <span className="community-sub">{selectedProspect.community}</span>
              </div>

              <button type="button" className="close-btn" onClick={() => setSelectedProspect(null)}>
                <X size={16} />
              </button>
            </header>

            <div className="lead-modal__body">
              {/* Verified Business Contact */}
              <div className="lead-modal__section">
                <h4>Verified Contact Details</h4>
                <div className="contact-details-grid">
                  <div className="contact-field">
                    <label>
                      Phone Number {selectedProspect.contact.phoneVerified ? <span className="verified-badge-inline"><ShieldCheck size={9} /> Verified</span> : <span className="unlisted-badge-inline">Unlisted</span>}
                    </label>
                    {selectedProspect.contact.phone ? (
                      <div className="contact-modal-row">
                        <code>{selectedProspect.contact.phone}</code>
                        <button
                          type="button"
                          className="contact-copy-btn"
                          onClick={() => copyField(selectedProspect.contact.phone!, "modal-phone")}
                          title="Copy phone"
                        >
                          {copiedKey === "modal-phone" ? <Check size={11} /> : <Copy size={11} />}
                        </button>
                      </div>
                    ) : (
                      <span className="unlisted-note">Unlisted in public discussion</span>
                    )}
                  </div>

                  <div className="contact-field">
                    <label>
                      Email {selectedProspect.contact.emailVerified ? <span className="verified-badge-inline"><ShieldCheck size={9} /> Verified</span> : selectedProspect.contact.email ? <span className="probable-badge-inline">Discovered</span> : <span className="unlisted-badge-inline">Unlisted</span>}
                    </label>
                    {selectedProspect.contact.email ? (
                      <div className="contact-modal-row">
                        <code>{selectedProspect.contact.email}</code>
                        <button
                          type="button"
                          className="contact-copy-btn"
                          onClick={() => copyField(selectedProspect.contact.email!, "modal-email")}
                          title="Copy email"
                        >
                          {copiedKey === "modal-email" ? <Check size={11} /> : <Copy size={11} />}
                        </button>
                      </div>
                    ) : (
                      <span className="unlisted-note">Unlisted in public discussion</span>
                    )}
                  </div>

                  <div className="contact-field">
                    <label>
                      LinkedIn {selectedProspect.contact.linkedinVerified ? <span className="verified-badge-inline"><ShieldCheck size={9} /> Verified Profile</span> : <span className="unlisted-badge-inline">Unlisted</span>}
                    </label>
                    {selectedProspect.contact.linkedinUrl ? (
                      <a href={selectedProspect.contact.linkedinUrl} target="_blank" rel="noreferrer" className="modal-link">
                        {selectedProspect.contact.linkedinUrl} <ExternalLink size={11} />
                      </a>
                    ) : (
                      <span className="unlisted-note">Unlisted in public discussion</span>
                    )}
                  </div>

                  <div className="contact-field">
                    <label>Public Source Discussion</label>
                    <a href={selectedProspect.sourceUrl} target="_blank" rel="noreferrer" className="modal-link">
                      View Source Post <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Personalized Outreach Hook */}
              <div className="lead-modal__section hook-section-minimal">
                <div className="hook-header">
                  <h4>Personalized Outreach Hook</h4>
                  <button type="button" className="copy-btn" onClick={() => copyHookToClipboard(selectedProspect.outreachAngle)}>
                    {copiedHook ? <Check size={12} /> : <Copy size={12} />}
                    {copiedHook ? "Copied!" : "Copy Hook"}
                  </button>
                </div>
                <div className="hook-content">{selectedProspect.outreachAngle}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
