/**
 * Strategy & SaaS Framework Visualization Engine
 * Unified JSON Schema & Type Definitions for the 8 Core Primitives
 */

export type PrimitiveType =
  | 'matrix'
  | 'funnel'
  | 'flow'
  | 'tree'
  | 'map'
  | 'bridge'
  | 'time'
  | 'network';

export type FrameworkCategory =
  | 'Strategy & Positioning'
  | 'Market & Growth'
  | 'Customer & Marketing'
  | 'Product & Prioritization'
  | 'Finance & SaaS Metrics'
  | 'Operations & Value Chain'
  | 'Organization & Governance'
  | 'Risk & Decision-Making';

export interface FrameworkMeta {
  id: string;
  name: string;
  category: FrameworkCategory;
  primitive: PrimitiveType;
  description: string;
  strategicQuestion: string;
  tags: string[];
  version?: string;
  author?: string;
}

// -------------------------------------------------------------
// 1. MATRIX PRIMITIVE SCHEMA (2x2, 3x3, NxM, SWOT, BCG, Risk, RACI)
// -------------------------------------------------------------
export interface MatrixAxis {
  label: string;
  lowLabel?: string;
  highLabel?: string;
  midLabel?: string;
}

export interface MatrixQuadrant {
  id: string;
  title: string;
  subtitle?: string;
  row: number; // 0-indexed from top
  col: number; // 0-indexed from left
  color?: string; // Hex, Tailwind badge class, or theme token
  accent?: string;
  description?: string;
}

export interface MatrixItem {
  id: string;
  label: string;
  description?: string;
  quadrantId?: string; // Placed inside discrete quadrant/cell
  x?: number; // Continuous 0-100 coordinate (optional scatter/positioning)
  y?: number; // Continuous 0-100 coordinate
  size?: number; // Relative bubble weight
  badge?: string;
  status?: 'critical' | 'high' | 'medium' | 'low' | 'neutral';
  color?: string;
  customFields?: Record<string, string | number>;
}

export interface MatrixConfig {
  primitive: 'matrix';
  gridType: '2x2' | '3x3' | 'custom-grid' | 'table-matrix';
  rows: number;
  cols: number;
  xAxis?: MatrixAxis;
  yAxis?: MatrixAxis;
  rowHeaders?: string[];
  colHeaders?: string[];
  quadrants: MatrixQuadrant[];
  items: MatrixItem[];
  options?: {
    showCoordinates?: boolean;
    allowDrag?: boolean;
    cellLayout?: 'cards' | 'bullets' | 'scatter' | 'compact-table';
    aspectRatio?: string;
  };
}

// -------------------------------------------------------------
// 2. FUNNEL PRIMITIVE SCHEMA (Marketing, Sales, Pipeline, AIDA)
// -------------------------------------------------------------
export interface FunnelStage {
  id: string;
  name: string;
  value: number; // Quantitative count or $ amount
  formattedValue?: string; // e.g. "100,000 Visitors" or "$1.2M"
  conversionRate?: number; // % passing to this stage (0-100)
  dropoffRate?: number; // % dropping out before next stage (0-100)
  velocityDays?: number; // Avg days spent in stage
  color?: string;
  metrics?: { label: string; value: string }[];
  keyActions?: string[];
}

export interface FunnelConfig {
  primitive: 'funnel';
  stages: FunnelStage[];
  unit?: string; // e.g. "leads", "users", "$"
  currency?: string;
  options?: {
    orientation?: 'vertical' | 'horizontal';
    showDropoff?: boolean;
    showConversionPill?: boolean;
    colorScheme?: 'gradient' | 'distinct' | 'monochrome';
    showVelocity?: boolean;
  };
}

// -------------------------------------------------------------
// 3. FLOW PRIMITIVE SCHEMA (Customer Journey, Value Chain, SIPOC)
// -------------------------------------------------------------
export interface FlowStep {
  id: string;
  title: string;
  phaseId: string;
  sentiment?: number; // -5 (frustration) to +5 (delight) for sentiment graph
  touchpoints?: string[];
  customerAction?: string;
  frontstageAction?: string;
  backstageAction?: string;
  painPoints?: string[];
  opportunities?: string[];
  kpis?: string[];
  owner?: string;
}

export interface FlowPhase {
  id: string;
  name: string;
  color?: string;
  description?: string;
}

export interface FlowLane {
  id: string;
  label: string;
  icon?: string;
  field: keyof FlowStep;
}

export interface FlowConfig {
  primitive: 'flow';
  phases: FlowPhase[];
  lanes: FlowLane[];
  steps: FlowStep[];
  options?: {
    showSentimentCurve?: boolean;
    flowType?: 'journey' | 'value-chain' | 'sipoc' | 'process';
    layout?: 'horizontal-lanes' | 'chevron-steps' | 'block-stages';
  };
}

// -------------------------------------------------------------
// 4. TREE PRIMITIVE SCHEMA (KPI Tree, DuPont, OKR, Decision Tree)
// -------------------------------------------------------------
export interface TreeNode {
  id: string;
  parentId?: string | null;
  label: string;
  value?: string | number;
  unit?: string;
  change?: number; // e.g. +12.4%
  target?: string | number;
  status?: 'good' | 'warning' | 'danger' | 'neutral';
  formula?: string; // e.g. "A = B * C" or "SUM"
  operator?: '+' | '-' | '×' | '÷' | '=' | 'branch' | 'decision';
  probability?: number; // For decision trees (0 - 1.0)
  expectedValue?: number;
  notes?: string;
  children?: TreeNode[];
}

