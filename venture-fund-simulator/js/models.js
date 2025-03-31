/**
 * Venture Fund Simulator - Models Module
 * Contains classes for Fund, Startup, and other game entities
 */

/**
 * Class representing a venture capital fund
 */
class Fund {
    constructor(config) {
        // Fund identity
        this.name = config.name;
        this.industries = config.industries;
        this.geography = config.geography;
        this.stage = config.stage;
        this.differentiator = config.differentiator;
        
        // Fund economics
        this.size = config.size; // in millions
        this.checkSize = config.checkSize; // in millions
        this.managementFee = config.managementFee; // percentage
        this.carriedInterest = config.carriedInterest; // percentage
        this.targetIRR = config.targetIRR; // percentage
        
        // Investment strategy
        this.targetInvestments = config.targetInvestments;
        this.followOnReserve = config.followOnReserve; // percentage
        this.riskTolerance = config.riskTolerance; // 1-10 scale
        
        // Investment criteria weights
        this.criteria = {
            team: config.criteria.team,
            market: config.criteria.market,
            traction: config.criteria.traction,
            product: config.criteria.product,
            business: config.criteria.business
        };
        
        // LP composition
        this.lps = {
            institutional: config.lps.institutional,
            familyOffice: config.lps.familyOffice,
            individual: config.lps.individual
        };
        
        // Runtime state
        this.availableCapital = config.size;
        this.initialCapital = config.size;
        this.deployedCapital = 0;
        this.reservedCapital = (config.size * config.followOnReserve) / 100;
        this.initialCapital = config.size;
        this.managementFeesCollected = 0;
        this.carriedInterestEarned = 0;
        this.portfolio = [];
        this.passedDeals = [];
        this.currentYear = 1;
        this.currentQuarter = 1;
        this.returns = 0;
        this.irr = 0;
        this.moic = 1.0;
        this.yearlyPerformance = []; // To track performance over time
        
        // Fund performance tracking
        this.totalInvestments = 0;
        this.successfulExits = 0;
        this.failedInvestments = 0;
    }
    
    /**
     * Calculate the fund's score for a given startup
     * @param {Startup} startup - The startup to evaluate
     * @returns {number} - Score from 0-100
     */
    evaluateStartup(startup) {
        let score = 0;
        
        // Team score (0-100)
        const teamScore = startup.teamQuality * 20; // 0-5 scale to 0-100
        score += (teamScore * this.criteria.team) / 100;
        
        // Market score (0-100)
        const marketScore = startup.marketSize * 20; // 0-5 scale to 0-100
        score += (marketScore * this.criteria.market) / 100;
        
        // Traction score (0-100)
        const tractionScore = startup.traction * 20; // 0-5 scale to 0-100
        score += (tractionScore * this.criteria.traction) / 100;
        
        // Product score (0-100)
        const productScore = startup.productQuality * 20; // 0-5 scale to 0-100
        score += (productScore * this.criteria.product) / 100;
        
        // Business model score (0-100)
        const businessScore = startup.businessModel * 20; // 0-5 scale to 0-100
        score += (businessScore * this.criteria.business) / 100;
        
        // Adjust based on industry and stage fit
        if (this.industries.includes(startup.industry)) {
            score += 5; // Bonus for industry fit
        }
        
        if (this.stage === startup.stage || this.stage === 'multi-stage') {
            score += 5; // Bonus for stage fit
        }
        
        // Adjust for geography fit
        if (this.geography === startup.geography || this.geography === 'global') {
            score += 5; // Bonus for geography fit
        }
        
        // Risk tolerance adjustment
        if (startup.riskLevel > 3) {
            // High-risk startup
            score += (this.riskTolerance - 5) * 2; // Adjust score based on risk tolerance
        }
        
        return Math.min(Math.max(score, 0), 100); // Ensure score is between 0-100
    }
    
    /**
     * Make an investment in a startup
     * @param {Startup} startup - The startup to invest in
     * @param {number} amount - Investment amount in millions
     * @returns {boolean} - Whether the investment was successful
     */
    investInStartup(startup, amount) {
        // Check if we have enough capital
        if (amount > this.availableCapital) {
            return false;
        }
        
        // Make the investment
        startup.receiveInvestment(amount, this);
        this.portfolio.push(startup);
        this.availableCapital -= amount;
        this.deployedCapital += amount;
        this.totalInvestments++;
        
        return true;
    }
    
