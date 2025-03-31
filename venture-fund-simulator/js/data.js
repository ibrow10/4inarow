/**
 * Venture Fund Simulator - Data Module
 * Contains game constants, startup data, and market events
 */

const GAME_CONSTANTS = {
    SIMULATION_YEARS: 10,
    QUARTERS_PER_YEAR: 4,
    MAX_DEALS_PER_QUARTER: 5,
    MIN_DEALS_PER_QUARTER: 2,
    BASE_FAILURE_RATE: 0.3,  // 30% base chance of startup failure
    BASE_EXIT_RATE: 0.05,    // 5% base chance of exit opportunity per quarter
    FOLLOW_ON_MULTIPLIER: 1.5, // Multiplier for follow-on investments
    MARKET_EVENT_CHANCE: 0.3, // 30% chance of market event per quarter
};

// Industry data with risk/return profiles
const INDUSTRY_DATA = {
    tech: {
        name: "Technology",
        avgReturn: 3.0,
        volatility: 1.2,
        exitTimeframe: 5,
        description: "Software, hardware, and internet companies"
    },
    biotech: {
        name: "Biotech",
        avgReturn: 4.0,
        volatility: 1.8,
        exitTimeframe: 8,
        description: "Biotechnology, pharmaceuticals, and medical devices"
    },
    cleantech: {
        name: "Clean Energy",
        avgReturn: 2.5,
        volatility: 1.5,
        exitTimeframe: 7,
        description: "Renewable energy, sustainability, and clean technology"
    },
    fintech: {
        name: "Fintech",
        avgReturn: 3.2,
        volatility: 1.3,
        exitTimeframe: 6,
        description: "Financial technology, payments, and banking solutions"
    },
    consumer: {
        name: "Consumer",
        avgReturn: 2.8,
        volatility: 1.4,
        exitTimeframe: 5,
        description: "Consumer products, services, and direct-to-consumer brands"
    },
    enterprise: {
        name: "Enterprise",
        avgReturn: 2.6,
        volatility: 0.9,
        exitTimeframe: 6,
        description: "B2B software, services, and solutions"
    }
};

// Geographical data with market characteristics
const GEO_DATA = {
    global: {
        name: "Global",
        marketSize: 1.0,
        competitionLevel: 1.0,
        regulatoryRisk: 1.0,
        description: "Worldwide operations and market reach"
    },
    "north-america": {
        name: "North America",
        marketSize: 0.8,
        competitionLevel: 1.2,
        regulatoryRisk: 0.7,
        description: "United States and Canada"
    },
    europe: {
        name: "Europe",
        marketSize: 0.7,
        competitionLevel: 0.9,
        regulatoryRisk: 1.1,
        description: "European Union and United Kingdom"
    },
    asia: {
        name: "Asia",
        marketSize: 0.9,
        competitionLevel: 1.1,
        regulatoryRisk: 1.2,
        description: "East Asia, South Asia, and Southeast Asia"
    },
    latam: {
        name: "Latin America",
        marketSize: 0.5,
        competitionLevel: 0.7,
        regulatoryRisk: 1.3,
        description: "Central and South America"
    },
    ireland: {
        name: "Ireland",
        marketSize: 0.4,
        competitionLevel: 0.8,
        regulatoryRisk: 0.6,
        description: "Republic of Ireland with strong tech and pharma sectors"
    },
    "n-ireland": {
        name: "Northern Ireland",
        marketSize: 0.3,
        competitionLevel: 0.7,
        regulatoryRisk: 0.8,
        description: "Northern Ireland with emerging tech and creative industries"
    },
    cork: {
        name: "Cork",
        marketSize: 0.2,
        competitionLevel: 0.6,
        regulatoryRisk: 0.5,
        description: "Cork region with focus on tech, pharma, and food innovation"
    }
};

// Investment stage data
const STAGE_DATA = {
    seed: {
        name: "Seed",
        riskLevel: 1.8,
        returnMultiplier: 2.0,
        typicalValuation: "1-5M",
        description: "Early-stage startups with initial product development"
    },
    "series-a": {
        name: "Series A",
        riskLevel: 1.4,
        returnMultiplier: 1.5,
        typicalValuation: "10-30M",
        description: "Startups with product-market fit and initial traction"
    },
    "series-b": {
        name: "Series B",
        riskLevel: 1.0,
        returnMultiplier: 1.2,
        typicalValuation: "30-60M",
        description: "Companies with proven business model and growth"
    },
    growth: {
        name: "Growth",
        riskLevel: 0.7,
        returnMultiplier: 0.8,
        typicalValuation: "100M+",
        description: "Established companies with significant revenue and expansion plans"
    },
    "multi-stage": {
        name: "Multi-stage",
        riskLevel: 1.2,
        returnMultiplier: 1.3,
        typicalValuation: "Varies",
        description: "Investments across multiple stages of company development"
    }
};

