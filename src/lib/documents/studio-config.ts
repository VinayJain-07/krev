import type { FrameworkConfig, PrimitiveType } from "@/visuals/engine/types/schema";

type Data = Record<string, unknown>;

const isObject = (value: unknown): value is Data => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const hasText = (value: Data, key: string) => typeof value[key] === "string";
const hasNumber = (value: Data, key: string) => typeof value[key] === "number" && Number.isFinite(value[key]);
const hasItems = (value: Data, key: string, check: (item: Data) => boolean, minimum = 0) =>
  Array.isArray(value[key]) && value[key].length >= minimum && value[key].every((item: unknown) => isObject(item) && check(item));
const optionalItems = (value: Data, key: string, check: (item: Data) => boolean) =>
  value[key] === undefined || hasItems(value, key, check);
const optionalTextList = (value: Data, key: string) => value[key] === undefined ||
  (Array.isArray(value[key]) && value[key].every((item: unknown) => typeof item === "string"));

function validTreeNode(node: Data, depth = 0): boolean {
  return depth < 20 && hasText(node, "id") && hasText(node, "label") &&
    (node.children === undefined || hasItems(node, "children", (child) => validTreeNode(child, depth + 1)));
}

/** Check the renderer-facing shape before a user-edited JSON value reaches React. */
export function isStudioConfig(value: unknown, primitive: PrimitiveType): value is FrameworkConfig {
  if (!isObject(value) || value.primitive !== primitive) return false;
  switch (primitive) {
    case "matrix":
      return hasNumber(value, "rows") && hasNumber(value, "cols") && hasText(value, "gridType") &&
        hasItems(value, "quadrants", (item) => hasText(item, "id") && hasText(item, "title") && hasNumber(item, "row") && hasNumber(item, "col")) &&
        hasItems(value, "items", (item) => hasText(item, "id") && hasText(item, "label")) &&
        optionalTextList(value, "rowHeaders") && optionalTextList(value, "colHeaders");
    case "funnel":
      return hasItems(value, "stages", (item) => hasText(item, "id") && hasText(item, "name") && hasNumber(item, "value"), 1);
    case "flow":
      return hasItems(value, "phases", (item) => hasText(item, "id") && hasText(item, "name"), 1) &&
        hasItems(value, "lanes", (item) => hasText(item, "id") && hasText(item, "label") && hasText(item, "field")) &&
        hasItems(value, "steps", (item) => hasText(item, "id") && hasText(item, "title") && hasText(item, "phaseId"));
    case "tree":
      return isObject(value.root) && validTreeNode(value.root);
    case "map":
      return hasText(value, "mapType") &&
        optionalItems(value, "entities", (item) => hasText(item, "id") && hasText(item, "name")) &&
        optionalItems(value, "rings", (item) => hasText(item, "id") && hasText(item, "label") && hasText(item, "value"));
    case "bridge":
      return hasItems(value, "steps", (item) => hasText(item, "id") && hasText(item, "label") && hasText(item, "type") && hasNumber(item, "value"), 1);
    case "time":
      return hasText(value, "timeType") &&
        optionalItems(value, "horizons", (item) => hasText(item, "id") && hasText(item, "horizon") && Array.isArray(item.initiatives)) &&
        optionalItems(value, "milestones", (item) => hasText(item, "id") && hasText(item, "title")) &&
        (value.cohortData === undefined || (isObject(value.cohortData) && Array.isArray(value.cohortData.periods) && hasItems(value.cohortData, "rows", (item) => hasText(item, "cohort") && Array.isArray(item.retentionRates))));
    case "network":
      return hasText(value, "networkType") &&
        hasItems(value, "nodes", (item) => hasText(item, "id") && hasText(item, "label"), 1) &&
        hasItems(value, "edges", (item) => hasText(item, "id") && hasText(item, "source") && hasText(item, "target"));
  }
}
