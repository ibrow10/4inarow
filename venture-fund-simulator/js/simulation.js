/**
 * Venture Fund Simulator - Simulation Module
 * Handles the game simulation logic and state management
 */

class GameSimulation {
    constructor() {
        this.fund = null;
        this.currentDeals = [];
        this.activeMarketEvents = [];
        this.gamePhase = 'setup'; // setup, simulation, results
        this.gameOver = false;
        this.dealHistory = [];
        this.eventHistory = [];
        this.lessonLearned = [];
    }

    /**
     * Initialize a new fund based on user configuration
     * @param {object} config - Fund configuration from setup form
     */
    initializeFund(config) {
        console.log('Initializing fund with config:', config);
        
        try {
            this.fund = new Fund(config);
            console.log('Fund created:', this.fund);
            
            this.gamePhase = 'simulation';
            this.gameOver = false;
            this.currentDeals = [];
            this.activeMarketEvents = [];
            this.dealHistory = [];
            this.eventHistory = [];
            this.lessonLearned = [];
            
            // Generate initial deal flow
            console.log('Generating initial deal flow...');
            this.generateDealFlow();
            
            // Save game state
            console.log('Saving game state...');
            this.saveGameState();
            
            return this.fund;
        } catch (error) {
            console.error('Error initializing fund:', error);
            throw error;
        }
    }

    /**
     * Generate new deal flow for the current quarter
     */
    generateDealFlow() {
        // Clear current deals
        this.currentDeals = [];
        
        // Determine number of deals this quarter
        const minDeals = GAME_CONSTANTS.MIN_DEALS_PER_QUARTER;
        const maxDeals = GAME_CONSTANTS.MAX_DEALS_PER_QUARTER;
        const numDeals = Math.floor(Math.random() * (maxDeals - minDeals + 1)) + minDeals;
        
        // Get companies from the database that match our fund's focus
        const companiesFromDB = getRandomCompanies(numDeals, {
            industry: this.fund.industries,
            geography: this.fund.geography,
            stage: this.fund.stage
        });
        
        // Convert database companies to Startup objects
        for (const companyData of companiesFromDB) {
            const startup = new Startup({
                name: companyData.name,
                industry: companyData.industry,
                stage: companyData.stage,
                geography: companyData.geography,
                description: companyData.description,
                teamQuality: companyData.teamQuality,
                productQuality: companyData.productQuality,
                marketSize: companyData.marketSize,
                traction: companyData.traction,
                businessModel: companyData.businessModel,
                valuation: companyData.valuation,
                revenue: companyData.revenue,
                growthRate: companyData.growthRate,
                burnRate: companyData.burnRate,
                runway: companyData.runway,
                riskLevel: companyData.riskLevel,
                potentialReturn: companyData.potentialReturn
            });
            
            this.currentDeals.push(startup);
        }
        
        return this.currentDeals;
    }

    /**
     * Evaluate a deal and return the fund's score
     * @param {Startup} startup - The startup to evaluate
     * @returns {number} - Score from 0-100
     */
    evaluateDeal(startup) {
        return this.fund.evaluateStartup(startup);
    }

    /**
     * Make an investment in a startup
     * @param {Startup} startup - The startup to invest in
     * @returns {boolean} - Whether the investment was successful
     */
    makeInvestment(startup) {
        // Default to the fund's average check size
        const amount = this.fund.checkSize;
        
        // Make the investment
        const success = this.fund.investInStartup(startup, amount);
        
        if (success) {
            // Remove from current deals
            const index = this.currentDeals.findIndex(s => s.id === startup.id);
            if (index !== -1) {
                this.currentDeals.splice(index, 1);
            }
            
            // Add to deal history
            this.dealHistory.push({
                type: 'investment',
                startup: startup,
                amount: amount,
                year: this.fund.currentYear,
                quarter: this.fund.currentQuarter
            });
            
            // Save game state
            this.saveGameState();
        }
        
        return success;
    }

    /**
     * Make a follow-on investment in an existing portfolio company
     * @param {Startup} startup - The startup to invest in
     * @param {number} amount - Investment amount in millions
     * @returns {boolean} - Whether the investment was successful
     */
    makeFollowOnInvestment(startup, amount) {
        // Make the follow-on investment
        const success = this.fund.makeFollowOnInvestment(startup, amount);
        
        if (success) {
            // Add to deal history
            this.dealHistory.push({
                type: 'follow-on',
                startup: startup,
                amount: amount,
                year: this.fund.currentYear,
                quarter: this.fund.currentQuarter
            });
            
            // Save game state
            this.saveGameState();
        }
        
        return success;
    }