// LP types with characteristics
const LP_TYPES = {
    institutional: {
        name: "Institutional LPs",
        riskTolerance: 0.8,
        returnExpectations: 2.5,
        patience: 0.9,
        description: "Pension funds, endowments, and foundations"
    },
    familyOffice: {
        name: "Family Offices",
        riskTolerance: 1.1,
        returnExpectations: 2.8,
        patience: 1.0,
        description: "Private wealth management firms for ultra-high-net-worth individuals"
    },
    individual: {
        name: "Individual LPs",
        riskTolerance: 1.3,
        returnExpectations: 3.0,
        patience: 0.7,
        description: "High-net-worth individuals and angel investors"
    }
};

// Startup names and descriptions for generating deal flow
const STARTUP_DATA = {
    names: [
        "Quantum", "Nova", "Apex", "Zenith", "Pulse", "Nexus", "Vertex", "Fusion", "Cipher", "Echo",
        "Prism", "Helix", "Spark", "Orbit", "Flux", "Catalyst", "Vector", "Beacon", "Horizon", "Lumina"
    ],
    suffixes: [
        "Tech", "AI", "Labs", "Systems", "Networks", "Dynamics", "Solutions", "Robotics", "Genomics", "Analytics",
        "Health", "Energy", "Finance", "Mobility", "Security", "Cloud", "Data", "Ventures", "Biotech", "Software"
    ],
    descriptions: {
        tech: [
            "A cloud-native platform for enterprise workflow automation",
            "An AI-powered recommendation engine for e-commerce",
            "A low-code development platform for business applications",
            "A cybersecurity solution using behavioral analytics",
            "A data integration platform for enterprise systems"
        ],
        biotech: [
            "A gene therapy approach for rare genetic disorders",
            "A platform for rapid drug discovery using AI",
            "A medical device for non-invasive glucose monitoring",
            "A cell therapy technology for autoimmune diseases",
            "A diagnostic platform for early cancer detection"
        ],
        cleantech: [
            "A grid-scale energy storage solution using novel materials",
            "A carbon capture technology for industrial applications",
            "A smart grid management system for renewable energy",
            "A water purification technology for developing regions",
            "A sustainable packaging solution for consumer products"
        ],
        fintech: [
            "A blockchain-based payment processing platform",
            "An AI-powered fraud detection system for banks",
            "A robo-advisor for sustainable investing",
            "A digital banking platform for underserved communities",
            "A cryptocurrency exchange with enhanced security features"
        ],
        consumer: [
            "A subscription service for personalized wellness products",
            "A direct-to-consumer brand for sustainable fashion",
            "A marketplace for handcrafted home goods",
            "A food delivery service focused on local restaurants",
            "A virtual fitness platform with AI coaching"
        ],
        enterprise: [
            "A SaaS platform for supply chain management",
            "An enterprise knowledge management system",
            "A compliance automation tool for regulated industries",
            "A B2B marketplace for industrial equipment",
            "A workforce management solution for remote teams"
        ]
    }
};