export interface TreeConfig {
  primitive: 'tree';
  root: TreeNode;
  orientation?: 'horizontal' | 'vertical';
  treeType?: 'kpi-metric' | 'dupont' | 'decision' | 'okr' | 'org';
  options?: {
    showFormulas?: boolean;
    showVariancePills?: boolean;
    collapsible?: boolean;
    nodeCardWidth?: number;
  };
}

// -------------------------------------------------------------
// 5. MAP PRIMITIVE SCHEMA (Perceptual Positioning, TAM/SAM/SOM)
// -------------------------------------------------------------
export interface MapEntity {
  id: string;
  name: string;
  x?: number; // 0 to 100 for perceptual positioning
  y?: number; // 0 to 100
  size?: number; // Bubble radius / market share
  category?: string;
  color?: string;
  isSelf?: boolean;
  notes?: string;
  metrics?: { label: string; value: string }[];
}

export interface ConcentricRing {
  id: string;
  label: string;
  subLabel?: string;
  value: string;
  description: string;
  color: string;
  percentageOfTAM?: number;
}

export interface MapConfig {
  primitive: 'map';
  mapType: 'perceptual-scatter' | 'concentric-rings' | 'quadrant-radar' | 'strategic-groups';
  xAxis?: {
    label: string;
    minLabel: string;
    maxLabel: string;
  };
  yAxis?: {
    label: string;
    minLabel: string;
    maxLabel: string;
  };
  entities?: MapEntity[];
  rings?: ConcentricRing[]; // Specifically for TAM/SAM/SOM
  centerLabel?: string;
  options?: {
    showQuadrantLines?: boolean;
    showLegend?: boolean;
    bubbleScaleFactor?: number;
  };
}

// -------------------------------------------------------------
// 6. BRIDGE PRIMITIVE SCHEMA (ARR/MRR SaaS Bridge, Revenue to FCF)
// -------------------------------------------------------------
export interface BridgeStep {
  id: string;
  label: string;
  value: number; // positive or negative
  formattedValue?: string;
  type: 'anchor' | 'delta-positive' | 'delta-negative' | 'subtotal' | 'final';
  color?: string;
  category?: string;
  percentageOfBase?: number;
  explanation?: string;
}

export interface BridgeConfig {
  primitive: 'bridge';
  currency?: string;
  unit?: string; // e.g. "$M", "$k", "Users"
  bridgeType?: 'arr-mrr-bridge' | 'financial-pnl' | 'cash-flow' | 'valuation';
  steps: BridgeStep[];
  options?: {
    showConnectors?: boolean;
    showDeltaBadges?: boolean;
    height?: number;
    showSummaryCards?: boolean;
  };
}

// -------------------------------------------------------------
// 7. TIME PRIMITIVE SCHEMA (Roadmaps, 3 Horizons, Cohort Retention)
// -------------------------------------------------------------
export interface HorizonTrack {
  id: string;
  horizon: 'H1: Core Business' | 'H2: Emerging Growth' | 'H3: Future Bets' | string;
  timeframe: string;
  focus: string;
  color: string;
  initiatives: {
    id: string;
    title: string;
    status: 'planned' | 'in-progress' | 'completed' | 'validated';
    impact: 'high' | 'medium' | 'low';
    owner?: string;
    quarter?: string;
  }[];
}

export interface CohortRow {
  cohort: string; // e.g. "Jan 2024"
  userCount: number;
  retentionRates: number[]; // % active in Month 0, 1, 2, ... 12
}

export interface TimeConfig {
  primitive: 'time';
  timeType: 'three-horizons' | 'cohort-retention' | 'strategic-roadmap' | 'gantt-milestones';
  horizons?: HorizonTrack[];
  cohortData?: {
    periods: string[]; // ["M0", "M1", "M2", "M3", ...]
    rows: CohortRow[];
  };
  milestones?: {
    id: string;
    title: string;
    date: string;
    quarter: string;
    phase: string;
    status: string;
    deliverables: string[];
  }[];
  options?: {
    colorScale?: 'emerald' | 'indigo' | 'amber' | 'blue';
    showPercentages?: boolean;
  };
}

// -------------------------------------------------------------
// 8. NETWORK PRIMITIVE SCHEMA (Causal Loops, Feedback Loops, Systems)
// -------------------------------------------------------------
export interface NetworkNode {
  id: string;
  label: string;
  type?: 'driver' | 'outcome' | 'stock' | 'delay' | 'lever' | 'neutral';
  color?: string;
  icon?: string;
  x?: number; // relative pos % (0-100)
  y?: number;
}

export interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  polarity: '+' | '-'; // Positive (reinforcing) or Negative (balancing)
  label?: string;
  strength?: 'strong' | 'medium' | 'weak';
  isFeedback?: boolean;
  delay?: boolean;
}

export interface NetworkConfig {
  primitive: 'network';
  networkType: 'causal-loop' | 'stakeholder' | 'ecosystem' | 'porters-5-forces';
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  loops?: {
    id: string;
    type: 'reinforcing' | 'balancing';
    label: string;
    description?: string;
  }[];
  options?: {
    curvedLines?: boolean;
    animatedFlow?: boolean;
    showPolarityBadges?: boolean;
  };
}

// -------------------------------------------------------------
// UNIFIED CONTAINER TYPE
// -------------------------------------------------------------
export type FrameworkConfig =
  | MatrixConfig
  | FunnelConfig
  | FlowConfig
  | TreeConfig
  | MapConfig
  | BridgeConfig
  | TimeConfig
  | NetworkConfig;

export interface CompleteFramework {
  meta: FrameworkMeta;
  config: FrameworkConfig;
}