    /**
     * Make a follow-on investment in an existing portfolio company
     * @param {Startup} startup - The startup to invest in
     * @param {number} amount - Investment amount in millions
     * @returns {boolean} - Whether the investment was successful
     */
    makeFollowOnInvestment(startup, amount) {
        // Check if we have enough reserved capital
        if (amount > this.reservedCapital) {
            return false;
        }
        
        // Make the follow-on investment
        startup.receiveFollowOnInvestment(amount, this);
        this.reservedCapital -= amount;
        this.deployedCapital += amount;
        
        return true;
    }
    
    /**
     * Process a startup exit
     * @param {Startup} startup - The startup that exited
     * @param {number} returnMultiple - The multiple of the investment returned
     */
    processExit(startup, returnMultiple) {
        const investmentAmount = startup.investmentAmount;
        const returnAmount = investmentAmount * returnMultiple;
        
        // Update fund metrics
        this.returns += returnAmount - investmentAmount; // Net return
        this.successfulExits++;
        
        // Remove from portfolio
        const index = this.portfolio.findIndex(s => s.id === startup.id);
        if (index !== -1) {
            this.portfolio.splice(index, 1);
        }
        
        // Calculate carried interest
        if (returnMultiple > 1) {
            const profit = returnAmount - investmentAmount;
            const carriedInterest = profit * (this.carriedInterest / 100);
            this.carriedInterestEarned += carriedInterest;
        }
        
        // Update fund performance metrics
        this.updatePerformanceMetrics();
    }
    
    /**
     * Process a startup failure
     * @param {Startup} startup - The startup that failed
     */
    processFailure(startup) {
        // Update fund metrics
        this.failedInvestments++;
        
        // Remove from portfolio
        const index = this.portfolio.findIndex(s => s.id === startup.id);
        if (index !== -1) {
            this.portfolio.splice(index, 1);
        }
        
        // Update fund performance metrics
        this.updatePerformanceMetrics();
    }
    
    /**
     * Update the fund's performance metrics (IRR, MOIC)
     */
    updatePerformanceMetrics() {
        // Calculate MOIC (Multiple on Invested Capital)
        const totalValue = this.returns + this.deployedCapital;
        this.moic = totalValue / this.initialCapital;
        
        // Calculate IRR (Internal Rate of Return)
        // This is a simplified calculation for the game
        const years = this.currentYear - 1 + (this.currentQuarter / 4);
        if (years > 0) {
            this.irr = (Math.pow(this.moic, 1/years) - 1) * 100;
        }
    }
    
    /**
     * Advance to the next quarter
     */
    advanceQuarter() {
        this.currentQuarter++;
        
        if (this.currentQuarter > 4) {
            this.currentQuarter = 1;
            this.currentYear++;
            
            // Collect annual management fee
            const managementFeeAmount = (this.initialCapital * this.managementFee) / 100;
            this.managementFeesCollected += managementFeeAmount;
        }
        
        // Record performance for this period
        this.yearlyPerformance.push({
            year: this.currentYear,
            quarter: this.currentQuarter,
            irr: this.irr,
            moic: this.moic,
            portfolioCount: this.portfolio.length
        });
        
        // Update fund performance metrics
        this.updatePerformanceMetrics();
    }
}

/**
 * Class representing a startup company
 */
