export type AdminFeedActor = {
  name: string | null;
  email: string;
};

export type AdminFeedCompany = {
  name: string;
  normalizedDomain: string;
};

export type AdminFeedEvent = {
  id: string;
  kind: "REGISTERED" | "LOGIN" | "COMPANY_CREATED" | "COMPANY_VIEWED";
  detail: string | null;
  createdAt: Date;
  user: AdminFeedActor;
  company: AdminFeedCompany | null;
};

type RegistrationRecord = AdminFeedActor & {
  id: string;
  createdAt: Date;
};

type CompanyRecord = AdminFeedCompany & {
  id: string;
  createdAt: Date;
  user: AdminFeedActor;
};

export function buildAdminActivityFeed(args: {
  registrations: RegistrationRecord[];
  companies: CompanyRecord[];
  trackedEvents: AdminFeedEvent[];
  limit?: number;
}): AdminFeedEvent[] {
  const registrations: AdminFeedEvent[] = args.registrations.map((user) => ({
    id: `registered-${user.id}`,
    kind: "REGISTERED",
    detail: null,
    createdAt: user.createdAt,
    user: { name: user.name, email: user.email },
    company: null,
  }));

  const companies: AdminFeedEvent[] = args.companies.map((company) => ({
    id: `company-created-${company.id}`,
    kind: "COMPANY_CREATED",
    detail: null,
    createdAt: company.createdAt,
    user: company.user,
    company: { name: company.name, normalizedDomain: company.normalizedDomain },
  }));

  return [...registrations, ...companies, ...args.trackedEvents]
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
    .slice(0, args.limit ?? 80);
}
