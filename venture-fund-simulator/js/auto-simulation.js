/**
 * Venture Fund Simulator - Auto Simulation Module
 * Handles automatic simulation of the entire fund lifecycle
 */

// Function to start the auto-simulation process
function startAutoSimulation() {
    console.log('Starting auto-simulation process');
    
    // Validate form inputs
    if (!validateFundSetup()) {
        return false;
    }
    
    // Get fund configuration from the form
    const fundConfig = getFundConfigFromForm();
    
    // Initialize the fund
    gameSimulation.initializeFund(fundConfig);
    
    // Run the entire simulation
    runFullSimulation();
    
    return true;
}

// Validate the fund setup form
function validateFundSetup() {
    // Check if investment criteria weights total 100
    const criteriaTotal = parseInt(document.getElementById('criteria-total').textContent || '0');
    if (criteriaTotal !== 100) {
        alert('Investment criteria weights must total 100!');
        return false;
    }
    
    // Check if LP composition percentages total 100
    const lpTotal = parseInt(document.getElementById('lp-total').textContent || '0');
    if (lpTotal !== 100) {
        alert('LP composition percentages must total 100%!');
        return false;
    }
    
    // Check if fund name is provided
    const fundName = document.getElementById('fund-name').value;
    if (!fundName.trim()) {
        alert('Please provide a fund name!');
        return false;
    }
    
    return true;
}

// Get fund configuration from the form
function getFundConfigFromForm() {
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
        
        // Investment criteria
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

// Run the full simulation automatically
function runFullSimulation() {
    console.log('Running full simulation');
    
    // Simulate year 1 with manual investment decisions
    simulateYear1WithInvestments();
    
    // Auto-simulate years 2-10
    autoSimulateRemainingYears();
    
    // Calculate final results and show results page
    finalizeFundAndShowResults();
}

// Simulate year 1 with strategic investment decisions
function simulateYear1WithInvestments() {
    console.log('Simulating Year 1 with strategic investments');
    
    // Make strategic investments in Year 1
    for (let quarter = 1; quarter <= 4; quarter++) {
        console.log(`Processing Year 1, Quarter ${quarter}`);
        
        // Get current deals
        const deals = gameSimulation.currentDeals;
        
        // Evaluate and invest in the best deals
        makeStrategicInvestments(deals);
        
        // Advance to next quarter if not the last quarter of year 1
        if (quarter < 4) {
            gameSimulation.advanceQuarter();
        }
    }
}

// Make strategic investments based on fund criteria and deal quality
function makeStrategicInvestments(deals) {
    console.log(`Evaluating ${deals.length} potential investments`);
    
    // Score all deals
    const scoredDeals = deals.map(deal => ({
        deal: deal,
        score: gameSimulation.evaluateDeal(deal)
    }));
    
    // Sort by score (highest first)
    scoredDeals.sort((a, b) => b.score - a.score);
    
    // Determine how many deals to invest in this quarter (1-2 based on quality)
    const highQualityDeals = scoredDeals.filter(d => d.score >= 75);
    const dealsToInvest = Math.min(2, highQualityDeals.length);
    
    console.log(`Found ${highQualityDeals.length} high-quality deals, investing in ${dealsToInvest}`);
    
    // Invest in the top deals
    for (let i = 0; i < dealsToInvest; i++) {
        if (i < scoredDeals.length) {
            const dealInfo = scoredDeals[i];
            
            // Only invest if we have enough capital and the score is decent
            if (dealInfo.score >= 65 && gameSimulation.fund.availableCapital >= gameSimulation.fund.checkSize) {
                console.log(`Investing in ${dealInfo.deal.name} with score ${dealInfo.score}`);
                gameSimulation.makeInvestment(dealInfo.deal);
                
                // Add to event history
                gameSimulation.eventHistory.push({
                    type: 'strategic-investment',
                    startup: dealInfo.deal,
                    score: dealInfo.score,
                    year: gameSimulation.fund.currentYear,
                    quarter: gameSimulation.fund.currentQuarter
                });
            }
        }
    }
    
    // Pass on the remaining deals
    for (const deal of [...gameSimulation.currentDeals]) {
        gameSimulation.passDeal(deal);
    }
}

// Auto-simulate the remaining years (2-10)
function autoSimulateRemainingYears() {
    console.log('Auto-simulating remaining years');
    
    // Continue simulation until we reach the end year
    while (gameSimulation.fund.currentYear < GAME_CONSTANTS.SIMULATION_YEARS || 
           (gameSimulation.fund.currentYear === GAME_CONSTANTS.SIMULATION_YEARS && 
            gameSimulation.fund.currentQuarter < 4)) {
        
        gameSimulation.advanceQuarter();
        
        // Check if game is over
        if (gameSimulation.gameOver) {
            break;
        }
    }
    
    // Ensure we end the game if it hasn't ended yet
    if (!gameSimulation.gameOver) {
        gameSimulation.endGame();
    }
}

// Finalize fund performance and show results
function finalizeFundAndShowResults() {
    console.log('Finalizing fund performance and showing results');
    
    // Calculate percentile ranking
    calculatePercentileRanking();
    
    // Change to results phase
    document.querySelectorAll('.game-phase').forEach(el => {
        el.classList.add('d-none');
        el.classList.remove('active');
    });
    
    const resultsPhase = document.getElementById('results-phase');
    if (resultsPhase) {
        resultsPhase.classList.remove('d-none');
        resultsPhase.classList.add('active');
    }
    
    // Update navigation
    const phaseLinks = document.querySelectorAll('#game-phases a');
    phaseLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.phase === 'results') {
            link.classList.add('active');
        }
    });
    
    // Hide the fund dashboard
    const fundDashboard = document.getElementById('fund-dashboard');
    if (fundDashboard) {
        fundDashboard.classList.add('d-none');
    }
    
    // Render results
    autoSimRenderResults();
}