    /**
     * Pass on a deal (decline to invest)
     * @param {Startup} startup - The startup to pass on
     */
    passDeal(startup) {
        // Add to passed deals
        this.fund.passedDeals.push(startup);
        
        // Remove from current deals
        const index = this.currentDeals.findIndex(s => s.id === startup.id);
        if (index !== -1) {
            this.currentDeals.splice(index, 1);
        }
        
        // Add to deal history
        this.dealHistory.push({
            type: 'pass',
            startup: startup,
            year: this.fund.currentYear,
            quarter: this.fund.currentQuarter
        });
        
        // Save game state
        this.saveGameState();
    }

    /**
     * Advance the simulation to the next quarter
     */
    advanceQuarter() {
        // Process current portfolio companies
        this.simulatePortfolioPerformance();
        
        // Process market events
        this.processMarketEvents();
        
        // Advance fund to next quarter
        this.fund.advanceQuarter();
        
        // Check if game is over
        if (this.fund.currentYear > GAME_CONSTANTS.SIMULATION_YEARS) {
            this.endGame();
            return;
        }
        
        // Check if we need to auto-simulate (after year 1)
        if (this.fund.currentYear > 1) {
            // Auto-simulate this quarter
            this.autoSimulateQuarter();
        } else {
            // Generate new deal flow for manual decisions in year 1
            this.generateDealFlow();
        }
        
        // Save game state
        this.saveGameState();
    }
    
    /**
     * Auto-simulate a quarter (for years 2-10)
     */
    autoSimulateQuarter() {
        console.log(`Auto-simulating Year ${this.fund.currentYear}, Quarter ${this.fund.currentQuarter}`);
        
        // Generate deals but automatically make investment decisions
        const deals = this.generateDealFlow();
        
        // Auto-invest in deals that score above threshold
        const INVESTMENT_THRESHOLD = 70; // Only invest in deals that score 70+
        const MAX_INVESTMENTS_PER_QUARTER = 1; // Limit investments per quarter
        
        let investmentsMade = 0;
        
        for (const deal of deals) {
            // Skip if we've reached max investments for this quarter
            if (investmentsMade >= MAX_INVESTMENTS_PER_QUARTER) {
                this.passDeal(deal);
                continue;
            }
            
            // Evaluate the deal
            const score = this.evaluateDeal(deal);
            
            // Invest if score is above threshold and we have capital
            if (score >= INVESTMENT_THRESHOLD && this.fund.availableCapital >= this.fund.checkSize) {
                console.log(`Auto-investing in ${deal.name} with score ${score}`);
                this.makeInvestment(deal);
                investmentsMade++;
                
                // Add to event history
                this.eventHistory.push({
                    type: 'auto-investment',
                    startup: deal,
                    score: score,
                    year: this.fund.currentYear,
                    quarter: this.fund.currentQuarter
                });
            } else {
                this.passDeal(deal);
            }
        }
        
        // Consider follow-on investments for existing portfolio
        this.considerAutoFollowOn();
    }
    
    /**
     * Consider making follow-on investments in existing portfolio companies
     */
    considerAutoFollowOn() {
        // Only make follow-on investments if we have reserved capital
        if (this.fund.reservedCapital <= 0) return;
        
        // Consider each portfolio company for follow-on
        for (const startup of this.fund.portfolio) {
            // Only consider companies that have been in portfolio for at least 4 quarters
            if (startup.quartersSinceInvestment < 4) continue;
            
            // Only consider companies that are performing well
            const currentMultiple = startup.getCurrentMultiple();
            if (currentMultiple < 1.5) continue;
            
            // 30% chance of making a follow-on investment in qualifying companies
            if (Math.random() < 0.3) {
                // Calculate follow-on amount (typically 1-2x original investment)
                const followOnAmount = Math.min(
                    startup.investmentAmount * (1 + Math.random()),
                    this.fund.reservedCapital
                );
                
                // Make the follow-on investment
                const success = this.makeFollowOnInvestment(startup, followOnAmount);
                
                if (success) {
                    console.log(`Made follow-on investment of $${followOnAmount}M in ${startup.name}`);
                    
                    // Add to event history
                    this.eventHistory.push({
                        type: 'auto-follow-on',
                        startup: startup,
                        amount: followOnAmount,
                        year: this.fund.currentYear,
                        quarter: this.fund.currentQuarter
                    });
                    
                    // Only make one follow-on per quarter
                    break;
                }
            }
        }
    }

