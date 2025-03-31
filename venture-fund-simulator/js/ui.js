/**
 * Venture Fund Simulator - UI Module
 * Handles all UI interactions, DOM manipulations, and event listeners
 */

class UI {
    constructor() {
        console.log('Initializing UI class...');
        // Cache DOM elements
        this.gamePhases = document.getElementById('game-phases');
        this.setupPhase = document.getElementById('setup-phase');
        this.simulationPhase = document.getElementById('simulation-phase');
        this.resultsPhase = document.getElementById('results-phase');
        this.fundDashboard = document.getElementById('fund-dashboard');
        
        console.log('Game phases:', this.gamePhases);
        console.log('Setup phase:', this.setupPhase);
        console.log('Simulation phase:', this.simulationPhase);
        console.log('Results phase:', this.resultsPhase);
        
        // Deal flow elements
        this.dealContainer = document.getElementById('deal-flow-container');
        this.dealModal = document.getElementById('deal-modal');
        this.dealModalTitle = document.getElementById('deal-modal-title');
        this.dealModalBody = document.getElementById('deal-modal-body');
        this.passDealBtn = document.getElementById('pass-deal-btn');
        this.investDealBtn = document.getElementById('invest-deal-btn');
        
        // Portfolio elements
        this.portfolioContainer = document.getElementById('portfolio-container');
        this.companyModal = document.getElementById('company-modal');
        this.companyModalTitle = document.getElementById('company-modal-title');
        this.companyModalBody = document.getElementById('company-modal-body');
        this.followonBtn = document.getElementById('followon-btn');
        
        // Dashboard elements
        this.currentYear = document.getElementById('current-year');
        this.currentQuarter = document.getElementById('current-quarter');
        this.availableCapital = document.getElementById('available-capital');
        this.portfolioCount = document.getElementById('portfolio-count');
        this.currentIRR = document.getElementById('current-irr');
        this.currentMOIC = document.getElementById('current-moic');
        
        // Market events
        this.marketEventsContainer = document.getElementById('market-events');
        
        // Results elements
        this.fundPerformanceChart = document.getElementById('fund-performance-chart');
        this.investmentDistributionChart = document.getElementById('investment-distribution-chart');
        this.topInvestmentsContainer = document.getElementById('top-investments');
        this.lessonsLearnedContainer = document.getElementById('lessons-learned');
        this.restartGameBtn = document.getElementById('restart-game-btn');
        
        // Form elements
        this.fundSetupForm = document.getElementById('fund-setup-form');
        
        // Bootstrap modal instances
        this.dealModalInstance = null;
        this.companyModalInstance = null;
        
        // Charts
        this.performanceChart = null;
        this.distributionChart = null;
        
        // Current deal/company being viewed
        this.currentDeal = null;
        this.currentCompany = null;
    }
    