// Calculate the fund's percentile ranking among hypothetical peer funds
function calculatePercentileRanking() {
    console.log('Calculating percentile ranking');
    
    // Get the fund's performance metrics
    const fund = gameSimulation.fund;
    
    // Generate a distribution of hypothetical peer fund performances
    const peerFundCount = 100;
    const peerFundPerformances = [];
    
    // Base performance on the fund's stage and industry focus
    const baseTVPI = getBaseTVPIForFundType(fund.stage, fund.industries);
    
    // Generate peer fund performances with normal distribution around the base TVPI
    for (let i = 0; i < peerFundCount; i++) {
        // Add random variation (normal distribution)
        const randomFactor = (Math.random() + Math.random() + Math.random() + Math.random() - 2) / 2; // Approximates normal distribution
        const peerTVPI = baseTVPI * (1 + randomFactor);
        
        peerFundPerformances.push({
            tvpi: Math.max(0.1, peerTVPI), // Ensure minimum TVPI of 0.1
            irr: calculateIRRFromTVPI(peerTVPI, GAME_CONSTANTS.SIMULATION_YEARS)
        });
    }
    
    // Sort peer performances by TVPI (ascending)
    peerFundPerformances.sort((a, b) => a.tvpi - b.tvpi);
    
    // Find where our fund ranks in the distribution
    let rank = 0;
    while (rank < peerFundPerformances.length && peerFundPerformances[rank].tvpi < fund.tvpi) {
        rank++;
    }
    
    // Calculate percentile (higher is better)
    const percentile = Math.round((rank / peerFundPerformances.length) * 100);
    
    // Store the percentile and peer data in the fund object
    fund.percentileRank = percentile;
    fund.peerMedianTVPI = peerFundPerformances[Math.floor(peerFundPerformances.length / 2)].tvpi;
    fund.peerTopQuartileTVPI = peerFundPerformances[Math.floor(peerFundPerformances.length * 0.75)].tvpi;
    fund.peerBottomQuartileTVPI = peerFundPerformances[Math.floor(peerFundPerformances.length * 0.25)].tvpi;
    
    console.log(`Fund percentile rank: ${percentile}%`);
}