    /**
     * Simulate the performance of all portfolio companies for the current quarter
     */
    simulatePortfolioPerformance() {
        // Get current market conditions
        const marketConditions = this.getCurrentMarketConditions();
        
        // Process each portfolio company
        for (let i = this.fund.portfolio.length - 1; i >= 0; i--) {
            const startup = this.fund.portfolio[i];
            
            // Simulate quarter performance
            startup.simulateQuarter(marketConditions);
            
            // Check for exit
            const exitResult = startup.checkForExit(
                GAME_CONSTANTS.BASE_EXIT_RATE,
                marketConditions
            );
            
            if (exitResult) {
                // Process exit
                this.fund.processExit(startup, exitResult.multiple);
                
                // Add to event history
                this.eventHistory.push({
                    type: 'exit',
                    startup: startup,
                    details: exitResult,
                    year: this.fund.currentYear,
                    quarter: this.fund.currentQuarter
                });
                
                continue; // Skip failure check if exited
            }
            
            // Check for failure
            const failureResult = startup.checkForFailure(
                GAME_CONSTANTS.BASE_FAILURE_RATE,
                marketConditions
            );
            
            if (failureResult) {
                // Process failure
                this.fund.processFailure(startup);
                
                // Add to event history
                this.eventHistory.push({
                    type: 'failure',
                    startup: startup,
                    details: failureResult,
                    year: this.fund.currentYear,
                    quarter: this.fund.currentQuarter
                });
            }
        }
    }

    /**
     * Process market events for the current quarter
     */
    processMarketEvents() {
        // Update existing market events
        for (let i = this.activeMarketEvents.length - 1; i >= 0; i--) {
            const event = this.activeMarketEvents[i];
            
            // Check if event is still active
            if (!event.isActive(this.fund.currentQuarter, this.fund.currentYear)) {
                // Event has ended
                this.activeMarketEvents.splice(i, 1);
                
                // Add to event history
                this.eventHistory.push({
                    type: 'event-end',
                    event: event,
                    year: this.fund.currentYear,
                    quarter: this.fund.currentQuarter
                });
            }
        }
        
        // Chance for new market event
        if (Math.random() < GAME_CONSTANTS.MARKET_EVENT_CHANCE) {
            // Select a random market event
            const eventIndex = Math.floor(Math.random() * MARKET_EVENTS.length);
            const eventTemplate = MARKET_EVENTS[eventIndex];
            
            // Create new event instance
            const newEvent = new MarketEvent(eventTemplate);
            newEvent.activate(this.fund.currentQuarter, this.fund.currentYear);
            
            // Add to active events
            this.activeMarketEvents.push(newEvent);
            
            // Add to event history
            this.eventHistory.push({
                type: 'event-start',
                event: newEvent,
                year: this.fund.currentYear,
                quarter: this.fund.currentQuarter
            });
        }
    }

    /**
     * Get the combined market conditions from all active events
     * @returns {object} - Combined market conditions
     */
    getCurrentMarketConditions() {
        // Start with neutral conditions
        const conditions = {
            valuationMultiplier: 1.0,
            exitRateModifier: 0,
            failureRateModifier: 0,
            industries: {}
        };
        
        // No active events
        if (this.activeMarketEvents.length === 0) {
            return conditions;
        }
        
        // Process each active event
        for (const event of this.activeMarketEvents) {
            const eventConditions = event.getCurrentConditions();
            
            // Apply general modifiers
            if (eventConditions.valuationMultiplier) {
                conditions.valuationMultiplier *= eventConditions.valuationMultiplier;
            }
            
            if (eventConditions.exitRateModifier) {
                conditions.exitRateModifier += eventConditions.exitRateModifier;
            }
            
            if (eventConditions.failureRateModifier) {
                conditions.failureRateModifier += eventConditions.failureRateModifier;
            }
            
            // Apply industry-specific modifiers
            if (eventConditions.industries) {
                for (const industry in eventConditions.industries) {
                    if (!conditions.industries[industry]) {
                        conditions.industries[industry] = {};
                    }
                    
                    const industryImpact = eventConditions.industries[industry];
                    
                    for (const key in industryImpact) {
                        if (!conditions.industries[industry][key]) {
                            conditions.industries[industry][key] = industryImpact[key];
                        } else {
                            // For multipliers, multiply them
                            if (key.includes('Multiplier')) {
                                conditions.industries[industry][key] *= industryImpact[key];
                            } 
                            // For modifiers, add them
                            else if (key.includes('Modifier')) {
                                conditions.industries[industry][key] += industryImpact[key];
                            }
                        }
                    }
                }
            }
        }
        
        return conditions;
    }

