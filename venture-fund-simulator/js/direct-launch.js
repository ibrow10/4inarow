/**
 * Direct Launch Implementation
 * A simplified approach to launching the fund
 */

// Direct function to launch the fund without relying on complex object structure
function directLaunchFund() {
    console.log('Direct launch fund function called');
    
    try {
        // 1. Validate form inputs
        const criteriaTotal = parseInt(document.getElementById('criteria-total').textContent || '0');
        console.log('Criteria total:', criteriaTotal);
        if (criteriaTotal !== 100) {
            alert('Investment criteria weights must total 100!');
            return false;
        }
        
        const lpTotal = parseInt(document.getElementById('lp-total').textContent || '0');
        console.log('LP total:', lpTotal);
        if (lpTotal !== 100) {
            alert('LP composition percentages must total 100%!');
            return false;
        }
        
        // 2. Collect form data
        const fundName = document.getElementById('fund-name').value;
        console.log('Fund name:', fundName);
        
        // 3. Change to simulation phase directly
        console.log('Changing to simulation phase...');
        
        // Hide setup phase
        const setupPhase = document.getElementById('setup-phase');
        console.log('Setup phase element:', setupPhase);
        if (setupPhase) {
            setupPhase.classList.add('d-none');
        }
        
        // Show simulation phase
        const simulationPhase = document.getElementById('simulation-phase');
        console.log('Simulation phase element:', simulationPhase);
        if (simulationPhase) {
            simulationPhase.classList.remove('d-none');
            simulationPhase.style.display = 'block';
        }
        
        // Update navigation
        const phaseLinks = document.querySelectorAll('#game-phases a');
        phaseLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-phase') === 'simulation') {
                link.classList.add('active');
                link.classList.remove('disabled');
            }
        });
        
        // 4. Generate initial deals
        generateInitialDeals();
        
        return true;
    } catch (error) {
        console.error('Error in directLaunchFund:', error);
        alert('There was an error launching your fund. Please check the console for details.');
        return false;
    }
}

