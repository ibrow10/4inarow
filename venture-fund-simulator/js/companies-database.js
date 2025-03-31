/**
 * Venture Fund Simulator - Companies Database
 * Contains a comprehensive database of potential investment companies
 * with detailed descriptions and metrics
 */

const COMPANIES_DATABASE = [
    // TECHNOLOGY SECTOR
    {
        name: "QuantumAI",
        industry: "tech",
        stage: "seed",
        geography: "north-america",
        description: "Developing quantum machine learning algorithms that can run on both quantum and classical hardware, providing 10-100x speedups for specific AI workloads. Founded by two PhDs from MIT's quantum computing lab.",
        teamQuality: 5,
        productQuality: 4,
        marketSize: 5,
        traction: 2,
        businessModel: 3,
        valuation: 8,
        revenue: 0.2,
        growthRate: 150,
        burnRate: 0.3,
        runway: 8,
        riskLevel: 4,
        potentialReturn: 25
    },
    {
        name: "NexusCloud",
        industry: "tech",
        stage: "series-a",
        geography: "north-america",
        description: "Multi-cloud orchestration platform that reduces cloud computing costs by 40% through intelligent workload distribution and optimization. Already serving 25 enterprise customers with $1.2M ARR.",
        teamQuality: 4,
        productQuality: 5,
        marketSize: 5,
        traction: 4,
        businessModel: 5,
        valuation: 35,
        revenue: 1.5,
        growthRate: 200,
        burnRate: 0.5,
        runway: 12,
        riskLevel: 3,
        potentialReturn: 10
    },
    {
        name: "CipherSec",
        industry: "tech",
        stage: "seed",
        geography: "europe",
        description: "Zero-knowledge proof encryption system for enterprise data sharing, allowing companies to collaborate on sensitive data without exposing it. Founded by former cybersecurity leads from CERN.",
        teamQuality: 4,
        productQuality: 4,
        marketSize: 4,
        traction: 2,
        businessModel: 3,
        valuation: 7,
        revenue: 0.1,
        growthRate: 120,
        burnRate: 0.2,
        runway: 10,
        riskLevel: 3,
        potentialReturn: 15
    },
    {
        name: "PulseAnalytics",
        industry: "tech",
        stage: "series-b",
        geography: "north-america",
        description: "Real-time customer sentiment analysis platform using proprietary NLP models with 95% accuracy, serving major retail and hospitality brands. Growing 15% month-over-month with strong unit economics.",
        teamQuality: 4,
        productQuality: 4,
        marketSize: 4,
        traction: 5,
        businessModel: 4,
        valuation: 85,
        revenue: 8.5,
        growthRate: 120,
        burnRate: 1.2,
        runway: 18,
        riskLevel: 2,
        potentialReturn: 6
    },
    {
        name: "VectorMobility",
        industry: "tech",
        stage: "growth",
        geography: "global",
        description: "Autonomous vehicle software stack with proprietary sensor fusion technology, already integrated with 3 major automotive manufacturers. Preparing for IPO within 18 months.",
        teamQuality: 5,
        productQuality: 5,
        marketSize: 5,
        traction: 4,
        businessModel: 4,
        valuation: 450,
        revenue: 45,
        growthRate: 80,
        burnRate: 5,
        runway: 24,
        riskLevel: 2,
        potentialReturn: 4
    },
    
    // BIOTECH SECTOR
    {
        name: "HelixGenomics",
        industry: "biotech",
        stage: "seed",
        geography: "north-america",
        description: "CRISPR-based gene editing platform targeting rare genetic disorders with a novel delivery mechanism that improves cell targeting by 300%. Led by a renowned geneticist with 15+ publications in Nature.",
        teamQuality: 5,
        productQuality: 4,
        marketSize: 4,
        traction: 1,
        businessModel: 3,
        valuation: 12,
        revenue: 0,
        growthRate: 0,
        burnRate: 0.4,
        runway: 9,
        riskLevel: 5,
        potentialReturn: 30
    },
    {
        name: "CatalystBio",
        industry: "biotech",
        stage: "series-a",
        geography: "europe",
        description: "AI-powered drug discovery platform that has identified 3 promising compounds for neurodegenerative diseases, with first candidate entering Phase I trials. Partnership with major pharma company already secured.",
        teamQuality: 4,
        productQuality: 4,
        marketSize: 5,
        traction: 3,
        businessModel: 4,
        valuation: 45,
        revenue: 2.5,
        growthRate: 60,
        burnRate: 1.5,
        runway: 10,
        riskLevel: 4,
        potentialReturn: 12
    },
    {
        name: "BeaconHealth",
        industry: "biotech",
        stage: "series-b",
        geography: "asia",
        description: "Non-invasive continuous glucose monitoring technology using optical sensors with 98% accuracy compared to blood tests. FDA approval expected within 6 months and already approved in Europe and Asia.",
        teamQuality: 4,
        productQuality: 5,
        marketSize: 5,
        traction: 4,
        businessModel: 5,
        valuation: 120,
        revenue: 8,
        growthRate: 150,
        burnRate: 2,
        runway: 12,
        riskLevel: 3,
        potentialReturn: 8
    },
    
    // CLEANTECH SECTOR
    {
        name: "FusionEnergy",
        industry: "cleantech",
        stage: "seed",
        geography: "global",
        description: "Developing compact fusion reactor technology using a novel approach to plasma containment. Successfully demonstrated sustained reaction for 30 seconds in lab conditions, a significant breakthrough.",
        teamQuality: 5,
        productQuality: 3,
        marketSize: 5,
        traction: 1,
        businessModel: 2,
        valuation: 15,
        revenue: 0,
        growthRate: 0,
        burnRate: 0.5,
        runway: 9,
        riskLevel: 5,
        potentialReturn: 50
    },
    {
        name: "OrbitSolar",
        industry: "cleantech",
        stage: "series-a",
        geography: "north-america",
        description: "Solar panel technology with 35% efficiency (vs industry standard 20-22%) using proprietary perovskite-silicon tandem cell design. Already deployed in pilot projects with 3 utility companies.",
        teamQuality: 4,
        productQuality: 5,
        marketSize: 5,
        traction: 3,
        businessModel: 4,
        valuation: 40,
        revenue: 1.8,
        growthRate: 120,
        burnRate: 0.8,
        runway: 15,
        riskLevel: 3,
        potentialReturn: 15
    },
    {
        name: "FluxStorage",
        industry: "cleantech",
        stage: "series-b",
        geography: "europe",
        description: "Grid-scale energy storage using flow batteries with novel electrolyte chemistry, providing 40% cost reduction and 2x lifespan compared to lithium-ion. Contracts with 5 European utility companies.",
        teamQuality: 4,
        productQuality: 4,
        marketSize: 5,
        traction: 4,
        businessModel: 4,
        valuation: 95,
        revenue: 12,
        growthRate: 90,
        burnRate: 2.5,
        runway: 12,
        riskLevel: 3,
        potentialReturn: 7
    },
    
    // FINTECH SECTOR
    {
        name: "PrismFinance",
        industry: "fintech",
        stage: "seed",
        geography: "global",
        description: "Decentralized finance protocol enabling cross-border payments at 1/10th the cost and 100x the speed of traditional systems. Already processing $5M in monthly transaction volume despite being in beta.",
        teamQuality: 4,
        productQuality: 4,
        marketSize: 5,
        traction: 3,
        businessModel: 3,
        valuation: 18,
        revenue: 0.3,
        growthRate: 200,
        burnRate: 0.4,
        runway: 12,
        riskLevel: 4,
        potentialReturn: 20
    },
    {
        name: "VertexInsure",
        industry: "fintech",
        stage: "series-a",
        geography: "north-america",
        description: "AI-powered insurance underwriting platform that reduces risk assessment time from weeks to minutes while improving accuracy by 40%. Working with 8 of the top 20 insurance providers.",
        teamQuality: 4,
        productQuality: 5,
        marketSize: 4,
        traction: 4,
        businessModel: 5,
        valuation: 55,
        revenue: 4.2,
        growthRate: 150,
        burnRate: 1,
        runway: 14,
        riskLevel: 3,
        potentialReturn: 12
    },
    {
        name: "EchoInvest",
        industry: "fintech",
        stage: "growth",
        geography: "global",
        description: "Automated wealth management platform with proprietary asset allocation algorithms that have outperformed market benchmarks by 3.2% annually. Managing over $2B in assets with strong revenue growth.",
        teamQuality: 5,
        productQuality: 4,
        marketSize: 5,
        traction: 5,
        businessModel: 5,
        valuation: 380,
        revenue: 42,
        growthRate: 70,
        burnRate: 4,
        runway: 30,
        riskLevel: 2,
        potentialReturn: 5
    },
    
    // CONSUMER SECTOR
    {
        name: "LuminaWear",
        industry: "consumer",
        stage: "seed",
        geography: "north-america",
        description: "Smart clothing with embedded health sensors and adaptive temperature control, targeting premium athletic and outdoor markets. Founded by former Nike and Apple engineers.",
        teamQuality: 4,
        productQuality: 4,
        marketSize: 3,
        traction: 2,
        businessModel: 3,
        valuation: 9,
        revenue: 0.2,
        growthRate: 100,
        burnRate: 0.3,
        runway: 9,
        riskLevel: 3,
        potentialReturn: 15
    },
    {
        name: "HorizonFoods",
        industry: "consumer",
        stage: "series-a",
        geography: "global",
        description: "Plant-based protein alternatives with proprietary fermentation technology creating products indistinguishable from animal proteins in blind taste tests. Already in 500+ retail locations.",
        teamQuality: 4,
        productQuality: 5,
        marketSize: 4,
        traction: 4,
        businessModel: 4,
        valuation: 60,
        revenue: 5.5,
        growthRate: 180,
        burnRate: 1.2,
        runway: 15,
        riskLevel: 3,
        potentialReturn: 10
    },
    {
        name: "ZenithLeisure",
        industry: "consumer",
        stage: "series-b",
        geography: "asia",
        description: "Experiential travel platform offering curated, sustainable luxury experiences with 85% booking through proprietary app. Expanding rapidly across Asia with plans for global rollout.",
        teamQuality: 4,
        productQuality: 4,
        marketSize: 4,
        traction: 5,
        businessModel: 4,
        valuation: 110,
        revenue: 18,
        growthRate: 120,
        burnRate: 3,
        runway: 18,
        riskLevel: 2,
        potentialReturn: 7
    },
    
    // ENTERPRISE SECTOR
    {
        name: "ApexWorkflow",
        industry: "enterprise",
        stage: "seed",
        geography: "north-america",
        description: "No-code workflow automation platform for enterprise operations, reducing process time by 70% on average. Early customers include two Fortune 500 companies despite pre-revenue status.",
        teamQuality: 4,
        productQuality: 4,
        marketSize: 4,
        traction: 2,
        businessModel: 4,
        valuation: 12,
        revenue: 0.1,
        growthRate: 120,
        burnRate: 0.4,
        runway: 9,
        riskLevel: 3,
        potentialReturn: 18
    },
    {
        name: "NovaSecurity",
        industry: "enterprise",
        stage: "series-a",
        geography: "europe",
        description: "Zero-trust security platform with continuous authentication and behavioral monitoring, reducing enterprise security incidents by 85%. Growing rapidly in financial and healthcare sectors.",
        teamQuality: 5,
        productQuality: 5,
        marketSize: 5,
        traction: 3,
        businessModel: 4,
        valuation: 50,
        revenue: 3.8,
        growthRate: 150,
        burnRate: 1,
        runway: 12,
        riskLevel: 3,
        potentialReturn: 12
    },
    {
        name: "SparkDevOps",
        industry: "enterprise",
        stage: "growth",
        geography: "global",
        description: "DevOps platform automating software deployment and infrastructure management with proprietary AI for predictive scaling. Used by over 10,000 companies with strong net revenue retention of 140%.",
        teamQuality: 5,
        productQuality: 5,
        marketSize: 5,
        traction: 5,
        businessModel: 5,
        valuation: 420,
        revenue: 65,
        growthRate: 80,
        burnRate: 8,
        runway: 24,
        riskLevel: 2,
        potentialReturn: 5
    }
];