    /**
     * Initialize the UI
     */
    initialize() {
        // Initialize Bootstrap modals
        this.dealModalInstance = new bootstrap.Modal(this.dealModal);
        this.companyModalInstance = new bootstrap.Modal(this.companyModal);
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        console.log('Setting up event listeners...');
        console.log('Fund setup form element:', this.fundSetupForm);
        
        // Game phase navigation
        this.gamePhases.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' && !e.target.classList.contains('disabled')) {
                this.changeGamePhase(e.target.dataset.phase);
            }
        });
        
        // Fund setup form submission
        this.fundSetupForm.addEventListener('submit', (e) => {
            console.log('Form submitted!');
            e.preventDefault();
            this.processFundSetup();
        });
        
        // Deal modal buttons
        this.passDealBtn.addEventListener('click', () => {
            if (this.currentDeal) {
                gameSimulation.passDeal(this.currentDeal);
                this.dealModalInstance.hide();
                this.updateDealFlow();
            }
        });
        
        this.investDealBtn.addEventListener('click', () => {
            if (this.currentDeal) {
                const success = gameSimulation.makeInvestment(this.currentDeal);
                if (success) {
                    this.dealModalInstance.hide();
                    this.updateDealFlow();
                    this.updatePortfolio();
                    this.updateDashboard();
                } else {
                    alert('Not enough capital available for this investment!');
                }
            }
        });
        
        // Follow-on investment button
        this.followonBtn.addEventListener('click', () => {
            if (this.currentCompany) {
                const amount = prompt(`Enter follow-on investment amount (in $M). Available reserve: $${gameSimulation.fund.reservedCapital.toFixed(1)}M`, gameSimulation.fund.checkSize);
                if (amount !== null) {
                    const amountNum = parseFloat(amount);
                    if (!isNaN(amountNum) && amountNum > 0) {
                        const success = gameSimulation.makeFollowOnInvestment(this.currentCompany, amountNum);
                        if (success) {
                            this.companyModalInstance.hide();
                            this.updatePortfolio();
                            this.updateDashboard();
                        } else {
                            alert('Not enough reserved capital for this follow-on investment!');
                        }
                    }
                }
            }
        });
        
        // Next quarter button
        document.getElementById('next-quarter-btn').addEventListener('click', () => {
            gameSimulation.advanceQuarter();
            this.updateUI();
            
            // Check if game is over
            if (gameSimulation.gameOver) {
                this.changeGamePhase('results');
                this.renderResults();
            }
        });
        
        // Restart game button
        this.restartGameBtn.addEventListener('click', () => {
            this.changeGamePhase('setup');
            this.resetUI();
        });
        
        // Save game button
        document.getElementById('save-game-btn').addEventListener('click', () => {
            gameSimulation.saveGameState();
            alert('Game saved successfully!');
        });
        
        // New game button
        document.getElementById('new-game-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to start a new game? Any unsaved progress will be lost.')) {
                localStorage.removeItem('ventureFundSimulator');
                window.location.reload();
            }
        });
    }
    
    /**
     * Get fund configuration from setup form
     * @returns {object} - Fund configuration object
     */
    getFundConfig() {
        return {
            // Fund identity
            name: document.getElementById('fund-name').value,
            industries: Array.from(document.getElementById('industry-focus').selectedOptions).map(opt => opt.value),
            geography: document.getElementById('geo-focus').value,
            stage: document.getElementById('stage-focus').value,
            differentiator: document.getElementById('fund-differentiator').value,
            
            // Fund economics
            size: parseFloat(document.getElementById('fund-size').value),
            checkSize: parseFloat(document.getElementById('check-size').value),
            managementFee: parseFloat(document.getElementById('management-fee').value),
            carriedInterest: parseFloat(document.getElementById('carried-interest').value),
            targetIRR: parseFloat(document.getElementById('target-irr').value),
            
            // Investment strategy
            targetInvestments: parseInt(document.getElementById('target-investments').value),
            followOnReserve: parseFloat(document.getElementById('followon-reserve').value),
            riskTolerance: parseInt(document.getElementById('risk-tolerance').value),
            
            // Investment criteria weights
            criteria: {
                team: parseInt(document.getElementById('team-weight').value),
                market: parseInt(document.getElementById('market-weight').value),
                traction: parseInt(document.getElementById('traction-weight').value),
                product: parseInt(document.getElementById('product-weight').value),
                business: parseInt(document.getElementById('business-weight').value)
            },
            
            // LP composition
            lps: {
                institutional: parseInt(document.getElementById('institutional-lps').value),
                familyOffice: parseInt(document.getElementById('family-offices').value),
                individual: parseInt(document.getElementById('individual-lps').value)
            }
        };
    }
    
    /**
     * Change the active game phase
     * @param {string} phase - Phase to change to ('setup', 'simulation', 'results')
     */
    changeGamePhase(phase) {
        console.log(`Changing game phase to: ${phase}`);
        console.log('Setup phase element:', this.setupPhase);
        console.log('Simulation phase element:', this.simulationPhase);
        console.log('Results phase element:', this.resultsPhase);
        
        // Update navigation
        const phaseLinks = this.gamePhases.querySelectorAll('a');
        console.log('Phase links:', phaseLinks);
        phaseLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.phase === phase) {
                link.classList.add('active');
            }
        });
        
        // Hide all phases
        this.setupPhase.classList.add('d-none');
        this.setupPhase.classList.remove('active');
        this.simulationPhase.classList.add('d-none');
        this.simulationPhase.classList.remove('active');
        this.resultsPhase.classList.add('d-none');
        this.resultsPhase.classList.remove('active');
        
        // Show selected phase
        if (phase === 'setup') {
            this.setupPhase.classList.remove('d-none');
            this.setupPhase.classList.add('active');
            this.fundDashboard.classList.add('d-none');
        } else if (phase === 'simulation') {
            this.simulationPhase.classList.remove('d-none');
            this.simulationPhase.classList.add('active');
            this.fundDashboard.classList.remove('d-none');
        } else if (phase === 'results') {
            this.resultsPhase.classList.remove('d-none');
            this.resultsPhase.classList.add('active');
            
            // Render results data when switching to results tab
            if (gameSimulation.fund) {
                this.renderResults();
            }
            this.fundDashboard.classList.add('d-none');
        }
        
        // Update game phase in simulation
        if (gameSimulation) {
            gameSimulation.gamePhase = phase;
        }
    }
    
    /**
     * Update all UI elements based on current game state
     */
    updateUI() {
        this.updateDashboard();
        this.updateDealFlow();
        this.updatePortfolio();
        this.updateMarketEvents();
    }
    
    /**
     * Reset UI elements for a new game
     */
    resetUI() {
        // Clear deal flow
        this.dealContainer.innerHTML = '';
        
        // Clear portfolio
        this.portfolioContainer.innerHTML = '';
        
        // Clear market events
        this.marketEventsContainer.innerHTML = '';
        
        // Reset dashboard
        this.currentYear.textContent = '1';
        this.currentQuarter.textContent = '1';
        this.availableCapital.textContent = '0';
        this.portfolioCount.textContent = '0';
        this.currentIRR.textContent = '0';
        this.currentMOIC.textContent = '0';
    }
}

