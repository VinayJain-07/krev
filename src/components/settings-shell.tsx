import { ReactNode } from "react";
import Link from "next/link";
import { Bot, CreditCard, Globe2, MessageCircle, Moon, Plug, Shield, Users } from "lucide-react";
import { Brand } from "./brand";

export function SettingsShell({ active, children }: { active: string; children: ReactNode }) {
  const items = [
    ["Websites", "/", Globe2], ["Credits", "/settings/credits", CreditCard], ["Appearance", "/settings/appearance", Moon], ["Agents", "/settings/agents", Bot], ["Integrations", "/settings/integrations", Plug], ["Team", "/settings/team", Users],
  ] as const;
  return <main className="settings-shell"><header><Brand /><Link href="/">← Back to dashboard</Link></header><div className="settings-layout"><aside><h1>Settings</h1><p className="settings-group">AI CMO</p>{items.map(([label, href, Icon]) => <Link className={active === label ? "active" : ""} href={href} key={label}><Icon size={15} />{label}</Link>)}<p className="settings-group">CHAT</p><span><MessageCircle size={15} />Personalization</span><p className="settings-group">GENERAL</p><span><Shield size={15} />Account & Security</span><Link href="/admin"><Shield size={15} />Admin Activity</Link></aside><section className="settings-content">{children}</section></div><div className="accent-bar" /></main>;
}