// Market events that can impact the simulation
const MARKET_EVENTS = [
    {
        title: "Economic Boom",
        description: "Strong economic growth boosts startup valuations and exit opportunities.",
        impact: {
            type: "positive",
            valuationMultiplier: 1.3,
            exitRateModifier: 0.1,
            failureRateModifier: -0.05
        },
        duration: 4 // quarters
    },
    {
        title: "Economic Recession",
        description: "Economic downturn leads to lower valuations and more difficult fundraising environment.",
        impact: {
            type: "negative",
            valuationMultiplier: 0.7,
            exitRateModifier: -0.03,
            failureRateModifier: 0.1
        },
        duration: 6 // quarters
    },
    {
        title: "Tech Bubble",
        description: "Excessive optimism in tech leads to inflated valuations, followed by a correction.",
        impact: {
            type: "mixed",
            phases: [
                {
                    valuationMultiplier: 1.5,
                    exitRateModifier: 0.15,
                    failureRateModifier: -0.05,
                    duration: 3 // quarters
                },
                {
                    valuationMultiplier: 0.6,
                    exitRateModifier: -0.05,
                    failureRateModifier: 0.15,
                    duration: 4 // quarters
                }
            ]
        }
    },
    {
        title: "Regulatory Change",
        description: "New regulations impact certain industries, creating both challenges and opportunities.",
        impact: {
            type: "mixed",
            industrySpecific: true,
            industries: {
                fintech: {
                    valuationMultiplier: 0.8,
                    failureRateModifier: 0.1
                },
                biotech: {
                    valuationMultiplier: 0.9,
                    failureRateModifier: 0.05
                }
            },
            duration: 8 // quarters
        }
    },
    {
        title: "Technological Breakthrough",
        description: "Major technological advancement creates new opportunities in specific sectors.",
        impact: {
            type: "positive",
            industrySpecific: true,
            industries: {
                tech: {
                    valuationMultiplier: 1.4,
                    exitRateModifier: 0.1
                },
                biotech: {
                    valuationMultiplier: 1.3,
                    exitRateModifier: 0.08
                }
            },
            duration: 6 // quarters
        }
    },
    {
        title: "IPO Market Heats Up",
        description: "Strong public market appetite for tech IPOs creates favorable exit environment.",
        impact: {
            type: "positive",
            exitRateModifier: 0.15,
            exitValueMultiplier: 1.3,
            duration: 4 // quarters
        }
    },
    {
        title: "Venture Capital Dry Spell",
        description: "Reduced VC activity makes follow-on funding more difficult to secure.",
        impact: {
            type: "negative",
            followOnSuccessModifier: -0.2,
            failureRateModifier: 0.1,
            duration: 5 // quarters
        }
    },
    {
        title: "Corporate Acquisition Spree",
        description: "Major corporations actively acquiring startups in specific sectors.",
        impact: {
            type: "positive",
            exitRateModifier: 0.2,
            industrySpecific: true,
            industries: {
                tech: { exitValueMultiplier: 1.2 },
                enterprise: { exitValueMultiplier: 1.3 }
            },
            duration: 3 // quarters
        }
    },
    {
        title: "Global Pandemic",
        description: "Worldwide health crisis disrupts markets but accelerates digital transformation.",
        impact: {
            type: "mixed",
            industries: {
                tech: { valuationMultiplier: 1.2 },
                consumer: { valuationMultiplier: 0.7 },
                biotech: { valuationMultiplier: 1.4 },
                fintech: { valuationMultiplier: 1.1 }
            },
            failureRateModifier: 0.1,
            duration: 8 // quarters
        }
    },
    {
        title: "Talent Migration",
        description: "Shift in where top talent wants to work affects startup success rates.",
        impact: {
            type: "neutral",
            industries: {
                tech: { failureRateModifier: -0.05 },
                cleantech: { failureRateModifier: -0.05 }
            },
            duration: 6 // quarters
        }
    }
];

// Exit types with characteristics
const EXIT_TYPES = [
    {
        type: "Acquisition - Strategic",
        description: "Acquired by a larger company for strategic reasons",
        returnMultiplierRange: [2, 10],
        probability: 0.6
    },
    {
        type: "Acquisition - Financial",
        description: "Acquired by a private equity firm or similar financial buyer",
        returnMultiplierRange: [1.5, 5],
        probability: 0.2
    },
    {
        type: "IPO",
        description: "Initial Public Offering on a stock exchange",
        returnMultiplierRange: [3, 20],
        probability: 0.1
    },
    {
        type: "Secondary Sale",
        description: "Shares sold to new investors without a full company exit",
        returnMultiplierRange: [1.5, 3],
        probability: 0.1
    }
];

// Failure scenarios
const FAILURE_SCENARIOS = [
    {
        type: "Ran Out of Cash",
        description: "Failed to raise additional funding and exhausted capital",
        probability: 0.4
    },
    {
        type: "Market Timing",
        description: "Product was too early or too late for the market",
        probability: 0.2
    },
    {
        type: "Team Issues",
        description: "Co-founder conflicts or inability to build the right team",
        probability: 0.15
    },
    {
        type: "Competition",
        description: "Outcompeted by rivals or new entrants",
        probability: 0.15
    },
    {
        type: "Product-Market Fit",
        description: "Failed to achieve product-market fit",
        probability: 0.1
    }
];