// Generate some initial deals for the simulation phase
function generateInitialDeals() {
    console.log('Generating initial deals...');
    
    const dealContainer = document.getElementById('deal-flow-container');
    if (!dealContainer) {
        console.error('Deal container not found');
        return;
    }
    
    // Clear existing deals
    dealContainer.innerHTML = '';
    
    // Sample deal data
    const sampleDeals = [
        {
            name: "TechNova",
            industry: "Technology",
            stage: "Seed",
            description: "AI-powered productivity platform",
            teamQuality: 4,
            marketSize: 5,
            traction: 3,
            askAmount: 2.5,
            valuation: 10
        },
        {
            name: "GreenEarth",
            industry: "CleanTech",
            stage: "Series A",
            description: "Sustainable energy solutions",
            teamQuality: 3,
            marketSize: 4,
            traction: 4,
            askAmount: 5,
            valuation: 25
        },
        {
            name: "HealthPlus",
            industry: "Healthcare",
            stage: "Seed",
            description: "Remote patient monitoring platform",
            teamQuality: 5,
            marketSize: 4,
            traction: 2,
            askAmount: 1.5,
            valuation: 8
        }
    ];
    
    // Create deal cards
    sampleDeals.forEach(deal => {
        const dealCard = document.createElement('div');
        dealCard.className = 'card mb-3 deal-card';
        dealCard.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${deal.name}</h5>
                <h6 class="card-subtitle mb-2 text-muted">${deal.industry} | ${deal.stage}</h6>
                <p class="card-text">${deal.description}</p>
                <button class="btn btn-sm btn-primary view-deal-btn">View Details</button>
            </div>
        `;
        
        // Add click event to view deal button
        dealCard.querySelector('.view-deal-btn').addEventListener('click', function() {
            showDealModal(deal);
        });
        
        dealContainer.appendChild(dealCard);
    });
    
    // Set up fund dashboard
    updateFundDashboard();
    
    // Set up next quarter button
    const nextQuarterBtn = document.getElementById('next-quarter-btn');
    if (nextQuarterBtn) {
        nextQuarterBtn.addEventListener('click', advanceQuarter);
    }
}

// Update the fund dashboard with initial values
function updateFundDashboard() {
    console.log('Updating fund dashboard...');
    
    const fundSize = document.getElementById('fund-size').value;
    
    // Show the dashboard
    const fundDashboard = document.getElementById('fund-dashboard');
    if (fundDashboard) {
        fundDashboard.classList.remove('d-none');
    }
    
    // Update dashboard elements
    document.getElementById('current-year').textContent = '1';
    document.getElementById('current-quarter').textContent = '1';
    document.getElementById('available-capital').textContent = fundSize;
    document.getElementById('portfolio-count').textContent = '0';
    document.getElementById('current-irr').textContent = '0';
    document.getElementById('current-moic').textContent = '1.0';
}

// Show deal details in a modal
function showDealModal(deal) {
    console.log('Showing deal modal for:', deal.name);
    
    // Get or create modal
    let dealModal = document.getElementById('deal-modal');
    
    if (!dealModal) {
        // Create modal if it doesn't exist
        dealModal = document.createElement('div');
        dealModal.id = 'deal-modal';
        dealModal.className = 'modal fade';
        dealModal.setAttribute('tabindex', '-1');
        dealModal.setAttribute('aria-hidden', 'true');
        
        document.body.appendChild(dealModal);
    }
    
    // Set modal content
    dealModal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title">${deal.name}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <p><strong>Industry:</strong> ${deal.industry}</p>
                            <p><strong>Stage:</strong> ${deal.stage}</p>
                            <p><strong>Ask Amount:</strong> $${deal.askAmount}M</p>
                            <p><strong>Valuation:</strong> $${deal.valuation}M</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Team Quality:</strong> ${'★'.repeat(deal.teamQuality)}${'☆'.repeat(5-deal.teamQuality)}</p>
                            <p><strong>Market Size:</strong> ${'★'.repeat(deal.marketSize)}${'☆'.repeat(5-deal.marketSize)}</p>
                            <p><strong>Traction:</strong> ${'★'.repeat(deal.traction)}${'☆'.repeat(5-deal.traction)}</p>
                        </div>
                    </div>
                    <div class="mb-3">
                        <h6>Description</h6>
                        <p>${deal.description}</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Pass</button>
                    <button type="button" class="btn btn-success" id="invest-btn">Invest $${deal.askAmount}M</button>
                </div>
            </div>
        </div>
    `;
    
    // Initialize Bootstrap modal
    try {
        const modal = new bootstrap.Modal(dealModal);
        modal.show();
    } catch (error) {
        console.error('Error showing modal:', error);
        alert(`Deal Details - ${deal.name}\n\nIndustry: ${deal.industry}\nStage: ${deal.stage}\nAsk Amount: $${deal.askAmount}M\nValuation: $${deal.valuation}M\n\nWould you like to invest?`);
        if (confirm('Invest in this deal?')) {
            investInDeal(deal);
        }
    }
    
    // Add event listener to invest button
    const investBtn = document.getElementById('invest-btn');
    if (investBtn) {
        investBtn.addEventListener('click', function() {
            investInDeal(deal);
            modal.hide();
        });
    }
}

// Invest in a deal
function investInDeal(deal) {
    console.log('Investing in deal:', deal.name);
    
    // Get available capital
    const availableCapitalEl = document.getElementById('available-capital');
    let availableCapital = parseFloat(availableCapitalEl.textContent);
    
    // Check if enough capital
    if (availableCapital < deal.askAmount) {
        alert('Not enough capital to invest in this deal!');
        return;
    }
    
    // Update available capital
    availableCapital -= deal.askAmount;
    availableCapitalEl.textContent = availableCapital.toFixed(1);
    
    // Update portfolio count
    const portfolioCountEl = document.getElementById('portfolio-count');
    let portfolioCount = parseInt(portfolioCountEl.textContent);
    portfolioCount += 1;
    portfolioCountEl.textContent = portfolioCount;
    
    // Add to portfolio companies
    addToPortfolio(deal);
    
    // Show success message
    alert(`Successfully invested $${deal.askAmount}M in ${deal.name}!`);
}

// Add a deal to the portfolio
function addToPortfolio(deal) {
    console.log('Adding to portfolio:', deal.name);
    
    const portfolioContainer = document.getElementById('portfolio-companies');
    if (!portfolioContainer) {
        console.error('Portfolio container not found');
        return;
    }
    
    // Create portfolio item
    const portfolioItem = document.createElement('div');
    portfolioItem.className = 'card mb-3';
    portfolioItem.innerHTML = `
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">${deal.name}</h5>
                <span class="badge bg-info">${deal.stage}</span>
            </div>
            <p class="card-text text-muted">${deal.industry}</p>
            <div class="d-flex justify-content-between">
                <span><strong>Investment:</strong> $${deal.askAmount}M</span>
                <span><strong>Status:</strong> <span class="text-success">Active</span></span>
            </div>
        </div>
    `;
    
    portfolioContainer.appendChild(portfolioItem);
}

// Advance to the next quarter
function advanceQuarter() {
    console.log('Advancing to next quarter...');
    
    // Get current year and quarter
    const currentYearEl = document.getElementById('current-year');
    const currentQuarterEl = document.getElementById('current-quarter');
    
    let currentYear = parseInt(currentYearEl.textContent);
    let currentQuarter = parseInt(currentQuarterEl.textContent);
    
    // Advance quarter
    currentQuarter += 1;
    if (currentQuarter > 4) {
        currentQuarter = 1;
        currentYear += 1;
    }
    
    // Update display
    currentYearEl.textContent = currentYear;
    currentQuarterEl.textContent = currentQuarter;
    
    // Check if game over (5 years)
    if (currentYear > 5) {
        alert('Congratulations! You have completed the 5-year fund simulation.');
        return;
    }
    
    // Generate new deals
    generateNewDeals();
    
    // Update portfolio performance
    updatePortfolioPerformance();
}

// Generate new deals for the current quarter
function generateNewDeals() {
    console.log('Generating new deals...');
    
    const dealContainer = document.getElementById('deal-flow-container');
    if (!dealContainer) {
        console.error('Deal container not found');
        return;
    }
    
    // Clear existing deals
    dealContainer.innerHTML = '';
    
    // Generate random number of deals (2-4)
    const numDeals = Math.floor(Math.random() * 3) + 2;
    
    // Sample company names
    const companyNames = [
        'DataSphere', 'MediSync', 'EcoTech', 'FinEdge', 'CloudNest',
        'BioGenics', 'RoboMinds', 'CyberShield', 'AgriTech', 'RetailAI'
    ];
    
    // Sample industries
    const industries = [
        'Technology', 'Healthcare', 'CleanTech', 'FinTech', 'E-commerce',
        'Biotech', 'Robotics', 'Cybersecurity', 'AgTech', 'Retail'
    ];
    
    // Sample stages
    const stages = ['Seed', 'Series A', 'Series B'];
    
    // Generate random deals
    for (let i = 0; i < numDeals; i++) {
        // Pick random name, industry, and stage
        const nameIndex = Math.floor(Math.random() * companyNames.length);
        const industryIndex = Math.floor(Math.random() * industries.length);
        const stageIndex = Math.floor(Math.random() * stages.length);
        
        // Generate random metrics
        const teamQuality = Math.floor(Math.random() * 3) + 2; // 2-5
        const marketSize = Math.floor(Math.random() * 3) + 2; // 2-5
        const traction = Math.floor(Math.random() * 3) + 2; // 2-5
        
        // Generate random ask amount and valuation based on stage
        let askAmount, valuation;
        if (stages[stageIndex] === 'Seed') {
            askAmount = (Math.floor(Math.random() * 20) + 5) / 10; // 0.5-2.5M
            valuation = askAmount * (Math.floor(Math.random() * 3) + 3); // 3-5x ask
        } else if (stages[stageIndex] === 'Series A') {
            askAmount = Math.floor(Math.random() * 4) + 3; // 3-7M
            valuation = askAmount * (Math.floor(Math.random() * 3) + 4); // 4-6x ask
        } else {
            askAmount = Math.floor(Math.random() * 10) + 8; // 8-18M
            valuation = askAmount * (Math.floor(Math.random() * 3) + 5); // 5-7x ask
        }
        
        // Create deal object
        const deal = {
            name: companyNames[nameIndex] + (Math.floor(Math.random() * 100) + 1),
            industry: industries[industryIndex],
            stage: stages[stageIndex],
            description: `A promising ${industries[industryIndex].toLowerCase()} startup focused on innovation and growth.`,
            teamQuality: teamQuality,
            marketSize: marketSize,
            traction: traction,
            askAmount: askAmount.toFixed(1),
            valuation: valuation.toFixed(1)
        };
        
        // Create deal card
        const dealCard = document.createElement('div');
        dealCard.className = 'card mb-3 deal-card';
        dealCard.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${deal.name}</h5>
                <h6 class="card-subtitle mb-2 text-muted">${deal.industry} | ${deal.stage}</h6>
                <p class="card-text">${deal.description}</p>
                <button class="btn btn-sm btn-primary view-deal-btn">View Details</button>
            </div>
        `;
        
        // Add click event to view deal button
        dealCard.querySelector('.view-deal-btn').addEventListener('click', function() {
            showDealModal(deal);
        });
        
        dealContainer.appendChild(dealCard);
    }
}

// Force show simulation phase (emergency function)
function forceShowSimulation() {
    console.log('FORCE SHOWING SIMULATION PHASE');
    
    // Hide all phases
    document.querySelectorAll('.game-phase').forEach(phase => {
        phase.classList.add('d-none');
        phase.style.display = 'none';
    });
    
    // Show simulation phase
    const simulationPhase = document.getElementById('simulation-phase');
    if (simulationPhase) {
        simulationPhase.classList.remove('d-none');
        simulationPhase.style.display = 'block';
        console.log('Simulation phase should now be visible');
    } else {
        console.error('Simulation phase element not found!');
    }
    
    // Show fund dashboard
    const fundDashboard = document.getElementById('fund-dashboard');
    if (fundDashboard) {
        fundDashboard.classList.remove('d-none');
        fundDashboard.style.display = 'block';
    }
    
    // Generate deals
    generateInitialDeals();
}

// Update portfolio performance
function updatePortfolioPerformance() {
    console.log('Updating portfolio performance...');
    
    // Randomly update IRR and MOIC
    const irrEl = document.getElementById('current-irr');
    const moicEl = document.getElementById('current-moic');
    
    // Get current values
    let irr = parseFloat(irrEl.textContent || '0');
    let moic = parseFloat(moicEl.textContent || '1.0');
    
    // Random change (-5% to +15% for IRR, -0.1 to +0.3 for MOIC)
    const irrChange = (Math.random() * 20 - 5) / 100;
    const moicChange = (Math.random() * 0.4 - 0.1);
    
    // Update values
    irr += irrChange * 100; // Convert to percentage points
    moic += moicChange;
    
    // Ensure values are reasonable
    irr = Math.max(-20, Math.min(50, irr));
    moic = Math.max(0.5, moic);
    
    // Update display
    irrEl.textContent = irr.toFixed(1);
    moicEl.textContent = moic.toFixed(2);
    
    // Update color based on performance
    if (irr > 20) {
        irrEl.className = 'text-success';
    } else if (irr < 0) {
        irrEl.className = 'text-danger';
    } else {
        irrEl.className = '';
    }
    
    if (moic > 2.0) {
        moicEl.className = 'text-success';
    } else if (moic < 1.0) {
        moicEl.className = 'text-danger';
    } else {
        moicEl.className = '';
    }
}
