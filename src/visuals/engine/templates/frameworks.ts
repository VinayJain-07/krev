import { CompleteFramework } from '../types/schema';

export const FRAMEWORK_TEMPLATES: CompleteFramework[] = [
  // -------------------------------------------------------------
  // 1. SWOT Analysis (Matrix Primitive)
  // -------------------------------------------------------------
  {
    meta: {
      id: 'swot',
      name: 'SWOT Analysis',
      category: 'Strategy & Positioning',
      primitive: 'matrix',
      description:
        'Foundational strategic planning framework evaluating internal capabilities against external market dynamics.',
      strategicQuestion:
        'Where are we strong/weak internally, and what opportunities/threats exist externally?',
      tags: ['Strategy', 'Competitive', 'Core', 'Matrix'],
    },
    config: {
      primitive: 'matrix',
      gridType: '2x2',
      rows: 2,
      cols: 2,
      xAxis: {
        label: 'Perspective',
        lowLabel: 'Internal Focus',
        highLabel: 'External Environment',
      },
      yAxis: {
        label: 'Impact',
        lowLabel: 'Harmful / Deficits',
        highLabel: 'Helpful / Strengths',
      },
      quadrants: [
        {
          id: 'strengths',
          title: 'Strengths (Internal)',
          subtitle: 'Internal assets, moat & advantages',
          row: 0,
          col: 0,
          accent: '#10b981',
          description: 'Unique IP, proprietary algorithms, 120% NRR, top-tier engineering talent.',
        },
        {
          id: 'opportunities',
          title: 'Opportunities (External)',
          subtitle: 'Market trends & expansion avenues',
          row: 0,
          col: 1,
          accent: '#0ea5e9',
          description: 'EU expansion, enterprise upselling, vertical AI workflows.',
        },
        {
          id: 'weaknesses',
          title: 'Weaknesses (Internal)',
          subtitle: 'Operational gaps & resource constraints',
          row: 1,
          col: 0,
          accent: '#f59e0b',
          description: 'High CAC in mid-market, legacy UI components, reliance on key sales reps.',
        },
        {
          id: 'threats',
          title: 'Threats (External)',
          subtitle: 'Macro risks & competitive disruption',
          row: 1,
          col: 1,
          accent: '#f43f5e',
          description: 'Incumbents bundling free clones, regulatory data residency mandates.',
        },
      ],
      items: [
        {
          id: 's1',
          label: 'Proprietary Real-time Analytics Engine',
          description: 'Sub-10ms query speeds with 99.99% uptime SLA.',
          quadrantId: 'strengths',
          badge: 'Moat',
        },
        {
          id: 's2',
          label: 'Industry-leading 124% Net Revenue Retention',
          description: 'Deep customer lock-in via workflow automation.',
          quadrantId: 'strengths',
          badge: '124% NRR',
        },
        {
          id: 'o1',
          label: 'Generative AI Workflow Integration',
          description: 'Opportunity to automate 65% of repetitive client reporting.',
          quadrantId: 'opportunities',
          badge: 'Growth Lever',
        },
        {
          id: 'o2',
          label: 'European FinTech Regulatory Expansion',
          description: 'First-mover compliance advantage under DORA requirements.',
          quadrantId: 'opportunities',
          badge: '$40M TAM',
        },
        {
          id: 'w1',
          label: 'Elevated Mid-Market Sales Cycle (95 days)',
          description: 'Complex procurement and lack of self-serve sandbox.',
          quadrantId: 'weaknesses',
          badge: 'High CAC',
        },
        {
          id: 'w2',
          label: 'Limited Mobile Optimization',
          description: 'Executive dashboards lack native iOS/Android client apps.',
          quadrantId: 'weaknesses',
          badge: 'Tech Debt',
        },
        {
          id: 't1',
          label: 'Aggressive Bundling by Cloud Megavendors',
          description: 'Free tier subsidized by compute cloud credits.',
          quadrantId: 'threats',
          badge: 'Price Pressure',
        },
        {
          id: 't2',
          label: 'Stringent Data Sovereignty Directives',
          description: 'Requires multi-region sovereign cluster deployments.',
          quadrantId: 'threats',
          badge: 'Compliance',
        },
      ],
    },
  },

  // -------------------------------------------------------------
  // 2. Business Model Canvas (Matrix Primitive - 9 Blocks)
  // -------------------------------------------------------------
  {
    meta: {
      id: 'business-model-canvas',
      name: 'Business Model Canvas',
      category: 'Strategy & Positioning',
      primitive: 'matrix',
      description:
        'Strategic management template for developing new and documenting existing business models across 9 foundational pillars.',
      strategicQuestion:
        'How does the business create, deliver, and capture economic value?',
      tags: ['Strategy', 'Canvas', '9-Block', 'Business Model'],
    },
    config: {
      primitive: 'matrix',
      gridType: 'custom-grid',
      rows: 3,
      cols: 3,
      quadrants: [
        {
          id: 'key-partners',
          title: 'Key Partners',
          subtitle: 'Strategic alliances & suppliers',
          row: 0,
          col: 0,
          accent: '#8b5cf6',
        },
        {
          id: 'key-activities',
          title: 'Key Activities',
          subtitle: 'Core operational capabilities',
          row: 0,
          col: 1,
          accent: '#3b82f6',
        },
        {
          id: 'value-props',
          title: 'Value Propositions',
          subtitle: 'Differentiated client benefits',
          row: 0,
          col: 2,
          accent: '#14b8a6',
        },
        {
          id: 'customer-relationships',
          title: 'Customer Relationships',
          subtitle: 'Engagement & retention model',
          row: 1,
          col: 0,
          accent: '#ec4899',
        },
        {
          id: 'channels',
          title: 'Channels',
          subtitle: 'Go-to-market touchpoints',
          row: 1,
          col: 1,
          accent: '#f59e0b',
        },
        {
          id: 'customer-segments',
          title: 'Customer Segments',
          subtitle: 'Target ICP profiles',
          row: 1,
          col: 2,
          accent: '#10b981',
        },
        {
          id: 'cost-structure',
          title: 'Cost Structure',
          subtitle: 'Major operational cost drivers',
          row: 2,
          col: 0,
          accent: '#f43f5e',
        },
        {
          id: 'revenue-streams',
          title: 'Revenue Streams',
          subtitle: 'Monetization & contract models',
          row: 2,
          col: 1,
          accent: '#06b6d4',
        },
      ],
      items: [
        {
          id: 'bmc1',
          label: 'Cloud Infrastructure & API Providers',
          description: 'AWS, Azure, OpenAI Enterprise API access.',
          quadrantId: 'key-partners',
          badge: 'Hosting & AI',
        },
        {
          id: 'bmc2',
          label: 'Continuous Core Engine Optimization',
          description: 'Zero-downtime microservice architecture and data pipelines.',
          quadrantId: 'key-activities',
          badge: 'Engineering',
        },
        {
          id: 'bmc3',
          label: '10x Faster Executive Strategy Synthesis',
          description: 'Automated strategic frameworks with live BI synchronization.',
          quadrantId: 'value-props',
          badge: 'Core Value',
        },
        {
          id: 'bmc4',
          label: 'Dedicated Strategic Customer Success',
          description: 'White-glove onboarding for Fortune 500 accounts.',
          quadrantId: 'customer-relationships',
          badge: 'High-Touch',
        },
        {
          id: 'bmc5',
          label: 'Product-Led Growth + Enterprise Direct',
          description: 'Interactive sandbox funnels converting into enterprise MSAs.',
          quadrantId: 'channels',
          badge: 'PLG + Sales',
        },
        {
          id: 'bmc6',
          label: 'Management Consultants & Corporate Strategists',
          description: 'Tier-1 consulting firms, CFO offices, and SaaS founders.',
          quadrantId: 'customer-segments',
          badge: 'Primary ICP',
        },
        {
          id: 'bmc7',
          label: 'Compute, GPU Inference & Talent Payroll',
          description: 'R&D talent accounts for 58% of operating expenses.',
          quadrantId: 'cost-structure',
          badge: 'COGS & Opex',
        },
        {
          id: 'bmc8',
          label: 'Annual Enterprise SaaS Subscriptions + Usage',
          description: 'Tiered per-seat licensing plus compute consumption tiers.',
          quadrantId: 'revenue-streams',
          badge: 'ARR & Usage',
        },
      ],
    },
  },

  // -------------------------------------------------------------
  // 3. Porter's Five Forces (Network / Map Primitive)
  // -------------------------------------------------------------
  {
    meta: {
      id: 'porters-five-forces',
      name: "Porter's Five Forces",
      category: 'Market & Growth',
      primitive: 'network',
      description:
        'Industry structure model analyzing competitive dynamics and profit potential across 5 core competitive forces.',
      strategicQuestion: 'How attractive, profitable, and defensible is this industry?',
      tags: ['Industry', 'Competition', 'Economics', 'Porter'],
    },
    config: {
      primitive: 'network',
      networkType: 'porters-5-forces',
      nodes: [
        {
          id: 'rivalry',
          label: 'Competitive Rivalry: High',
          type: 'outcome',
          color: '#14b8a6',
        },
        {
          id: 'new-entrants',
          label: 'New Entrants: Medium Threat',
          type: 'driver',
          color: '#38bdf8',
        },
        {
          id: 'substitutes',
          label: 'Substitutes: Moderate Threat',
          type: 'driver',
          color: '#f43f5e',
        },
        {
          id: 'supplier-power',
          label: 'Supplier Power: Low-Medium',
          type: 'driver',
          color: '#818cf8',
        },
        {
          id: 'buyer-power',
          label: 'Buyer Bargaining Power: High',
          type: 'driver',
          color: '#34d399',
        },
      ],
      edges: [
        { id: 'e1', source: 'new-entrants', target: 'rivalry', polarity: '+' },
        { id: 'e2', source: 'substitutes', target: 'rivalry', polarity: '+' },
        { id: 'e3', source: 'supplier-power', target: 'rivalry', polarity: '+' },
        { id: 'e4', source: 'buyer-power', target: 'rivalry', polarity: '+' },
      ],
    },
  },

  // -------------------------------------------------------------
  // 4. PESTEL Analysis (Matrix Primitive - 6 Factors)
  // -------------------------------------------------------------
  {
    meta: {
      id: 'pestel',
      name: 'PESTEL Analysis',
      category: 'Market & Growth',
      primitive: 'matrix',
      description:
        'Macro-environmental scanning tool evaluating Political, Economic, Social, Technological, Environmental, and Legal forces.',
      strategicQuestion: 'What external macro forces will shape our strategic operating environment?',
      tags: ['Macro', 'Environment', 'PESTEL', 'Strategy'],
    },
    config: {
      primitive: 'matrix',
      gridType: 'custom-grid',
      rows: 2,
      cols: 3,
      quadrants: [
        {
          id: 'political',
          title: 'Political',
          subtitle: 'Policy & cross-border regulations',
          row: 0,
          col: 0,
          accent: '#3b82f6',
        },
        {
          id: 'economic',
          title: 'Economic',
          subtitle: 'Interest rates & corporate spending',
          row: 0,
          col: 1,
          accent: '#10b981',
        },
        {
          id: 'social',
          title: 'Social',
          subtitle: 'Remote work & demographics',
          row: 0,
          col: 2,
          accent: '#ec4899',
        },
        {
          id: 'technological',
          title: 'Technological',
          subtitle: 'AI breakthroughs & cloud shifts',
          row: 1,
          col: 0,
          accent: '#8b5cf6',
        },
        {
          id: 'environmental',
          title: 'Environmental',
          subtitle: 'ESG mandates & carbon footprint',
          row: 1,
          col: 1,
          accent: '#14b8a6',
        },
        {
          id: 'legal',
          title: 'Legal',
          subtitle: 'Data privacy & IP copyright',
          row: 1,
          col: 2,
          accent: '#f59e0b',
        },
      ],
      items: [
        {
          id: 'p1',
          label: 'Data Sovereignty Legislation',
          description: 'Strict requirements to process enterprise data within sovereign borders.',
          quadrantId: 'political',
          badge: 'Regulation',
        },
        {
          id: 'ec1',
          label: 'Tightening IT Budgets & Scrutiny',
          description: 'CFOs mandate clear 12-month ROI for software renewals.',
          quadrantId: 'economic',
          badge: 'ROI Focus',
        },
        {
          id: 's1',
          label: 'Hybrid & Distributed Workforce',
          description: 'Asynchronous collaboration replaces monolithic in-person meetings.',
          quadrantId: 'social',
          badge: 'Behavior',
        },
        {
          id: 't1',
          label: 'Foundation Model Commoditization',
          description: 'Rapid drop in LLM token pricing enables aggressive agentic features.',
          quadrantId: 'technological',
          badge: 'Tech Shift',
        },
        {
          id: 'en1',
          label: 'Cloud Datacenter Carbon Reporting',
          description: 'Enterprises require net-zero software vendor disclosures.',
          quadrantId: 'environmental',
          badge: 'ESG',
        },
        {
          id: 'l1',
          label: 'EU AI Act & Compliance Directives',
          description: 'Transparent audit logs required for algorithmic decision pipelines.',
          quadrantId: 'legal',
          badge: 'Audit Ready',
        },
      ],
    },
  },

  // -------------------------------------------------------------
  // 5. Ansoff Matrix (Matrix Primitive)
  // -------------------------------------------------------------
  {
    meta: {
      id: 'ansoff',
      name: 'Ansoff Growth Matrix',
      category: 'Market & Growth',
      primitive: 'matrix',
      description:
        'Growth strategy matrix mapping Market Penetration, Market Development, Product Development, and Diversification.',
      strategicQuestion: 'Which growth vector offers the optimal balance of risk and market upside?',
      tags: ['Growth', 'Expansion', 'Product', 'Matrix'],
    },
    config: {
      primitive: 'matrix',
      gridType: '2x2',
      rows: 2,
      cols: 2,
      xAxis: {
        label: 'Markets',
        lowLabel: 'Existing Markets',
        highLabel: 'New Markets',
      },
      yAxis: {
        label: 'Products',
        lowLabel: 'New Products',
        highLabel: 'Existing Products',
      },
      quadrants: [
        {
          id: 'market-penetration',
          title: 'Market Penetration',
          subtitle: 'Existing Products / Existing Markets',
          row: 0,
          col: 0,
          accent: '#10b981',
          description: 'Increase market share within current customer base (Lowest risk).',
        },
        {
          id: 'market-development',
          title: 'Market Development',
          subtitle: 'Existing Products / New Markets',
          row: 0,
          col: 1,
          accent: '#3b82f6',
          description: 'Expand into international regions and untapped buyer personas.',
        },
        {
          id: 'product-development',
          title: 'Product Development',
          subtitle: 'New Products / Existing Markets',
          row: 1,
          col: 0,
          accent: '#8b5cf6',
          description: 'Launch add-on modules and agentic tools to current user base.',
        },
        {
          id: 'diversification',
          title: 'Diversification',
          subtitle: 'New Products / New Markets',
          row: 1,
          col: 1,
          accent: '#f43f5e',
          description: 'Enter entirely new business verticals (Highest risk & reward).',
        },
      ],
      items: [
        {
          id: 'a1',
          label: 'Upsell Enterprise Seats to Fortune 500 Subdivisions',
          description: 'Expand from marketing teams to corporate strategy units.',
          quadrantId: 'market-penetration',
          badge: '+30% ARR',
        },
        {
          id: 'a2',
          label: 'Launch APAC Sales Operations',
          description: 'Localize currency, language, and regional data centers in Tokyo & Sydney.',
          quadrantId: 'market-development',
          badge: 'Geo Expansion',
        },
        {
          id: 'a3',
          label: 'Develop Real-Time Scenario Simulation Engine',
          description: 'Interactive Monte Carlo simulation tool for CFOs.',
          quadrantId: 'product-development',
          badge: 'New Module',
        },
        {
          id: 'a4',
          label: 'B2C Executive Coaching & Career App',
          description: 'Consumer mobile app leveraging organizational leadership graph.',
          quadrantId: 'diversification',
          badge: 'High Risk/Return',
        },
      ],
    },
  },

  // -------------------------------------------------------------
  // 6. BCG Growth-Share Matrix (Matrix Primitive)
  // -------------------------------------------------------------
  {
    meta: {
      id: 'bcg-matrix',
      name: 'BCG Growth-Share Matrix',
      category: 'Product & Prioritization',
      primitive: 'matrix',
      description:
        'Portfolio management framework categorizing business units as Stars, Cash Cows, Question Marks, or Dogs.',
      strategicQuestion: 'Where should capital and engineering resources be allocated across the product portfolio?',
      tags: ['Portfolio', 'BCG', 'Investment', 'Matrix'],
    },
    config: {
      primitive: 'matrix',
      gridType: '2x2',
      rows: 2,
      cols: 2,
      xAxis: {
        label: 'Relative Market Share',
        lowLabel: 'Low Share',
        highLabel: 'High Share',
      },
      yAxis: {
        label: 'Market Growth Rate',
        lowLabel: 'Low Growth',
        highLabel: 'High Growth',
      },
      quadrants: [
        {
          id: 'stars',
          title: 'Stars ⭐',
          subtitle: 'High Growth / High Share',
          row: 0,
          col: 1,
          accent: '#14b8a6',
          description: 'Heavy investment to maintain dominance & leadership.',
        },
        {
          id: 'question-marks',
          title: 'Question Marks ❓',
          subtitle: 'High Growth / Low Share',
          row: 0,
          col: 0,
          accent: '#f59e0b',
          description: 'High potential bets; invest selectively or divest.',
        },
        {
          id: 'cash-cows',
          title: 'Cash Cows 🐄',
          subtitle: 'Low Growth / High Share',
          row: 1,
          col: 1,
          accent: '#3b82f6',
          description: 'Generate high cash flow; harvest profits to fund Stars.',
        },
        {
          id: 'dogs',
          title: 'Dogs 🐕',
          subtitle: 'Low Growth / Low Share',
          row: 1,
          col: 0,
          accent: '#f43f5e',
          description: 'Liquidate, sunset, or repurpose remaining assets.',
        },
      ],
      items: [
        {
          id: 'bcg1',
          label: 'AI Strategy Studio SaaS',
          description: '140% YoY ARR growth with 42% market category share.',
          quadrantId: 'stars',
          badge: 'Double Down',
        },
        {
          id: 'bcg2',
          label: 'Legacy PDF Report Generator',
          description: 'Stable $12M cash flow with minimal maintenance overhead.',
          quadrantId: 'cash-cows',
          badge: 'Harvest Cash',
        },
        {
          id: 'bcg3',
          label: 'Autonomous Market Research Agent',
          description: 'Explosive industry interest but strong nascent competition.',
          quadrantId: 'question-marks',
          badge: 'Pivot or Fund',
        },
        {
          id: 'bcg4',
          label: 'On-Premise Desktop Viewer v1',
          description: 'Declining user base and high technical support burden.',
          quadrantId: 'dogs',
          badge: 'Sunset Plan',
        },
      ],
    },
  },

  // -------------------------------------------------------------
  // 7. TAM / SAM / SOM Market Sizing (Map Primitive - Concentric Rings)
  // -------------------------------------------------------------
  {
    meta: {
      id: 'tam-sam-som',
      name: 'TAM / SAM / SOM Market Sizing',
      category: 'Market & Growth',
      primitive: 'map',
      description:
        'Concentric market potential framework defining Total Addressable, Serviceable Addressable, and Serviceable Obtainable markets.',
      strategicQuestion: 'What is the realistic capture capacity and revenue ceiling for this business?',
      tags: ['Market Size', 'TAM', 'Investor', 'Economics'],
    },
    config: {
      primitive: 'map',
      mapType: 'concentric-rings',
      rings: [
        {
          id: 'tam',
          label: 'TAM: Total Addressable Market',
          subLabel: 'Global Enterprise Strategy & Analytics Software',
          value: '$48.5 Billion',
          description:
            'Total theoretical demand worldwide for strategic intelligence and SaaS analytics platforms across all enterprise sectors.',
          color: '#3b82f6',
          percentageOfTAM: 100,
        },
        {
          id: 'sam',
          label: 'SAM: Serviceable Addressable Market',
          subLabel: 'Mid-Market & Enterprise B2B SaaS & Tech Cos',
          value: '$8.2 Billion',
          description:
            'Segment fitting current product capabilities, integrations, language localization, and security certifications.',
          color: '#14b8a6',
          percentageOfTAM: 16.9,
        },
        {
          id: 'som',
          label: 'SOM: Serviceable Obtainable Market',
          subLabel: '3-Year Target Reachable via Direct & PLG',
          value: '$750 Million',
          description:
            'Realistic target captured within 36 months based on current sales velocity, marketing budget, and channel partners.',
          color: '#10b981',
          percentageOfTAM: 1.5,
        },
      ],
    },
  },

  // -------------------------------------------------------------
  // 8. Customer Journey Map (Flow Primitive)
  // -------------------------------------------------------------
  {
    meta: {
      id: 'customer-journey',
      name: 'Customer Journey Map',
      category: 'Customer & Marketing',
      primitive: 'flow',
      description:
        'End-to-end multi-phase timeline tracking customer actions, sentiment, touchpoints, and friction points from Discovery to Advocacy.',
      strategicQuestion: 'Where are customers experiencing friction, delight, or drop-off across their lifecycle?',
      tags: ['Journey', 'Customer Experience', 'Sentiment', 'Flow'],
    },
    config: {
      primitive: 'flow',
      phases: [
        { id: 'p1', name: '1. Discovery & Search', color: '#3b82f6' },
        { id: 'p2', name: '2. Evaluation & Demo', color: '#8b5cf6' },
        { id: 'p3', name: '3. Onboarding & Setup', color: '#f59e0b' },
        { id: 'p4', name: '4. Habitual Value Use', color: '#10b981' },
        { id: 'p5', name: '5. Expansion & Advocacy', color: '#14b8a6' },
      ],
      lanes: [
        { id: 'customerAction', label: 'Customer Action', field: 'customerAction' },
        { id: 'touchpoints', label: 'Touchpoints', field: 'touchpoints' },
        { id: 'painPoints', label: 'Pain Points', field: 'painPoints' },
        { id: 'opportunities', label: 'Opportunities', field: 'opportunities' },
      ],
      steps: [
        {
          id: 's1',
          title: 'Problem Awareness',
          phaseId: 'p1',
          sentiment: 0,
          customerAction: 'Searches for modern strategy canvas tools after frustrating PowerPoint workflow.',
          touchpoints: ['Google Search', 'LinkedIn Thought Leadership', 'Substack'],
          painPoints: ['Overwhelmed by static template sites'],
          opportunities: ['Interactive interactive preview widget'],
        },
        {
          id: 's2',
          title: 'Interactive Sandbox Trial',
          phaseId: 'p2',
          sentiment: 4,
          customerAction: 'Tests live editable BCG & SWOT canvases without mandatory credit card.',
          touchpoints: ['Web App Sandbox', 'Product Tour', 'Documentation'],
          painPoints: ['Wants instant CSV export'],
          opportunities: ['One-click AI pre-fill from company URL'],
        },
        {
          id: 's3',
          title: 'Team SSO & Workspace Setup',
          phaseId: 'p3',
          sentiment: -2,
          customerAction: 'Invites 5 department leaders and links Okta SAML credentials.',
          touchpoints: ['Admin Console', 'Security Review Docs'],
          painPoints: ['Manual role permission assignment takes too long'],
          opportunities: ['Automated department provisioning wizard'],
        },
        {
          id: 's4',
          title: 'Quarterly Strategic Review',
          phaseId: 'p4',
          sentiment: 5,
          customerAction: 'Presents live executive dashboard directly to Board of Directors.',
          touchpoints: ['Presentation Mode', 'Live Shared URL'],
          painPoints: ['Needs PDF backup snapshot'],
          opportunities: ['Real-time collaborative voting & commenting'],
        },
        {
          id: 's5',
          title: 'Enterprise Multi-Dept Rollout',
          phaseId: 'p5',
          sentiment: 5,
          customerAction: 'Recommends platform to VP of Product & Operations for enterprise MSA.',
          touchpoints: ['Customer Referral', 'Enterprise Sales Exec'],
          painPoints: ['Procurement contract redlines'],
          opportunities: ['Automated ROI impact report for procurement'],
        },
      ],
    },
  },

  // -------------------------------------------------------------
  // 9. SaaS Marketing & Sales Funnel (Funnel Primitive)
  // -------------------------------------------------------------
  {
    meta: {
      id: 'saas-marketing-funnel',
      name: 'SaaS Marketing & Sales Funnel',
      category: 'Customer & Marketing',
      primitive: 'funnel',
      description:
        'Multi-stage conversion funnel tracking user progression from Top-of-Funnel awareness down to Retained Champions.',
      strategicQuestion: 'Where are high-intent leads dropping off, and how can we optimize pipeline conversion?',
      tags: ['Funnel', 'Conversion', 'SaaS', 'Sales Pipeline'],
    },
    config: {
      primitive: 'funnel',
      unit: 'prospects',
      stages: [
        {
          id: 'stg-1',
          name: '1. Website Visitors & Content Readers',
          value: 125000,
          formattedValue: '125,000 Visitors',
          conversionRate: 100,
          velocityDays: 1,
          color: '#38bdf8',
          keyActions: ['Organic Search', 'Social Tech Articles', 'Podcast Ads'],
        },
        {
          id: 'stg-2',
          name: '2. Free Sandbox / Trial Signups',
          value: 12500,
          formattedValue: '12,500 Signups (10%)',
          conversionRate: 10,
          velocityDays: 3,
          color: '#818cf8',
          keyActions: ['Sandbox Created', 'Template Selected', 'Verified Email'],
        },
        {
          id: 'stg-3',
          name: '3. Product Qualified Leads (PQLs)',
          value: 3750,
          formattedValue: '3,750 PQLs (30%)',
          conversionRate: 30,
          velocityDays: 7,
          color: '#a78bfa',
          keyActions: ['Invited 2+ Peers', '3+ Canvases Created', 'Exported JSON'],
        },
        {
          id: 'stg-4',
          name: '4. Sales Qualified Opportunities (SQLs)',
          value: 1125,
          formattedValue: '1,125 Deals ($4.5M Pipeline)',
          conversionRate: 30,
          velocityDays: 14,
          color: '#34d399',
          keyActions: ['Security Review Completed', 'Executive Demo', 'Pricing Selected'],
        },
        {
          id: 'stg-5',
          name: '5. Closed-Won Customers',
          value: 395,
          formattedValue: '395 Customers ($1.58M ARR)',
          conversionRate: 35.1,
          velocityDays: 28,
          color: '#10b981',
          keyActions: ['Signed Annual MSA', 'Onboarding Call', 'Production Rollout'],
        },
      ],
    },
  },

  // -------------------------------------------------------------
  // 10. Impact vs. Effort Prioritization Matrix (Matrix Primitive)
  // -------------------------------------------------------------
  {
    meta: {
      id: 'impact-effort',
      name: 'Impact vs. Effort Matrix',
      category: 'Product & Prioritization',
      primitive: 'matrix',
      description:
        'Decision-making 2x2 plotting initiatives by expected business impact versus required engineering/operational effort.',
      strategicQuestion: 'Which high-leverage initiatives should we build first to maximize return on effort?',
      tags: ['Prioritization', 'Product', 'Quick Wins', 'Matrix'],
    },
    config: {
      primitive: 'matrix',
      gridType: '2x2',
      rows: 2,
      cols: 2,
      xAxis: {
        label: 'Effort & Complexity',
        lowLabel: 'Low Effort',
        highLabel: 'High Effort',
      },
      yAxis: {
        label: 'Business Impact',
        lowLabel: 'Low Impact',
        highLabel: 'High Impact',
      },
      quadrants: [
        {
          id: 'quick-wins',
          title: 'Quick Wins 🚀',
          subtitle: 'High Impact / Low Effort',
          row: 0,
          col: 0,
          accent: '#10b981',
          description: 'Execute immediately to capture fast momentum and high ROI.',
        },
        {
          id: 'major-bets',
          title: 'Strategic Bets 🎯',
          subtitle: 'High Impact / High Effort',
          row: 0,
          col: 1,
          accent: '#3b82f6',
          description: 'Plan carefully; core competitive differentiators.',
        },
        {
          id: 'fill-ins',
          title: 'Fill-Ins / Minor 🛠️',
          subtitle: 'Low Impact / Low Effort',
          row: 1,
          col: 0,
          accent: '#f59e0b',
          description: 'Implement during low-capacity sprint cycles.',
        },
        {
          id: 'time-sinks',
          title: 'Time Sinks / Don’t Do ⛔',
          subtitle: 'Low Impact / High Effort',
          row: 1,
          col: 1,
          accent: '#f43f5e',
          description: 'Deprioritize, eliminate, or reject from the roadmap.',
        },
      ],
      items: [
        {
          id: 'ie1',
          label: 'One-Click JSON Framework Export',
          description: 'High customer request frequency, minimal backend complexity.',
          quadrantId: 'quick-wins',
          badge: '1 Sprint',
        },
        {
          id: 'ie2',
          label: 'Autonomous AI Multi-Agent Scenario Synthesizer',
          description: 'Dramatically separates product from legacy visual canvas competitors.',
          quadrantId: 'major-bets',
          badge: 'Q3 Core Bet',
        },
        {
          id: 'ie3',
          label: 'Custom Theme Dark Mode Accent Colors',
          description: 'Nice-to-have visual polish for power users.',
          quadrantId: 'fill-ins',
          badge: 'Minor',
        },
        {
          id: 'ie4',
          label: 'Legacy On-Premise Oracle DB Connector',
          description: 'Very high custom maintenance burden with low market appetite.',
          quadrantId: 'time-sinks',
          badge: 'Reject',
        },
      ],
    },
  },

  // -------------------------------------------------------------
  // 11. Porter's Value Chain (Flow Primitive)
  // -------------------------------------------------------------
  {
    meta: {
      id: 'value-chain',
      name: "Porter's Value Chain",
      category: 'Operations & Value Chain',
      primitive: 'flow',
      description:
        'Sequential framework mapping primary and support activities that transform raw inputs into high-margin customer value.',
      strategicQuestion: 'Where is value created and where do cost inefficiencies exist across operations?',
      tags: ['Value Chain', 'Operations', 'Efficiency', 'Flow'],
    },
    config: {
      primitive: 'flow',
      phases: [
        { id: 'inbound', name: '1. Inbound Logistics / Data Feeds', color: '#3b82f6' },
        { id: 'operations', name: '2. Operations & Transformation', color: '#8b5cf6' },
        { id: 'outbound', name: '3. Outbound Delivery / APIs', color: '#14b8a6' },
        { id: 'marketing', name: '4. Marketing & Commercial Sales', color: '#f59e0b' },
        { id: 'service', name: '5. Customer Service & Success', color: '#10b981' },
      ],
      lanes: [
        { id: 'customerAction', label: 'Primary Activity', field: 'customerAction' },
        { id: 'touchpoints', label: 'Infrastructure & Tooling', field: 'touchpoints' },
        { id: 'opportunities', label: 'Margin Expansion Lever', field: 'opportunities' },
      ],
      steps: [
        {
          id: 'vc1',
          title: 'Data Ingestion & Normalization',
          phaseId: 'inbound',
          customerAction: 'Automated extraction of financial reports, CRM tables, and ERP feeds.',
          touchpoints: ['Kafka Streams', 'Snowflake Connectors', 'S3 Lakes'],
          opportunities: ['Pre-built ERP webhook integrations'],
        },
        {
          id: 'vc2',
          title: 'Algorithmic Synthesis & Graph Engine',
          phaseId: 'operations',
          customerAction: 'Transforms raw relational data into visual 8-primitive framework schemas.',
          touchpoints: ['Distributed Rust Worker Pool', 'Graph DB'],
          opportunities: ['GPU cache vector acceleration'],
        },
        {
          id: 'vc3',
          title: 'Low-Latency Global CDN Rendering',
          phaseId: 'outbound',
          customerAction: 'Delivers high-fidelity interactive canvas widgets to edge nodes worldwide.',
          touchpoints: ['Cloudflare Workers', 'GraphQL Gateway'],
          opportunities: ['Sub-50ms edge caching'],
        },
        {
          id: 'vc4',
          title: 'Product-Led Sandbox Inbound',
          phaseId: 'marketing',
          customerAction: 'Generates organic virality via shareable strategic canvas templates.',
          touchpoints: ['Product Marketing', 'SEO Gallery', 'Community Hub'],
          opportunities: ['User template creator marketplace'],
        },
        {
          id: 'vc5',
          title: 'Proactive Churn Intervention',
          phaseId: 'service',
          customerAction: 'Monitors product adoption health and triggers proactive CS executive reviews.',
          touchpoints: ['Gainsight Telemetry', 'Slack Connect Channels'],
          opportunities: ['Automated quarterly executive value summaries'],
        },
      ],
    },
  },

  // -------------------------------------------------------------
  // 12. Competitive Positioning / Perceptual Map (Map Primitive)
  // -------------------------------------------------------------
  {
    meta: {
      id: 'competitive-positioning',
      name: 'Competitive Positioning Map',
      category: 'Strategy & Positioning',
      primitive: 'map',
      description:
        'Continuous 2-axis perceptual landscape plotting competitors by Product Sophistication vs. Time-to-Value.',
      strategicQuestion: 'Where is the white space in our competitive landscape, and how do we differentiate?',
      tags: ['Competitive', 'Positioning', 'Perceptual Map', 'Landscape'],
    },
    config: {
      primitive: 'map',
      mapType: 'perceptual-scatter',
      xAxis: {
        label: 'Time-to-Value & Usability',
        minLabel: 'Complex Setup / Slow',
        maxLabel: 'Instant / Product-Led',
      },
      yAxis: {
        label: 'Analytical Depth & AI Power',
        minLabel: 'Static / Shallow Templates',
        maxLabel: 'Deep Multi-Primitive Engine',
      },
      entities: [
        {
          id: 'self',
          name: 'Our Platform',
          x: 85,
          y: 88,
          size: 28,
          isSelf: true,
          color: '#14b8a6',
          notes: 'High Depth + Instant Time-to-Value (Ideal Quadrant)',
        },
        {
          id: 'incumbent-a',
          name: 'Legacy BI Suite',
          x: 25,
          y: 80,
          size: 34,
          color: '#64748b',
          notes: 'Deep analysis but requires 6-month enterprise implementation.',
        },
        {
          id: 'incumbent-b',
          name: 'Generic Visual Canvas',
          x: 82,
          y: 28,
          size: 32,
          color: '#f59e0b',
          notes: 'Easy to use whiteboard, but zero underlying data schemas or math.',
        },
        {
          id: 'incumbent-c',
          name: 'Slide Template Mills',
          x: 40,
          y: 18,
          size: 20,
          color: '#ef4444',
          notes: 'Static PowerPoint decks with no live collaboration.',
        },
      ],
    },
  },

  // -------------------------------------------------------------
  // 13. RACI Responsibility Matrix (Matrix Primitive - Table)
  // -------------------------------------------------------------
  {
    meta: {
      id: 'raci-matrix',
      name: 'RACI Responsibility Matrix',
      category: 'Organization & Governance',
      primitive: 'matrix',
      description:
        'Organizational governance grid mapping roles to tasks as Responsible, Accountable, Consulted, or Informed.',
      strategicQuestion: 'Who owns accountability, execution, and review for each major corporate initiative?',
      tags: ['RACI', 'Organization', 'Governance', 'Execution'],
    },
    config: {
      primitive: 'matrix',
      gridType: 'table-matrix',
      rows: 5,
      cols: 5,
      rowHeaders: [
        'Corporate Strategy Formulation',
        'Enterprise Product Roadmap',
        'Sales Pipeline Execution',
        'Security & Compliance Audit',
        'Customer Onboarding & Renewal',
      ],
      colHeaders: ['CEO', 'Chief Product Officer', 'VP of Sales', 'Chief Architect', 'VP Customer Success'],
      quadrants: [],
      items: [
        { id: 'r1', label: 'A', badge: 'A', customFields: { row: 'Corporate Strategy Formulation', col: 'CEO' } },
        { id: 'r2', label: 'C', badge: 'C', customFields: { row: 'Corporate Strategy Formulation', col: 'Chief Product Officer' } },
        { id: 'r3', label: 'C', badge: 'C', customFields: { row: 'Corporate Strategy Formulation', col: 'VP of Sales' } },
        { id: 'r4', label: 'C', badge: 'C', customFields: { row: 'Corporate Strategy Formulation', col: 'Chief Architect' } },
        { id: 'r5', label: 'I', badge: 'I', customFields: { row: 'Corporate Strategy Formulation', col: 'VP Customer Success' } },

        { id: 'r6', label: 'I', badge: 'I', customFields: { row: 'Enterprise Product Roadmap', col: 'CEO' } },
        { id: 'r7', label: 'A', badge: 'A', customFields: { row: 'Enterprise Product Roadmap', col: 'Chief Product Officer' } },
        { id: 'r8', label: 'C', badge: 'C', customFields: { row: 'Enterprise Product Roadmap', col: 'VP of Sales' } },
        { id: 'r9', label: 'R', badge: 'R', customFields: { row: 'Enterprise Product Roadmap', col: 'Chief Architect' } },
        { id: 'r10', label: 'C', badge: 'C', customFields: { row: 'Enterprise Product Roadmap', col: 'VP Customer Success' } },

        { id: 'r11', label: 'I', badge: 'I', customFields: { row: 'Sales Pipeline Execution', col: 'CEO' } },
        { id: 'r12', label: 'C', badge: 'C', customFields: { row: 'Sales Pipeline Execution', col: 'Chief Product Officer' } },
        { id: 'r13', label: 'A', badge: 'A', customFields: { row: 'Sales Pipeline Execution', col: 'VP of Sales' } },
        { id: 'r14', label: 'I', badge: 'I', customFields: { row: 'Sales Pipeline Execution', col: 'Chief Architect' } },
        { id: 'r15', label: 'C', badge: 'C', customFields: { row: 'Sales Pipeline Execution', col: 'VP Customer Success' } },

        { id: 'r16', label: 'I', badge: 'I', customFields: { row: 'Security & Compliance Audit', col: 'CEO' } },
        { id: 'r17', label: 'C', badge: 'C', customFields: { row: 'Security & Compliance Audit', col: 'Chief Product Officer' } },
        { id: 'r18', label: 'I', badge: 'I', customFields: { row: 'Security & Compliance Audit', col: 'VP of Sales' } },
        { id: 'r19', label: 'A', badge: 'A', customFields: { row: 'Security & Compliance Audit', col: 'Chief Architect' } },
        { id: 'r20', label: 'I', badge: 'I', customFields: { row: 'Security & Compliance Audit', col: 'VP Customer Success' } },

        { id: 'r21', label: 'I', badge: 'I', customFields: { row: 'Customer Onboarding & Renewal', col: 'CEO' } },
        { id: 'r22', label: 'C', badge: 'C', customFields: { row: 'Customer Onboarding & Renewal', col: 'Chief Product Officer' } },
        { id: 'r23', label: 'C', badge: 'C', customFields: { row: 'Customer Onboarding & Renewal', col: 'VP of Sales' } },
        { id: 'r24', label: 'I', badge: 'I', customFields: { row: 'Customer Onboarding & Renewal', col: 'Chief Architect' } },
        { id: 'r25', label: 'A', badge: 'A', customFields: { row: 'Customer Onboarding & Renewal', col: 'VP Customer Success' } },
      ],
    },
  },

  // -------------------------------------------------------------
  // 14. Risk Heatmap (Matrix Primitive)
  // -------------------------------------------------------------
  {
    meta: {
      id: 'risk-heatmap',
      name: 'Risk Probability × Impact Heatmap',
      category: 'Risk & Decision-Making',
      primitive: 'matrix',
      description:
        'Risk assessment matrix plotting business risks across Probability of Occurrence versus Severity of Impact.',
      strategicQuestion: 'Which high-severity risks threaten enterprise continuity and require active mitigation?',
      tags: ['Risk', 'Heatmap', 'Governance', 'Security'],
    },
    config: {
      primitive: 'matrix',
      gridType: '3x3',
      rows: 3,
      cols: 3,
      xAxis: {
        label: 'Severity of Impact',
        lowLabel: 'Minor Impact',
        highLabel: 'Catastrophic Impact',
      },
      yAxis: {
        label: 'Probability of Occurrence',
        lowLabel: 'Low Likelihood',
        highLabel: 'High Likelihood',
      },
      quadrants: [
        {
          id: 'critical-risk',
          title: 'Critical Risk Zone 🚨',
          subtitle: 'High Prob / High Impact',
          row: 0,
          col: 2,
          accent: '#ef4444',
          description: 'Immediate executive mitigation plans required.',
        },
        {
          id: 'high-risk',
          title: 'High Risk Zone ⚠️',
          subtitle: 'Moderate to High Exposure',
          row: 0,
          col: 1,
          accent: '#f97316',
        },
        {
          id: 'moderate-risk',
          title: 'Moderate Risk Zone ⚡',
          subtitle: 'Active Monitoring Required',
          row: 1,
          col: 1,
          accent: '#eab308',
        },
        {
          id: 'low-risk',
          title: 'Low Risk Zone 🟢',
          subtitle: 'Acceptable Exposure',
          row: 2,
          col: 0,
          accent: '#10b981',
        },
      ],
      items: [
        {
          id: 'rk1',
          label: 'Single Cloud Vendor Regional Outage',
          description: 'Requires multi-cloud active failover redundancy.',
          quadrantId: 'critical-risk',
          badge: 'Immediate Action',
        },
        {
          id: 'rk2',
          label: 'Key Customer Concentration (>25% ARR in 1 Account)',
          description: 'Mitigated by aggressive mid-market pipeline diversification.',
          quadrantId: 'high-risk',
          badge: 'Revenue Risk',
        },
        {
          id: 'rk3',
          label: 'Talent Poaching by Tech Giants',
          description: 'Mitigated with competitive equity vesting and remote culture.',
          quadrantId: 'moderate-risk',
          badge: 'HR / Retention',
        },
        {
          id: 'rk4',
          label: 'Minor Currency Fluctuation (EUR/USD)',
          description: 'Natural hedge via distributed EU contractor payroll.',
          quadrantId: 'low-risk',
          badge: 'Managed',
        },
      ],
    },
  },

  // -------------------------------------------------------------
  // 15. Strategy Map / Balanced Scorecard (Flow Primitive)
  // -------------------------------------------------------------
  {
    meta: {
      id: 'strategy-map',
      name: 'Strategy Map (Balanced Scorecard)',
      category: 'Strategy & Positioning',
      primitive: 'flow',
      description:
        'Causal roadmap linking Learning & Growth to Internal Processes, Customer Value, and Financial Performance.',
      strategicQuestion: 'How do organizational capabilities cascade into operational excellence and shareholder value?',
      tags: ['Strategy Map', 'Balanced Scorecard', 'Execution', 'Flow'],
    },
    config: {
      primitive: 'flow',
      phases: [
        { id: 'learning', name: '1. Learning & Growth', color: '#8b5cf6' },
        { id: 'processes', name: '2. Internal Processes', color: '#3b82f6' },
        { id: 'customer', name: '3. Customer Perspective', color: '#14b8a6' },
        { id: 'financial', name: '4. Financial Performance', color: '#10b981' },
      ],
      lanes: [
        { id: 'customerAction', label: 'Strategic Objective', field: 'customerAction' },
        { id: 'touchpoints', label: 'Primary KPI Target', field: 'touchpoints' },
        { id: 'opportunities', label: 'Enabling Initiative', field: 'opportunities' },
      ],
      steps: [
        {
          id: 'sm1',
          title: 'AI Engineering Mastery',
          phaseId: 'learning',
          customerAction: 'Upskill 100% of engineering team on LLM workflow orchestration.',
          touchpoints: ['100% Certifications', 'eNPS > 65'],
          opportunities: ['Bi-weekly AI hackathons'],
        },
        {
          id: 'sm2',
          title: 'Continuous Zero-Defect Delivery',
          phaseId: 'processes',
          customerAction: 'Automate end-to-end integration testing and reduce release cycles to 24 hours.',
          touchpoints: ['99.99% Uptime', '< 2hr MTTR'],
          opportunities: ['Autonomous canary deployment gates'],
        },
        {
          id: 'sm3',
          title: 'Best-in-Class Customer ROI & CSAT',
          phaseId: 'customer',
          customerAction: 'Deliver proven 5x productivity gains for client strategy teams.',
          touchpoints: ['CSAT > 92%', 'Net Retention > 125%'],
          opportunities: ['Executive impact scorecards'],
        },
        {
          id: 'sm4',
          title: 'Hyper-Efficient Free Cash Flow Scale',
          phaseId: 'financial',
          customerAction: 'Achieve Rule of 40 with sustained 35% operating margin.',
          touchpoints: ['ARR > $50M', 'FCF Margin > 25%'],
          opportunities: ['Expansion seat upsells'],
        },
      ],
    },
  },

  // -------------------------------------------------------------
  // 16. DuPont & SaaS Metric Tree (Tree Primitive)
  // -------------------------------------------------------------
  {
    meta: {
      id: 'kpi-tree',
      name: 'SaaS / DuPont KPI Metric Tree',
      category: 'Finance & SaaS Metrics',
      primitive: 'tree',
      description:
        'Hierarchical metric decomposition tree breaking top-line Annual Recurring Revenue (ARR) into underlying drivers and formulas.',
      strategicQuestion: 'Which sub-metrics are driving or holding back our top-line revenue engine?',
      tags: ['KPI Tree', 'DuPont', 'SaaS Metrics', 'Hierarchy'],
    },
    config: {
      primitive: 'tree',
      treeType: 'kpi-metric',
      root: {
        id: 'arr',
        label: 'Total Annual Recurring Revenue (ARR)',
        value: 24.5,
        unit: 'M',
        change: 42.5,
        formula: 'ARR = Existing Base + Net New ARR',
        status: 'good',
        children: [
          {
            id: 'net-new',
            label: 'Net New ARR',
            value: 7.8,
            unit: 'M',
            change: 55.0,
            operator: '+',
            formula: 'New Logo + Expansion - Churn',
            status: 'good',
            children: [
              {
                id: 'new-logo',
                label: 'New Logo ARR',
                value: 5.2,
                unit: 'M',
                change: 48.0,
                operator: '+',
                formula: 'Closed Deals × ACV',
                status: 'good',
                children: [
                  {
                    id: 'deals',
                    label: 'Closed Enterprise Deals',
                    value: 65,
                    change: 30.0,
                    operator: '×',
                    status: 'good',
                  },
                  {
                    id: 'acv',
                    label: 'Average Contract Value (ACV)',
                    value: 80,
                    unit: 'k',
                    change: 14.2,
                    operator: '=',
                    status: 'good',
                  },
                ],
              },
              {
                id: 'expansion',
                label: 'Expansion ARR (Upsell)',
                value: 3.4,
                unit: 'M',
                change: 62.0,
                operator: '+',
                status: 'good',
              },
              {
                id: 'churn',
                label: 'Contraction & Churn ARR',
                value: -0.8,
                unit: 'M',
                change: -12.0,
                operator: '-',
                status: 'good', // negative churn growth is good
              },
            ],
          },
          {
            id: 'base-arr',
            label: 'Starting Base ARR',
            value: 16.7,
            unit: 'M',
            change: 38.0,
            operator: '=',
            status: 'neutral',
          },
        ],
      },
    },
  },

  // -------------------------------------------------------------
  // 17. SaaS Cohort Retention Heatmap (Time Primitive)
  // -------------------------------------------------------------
  {
    meta: {
      id: 'cohort-retention',
      name: 'SaaS Cohort Retention Heatmap',
      category: 'Finance & SaaS Metrics',
      primitive: 'time',
      description:
        'Time-series matrix tracking customer retention decay curves across signup cohorts from Month 0 to Month 6.',
      strategicQuestion: 'Is customer retention improving over time across newer cohorts?',
      tags: ['Cohort', 'Retention', 'Heatmap', 'SaaS'],
    },
    config: {
      primitive: 'time',
      timeType: 'cohort-retention',
      cohortData: {
        periods: ['M0', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6'],
        rows: [
          { cohort: 'Jan 2024', userCount: 1450, retentionRates: [100, 94, 91, 88, 86, 85, 84] },
          { cohort: 'Feb 2024', userCount: 1620, retentionRates: [100, 95, 92, 89, 88, 87, 0] },
          { cohort: 'Mar 2024', userCount: 1890, retentionRates: [100, 96, 94, 91, 90, 0, 0] },
          { cohort: 'Apr 2024', userCount: 2150, retentionRates: [100, 97, 95, 93, 0, 0, 0] },
          { cohort: 'May 2024', userCount: 2480, retentionRates: [100, 98, 96, 0, 0, 0, 0] },
          { cohort: 'Jun 2024', userCount: 2950, retentionRates: [100, 99, 0, 0, 0, 0, 0] },
        ],
      },
    },
  },

  // -------------------------------------------------------------
  // 18. ARR / MRR Bridge (Bridge Primitive - Waterfall)
  // -------------------------------------------------------------
  {
    meta: {
      id: 'arr-bridge',
      name: 'SaaS ARR Bridge (Waterfall)',
      category: 'Finance & SaaS Metrics',
      primitive: 'bridge',
      description:
        'Executive financial bridge connecting Opening ARR to Ending ARR via New Bookings, Expansion, Contraction, and Churn.',
      strategicQuestion: 'What are the exact components contributing to net annual ARR change?',
      tags: ['ARR Bridge', 'Waterfall', 'Finance', 'SaaS'],
    },
    config: {
      primitive: 'bridge',
      bridgeType: 'arr-mrr-bridge',
      unit: 'M',
      currency: '$',
      steps: [
        {
          id: 'step-1',
          label: 'Opening ARR (FY23)',
          value: 18.5,
          formattedValue: '$18.5M',
          type: 'anchor',
          category: 'Base',
        },
        {
          id: 'step-2',
          label: 'New Customer ARR',
          value: 6.2,
          formattedValue: '+$6.2M',
          type: 'delta-positive',
          category: 'Growth',
        },
        {
          id: 'step-3',
          label: 'Expansion / Upsells',
          value: 3.8,
          formattedValue: '+$3.8M',
          type: 'delta-positive',
          category: 'Retention',
        },
        {
          id: 'step-4',
          label: 'Contraction / Downgrades',
          value: -0.9,
          formattedValue: '-$0.9M',
          type: 'delta-negative',
          category: 'Churn',
        },
        {
          id: 'step-5',
          label: 'Customer Logo Churn',
          value: -1.2,
          formattedValue: '-$1.2M',
          type: 'delta-negative',
          category: 'Churn',
        },
        {
          id: 'step-6',
          label: 'Ending ARR (FY24)',
          value: 26.4,
          formattedValue: '$26.4M',
          type: 'final',
          category: 'Closing Total',
        },
      ],
    },
  },

  // -------------------------------------------------------------
  // 19. Strategic Decision Tree (Tree Primitive)
  // -------------------------------------------------------------
  {
    meta: {
      id: 'decision-tree',
      name: 'Executive Decision Tree',
      category: 'Risk & Decision-Making',
      primitive: 'tree',
      description:
        'Probabilistic decision tree evaluating expected values and payoff scenarios for strategic market expansion decisions.',
      strategicQuestion: 'Which strategic path yields the highest expected economic value (EV)?',
      tags: ['Decision Tree', 'Probabilistic', 'EV', 'Strategy'],
    },
    config: {
      primitive: 'tree',
      treeType: 'decision',
      root: {
        id: 'root-decision',
        label: 'Strategic Expansion Dilemma',
        value: 'Decision Node',
        operator: 'decision',
        children: [
          {
            id: 'option-a',
            label: 'Path A: Build In-House Platform',
            value: '$14.2M EV',
            operator: 'branch',
            children: [
              {
                id: 'a-success',
                label: 'High Market Adoption (P=0.7)',
                value: '$22M Payoff',
                probability: 0.7,
                status: 'good',
              },
              {
                id: 'a-fail',
                label: 'Low Market Adoption (P=0.3)',
                value: '-$4M Loss',
                probability: 0.3,
                status: 'danger',
              },
            ],
          },
          {
            id: 'option-b',
            label: 'Path B: Acquire Niche AI Competitor',
            value: '$11.5M EV',
            operator: 'branch',
            children: [
              {
                id: 'b-synergy',
                label: 'Successful Synergy (P=0.5)',
                value: '$30M Payoff',
                probability: 0.5,
                status: 'good',
              },
              {
                id: 'b-clash',
                label: 'Integration Friction (P=0.5)',
                value: '-$7M Loss',
                probability: 0.5,
                status: 'danger',
              },
            ],
          },
        ],
      },
    },
  },

  // -------------------------------------------------------------
  // 20. Three Horizons of Growth (Time Primitive)
  // -------------------------------------------------------------
  {
    meta: {
      id: 'three-horizons',
      name: 'Three Horizons of Growth',
      category: 'Strategy & Positioning',
      primitive: 'time',
      description:
        'McKinsey framework structuring innovation across Horizon 1 (Core Business), Horizon 2 (Emerging Growth), and Horizon 3 (Future Bets).',
      strategicQuestion: 'How do we manage today’s cash engine while incubating tomorrow’s transformational business?',
      tags: ['Innovation', '3 Horizons', 'McKinsey', 'Roadmap'],
    },
    config: {
      primitive: 'time',
      timeType: 'three-horizons',
      horizons: [
        {
          id: 'h1',
          horizon: 'H1: Core Business',
          timeframe: '0 - 12 Months',
          focus: 'Maximize profitability, defend core market share, and optimize operational margins.',
          color: '#3b82f6',
          initiatives: [
            { id: 'i1', title: 'Enterprise SSO & Role Governance', status: 'completed', impact: 'high', quarter: 'Q1' },
            { id: 'i2', title: 'Automated Billing & Invoice Consolidation', status: 'in-progress', impact: 'medium', quarter: 'Q2' },
            { id: 'i3', title: 'Tier-1 Customer Success SLA Program', status: 'planned', impact: 'high', quarter: 'Q2' },
          ],
        },
        {
          id: 'h2',
          horizon: 'H2: Emerging Growth',
          timeframe: '12 - 36 Months',
          focus: 'Scale fast-growing product extensions, capture adjacent customer personas, and expand geographies.',
          color: '#14b8a6',
          initiatives: [
            { id: 'i4', title: 'Multi-Agent Autonomous Strategy Simulation', status: 'in-progress', impact: 'high', quarter: 'Q3' },
            { id: 'i5', title: 'European Sovereign Cloud Deployments', status: 'planned', impact: 'high', quarter: 'Q4' },
            { id: 'i6', title: 'Embedded Analytics Marketplace API', status: 'planned', impact: 'medium', quarter: 'Q4' },
          ],
        },
        {
          id: 'h3',
          horizon: 'H3: Future Bets',
          timeframe: '36+ Months',
          focus: 'Seed breakthrough research, exploratory bets, and potential business model pivots.',
          color: '#8b5cf6',
          initiatives: [
            { id: 'i7', title: 'Autonomous Real-Time Corporate Boardroom AI', status: 'planned', impact: 'high', quarter: '2026' },
            { id: 'i8', title: 'Decentralized Predictive Market Intelligence Swarm', status: 'planned', impact: 'high', quarter: '2027' },
          ],
        },
      ],
    },
  },
];