class Startup {
    constructor(config) {
        this.id = Math.random().toString(36).substring(2, 9);
        this.name = config.name;
        this.industry = config.industry;
        this.stage = config.stage;
        this.geography = config.geography;
        this.description = config.description;
        
        // Startup quality metrics (1-5 scale)
        this.teamQuality = config.teamQuality;
        this.productQuality = config.productQuality;
        this.marketSize = config.marketSize;
        this.traction = config.traction;
        this.businessModel = config.businessModel;
        
        // Financial metrics
        this.valuation = config.valuation; // in millions
        this.revenue = config.revenue; // in millions
        this.growthRate = config.growthRate; // percentage
        this.burnRate = config.burnRate; // in millions per quarter
        this.runway = config.runway; // in quarters
        
        // Risk and return characteristics
        this.riskLevel = config.riskLevel; // 1-5 scale
        this.potentialReturn = config.potentialReturn; // multiple
        
        // Investment tracking
        this.investmentAmount = 0;
        this.investors = [];
        this.investmentQuarter = 0;
        this.investmentYear = 0;
        
        // Status tracking
        this.active = true;
        this.exitStatus = null; // null, 'acquired', 'ipo', 'failed'
        this.exitMultiple = 0;
        this.failureReason = null;
        
        // Performance tracking
        this.quartersSinceInvestment = 0;
        this.performanceHistory = [];
    }
    
    /**
     * Receive an investment from a fund
     * @param {number} amount - Investment amount in millions
     * @param {Fund} fund - The investing fund
     */
    receiveInvestment(amount, fund) {
        this.investmentAmount += amount;
        this.investors.push({
            fund: fund,
            amount: amount,
            isFollowOn: false
        });
        
        // Record when the investment was made
        this.investmentQuarter = fund.currentQuarter;
        this.investmentYear = fund.currentYear;
        
        // Update runway based on new capital
        this.runway += Math.floor(amount / this.burnRate);
    }
    
    /**
     * Receive a follow-on investment
     * @param {number} amount - Investment amount in millions
     * @param {Fund} fund - The investing fund
     */
    receiveFollowOnInvestment(amount, fund) {
        this.investmentAmount += amount;
        this.investors.push({
            fund: fund,
            amount: amount,
            isFollowOn: true
        });
        
        // Update runway based on new capital
        this.runway += Math.floor(amount / this.burnRate);
        
        // Boost growth rate due to additional capital
        this.growthRate *= 1.1;
    }
    
    /**
     * Simulate startup performance for a quarter
     * @param {object} marketConditions - Current market conditions
     * @returns {object} - Performance update
     */
    simulateQuarter(marketConditions = {}) {
        if (!this.active) {
            return null;
        }
        
        this.quartersSinceInvestment++;
        this.runway--;
        
        // Base performance factors
        let performanceFactor = (Math.random() * 0.4) + 0.8; // 0.8 to 1.2 random factor
        
        // Adjust for market conditions
        if (marketConditions.valuationMultiplier) {
            performanceFactor *= marketConditions.valuationMultiplier;
        }
        
        // Industry-specific market conditions
        if (marketConditions.industrySpecific && 
            marketConditions.industries && 
            marketConditions.industries[this.industry]) {
            const industryImpact = marketConditions.industries[this.industry];
            if (industryImpact.valuationMultiplier) {
                performanceFactor *= industryImpact.valuationMultiplier;
            }
        }
        
        // Update metrics
        this.revenue *= (1 + (this.growthRate / 100) * performanceFactor);
        this.valuation *= (1 + (this.growthRate / 200) * performanceFactor);
        
        // Adjust growth rate over time (regression to the mean)
        if (this.growthRate > 50) {
            this.growthRate *= 0.95; // Growth slows down for high-growth startups
        }
        
        // Record performance
        const performance = {
            quarter: this.quartersSinceInvestment,
            revenue: this.revenue,
            valuation: this.valuation,
            growthRate: this.growthRate,
            performanceFactor
        };
        
        this.performanceHistory.push(performance);
        
        return performance;
    }
    