/**
 * Update the fund dashboard with current fund metrics
 */
UI.prototype.updateDashboard = function() {
    if (!gameSimulation.fund) return;
    
    this.currentYear.textContent = gameSimulation.fund.currentYear;
    this.currentQuarter.textContent = gameSimulation.fund.currentQuarter;
    this.availableCapital.textContent = gameSimulation.fund.availableCapital.toFixed(1);
    this.portfolioCount.textContent = gameSimulation.fund.portfolio.length;
    this.currentIRR.textContent = gameSimulation.fund.irr.toFixed(1);
    this.currentMOIC.textContent = gameSimulation.fund.moic.toFixed(2);
};

/**
 * Update the deal flow container with current deals
 */
UI.prototype.updateDealFlow = function() {
    if (!gameSimulation.currentDeals) return;
    
    this.dealContainer.innerHTML = '';
    
    if (gameSimulation.currentDeals.length === 0) {
        this.dealContainer.innerHTML = '<div class="alert alert-info">No deals available this quarter. Click "Next Quarter" to continue.</div>';
        return;
    }
    
    gameSimulation.currentDeals.forEach(startup => {
        const dealScore = gameSimulation.evaluateDeal(startup);
        const dealCard = this.createDealCard(startup, dealScore);
        this.dealContainer.appendChild(dealCard);
    });
};

/**
 * Create a deal card element for a startup
 * @param {Startup} startup - The startup to create a card for
 * @param {number} score - The fund's score for this startup
 * @returns {HTMLElement} - The deal card element
 */
