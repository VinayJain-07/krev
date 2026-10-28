export type QlooEntityType =
  | "artist"
  | "movie"
  | "tv_show"
  | "brand"
  | "place"
  | "destination"
  | "book"
  | "podcast"
  | "videogame";

export type QlooEntity = {
  id: string;
  name: string;
  type?: string;
  subtype?: string;
  imageUrl?: string;
  disambiguation?: string;
  source: "qloo";
};
export type QlooInsight = {
  id?: string;
  name?: string;
  type?: string;
  affinity?: number | null;
  tags?: string[];
  imageUrl?: string;
  explainability?: unknown;
};

export type QlooInsightsResponse = {
  results?: Record<string, unknown>;
  query?: Record<string, unknown>;
  [key: string]: unknown;
};