// Get base TVPI for fund type based on stage and industries
function getBaseTVPIForFundType(stage, industries) {
    // Base TVPI by stage
    let baseTVPI = 2.0; // Default
    
    if (stage === 'seed') {
        baseTVPI = 2.5;
    } else if (stage === 'series-a') {
        baseTVPI = 2.2;
    } else if (stage === 'series-b') {
        baseTVPI = 2.0;
    } else if (stage === 'growth') {
        baseTVPI = 1.8;
    }
    
    // Adjust for industry focus
    if (industries.includes('tech')) {
        baseTVPI *= 1.1;
    }
    if (industries.includes('biotech')) {
        baseTVPI *= 1.2;
    }
    if (industries.includes('cleantech')) {
        baseTVPI *= 0.9;
    }
    
    return baseTVPI;
}

// Calculate IRR from TVPI and fund duration
function calculateIRRFromTVPI(tvpi, years) {
    // Simple IRR calculation: (TVPI^(1/years) - 1) * 100
    return ((Math.pow(tvpi, 1 / years) - 1) * 100);
}

// Initialize event listeners when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing auto-simulation module');
    
    // Add the "Start Investing" button to the form
    addStartInvestingButton();
})

// Add the "Start Investing" button to the form
function addStartInvestingButton() {
    console.log('Adding Start Investing button');
    
    // Get the existing buttons
    const launchFundBtn = document.getElementById('launch-fund-btn');
    const forceSimulationBtn = document.getElementById('force-simulation-btn');
    
    if (!launchFundBtn) {
        console.error('Launch Fund button not found');
        return;
    }
    
    // Remove the force simulation button if it exists
    if (forceSimulationBtn) {
        forceSimulationBtn.remove();
    }
    
    // Replace the Launch Fund button with Start Investing button
    launchFundBtn.textContent = 'Start Investing';
    launchFundBtn.id = 'start-investing-btn';
    
    // Remove the existing onclick attribute
    launchFundBtn.removeAttribute('onclick');
    
    // Add click event listener
    launchFundBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Start Investing button clicked');
        startAutoSimulation();
    });
    
    // Fix the Start New Fund button
    const restartGameBtn = document.getElementById('restart-game-btn');
    if (restartGameBtn) {
        restartGameBtn.addEventListener('click', function() {
            console.log('Start New Fund button clicked');
            resetGameState();
        });
    }
    
    console.log('Start Investing button added successfully');
}

// Function to render the results data (including leaderboard)
function autoSimRenderResults() {
    console.log('Rendering results data from auto-simulation.js');
    
    // Check if the results-handler.js renderResultsData function exists
    if (typeof window.renderResultsData === 'function') {
        // Call the function from results-handler.js
        window.renderResultsData();
    } else {
        // Otherwise, do our own rendering
        renderBasicResultsData();
    }
    
    // Add the leaderboard
    renderLeaderboard();
}

// Basic results data rendering if the results-handler.js function isn't available
function renderBasicResultsData() {
    console.log('Rendering basic results data');
    
    if (!gameSimulation || !gameSimulation.fund) {
        console.error('No fund data available');
        return;
    }
    
    // Add the leaderboard
    renderLeaderboard();
}