    /**
     * Check if the startup should exit this quarter
     * @param {number} baseExitRate - Base probability of exit
     * @param {object} marketConditions - Current market conditions
     * @returns {object|null} - Exit details or null if no exit
     */
    checkForExit(baseExitRate, marketConditions = {}) {
        if (!this.active) {
            return null;
        }
        
        // Calculate exit probability
        let exitProbability = baseExitRate;
        
        // Adjust for time since investment (more likely as time passes)
        exitProbability += (this.quartersSinceInvestment / 40); // +2.5% per year
        
        // Adjust for market conditions
        if (marketConditions.exitRateModifier) {
            exitProbability += marketConditions.exitRateModifier;
        }
        
        // Adjust for industry-specific conditions
        if (marketConditions.industrySpecific && 
            marketConditions.industries && 
            marketConditions.industries[this.industry] &&
            marketConditions.industries[this.industry].exitRateModifier) {
            exitProbability += marketConditions.industries[this.industry].exitRateModifier;
        }
        
        // Check if exit occurs
        if (Math.random() < exitProbability) {
            // Determine exit type
            const exitType = this.determineExitType();
            
            // Calculate exit multiple
            let multipleRange = exitType.returnMultiplierRange;
            let baseMultiple = multipleRange[0] + (Math.random() * (multipleRange[1] - multipleRange[0]));
            
            // Adjust for startup quality
            const qualityFactor = (this.teamQuality + this.productQuality + this.marketSize + 
                                  this.traction + this.businessModel) / 25; // 0.2 to 1.0
            baseMultiple *= (0.5 + qualityFactor);
            
            // Adjust for market conditions
            if (marketConditions.exitValueMultiplier) {
                baseMultiple *= marketConditions.exitValueMultiplier;
            }
            
            // Adjust for industry-specific exit values
            if (marketConditions.industrySpecific && 
                marketConditions.industries && 
                marketConditions.industries[this.industry] &&
                marketConditions.industries[this.industry].exitValueMultiplier) {
                baseMultiple *= marketConditions.industries[this.industry].exitValueMultiplier;
            }
            
            // Record exit
            this.active = false;
            this.exitStatus = exitType.type.toLowerCase().split(' ')[0];
            this.exitMultiple = baseMultiple;
            
            return {
                type: exitType.type,
                multiple: baseMultiple,
                description: exitType.description
            };
        }
        
        return null;
    }
    
    /**
     * Check if the startup fails this quarter
     * @param {number} baseFailureRate - Base probability of failure
     * @param {object} marketConditions - Current market conditions
     * @returns {object|null} - Failure details or null if no failure
     */
    checkForFailure(baseFailureRate, marketConditions = {}) {
        if (!this.active) {
            return null;
        }
        
        // Calculate failure probability
        let failureProbability = baseFailureRate;
        
        // Runway-based failure risk
        if (this.runway <= 0) {
            failureProbability += 0.5; // 50% chance of failure if out of runway
        } else if (this.runway <= 2) {
            failureProbability += 0.2; // 20% additional chance if low runway
        }
        
        // Adjust for market conditions
        if (marketConditions.failureRateModifier) {
            failureProbability += marketConditions.failureRateModifier;
        }
        
        // Adjust for industry-specific conditions
        if (marketConditions.industrySpecific && 
            marketConditions.industries && 
            marketConditions.industries[this.industry] &&
            marketConditions.industries[this.industry].failureRateModifier) {
            failureProbability += marketConditions.industries[this.industry].failureRateModifier;
        }
        
        // Check if failure occurs
        if (Math.random() < failureProbability) {
            // Determine failure reason
            const failureScenario = this.determineFailureReason();
            
            // Record failure
            this.active = false;
            this.exitStatus = 'failed';
            this.failureReason = failureScenario.type;
            
            return {
                reason: failureScenario.type,
                description: failureScenario.description
            };
        }
        
        return null;
    }
    
    /**
     * Determine the type of exit based on weighted probabilities
     * @returns {object} - The selected exit type
     */
    determineExitType() {
        const rand = Math.random();
        let cumulativeProbability = 0;
        
        for (const exitType of EXIT_TYPES) {
            cumulativeProbability += exitType.probability;
            if (rand < cumulativeProbability) {
                return exitType;
            }
        }
        
        // Default to the first exit type if something goes wrong
        return EXIT_TYPES[0];
    }
    
    /**
     * Determine the reason for failure based on weighted probabilities
     * @returns {object} - The selected failure scenario
     */
    determineFailureReason() {
        const rand = Math.random();
        let cumulativeProbability = 0;
        
        for (const scenario of FAILURE_SCENARIOS) {
            cumulativeProbability += scenario.probability;
            if (rand < cumulativeProbability) {
                return scenario;
            }
        }
        
        // Default to the first failure scenario if something goes wrong
        return FAILURE_SCENARIOS[0];
    }
    
