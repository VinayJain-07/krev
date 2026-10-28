import { getInsights, searchEntities } from "./client";
import type { QlooEntity, QlooEntityType, QlooInsight } from "./types";

export type CulturalIntelligenceInput = {
  campaignGoal: string;
  audience: string;
  geography?: string;
  seedQueries: string[];
  categories: QlooEntityType[];
};

export type CulturalIntelligenceResult = {
  seeds: QlooEntity[];
  recommendations: Array<{ category: QlooEntityType; insights: QlooInsight[] }>;
  synthesisInputs: {
    campaignGoal: string;
    audience: string;
    geography?: string;
    evidenceCount: number;
    groundedBy: "qloo-taste-graph";
  };
};

export async function buildCulturalIntelligence(input: CulturalIntelligenceInput): Promise<CulturalIntelligenceResult> {
  const seeds: QlooEntity[] = [];
  for (const query of input.seedQueries.slice(0, 5)) {
    const matches = await searchEntities({ query, take: 4 });
    for (const match of matches) if (!seeds.some((seed) => seed.id === match.id)) seeds.push(match);
  }

  const recommendations: CulturalIntelligenceResult["recommendations"] = [];
  for (const category of input.categories.slice(0, 4)) {
    const result = await getInsights({
      filterType: category,
      entityIds: seeds.map((seed) => seed.id),
      audience: input.audience,
      location: input.geography,
      take: 8,
      explainability: true,
    });
    recommendations.push({ category, insights: result.insights });
  }

  return {
    seeds,
    recommendations,
    synthesisInputs: {
      campaignGoal: input.campaignGoal,
      audience: input.audience,
      geography: input.geography,
      evidenceCount: seeds.length + recommendations.reduce((count, recommendation) => count + recommendation.insights.length, 0),
      groundedBy: "qloo-taste-graph",
    },
  };
}
