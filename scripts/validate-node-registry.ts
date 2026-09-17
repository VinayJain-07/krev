import { access } from "node:fs/promises";
import path from "node:path";
import { AgentType, DocumentType } from "@prisma/client";
import { AGENT_DEFINITIONS, ALL_DOCUMENTS, INTERNAL_OPERATIONS, LEGACY_DOCUMENT_ALIASES, type NodeRepository } from "../src/lib/nodes/registry";

const roots: Record<Exclude<NodeRepository, "local">, string> = {
  "smark-node-1": "smark-node-1",
  "smark-node-2": "smark-node-2",
  "smark-node-3": "smark-node-3",
};

async function main() {
  const missingDocuments = Object.values(DocumentType).filter((type) => !ALL_DOCUMENTS.some((document) => document.type === type) && !LEGACY_DOCUMENT_ALIASES[type]);
  const missingAgents = Object.values(AgentType).filter((type) => !AGENT_DEFINITIONS.some((agent) => agent.type === type));
  if (missingDocuments.length || missingAgents.length) throw new Error(`Unmapped operations:\nDocuments: ${missingDocuments.join(", ") || "none"}\nAgents: ${missingAgents.join(", ") || "none"}`);
  const operations = [...ALL_DOCUMENTS, ...AGENT_DEFINITIONS, ...Object.values(INTERNAL_OPERATIONS)];
  const malformed = operations.flatMap((operation) => operation.nodes.filter((ref) => !ref.phase || !ref.reason).map((ref) => `${ref.repository}/${ref.node ?? ref.skill}`));
  if (malformed.length) throw new Error(`Node steps missing a phase or reason:\n${malformed.join("\n")}`);
  const refs = operations.flatMap((item) => item.nodes)
    .filter((ref, index, values) => values.findIndex((candidate) => candidate.repository === ref.repository && (candidate.node ?? candidate.skill) === (ref.node ?? ref.skill)) === index);
  const missing: string[] = [];
  for (const ref of refs) {
    const nodeName = ref.node ?? ref.skill;
    const source = ref.repository === "local"
      ? path.resolve(process.cwd(), "nodes", nodeName, "NODE.md")
      : path.resolve(process.cwd(), "vendor", "nodes", roots[ref.repository], "nodes", nodeName, "NODE.md");
    try { await access(source); } catch { missing.push(`${ref.repository}/${nodeName}`); }
  }
  if (missing.length) throw new Error(`Missing embedded node files:\n${missing.join("\n")}`);
  process.stdout.write(`Validated ${refs.length} unique embedded nodes across ${ALL_DOCUMENTS.length} documents, ${AGENT_DEFINITIONS.length} agents, and ${Object.keys(INTERNAL_OPERATIONS).length} internal operations.\n`);
}

main();