    /**
     * Calculate the current return multiple based on valuation growth
     * @returns {number} - The current multiple of the initial investment
     */
    getCurrentMultiple() {
        if (this.exitStatus) {
            return this.exitMultiple;
        }
        
        // Calculate based on valuation growth
        const initialValuation = this.performanceHistory.length > 0 
            ? this.performanceHistory[0].valuation 
            : this.valuation;
            
        return this.valuation / initialValuation;
    }
}

/**
 * Class representing a market event that impacts the simulation
 */
class MarketEvent {
    constructor(event) {
        this.title = event.title;
        this.description = event.description;
        this.impact = event.impact;
        this.startQuarter = 0;
        this.startYear = 0;
        this.duration = event.duration || 4; // Default to 4 quarters
        this.active = false;
        this.currentPhase = 0; // For mixed events with phases
    }
    
    /**
     * Activate the market event
     * @param {number} quarter - Current quarter
     * @param {number} year - Current year
     */
    activate(quarter, year) {
        this.startQuarter = quarter;
        this.startYear = year;
        this.active = true;
    }
    
    /**
     * Check if the event is still active
     * @param {number} currentQuarter - Current quarter
     * @param {number} currentYear - Current year
     * @returns {boolean} - Whether the event is still active
     */
    isActive(currentQuarter, currentYear) {
        if (!this.active) {
            return false;
        }
        
        const startTotalQuarters = (this.startYear - 1) * 4 + this.startQuarter;
        const currentTotalQuarters = (currentYear - 1) * 4 + currentQuarter;
        const quartersDifference = currentTotalQuarters - startTotalQuarters;
        
        if (this.impact.type === 'mixed' && this.impact.phases) {
            // For events with multiple phases
            let totalDuration = 0;
            for (const phase of this.impact.phases) {
                totalDuration += phase.duration;
            }
            
            if (quartersDifference >= totalDuration) {
                this.active = false;
                return false;
            }
            
            // Determine current phase
            let phaseBoundary = 0;
            for (let i = 0; i < this.impact.phases.length; i++) {
                phaseBoundary += this.impact.phases[i].duration;
                if (quartersDifference < phaseBoundary) {
                    this.currentPhase = i;
                    break;
                }
            }
            
            return true;
        } else {
            // For simple events
            if (quartersDifference >= this.duration) {
                this.active = false;
                return false;
            }
            return true;
        }
    }
    
    /**
     * Get the current market conditions from this event
     * @returns {object} - Market condition modifiers
     */
    getCurrentConditions() {
        if (!this.active) {
            return {};
        }
        
        if (this.impact.type === 'mixed' && this.impact.phases) {
            return this.impact.phases[this.currentPhase];
        } else {
            // Filter out non-numeric properties
            const conditions = {};
            for (const key in this.impact) {
                if (typeof this.impact[key] === 'number' || 
                    typeof this.impact[key] === 'object') {
                    conditions[key] = this.impact[key];
                }
            }
            return conditions;
        }
    }
}

/**
 * Generate a random startup for deal flow
 * @param {object} fundConfig - Configuration of the fund for targeting
 * @param {number} year - Current year in simulation
 * @param {number} quarter - Current quarter in simulation
 * @returns {Startup} - A new startup instance
 */
