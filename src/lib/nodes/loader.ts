import "server-only";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { NodeRef, NodeRepository, SkillRef, SkillRepository } from "./registry";

export type NodeExecutionStep = NodeRef & {
  step: number;
  source: string;
  digest: string;
  charactersProvided: number;
  references: string[];
  omittedReferences?: string[];
};
export type SkillExecutionStep = NodeExecutionStep;

const repositoryDirectories: Record<Exclude<NodeRepository, "local">, string> = {
  "smark-node-1": "smark-node-1",
  "smark-node-2": "smark-node-2",
  "smark-node-3": "smark-node-3",
};

const legacyRepoMap: Record<string, Exclude<NodeRepository, "local">> = {
  "claude-seo": "smark-node-1",
  "openclaw-marketing-skills": "smark-node-2",
  "social-media-skills": "smark-node-3",
};

function repositoryRoot(repository: NodeRepository | string): string {
  if (repository === "local") {
    return path.resolve(/* turbopackIgnore: true */ process.cwd(), "nodes");
  }
  const resolvedRepo = legacyRepoMap[repository] ?? (repository as Exclude<NodeRepository, "local">);
  const dirName = repositoryDirectories[resolvedRepo] ?? resolvedRepo;
  return path.resolve(/* turbopackIgnore: true */ process.cwd(), "vendor", "nodes", dirName);
}

function referencedMarkdown(markdown: string): string[] {
  return Array.from(markdown.matchAll(/(?:\(|`)(references\/[a-z0-9._/-]+\.md)(?:\)|`)/gi), (match) => match[1])
    .filter((value, index, values) => values.indexOf(value) === index);
}

async function loadOneNode(ref: NodeRef, budget: number, index: number): Promise<{ content: string; step: NodeExecutionStep }> {
  const nodeName = ref.node ?? ref.skill;
  const nodeDirectory = ref.repository === "local"
    ? path.join(repositoryRoot(ref.repository), nodeName)
    : path.join(repositoryRoot(ref.repository), "nodes", nodeName);
  let nodePath = path.join(nodeDirectory, "NODE.md");
  let main: string;
  try {
    main = await readFile(nodePath, "utf8");
  } catch {
    nodePath = path.join(nodeDirectory, "SKILL.md");
    main = await readFile(nodePath, "utf8");
  }
  try {
    const references: string[] = [];
    const referenceFiles: string[] = [];
    const omittedReferences: string[] = [];
    let remaining = Math.max(0, budget - main.length - 800);
    for (const relativePath of referencedMarkdown(main)) {
      try {
        const content = await readFile(path.join(nodeDirectory, relativePath), "utf8");
        const dependency = `DEPENDENCY: ${relativePath}\n${content}`;
        if (dependency.length <= remaining) {
          references.push(dependency);
          referenceFiles.push(relativePath);
          remaining -= dependency.length + 2;
        } else omittedReferences.push(relativePath);
      } catch {
        references.push(`DEPENDENCY UNAVAILABLE: ${relativePath}`);
        referenceFiles.push(`${relativePath} (unavailable)`);
      }
    }
    const source = path.relative(process.cwd(), nodePath).replaceAll("\\", "/");
    const loadedSource = [main, ...references, ...(omittedReferences.length ? [`SUPPLEMENTAL REFERENCES NOT INCLUDED (context budget): ${omittedReferences.join(", ")}. Do not claim to have read them.`] : [])].join("\n\n");
    const content = `NODE CHAIN STEP ${index + 1}\nPHASE: ${ref.phase}\nNODE: ${ref.repository}/${nodeName}\nROLE IN THIS OPERATION: ${ref.reason}\nSOURCE: ${source}\nSHA256: ${createHash("sha256").update(loadedSource).digest("hex")}\n\n${loadedSource}`;
    return {
      content,
      step: {
        ...ref,
        node: nodeName,
        skill: nodeName,
        step: index + 1,
        source,
        digest: createHash("sha256").update(loadedSource).digest("hex"),
        charactersProvided: content.length,
        references: referenceFiles,
        omittedReferences,
      },
    };
  } catch (error) {
    throw new Error(`Required node file ${ref.repository}/${nodeName} could not be loaded: ${error instanceof Error ? error.message : "unknown filesystem error"}`);
  }
}

export async function loadNodePackWithManifest(refs: NodeRef[], maxCharacters = 64_000): Promise<{ content: string; steps: NodeExecutionStep[] }> {
  if (!refs.length) throw new Error("This operation has no mapped node chain and cannot run.");
  const unique = refs.filter((ref, index, values) => values.findIndex((candidate) => candidate.repository === ref.repository && (candidate.node ?? candidate.skill) === (ref.node ?? ref.skill)) === index);
  const perNodeBudget = Math.max(0, Math.floor(maxCharacters / unique.length));
  const loaded: string[] = [];
  const steps: NodeExecutionStep[] = [];
  for (const [index, ref] of unique.entries()) {
    const result = await loadOneNode(ref, perNodeBudget, index);
    loaded.push(result.content);
    steps.push(result.step);
  }
  return { content: loaded.join("\n\n===== NEXT EMBEDDED NODE =====\n\n"), steps };
}
export const loadSkillPackWithManifest = loadNodePackWithManifest;

export async function loadNodePack(refs: NodeRef[], maxCharacters = 64_000): Promise<string> {
  return (await loadNodePackWithManifest(refs, maxCharacters)).content;
}
export const loadSkillPack = loadNodePack;