    /**
     * End the game and calculate final results
     */
    endGame() {
        this.gamePhase = 'results';
        this.gameOver = true;
        
        // Calculate additional performance metrics
        this.calculateFinalPerformanceMetrics();
        
        // Generate lessons learned
        this.generateLessonsLearned();
        
        // Save game state
        this.saveGameState();
    }
    
    /**
     * Calculate final performance metrics including TVPI, DPI, and final IRR
     */
    calculateFinalPerformanceMetrics() {
        // Calculate Total Value to Paid-In (TVPI)
        const totalValue = this.fund.returns + this.fund.deployedCapital;
        this.fund.tvpi = totalValue / this.fund.deployedCapital || 0;
        
        // Calculate Distributions to Paid-In (DPI)
        // For simplicity, assume all returns are distributed
        this.fund.dpi = this.fund.returns / this.fund.deployedCapital || 0;
        
        // Final IRR calculation (simplified)
        // In a real system, this would use a proper IRR calculation
        this.fund.finalIrr = this.fund.irr;
        
        // Calculate fund grade based on performance compared to market
        this.calculateFundGrade();
    }
    
    /**
     * Calculate the fund's grade (A-E) based on performance against market
     */
    calculateFundGrade() {
        const tvpi = this.fund.tvpi;
        
        // Define market benchmark TVPI based on fund stage and industries
        let benchmarkTvpi = 2.0; // Default benchmark
        
        // Adjust benchmark based on fund stage
        if (this.fund.stage === 'seed') {
            benchmarkTvpi = 2.5;
        } else if (this.fund.stage === 'series-a') {
            benchmarkTvpi = 2.2;
        } else if (this.fund.stage === 'series-b') {
            benchmarkTvpi = 2.0;
        } else if (this.fund.stage === 'growth') {
            benchmarkTvpi = 1.8;
        }
        
        // Calculate performance relative to benchmark
        const relativePerformance = tvpi / benchmarkTvpi;
        
        // Assign grade based on relative performance
        if (relativePerformance >= 1.5) {
            this.fund.grade = 'A';
        } else if (relativePerformance >= 1.2) {
            this.fund.grade = 'B';
        } else if (relativePerformance >= 0.9) {
            this.fund.grade = 'C';
        } else if (relativePerformance >= 0.6) {
            this.fund.grade = 'D';
        } else {
            this.fund.grade = 'E';
        }
    }