// Helper function to get a random company from the database
function getRandomCompany() {
    const randomIndex = Math.floor(Math.random() * COMPANIES_DATABASE.length);
    return COMPANIES_DATABASE[randomIndex];
}

// Helper function to get random companies filtered by criteria
function getRandomCompanies(count, filters = {}) {
    let filteredCompanies = [...COMPANIES_DATABASE];
    
    // Apply filters if provided
    if (filters.industry && filters.industry.length > 0) {
        filteredCompanies = filteredCompanies.filter(company => 
            filters.industry.includes(company.industry));
    }
    
    if (filters.stage) {
        filteredCompanies = filteredCompanies.filter(company => 
            company.stage === filters.stage || filters.stage === 'multi-stage');
    }
    
    if (filters.geography) {
        filteredCompanies = filteredCompanies.filter(company => 
            company.geography === filters.geography || filters.geography === 'global');
    }
    
    // If no companies match the filters, return from the full database
    if (filteredCompanies.length === 0) {
        filteredCompanies = [...COMPANIES_DATABASE];
    }
    
    // Get random companies up to the requested count
    const selectedCompanies = [];
    const maxCompanies = Math.min(count, filteredCompanies.length);
    
    // Create a copy to avoid modifying the original array
    const availableCompanies = [...filteredCompanies];
    
    for (let i = 0; i < maxCompanies; i++) {
        const randomIndex = Math.floor(Math.random() * availableCompanies.length);
        selectedCompanies.push(availableCompanies[randomIndex]);
        availableCompanies.splice(randomIndex, 1);
        
        // If we've used all available companies, break
        if (availableCompanies.length === 0) break;
    }
    
    return selectedCompanies;
}