function generateRandomStartup(fundConfig, year, quarter) {
    // Generate name
    const nameIndex = Math.floor(Math.random() * STARTUP_DATA.names.length);
    const suffixIndex = Math.floor(Math.random() * STARTUP_DATA.suffixes.length);
    const name = `${STARTUP_DATA.names[nameIndex]} ${STARTUP_DATA.suffixes[suffixIndex]}`;
    
    // Select industry (biased toward fund's focus)
    let industry;
    if (fundConfig.industries.length > 0 && Math.random() < 0.7) {
        // 70% chance to be in fund's focus industries
        const index = Math.floor(Math.random() * fundConfig.industries.length);
        industry = fundConfig.industries[index];
    } else {
        // 30% chance to be in any industry
        const industries = Object.keys(INDUSTRY_DATA);
        const index = Math.floor(Math.random() * industries.length);
        industry = industries[index];
    }
    
    // Select geography (biased toward fund's focus)
    let geography;
    if (fundConfig.geography !== 'global' && Math.random() < 0.7) {
        // 70% chance to be in fund's focus geography
        geography = fundConfig.geography;
    } else {
        // 30% chance to be in any geography
        const geographies = Object.keys(GEO_DATA);
        const index = Math.floor(Math.random() * geographies.length);
        geography = geographies[index];
    }
    
    // Select stage (biased toward fund's focus)
    let stage;
    if (fundConfig.stage !== 'multi-stage' && Math.random() < 0.7) {
        // 70% chance to be in fund's focus stage
        stage = fundConfig.stage;
    } else {
        // 30% chance to be in any stage
        const stages = Object.keys(STAGE_DATA);
        const index = Math.floor(Math.random() * stages.length);
        stage = stages[index];
    }
    
    // Get description
    const descriptions = STARTUP_DATA.descriptions[industry];
    const descriptionIndex = Math.floor(Math.random() * descriptions.length);
    const description = descriptions[descriptionIndex];
    
    // Generate quality metrics (1-5 scale)
    const teamQuality = (Math.random() * 3) + 2; // 2-5 range
    const productQuality = (Math.random() * 4) + 1; // 1-5 range
    const marketSize = (Math.random() * 4) + 1; // 1-5 range
    const traction = (Math.random() * 4) + 1; // 1-5 range
    const businessModel = (Math.random() * 4) + 1; // 1-5 range
    
    // Financial metrics based on stage
    let valuation, revenue, growthRate, burnRate, runway;
    
    switch (stage) {
        case 'seed':
            valuation = (Math.random() * 4) + 1; // $1-5M
            revenue = Math.random() * 0.5; // $0-0.5M
            growthRate = (Math.random() * 100) + 50; // 50-150%
            burnRate = (Math.random() * 0.3) + 0.1; // $0.1-0.4M per quarter
            runway = Math.floor((Math.random() * 4) + 2); // 2-6 quarters
            break;
        case 'series-a':
            valuation = (Math.random() * 20) + 10; // $10-30M
            revenue = (Math.random() * 2) + 0.5; // $0.5-2.5M
            growthRate = (Math.random() * 80) + 40; // 40-120%
            burnRate = (Math.random() * 0.7) + 0.3; // $0.3-1M per quarter
            runway = Math.floor((Math.random() * 4) + 3); // 3-7 quarters
            break;
        case 'series-b':
            valuation = (Math.random() * 30) + 30; // $30-60M
            revenue = (Math.random() * 7) + 3; // $3-10M
            growthRate = (Math.random() * 60) + 30; // 30-90%
            burnRate = (Math.random() * 2) + 1; // $1-3M per quarter
            runway = Math.floor((Math.random() * 4) + 4); // 4-8 quarters
            break;
        case 'growth':
            valuation = (Math.random() * 150) + 100; // $100-250M
            revenue = (Math.random() * 40) + 10; // $10-50M
            growthRate = (Math.random() * 40) + 20; // 20-60%
            burnRate = (Math.random() * 5) + 2; // $2-7M per quarter
            runway = Math.floor((Math.random() * 6) + 4); // 4-10 quarters
            break;
        default: // multi-stage or fallback
            valuation = (Math.random() * 50) + 5; // $5-55M
            revenue = (Math.random() * 10) + 0.5; // $0.5-10.5M
            growthRate = (Math.random() * 70) + 30; // 30-100%
            burnRate = (Math.random() * 2) + 0.5; // $0.5-2.5M per quarter
            runway = Math.floor((Math.random() * 4) + 3); // 3-7 quarters
    }
    
    // Risk and return characteristics
    const riskLevel = 6 - Math.min(teamQuality, productQuality); // 1-5 scale (inverted from quality)
    const potentialReturn = (Math.random() * 5) + (6 - STAGE_DATA[stage].riskLevel); // Higher for earlier stages
    
    return new Startup({
        name,
        industry,
        stage,
        geography,
        description,
        teamQuality,
        productQuality,
        marketSize,
        traction,
        businessModel,
        valuation,
        revenue,
        growthRate,
        burnRate,
        runway,
        riskLevel,
        potentialReturn
    });
}