    /**
     * Generate lessons learned based on fund performance
     */
    generateLessonsLearned() {
        const fund = this.fund;
        this.lessonLearned = [];
        
        // Lesson about overall performance
        if (fund.irr >= fund.targetIRR) {
            this.lessonLearned.push({
                title: "Strong Fund Performance",
                description: `Your fund achieved an IRR of ${fund.irr.toFixed(1)}%, exceeding your target of ${fund.targetIRR}%. Your investment thesis and strategy were effective.`
            });
        } else {
            this.lessonLearned.push({
                title: "Underperformance",
                description: `Your fund achieved an IRR of ${fund.irr.toFixed(1)}%, below your target of ${fund.targetIRR}%. Consider refining your investment thesis or decision-making process.`
            });
        }
        
        // Lesson about portfolio construction
        const portfolioSize = fund.totalInvestments;
        const targetSize = fund.targetInvestments;
        
        if (portfolioSize < targetSize * 0.7) {
            this.lessonLearned.push({
                title: "Insufficient Diversification",
                description: `You made ${portfolioSize} investments, well below your target of ${targetSize}. This limited your chances of finding breakout successes.`
            });
        } else if (portfolioSize > targetSize * 1.3) {
            this.lessonLearned.push({
                title: "Overdiversification",
                description: `You made ${portfolioSize} investments, well above your target of ${targetSize}. This may have spread your capital and attention too thin.`
            });
        }
        
        // Lesson about success rate
        const successRate = fund.successfulExits / fund.totalInvestments;
        
        if (successRate > 0.3) {
            this.lessonLearned.push({
                title: "Strong Selection Process",
                description: `Your success rate of ${(successRate * 100).toFixed(1)}% is excellent for venture investing, indicating a strong due diligence process.`
            });
        } else if (successRate < 0.1) {
            this.lessonLearned.push({
                title: "Poor Selection Process",
                description: `Your success rate of ${(successRate * 100).toFixed(1)}% is below average, suggesting your due diligence process needs improvement.`
            });
        }
        
        // Lesson about follow-on strategy
        const followOnInvestments = this.dealHistory.filter(deal => deal.type === 'follow-on').length;
        
        if (followOnInvestments === 0 && fund.totalInvestments > 5) {
            this.lessonLearned.push({
                title: "Missed Follow-On Opportunities",
                description: "You made no follow-on investments, potentially missing the opportunity to double down on your winners."
            });
        }
        
        // Lesson about industry focus
        const industryExits = {};
        const industryFailures = {};
        
        for (const event of this.eventHistory) {
            if (event.type === 'exit' && event.startup) {
                const industry = event.startup.industry;
                industryExits[industry] = (industryExits[industry] || 0) + 1;
            } else if (event.type === 'failure' && event.startup) {
                const industry = event.startup.industry;
                industryFailures[industry] = (industryFailures[industry] || 0) + 1;
            }
        }
        
        let bestIndustry = null;
        let bestRatio = 0;
        let worstIndustry = null;
        let worstRatio = Infinity;
        
        for (const industry in industryExits) {
            const exits = industryExits[industry] || 0;
            const failures = industryFailures[industry] || 0;
            const total = exits + failures;
            
            if (total >= 3) { // Only consider industries with enough data
                const ratio = exits / total;
                
                if (ratio > bestRatio) {
                    bestRatio = ratio;
                    bestIndustry = industry;
                }
                
                if (ratio < worstRatio) {
                    worstRatio = ratio;
                    worstIndustry = industry;
                }
            }
        }
        
        if (bestIndustry) {
            this.lessonLearned.push({
                title: "Industry Strength",
                description: `Your investments in ${INDUSTRY_DATA[bestIndustry].name} performed particularly well, with a ${(bestRatio * 100).toFixed(1)}% success rate.`
            });
        }
        
        if (worstIndustry && worstRatio < 0.2) {
            this.lessonLearned.push({
                title: "Industry Weakness",
                description: `Your investments in ${INDUSTRY_DATA[worstIndustry].name} underperformed, with only a ${(worstRatio * 100).toFixed(1)}% success rate.`
            });
        }
    }

    /**
     * Save the current game state to local storage
     */
    saveGameState() {
        try {
            const gameState = {
                fund: this.fund,
                currentDeals: this.currentDeals,
                activeMarketEvents: this.activeMarketEvents,
                gamePhase: this.gamePhase,
                gameOver: this.gameOver,
                dealHistory: this.dealHistory,
                eventHistory: this.eventHistory,
                lessonLearned: this.lessonLearned
            };
            
            localStorage.setItem('ventureFundSimulator', JSON.stringify(gameState));
        } catch (error) {
            console.error('Error saving game state:', error);
        }
    }