// Render the leaderboard section
function renderLeaderboard() {
    console.log('Rendering leaderboard');
    
    // Check if leaderboard container exists, if not create it
    let leaderboardContainer = document.getElementById('leaderboard-container');
    if (!leaderboardContainer) {
        // Create the leaderboard container
        const resultsCard = document.querySelector('#results-phase .card');
        if (!resultsCard) {
            console.error('Results card not found');
            return;
        }
        
        // Create a new card for the leaderboard
        const leaderboardCard = document.createElement('div');
        leaderboardCard.className = 'card mb-4';
        leaderboardCard.innerHTML = `
            <div class="card-header bg-primary text-white">
                <h5 class="mb-0">Fund Manager Leaderboard</h5>
            </div>
            <div class="card-body">
                <div id="leaderboard-container"></div>
            </div>
        `;
        
        // Insert the leaderboard card after the results card
        resultsCard.parentNode.insertBefore(leaderboardCard, resultsCard.nextSibling);
        
        // Get the leaderboard container
        leaderboardContainer = document.getElementById('leaderboard-container');
    }
    
    // Clear existing content
    leaderboardContainer.innerHTML = '';
    
    // Get the fund's percentile rank
    const fund = gameSimulation.fund;
    if (!fund || typeof fund.percentileRank === 'undefined') {
        leaderboardContainer.innerHTML = '<p class="text-muted">Leaderboard data not available.</p>';
        return;
    }
    
    // Create the percentile display
    const percentileDisplay = document.createElement('div');
    percentileDisplay.className = 'text-center mb-4';
    
    // Determine ranking category
    let rankCategory, rankColor;
    if (fund.percentileRank >= 90) {
        rankCategory = 'Elite Fund Manager';
        rankColor = 'text-success';
    } else if (fund.percentileRank >= 75) {
        rankCategory = 'Top Quartile Fund Manager';
        rankColor = 'text-success';
    } else if (fund.percentileRank >= 50) {
        rankCategory = 'Above Average Fund Manager';
        rankColor = 'text-primary';
    } else if (fund.percentileRank >= 25) {
        rankCategory = 'Below Average Fund Manager';
        rankColor = 'text-warning';
    } else {
        rankCategory = 'Bottom Quartile Fund Manager';
        rankColor = 'text-danger';
    }
    
    percentileDisplay.innerHTML = `
        <h1 class="display-1 ${rankColor}">${fund.percentileRank}%</h1>
        <p class="lead ${rankColor}"><strong>${rankCategory}</strong></p>
        <p>Your fund outperformed ${fund.percentileRank}% of peer funds in your category.</p>
    `;
    
    leaderboardContainer.appendChild(percentileDisplay);
    
    // Create the peer comparison chart
    const chartContainer = document.createElement('div');
    chartContainer.className = 'mt-4';
    chartContainer.innerHTML = `
        <h5 class="mb-3">Peer Fund Comparison</h5>
        <canvas id="peer-comparison-chart" height="200"></canvas>
    `;
    
    leaderboardContainer.appendChild(chartContainer);
    
    // Render the peer comparison chart
    setTimeout(() => {
        renderPeerComparisonChart(fund);
    }, 100);
}

// Render the peer comparison chart
function renderPeerComparisonChart(fund) {
    const chartCanvas = document.getElementById('peer-comparison-chart');
    if (!chartCanvas) {
        console.error('Peer comparison chart canvas not found');
        return;
    }
    
    // Destroy existing chart if it exists
    if (window.peerComparisonChart) {
        window.peerComparisonChart.destroy();
    }
    
    // Create the chart
    try {
        window.peerComparisonChart = new Chart(chartCanvas, {
            type: 'bar',
            data: {
                labels: ['Bottom Quartile', 'Median', 'Top Quartile', 'Your Fund'],
                datasets: [{
                    label: 'TVPI (x)',
                    data: [
                        fund.peerBottomQuartileTVPI.toFixed(2),
                        fund.peerMedianTVPI.toFixed(2),
                        fund.peerTopQuartileTVPI.toFixed(2),
                        fund.tvpi.toFixed(2)
                    ],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.5)',
                        'rgba(54, 162, 235, 0.5)',
                        'rgba(75, 192, 192, 0.5)',
                        'rgba(255, 206, 86, 0.5)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 206, 86, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'TVPI (x)'
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error creating peer comparison chart:', error);
    }
}