UI.prototype.createDealCard = function(startup, score) {
    const card = document.createElement('div');
    card.className = 'deal-card';
    card.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
            <div>
                <h5>${startup.name}</h5>
                <p class="text-muted">${startup.description}</p>
            </div>
            <span class="badge bg-${this.getScoreBadgeColor(score)}">${score.toFixed(0)}</span>
        </div>
        <div>
            <span class="badge bg-primary">${INDUSTRY_DATA[startup.industry].name}</span>
            <span class="badge bg-secondary">${STAGE_DATA[startup.stage].name}</span>
            <span class="badge bg-info">${GEO_DATA[startup.geography].name}</span>
        </div>
        <div class="deal-metrics">
            <span>Valuation: $${startup.valuation}M</span>
            <span>Revenue: $${startup.revenue}M</span>
            <span>Growth: ${startup.growthRate}%</span>
        </div>
    `;
    
    card.addEventListener('click', () => {
        this.showDealDetails(startup);
    });
    
    return card;
};

/**
 * Get the appropriate badge color based on score
 * @param {number} score - The startup score
 * @returns {string} - Bootstrap color class
 */
UI.prototype.getScoreBadgeColor = function(score) {
    if (score >= 80) return 'success';
    if (score >= 60) return 'primary';
    if (score >= 40) return 'warning';
    return 'danger';
};

/**
 * Show deal details in the modal
 * @param {Startup} startup - The startup to show details for
 */
UI.prototype.showDealDetails = function(startup) {
    this.currentDeal = startup;
    
    this.dealModalTitle.textContent = startup.name;
    
    const score = gameSimulation.evaluateDeal(startup);
    
    this.dealModalBody.innerHTML = `
        <div class="company-details">
            <p>${startup.description}</p>
            <div class="badges mb-3">
                <span class="badge bg-primary">${INDUSTRY_DATA[startup.industry].name}</span>
                <span class="badge bg-secondary">${STAGE_DATA[startup.stage].name}</span>
                <span class="badge bg-info">${GEO_DATA[startup.geography].name}</span>
            </div>
        </div>
        
        <div class="metrics-row">
            <div class="metric-card">
                <span class="metric-value">$${startup.valuation}M</span>
                <span class="metric-label">Valuation</span>
            </div>
            <div class="metric-card">
                <span class="metric-value">$${startup.revenue}M</span>
                <span class="metric-label">Revenue</span>
            </div>
            <div class="metric-card">
                <span class="metric-value">${startup.growthRate}%</span>
                <span class="metric-label">Growth Rate</span>
            </div>
            <div class="metric-card">
                <span class="metric-value">${startup.burnRate.toFixed(1)}M</span>
                <span class="metric-label">Burn Rate</span>
            </div>
            <div class="metric-card">
                <span class="metric-value">${startup.runway}</span>
                <span class="metric-label">Runway (quarters)</span>
            </div>
        </div>
        
        <h5 class="mt-4">Quality Assessment</h5>
        <div class="row">
            <div class="col-md-6">
                <div class="mb-3">
                    <label class="form-label">Team Quality</label>
                    <div class="progress">
                        <div class="progress-bar bg-primary" role="progressbar" style="width: ${startup.teamQuality * 20}%" aria-valuenow="${startup.teamQuality}" aria-valuemin="0" aria-valuemax="5"></div>
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label">Product Quality</label>
                    <div class="progress">
                        <div class="progress-bar bg-success" role="progressbar" style="width: ${startup.productQuality * 20}%" aria-valuenow="${startup.productQuality}" aria-valuemin="0" aria-valuemax="5"></div>
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label">Market Size</label>
                    <div class="progress">
                        <div class="progress-bar bg-info" role="progressbar" style="width: ${startup.marketSize * 20}%" aria-valuenow="${startup.marketSize}" aria-valuemin="0" aria-valuemax="5"></div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="mb-3">
                    <label class="form-label">Traction</label>
                    <div class="progress">
                        <div class="progress-bar bg-warning" role="progressbar" style="width: ${startup.traction * 20}%" aria-valuenow="${startup.traction}" aria-valuemin="0" aria-valuemax="5"></div>
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label">Business Model</label>
                    <div class="progress">
                        <div class="progress-bar bg-danger" role="progressbar" style="width: ${startup.businessModel * 20}%" aria-valuenow="${startup.businessModel}" aria-valuemin="0" aria-valuemax="5"></div>
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label">Risk Level</label>
                    <div class="progress">
                        <div class="progress-bar bg-secondary" role="progressbar" style="width: ${startup.riskLevel * 20}%" aria-valuenow="${startup.riskLevel}" aria-valuemin="0" aria-valuemax="5"></div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="alert alert-${this.getScoreBadgeColor(score)} mt-3">
            <strong>Fund Score: ${score.toFixed(0)}/100</strong> - Based on your fund's investment criteria
        </div>
    `;
    
    this.dealModalInstance.show();
};

/**
 * Update the portfolio container with current portfolio companies
 */
UI.prototype.updatePortfolio = function() {
    if (!gameSimulation.fund) return;
    
    this.portfolioContainer.innerHTML = '';
    
    if (gameSimulation.fund.portfolio.length === 0) {
        this.portfolioContainer.innerHTML = '<div class="alert alert-info">No portfolio companies yet. Invest in startups to build your portfolio.</div>';
        return;
    }
    
    gameSimulation.fund.portfolio.forEach(company => {
        const companyCard = this.createPortfolioCard(company);
        this.portfolioContainer.appendChild(companyCard);
    });
};

/**
 * Create a portfolio card element for a company
 * @param {Startup} company - The portfolio company
 * @returns {HTMLElement} - The portfolio card element
 */
UI.prototype.createPortfolioCard = function(company) {
    const card = document.createElement('div');
    card.className = 'portfolio-company';
    
    const currentMultiple = company.getCurrentMultiple();
    const multipleClass = currentMultiple >= 1 ? 'text-success' : 'text-danger';
    
    card.innerHTML = `
        <div class="company-header">
            <h5>${company.name}</h5>
            <span class="${multipleClass}">${currentMultiple.toFixed(2)}x</span>
        </div>
        <p class="text-muted">${company.description}</p>
        <div>
            <span class="badge bg-primary">${INDUSTRY_DATA[company.industry].name}</span>
            <span class="badge bg-secondary">${STAGE_DATA[company.stage].name}</span>
            <span class="badge bg-info">${GEO_DATA[company.geography].name}</span>
        </div>
        <div class="mt-2">
            <label class="form-label">Performance</label>
            <div class="progress">
                <div class="progress-bar bg-${currentMultiple >= 1 ? 'success' : 'danger'}" role="progressbar" 
                    style="width: ${Math.min(currentMultiple * 50, 100)}%" 
                    aria-valuenow="${currentMultiple}" aria-valuemin="0" aria-valuemax="2">
                </div>
            </div>
        </div>
        <div class="company-metrics mt-2">
            <span>Invested: $${company.investmentAmount.toFixed(1)}M</span>
            <span>Current Value: $${(company.investmentAmount * currentMultiple).toFixed(1)}M</span>
            <span>Quarters Held: ${company.quartersSinceInvestment}</span>
        </div>
    `;
    
    card.addEventListener('click', () => {
        this.showCompanyDetails(company);
    });
    
    return card;
};

/**
 * Show company details in the modal
 * @param {Startup} company - The company to show details for
 */
UI.prototype.showCompanyDetails = function(company) {
    this.currentCompany = company;
    
    this.companyModalTitle.textContent = company.name;
    
    const currentMultiple = company.getCurrentMultiple();
    const multipleClass = currentMultiple >= 1 ? 'text-success' : 'text-danger';
    
    this.companyModalBody.innerHTML = `
        <div class="company-details">
            <p>${company.description}</p>
            <div class="badges mb-3">
                <span class="badge bg-primary">${INDUSTRY_DATA[company.industry].name}</span>
                <span class="badge bg-secondary">${STAGE_DATA[company.stage].name}</span>
                <span class="badge bg-info">${GEO_DATA[company.geography].name}</span>
            </div>
        </div>
        
        <div class="metrics-row">
            <div class="metric-card">
                <span class="metric-value">$${company.valuation.toFixed(1)}M</span>
                <span class="metric-label">Current Valuation</span>
            </div>
            <div class="metric-card">
                <span class="metric-value">$${company.revenue.toFixed(1)}M</span>
                <span class="metric-label">Revenue</span>
            </div>
            <div class="metric-card">
                <span class="metric-value">${company.growthRate.toFixed(1)}%</span>
                <span class="metric-label">Growth Rate</span>
            </div>
            <div class="metric-card">
                <span class="metric-value">${company.burnRate.toFixed(1)}M</span>
                <span class="metric-label">Burn Rate</span>
            </div>
            <div class="metric-card">
                <span class="metric-value">${company.runway}</span>
                <span class="metric-label">Runway (quarters)</span>
            </div>
        </div>
        
        <div class="metrics-row mt-3">
            <div class="metric-card">
                <span class="metric-value">$${company.investmentAmount.toFixed(1)}M</span>
                <span class="metric-label">Investment</span>
            </div>
            <div class="metric-card">
                <span class="metric-value">${company.quartersSinceInvestment}</span>
                <span class="metric-label">Quarters Held</span>
            </div>
            <div class="metric-card">
                <span class="metric-value ${multipleClass}">${currentMultiple.toFixed(2)}x</span>
                <span class="metric-label">Current Multiple</span>
            </div>
            <div class="metric-card">
                <span class="metric-value">$${(company.investmentAmount * currentMultiple).toFixed(1)}M</span>
                <span class="metric-label">Current Value</span>
            </div>
        </div>
        
        <h5 class="mt-4">Performance History</h5>
        <div id="company-performance-chart" style="height: 200px;"></div>
    `;
    
    // Show follow-on button if there's enough reserved capital
    if (gameSimulation.fund.reservedCapital > 0) {
        this.followonBtn.classList.remove('d-none');
    } else {
        this.followonBtn.classList.add('d-none');
    }
    
    this.companyModalInstance.show();
    
    // Render performance chart after modal is shown
    setTimeout(() => {
        this.renderCompanyPerformanceChart(company);
    }, 500);
};

/**
 * Render a chart showing company performance over time
 * @param {Startup} company - The company to show performance for
 */
UI.prototype.renderCompanyPerformanceChart = function(company) {
    const ctx = document.getElementById('company-performance-chart').getContext('2d');
    
    const labels = [];
    const valuationData = [];
    const investmentValueData = [];
    
    // Generate data points
    for (let i = 0; i <= company.quartersSinceInvestment; i++) {
        labels.push(`Q${i}`);
        
        // Use performance history if available, otherwise estimate
        if (company.performanceHistory[i]) {
            valuationData.push(company.performanceHistory[i].valuation);
            investmentValueData.push(company.performanceHistory[i].investmentValue);
        } else if (i === 0) {
            // Initial investment
            valuationData.push(company.valuation);
            investmentValueData.push(company.investmentAmount);
        }
    }
    
    // Create chart
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Company Valuation ($M)',
                    data: valuationData,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    tension: 0.1
                },
                {
                    label: 'Investment Value ($M)',
                    data: investmentValueData,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Value ($M)'
                    }
                }
            }
        }
    });
};

/**
 * Update the market events container with active events
 */
UI.prototype.updateMarketEvents = function() {
    if (!gameSimulation.activeMarketEvents) return;
    
    this.marketEventsContainer.innerHTML = '';
    
    if (gameSimulation.activeMarketEvents.length === 0) {
        this.marketEventsContainer.innerHTML = '<div class="alert alert-info">No active market events.</div>';
        return;
    }
    
    gameSimulation.activeMarketEvents.forEach(event => {
        const eventCard = this.createMarketEventCard(event);
        this.marketEventsContainer.appendChild(eventCard);
    });
};

/**
 * Create a market event card element
 * @param {MarketEvent} event - The market event to create a card for
 * @returns {HTMLElement} - The market event card element
 */
UI.prototype.createMarketEventCard = function(event) {
    const card = document.createElement('div');
    
    // Determine event type (positive/negative/neutral)
    let eventType = 'neutral';
    if (event.impact.valuationMultiplier > 1 || event.impact.exitRateMultiplier > 1) {
        eventType = 'positive';
    } else if (event.impact.valuationMultiplier < 1 || event.impact.failureRateMultiplier > 1) {
        eventType = 'negative';
    }
    
    card.className = `market-event ${eventType}`;
    card.innerHTML = `
        <div class="event-date">Started: Year ${event.startYear}, Q${event.startQuarter}</div>
        <div class="event-title">${event.title}</div>
        <p>${event.description}</p>
    `;
    
    return card;
};

/**
 * Render the results phase with fund performance data
 */
UI.prototype.renderResults = function() {
    if (!gameSimulation.fund) return;
    const fund = gameSimulation.fund;
    
    // Update fund details
    document.getElementById('result-fund-name').textContent = fund.name;
    document.getElementById('result-fund-size').textContent = fund.size;
    
    // Format industry focus
    const industryNames = fund.industries.map(ind => INDUSTRY_DATA[ind].name).join(', ');
    document.getElementById('result-fund-focus').textContent = industryNames;
    
    // Stage and geography
    document.getElementById('result-fund-stage').textContent = STAGE_DATA[fund.stage].name;
    document.getElementById('result-fund-geography').textContent = GEO_DATA[fund.geography].name;
    
    // Performance metrics
    document.getElementById('result-fund-grade').textContent = fund.grade || 'C';
    document.getElementById('result-fund-irr').textContent = fund.finalIrr ? fund.finalIrr.toFixed(1) : fund.irr.toFixed(1);
    document.getElementById('result-fund-tvpi').textContent = fund.tvpi ? fund.tvpi.toFixed(2) : '1.00';
    document.getElementById('result-fund-dpi').textContent = fund.dpi ? fund.dpi.toFixed(2) : '0.00';
    document.getElementById('result-fund-moic').textContent = fund.moic.toFixed(2);
    
    // Portfolio summary
    document.getElementById('result-total-investments').textContent = fund.totalInvestments;
    document.getElementById('result-successful-exits').textContent = fund.successfulExits;
    document.getElementById('result-failed-investments').textContent = fund.failedInvestments;
    
    // Calculate active investments
    const activeInvestments = fund.totalInvestments - fund.successfulExits - fund.failedInvestments;
    document.getElementById('result-active-investments').textContent = activeInvestments;
    
    // Render portfolio table
    this.renderPortfolioTable();
    
    // Render fund performance chart
    this.renderFundPerformanceChart();
    
    // Render investment distribution chart
    this.renderInvestmentDistributionChart();
    
    // Render top investments
    this.renderTopInvestments();
    
    // Render lessons learned
    this.renderLessonsLearned();
};

/**
 * Render the portfolio results table
 */
UI.prototype.renderPortfolioTable = function() {
    const tableBody = document.getElementById('portfolio-results-table');
    if (!tableBody) return;
    
    // Clear existing content
    tableBody.innerHTML = '';
    
    // Combine all investments from history
    const allInvestments = [];
    const investmentMap = new Map(); // To track unique investments
    
    // Process all investment events
    for (const event of gameSimulation.dealHistory) {
        if (event.type === 'investment' || event.type === 'auto-investment') {
            const startup = event.startup;
            investmentMap.set(startup.id, {
                startup: startup,
                initialInvestment: event.amount || startup.investmentAmount,
                year: event.year,
                quarter: event.quarter,
                followOnInvestments: []
            });
        } else if (event.type === 'follow-on' || event.type === 'auto-follow-on') {
            const startup = event.startup;
            const investment = investmentMap.get(startup.id);
            if (investment) {
                investment.followOnInvestments.push({
                    amount: event.amount,
                    year: event.year,
                    quarter: event.quarter
                });
            }
        }
    }
    
    // Process exit and failure events
    for (const event of gameSimulation.eventHistory) {
        if ((event.type === 'exit' || event.type === 'failure') && event.startup) {
            const investment = investmentMap.get(event.startup.id);
            if (investment) {
                investment.exitStatus = event.type;
                investment.exitDetails = event.details;
            }
        }
    }
    
    // Convert map to array and sort by year/quarter
    const investments = Array.from(investmentMap.values());
    investments.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.quarter - b.quarter;
    });
    
    // Render each investment
    for (const investment of investments) {
        const row = document.createElement('tr');
        const startup = investment.startup;
        
        // Calculate total investment amount
        let totalInvestment = investment.initialInvestment;
        for (const followOn of investment.followOnInvestments) {
            totalInvestment += followOn.amount;
        }
        
        // Determine status and return
        let status = 'Active';
        let returnMultiple = startup.getCurrentMultiple().toFixed(2) + 'x';
        let statusClass = 'text-primary';
        
        if (investment.exitStatus === 'exit') {
            status = investment.exitDetails.type;
            returnMultiple = investment.exitDetails.multiple.toFixed(2) + 'x';
            statusClass = 'text-success';
        } else if (investment.exitStatus === 'failure') {
            status = 'Failed: ' + investment.exitDetails.reason;
            returnMultiple = '0.00x';
            statusClass = 'text-danger';
        }
        
        // Create table cells
        row.innerHTML = `
            <td><strong>${startup.name}</strong></td>
            <td>${INDUSTRY_DATA[startup.industry].name}</td>
            <td>$${totalInvestment.toFixed(1)}M</td>
            <td>Y${investment.year}Q${investment.quarter}</td>
            <td class="${statusClass}">${status}</td>
            <td>${returnMultiple}</td>
        `;
        
        tableBody.appendChild(row);
    }
};

/**
 * Render the fund performance chart
 */
UI.prototype.renderFundPerformanceChart = function() {
    console.log('Rendering fund performance chart');
    
    // Get the canvas element for the performance chart
    const performanceCanvas = document.getElementById('performance-chart');
    if (!performanceCanvas) {
        console.error('Performance chart canvas not found');
        return;
    }
    
    // Get the context for the canvas
    const ctx = performanceCanvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (this.performanceChart) {
        this.performanceChart.destroy();
    }
    
    // Check if we have fund data
    if (!gameSimulation.fund) {
        console.error('No fund data available');
        return;
    }
    
    const fund = gameSimulation.fund;
    
    // Initialize arrays for chart data
    const labels = [];
    const irrData = [];
    const moicData = [];
    
    // If we have yearly performance data, use it
    if (fund.yearlyPerformance && fund.yearlyPerformance.length > 0) {
        console.log('Using yearly performance data:', fund.yearlyPerformance);
        
        // Generate data points from yearly performance
        fund.yearlyPerformance.forEach((perf, index) => {
            labels.push(`Year ${index + 1}`);
            irrData.push(perf.irr);
            moicData.push(perf.moic);
        });
    } else {
        // If no yearly data, create a simple progression
        console.log('No yearly performance data, creating simple progression');
        
        // For simplicity, create a linear progression to the final values
        const years = GAME_CONSTANTS.SIMULATION_YEARS;
        const finalIrr = fund.irr || 0;
        const finalMoic = fund.moic || 1.0;
        
        for (let i = 1; i <= years; i++) {
            labels.push(`Year ${i}`);
            
            // Create a simple progression
            const progress = i / years;
            irrData.push(finalIrr * progress);
            moicData.push(1.0 + (finalMoic - 1.0) * progress);
        }
    }
    
    console.log('Creating chart with data:', { labels, irrData, moicData });
    
    // Create chart
    try {
        this.performanceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'IRR (%)',
                        data: irrData,
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        yAxisID: 'y',
                        tension: 0.1
                    },
                    {
                        label: 'MOIC (x)',
                        data: moicData,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        yAxisID: 'y1',
                        tension: 0.1
                    }
                ]
            },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            stacked: false,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'IRR (%)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'MOIC (x)'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                },
            }
        }
    });
};

/**
 * Render the investment distribution chart
 */
UI.prototype.renderInvestmentDistributionChart = function() {
    if (!gameSimulation.fund) return;
    
    const ctx = this.investmentDistributionChart.getContext('2d');
    
    // Count investments by industry
    const industryCount = {};
    const industryColors = {
        tech: 'rgba(54, 162, 235, 0.8)',
        biotech: 'rgba(75, 192, 192, 0.8)',
        cleantech: 'rgba(255, 206, 86, 0.8)',
        fintech: 'rgba(153, 102, 255, 0.8)',
        consumer: 'rgba(255, 99, 132, 0.8)',
        enterprise: 'rgba(255, 159, 64, 0.8)'
    };
    
    // Initialize counts
    Object.keys(INDUSTRY_DATA).forEach(industry => {
        industryCount[industry] = 0;
    });
    
    // Count investments by industry
    gameSimulation.dealHistory.forEach(deal => {
        if (deal.type === 'investment' || deal.type === 'follow-on') {
            industryCount[deal.startup.industry]++;
        }
    });
    
    // Prepare chart data
    const labels = [];
    const data = [];
    const backgroundColor = [];
    
    Object.keys(industryCount).forEach(industry => {
        if (industryCount[industry] > 0) {
            labels.push(INDUSTRY_DATA[industry].name);
            data.push(industryCount[industry]);
            backgroundColor.push(industryColors[industry]);
        }
    });
    
    // Create chart
    this.distributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColor,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                },
                title: {
                    display: true,
                    text: 'Investments by Industry'
                }
            }
        }
    });
};

/**
 * Render the top investments section
 */
UI.prototype.renderTopInvestments = function() {
    if (!gameSimulation.fund) return;
    
    this.topInvestmentsContainer.innerHTML = '';
    
    // Get all exits and sort by return multiple
    const exits = gameSimulation.dealHistory.filter(deal => 
        deal.startup && deal.startup.exitStatus && 
        (deal.startup.exitStatus === 'acquired' || deal.startup.exitStatus === 'ipo')
    );
    
    if (exits.length === 0) {
        this.topInvestmentsContainer.innerHTML = '<div class="alert alert-info">No successful exits in this fund.</div>';
        return;
    }
    
    // Sort by exit multiple
    exits.sort((a, b) => b.startup.exitMultiple - a.startup.exitMultiple);
    
    // Take top 5
    const topExits = exits.slice(0, 5);
    
    // Create cards for each top exit
    topExits.forEach(exit => {
        const card = document.createElement('div');
        card.className = 'investment-card';
        card.innerHTML = `
            <div>
                <h6>${exit.startup.name}</h6>
                <div>
                    <span class="badge bg-primary">${INDUSTRY_DATA[exit.startup.industry].name}</span>
                    <span class="badge bg-secondary">${exit.startup.exitStatus === 'acquired' ? 'Acquisition' : 'IPO'}</span>
                </div>
            </div>
            <div class="investment-return text-success">${exit.startup.exitMultiple.toFixed(1)}x</div>
        `;
        
        this.topInvestmentsContainer.appendChild(card);
    });
};

/**
 * Render the lessons learned section
 */
UI.prototype.renderLessonsLearned = function() {
    if (!gameSimulation.lessonLearned || gameSimulation.lessonLearned.length === 0) {
        this.lessonsLearnedContainer.innerHTML = '<div class="alert alert-info">No lessons learned in this fund cycle.</div>';
        return;
    }
    
    this.lessonsLearnedContainer.innerHTML = '';
    
    // Create cards for each lesson
    gameSimulation.lessonLearned.forEach(lesson => {
        const card = document.createElement('div');
        card.className = 'lesson-card';
        card.innerHTML = `
            <h6>${lesson.title}</h6>
            <p>${lesson.description}</p>
        `;
        
        this.lessonsLearnedContainer.appendChild(card);
    });
};

// Note: Form handlers are now set up in setupEventListeners method

/**
 * Process fund setup form and initialize the simulation
 */
UI.prototype.processFundSetup = function() {
    console.log('Processing fund setup...');
    
    // Validate form
    const criteriaTotal = parseInt(document.getElementById('criteria-total').textContent);
    console.log('Criteria total:', criteriaTotal);
    if (criteriaTotal !== 100) {
        alert('Investment criteria weights must total 100!');
        return;
    }
    
    const lpTotal = parseInt(document.getElementById('lp-total').textContent);
    console.log('LP total:', lpTotal);
    if (lpTotal !== 100) {
        alert('LP composition percentages must total 100%!');
        return;
    }
    
    // Gather form data
    const fundConfig = {
        name: document.getElementById('fund-name').value,
        industries: Array.from(document.getElementById('industry-focus').selectedOptions).map(opt => opt.value),
        geography: document.getElementById('geo-focus').value,
        stage: document.getElementById('stage-focus').value,
        differentiator: document.getElementById('fund-differentiator').value,
        size: parseFloat(document.getElementById('fund-size').value),
        checkSize: parseFloat(document.getElementById('check-size').value),
        managementFee: parseFloat(document.getElementById('management-fee').value),
        carriedInterest: parseFloat(document.getElementById('carried-interest').value),
        targetIRR: parseFloat(document.getElementById('target-irr').value),
        targetInvestments: parseInt(document.getElementById('target-investments').value),
        followOnReserve: parseFloat(document.getElementById('followon-reserve').value),
        criteria: {
            team: parseInt(document.getElementById('team-weight').value),
            market: parseInt(document.getElementById('market-weight').value),
            traction: parseInt(document.getElementById('traction-weight').value),
            product: parseInt(document.getElementById('product-weight').value),
            business: parseInt(document.getElementById('business-weight').value)
        },
        riskTolerance: parseInt(document.getElementById('risk-tolerance').value),
        lps: {
            institutional: parseInt(document.getElementById('institutional-lps').value),
            familyOffice: parseInt(document.getElementById('family-offices').value),
            individual: parseInt(document.getElementById('individual-lps').value)
        }
    };
    
    // Initialize game simulation
    console.log('Initializing fund with config:', fundConfig);
    gameSimulation.initializeFund(fundConfig);
    
    // Update UI
    console.log('Updating UI...');
    this.updateUI();
    
    // Change to simulation phase
    console.log('Changing to simulation phase...');
    this.changeGamePhase('simulation');
    
    // Enable simulation phase in navigation
    console.log('Enabling simulation phase in navigation...');
    document.querySelector('[data-phase="simulation"]').classList.remove('disabled');
};

/**
 * Update the entire UI
 */
UI.prototype.updateUI = function() {
    // Update dashboard
    this.updateDashboard();
    
    // Update deal flow
    this.renderDealFlow();
    
    // Update portfolio
    this.renderPortfolio();
    
    // Update market events
    this.updateMarketEvents();
};

/**
 * Advance to the next quarter
 */
UI.prototype.advanceQuarter = function() {
    // Advance quarter in game simulation
    gameSimulation.advanceQuarter();
    
    // Update UI
    this.updateUI();
    
    // Check if game is over
    if (gameSimulation.gameOver) {
        // Enable results phase in navigation
        document.querySelector('[data-phase="results"]').classList.remove('disabled');
        
        // Change to results phase
        this.changeGamePhase('results');
    }
};

// Create a global instance of the UI
const ui = new UI();