    /**
     * Load a saved game state from local storage
     * @returns {boolean} - Whether a game state was successfully loaded
     */
    loadGameState() {
        try {
            const savedState = localStorage.getItem('ventureFundSimulator');
            
            if (!savedState) {
                return false;
            }
            
            const gameState = JSON.parse(savedState);
            
            // Restore fund
            if (gameState.fund) {
                // Create a new Fund instance with the saved properties
                this.fund = new Fund({
                    name: gameState.fund.name,
                    industries: gameState.fund.industries,
                    geography: gameState.fund.geography,
                    stage: gameState.fund.stage,
                    differentiator: gameState.fund.differentiator,
                    size: gameState.fund.size,
                    checkSize: gameState.fund.checkSize,
                    managementFee: gameState.fund.managementFee,
                    carriedInterest: gameState.fund.carriedInterest,
                    targetIRR: gameState.fund.targetIRR,
                    targetInvestments: gameState.fund.targetInvestments,
                    followOnReserve: gameState.fund.followOnReserve,
                    riskTolerance: gameState.fund.riskTolerance,
                    criteria: gameState.fund.criteria,
                    lps: gameState.fund.lps
                });
                
                // Restore runtime state
                this.fund.availableCapital = gameState.fund.availableCapital;
                this.fund.initialCapital = gameState.fund.initialCapital;
                this.fund.deployedCapital = gameState.fund.deployedCapital;
                this.fund.reservedCapital = gameState.fund.reservedCapital;
                this.fund.managementFeesCollected = gameState.fund.managementFeesCollected;
                this.fund.carriedInterestEarned = gameState.fund.carriedInterestEarned;
                this.fund.currentYear = gameState.fund.currentYear;
                this.fund.currentQuarter = gameState.fund.currentQuarter;
                this.fund.returns = gameState.fund.returns;
                this.fund.irr = gameState.fund.irr;
                this.fund.moic = gameState.fund.moic;
                this.fund.totalInvestments = gameState.fund.totalInvestments;
                this.fund.successfulExits = gameState.fund.successfulExits;
                this.fund.failedInvestments = gameState.fund.failedInvestments;
                this.fund.yearlyPerformance = gameState.fund.yearlyPerformance;
                
                // Restore portfolio
                this.fund.portfolio = [];
                if (gameState.fund.portfolio) {
                    for (const startupData of gameState.fund.portfolio) {
                        const startup = this.restoreStartup(startupData);
                        this.fund.portfolio.push(startup);
                    }
                }
                
                // Restore passed deals
                this.fund.passedDeals = [];
                if (gameState.fund.passedDeals) {
                    for (const startupData of gameState.fund.passedDeals) {
                        const startup = this.restoreStartup(startupData);
                        this.fund.passedDeals.push(startup);
                    }
                }
            }
            
            // Restore current deals
            this.currentDeals = [];
            if (gameState.currentDeals) {
                for (const startupData of gameState.currentDeals) {
                    const startup = this.restoreStartup(startupData);
                    this.currentDeals.push(startup);
                }
            }
            
            // Restore active market events
            this.activeMarketEvents = [];
            if (gameState.activeMarketEvents) {
                for (const eventData of gameState.activeMarketEvents) {
                    const event = new MarketEvent({
                        title: eventData.title,
                        description: eventData.description,
                        impact: eventData.impact,
                        duration: eventData.duration
                    });
                    
                    event.startQuarter = eventData.startQuarter;
                    event.startYear = eventData.startYear;
                    event.active = eventData.active;
                    event.currentPhase = eventData.currentPhase;
                    
                    this.activeMarketEvents.push(event);
                }
            }
            
            // Restore game state
            this.gamePhase = gameState.gamePhase;
            this.gameOver = gameState.gameOver;
            
            // Restore history
            this.dealHistory = gameState.dealHistory || [];
            this.eventHistory = gameState.eventHistory || [];
            this.lessonLearned = gameState.lessonLearned || [];
            
            // Restore startup references in history
            for (const deal of this.dealHistory) {
                if (deal.startup) {
                    deal.startup = this.restoreStartup(deal.startup);
                }
            }
            
            for (const event of this.eventHistory) {
                if (event.startup) {
                    event.startup = this.restoreStartup(event.startup);
                }
            }
            
            return true;
        } catch (error) {
            console.error('Error loading game state:', error);
            return false;
        }
    }

    /**
     * Restore a startup object from saved data
     * @param {object} data - Saved startup data
     * @returns {Startup} - Restored startup instance
     */
    restoreStartup(data) {
        const startup = new Startup({
            name: data.name,
            industry: data.industry,
            stage: data.stage,
            geography: data.geography,
            description: data.description,
            teamQuality: data.teamQuality,
            productQuality: data.productQuality,
            marketSize: data.marketSize,
            traction: data.traction,
            businessModel: data.businessModel,
            valuation: data.valuation,
            revenue: data.revenue,
            growthRate: data.growthRate,
            burnRate: data.burnRate,
            runway: data.runway,
            riskLevel: data.riskLevel,
            potentialReturn: data.potentialReturn
        });
        
        // Restore runtime state
        startup.id = data.id;
        startup.investmentAmount = data.investmentAmount;
        startup.investors = data.investors;
        startup.investmentQuarter = data.investmentQuarter;
        startup.investmentYear = data.investmentYear;
        startup.active = data.active;
        startup.exitStatus = data.exitStatus;
        startup.exitMultiple = data.exitMultiple;
        startup.failureReason = data.failureReason;
        startup.quartersSinceInvestment = data.quartersSinceInvestment;
        startup.performanceHistory = data.performanceHistory;
        
        return startup;
    }

    /**
     * Reset the game state
     */
    resetGame() {
        this.fund = null;
        this.currentDeals = [];
        this.activeMarketEvents = [];
        this.gamePhase = 'setup';
        this.gameOver = false;
        this.dealHistory = [];
        this.eventHistory = [];
        this.lessonLearned = [];
        
        // Clear saved game state
        localStorage.removeItem('ventureFundSimulator');
    }
}

// Create a global instance of the game simulation
const gameSimulation = new GameSimulation();
