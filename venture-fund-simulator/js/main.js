/**
 * Venture Fund Simulator - Main Module
 * Initializes the application and connects UI with simulation logic
 */

// Initialize global objects
let ui;
let gameSimulation;

try {
    console.log('Initializing global objects...');
    ui = new UI();
    console.log('UI initialized successfully');
    gameSimulation = new GameSimulation();
    console.log('GameSimulation initialized successfully');
} catch (error) {
    console.error('Error initializing global objects:', error);
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    
    try {
        // Initialize UI
        if (ui) {
            ui.initialize();
        } else {
            console.error('UI object is not initialized');
            ui = new UI();
            ui.initialize();
        }
        
        // Initialize GameSimulation if needed
        if (!gameSimulation) {
            console.log('Creating new GameSimulation instance');
            gameSimulation = new GameSimulation();
        }
        
        // Check for saved game
        loadGameState();
        
        // Set up event listeners for sliders
        setupRangeSliders();
        
        // Add direct event listener to the launch fund button
        const launchFundBtn = document.getElementById('launch-fund-btn');
        console.log('Launch fund button:', launchFundBtn);
        
        if (launchFundBtn) {
            launchFundBtn.addEventListener('click', function(e) {
                console.log('Launch fund button clicked!');
                e.preventDefault();
                launchFund();
            });
        }
    } catch (error) {
        console.error('Error in DOMContentLoaded event:', error);
    }
    
    // Add direct event listener to the form as well
    const fundSetupForm = document.getElementById('fund-setup-form');
    if (fundSetupForm) {
        fundSetupForm.addEventListener('submit', function(e) {
            console.log('Form submitted!');
            e.preventDefault();
            launchFund();
        });
    }
    
    console.log('Venture Fund Simulator initialized');
});

/**
 * Launch the fund and start the simulation
 */
function launchFund() {
    console.log('Launching fund...');
    
    try {
        // Check if all required objects exist
        console.log('gameSimulation exists:', typeof gameSimulation !== 'undefined');
        console.log('ui exists:', typeof ui !== 'undefined');
        console.log('Fund exists:', typeof Fund !== 'undefined');
        
        // Make sure gameSimulation is initialized
        if (!gameSimulation) {
            console.log('Creating new GameSimulation instance');
            gameSimulation = new GameSimulation();
        }
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
        
        console.log('Fund config:', fundConfig);
        
        // Initialize game simulation
        gameSimulation.initializeFund(fundConfig);
        
        // Update UI
        ui.updateUI();
        
        // Change to simulation phase
        ui.changeGamePhase('simulation');
        
        // Enable simulation phase in navigation
        document.querySelector('[data-phase="simulation"]').classList.remove('disabled');
        
        console.log('Fund launched successfully!');
    } catch (error) {
        console.error('Error launching fund:', error);
        alert('There was an error launching your fund. Please check the console for details.');
    }
}

/**
 * Load saved game state from localStorage if available
 */
function loadGameState() {
    const savedState = localStorage.getItem('ventureFundSimulator');
    
    if (savedState) {
        try {
            const state = JSON.parse(savedState);
            
            // Confirm if user wants to load saved game
            if (confirm('A saved game was found. Would you like to load it?')) {
                // Restore game state
                restoreGameState(state);
            } else {
                // Clear saved state
                localStorage.removeItem('ventureFundSimulator');
            }
        } catch (error) {
            console.error('Error loading saved game:', error);
            localStorage.removeItem('ventureFundSimulator');
        }
    }
}

/**
 * Restore game state from saved data
 * @param {object} state - Saved game state
 */
function restoreGameState(state) {
    // Recreate fund
    if (state.fund) {
        gameSimulation.fund = new Fund(state.fund);
    }
    
    // Restore current deals
    if (state.currentDeals) {
        gameSimulation.currentDeals = state.currentDeals.map(deal => {
            const startup = new Startup(deal);
            return startup;
        });
    }
    
    // Restore active market events
    if (state.activeMarketEvents) {
        gameSimulation.activeMarketEvents = state.activeMarketEvents.map(event => {
            const marketEvent = new MarketEvent(event);
            marketEvent.startYear = event.startYear;
            marketEvent.startQuarter = event.startQuarter;
            marketEvent.active = event.active;
            marketEvent.currentPhase = event.currentPhase;
            return marketEvent;
        });
    }
    
    // Restore deal history
    if (state.dealHistory) {
        gameSimulation.dealHistory = state.dealHistory;
    }
    
    // Restore event history
    if (state.eventHistory) {
        gameSimulation.eventHistory = state.eventHistory;
    }
    
    // Restore lessons learned
    if (state.lessonLearned) {
        gameSimulation.lessonLearned = state.lessonLearned;
    }
    
    // Restore game phase
    if (state.gamePhase) {
        gameSimulation.gamePhase = state.gamePhase;
        ui.changeGamePhase(state.gamePhase);
    }
    
    // Restore game over state
    if (state.gameOver !== undefined) {
        gameSimulation.gameOver = state.gameOver;
    }
    
    // Update UI
    ui.updateUI();
    
    // If game is over, render results
    if (gameSimulation.gameOver) {
        ui.renderResults();
    }
}

/**
 * Set up range sliders with dynamic value display
 */
function setupRangeSliders() {
    // Investment criteria sliders
    setupCriteriaSliders();
    
    // Risk tolerance slider
    setupRiskToleranceSlider();
    
    // LP composition sliders
    setupLPCompositionSliders();
}

/**
 * Set up investment criteria sliders
 */
function setupCriteriaSliders() {
    const criteriaSliders = [
        { id: 'team-weight', display: 'team-weight-value' },
        { id: 'market-weight', display: 'market-weight-value' },
        { id: 'traction-weight', display: 'traction-weight-value' },
        { id: 'product-weight', display: 'product-weight-value' },
        { id: 'business-weight', display: 'business-weight-value' }
    ];
    
    criteriaSliders.forEach(slider => {
        const sliderElement = document.getElementById(slider.id);
        const displayElement = document.getElementById(slider.display);
        
        if (sliderElement && displayElement) {
            // Set initial value
            displayElement.textContent = sliderElement.value;
            
            // Update on input
            sliderElement.addEventListener('input', () => {
                // Update display value
                displayElement.textContent = sliderElement.value;
                
                // Update total
                updateCriteriaTotal();
            });
        }
    });
    
    // Initial calculation
    updateCriteriaTotal();
}

/**
 * Update the criteria total
 */
function updateCriteriaTotal() {
    const criteriaWeights = document.querySelectorAll('.criteria-weight');
    let total = 0;
    
    criteriaWeights.forEach(input => {
        total += parseInt(input.value) || 0;
    });
    
    const criteriaTotal = document.getElementById('criteria-total');
    if (criteriaTotal) {
        criteriaTotal.textContent = total;
        
        if (total !== 100) {
            criteriaTotal.classList.add('text-danger');
        } else {
            criteriaTotal.classList.remove('text-danger');
        }
    }
}

/**
 * Ensure investment criteria weights total 100
 */
function ensureCriteriaTotal() {
    const team = parseInt(document.getElementById('team-weight').value);
    const market = parseInt(document.getElementById('market-weight').value);
    const traction = parseInt(document.getElementById('traction-weight').value);
    const product = parseInt(document.getElementById('product-weight').value);
    const business = parseInt(document.getElementById('business-weight').value);
    
    const total = team + market + traction + product + business;
    
    document.getElementById('criteria-total').textContent = total;
    
    if (total !== 100) {
        document.getElementById('criteria-total').classList.add('text-danger');
    } else {
        document.getElementById('criteria-total').classList.remove('text-danger');
    }
}

/**
 * Set up risk tolerance slider
 */
function setupRiskToleranceSlider() {
    const slider = document.getElementById('risk-tolerance');
    const display = document.getElementById('risk-tolerance-value');
    
    if (slider && display) {
        // Set initial value
        display.textContent = slider.value;
        
        // Update on input
        slider.addEventListener('input', () => {
            display.textContent = slider.value;
            
            // Update risk label
            updateRiskLabel(parseInt(slider.value));
        });
        
        // Set initial risk label
        updateRiskLabel(parseInt(slider.value));
    }
}

/**
 * Update risk tolerance label based on value
 * @param {number} value - Risk tolerance value (1-10)
 */
function updateRiskLabel(value) {
    const label = document.getElementById('risk-label');
    
    if (label) {
        if (value <= 3) {
            label.textContent = 'Conservative';
            label.className = 'text-primary';
        } else if (value <= 7) {
            label.textContent = 'Balanced';
            label.className = 'text-success';
        } else {
            label.textContent = 'Aggressive';
            label.className = 'text-danger';
        }
    }
}

/**
 * Set up LP composition sliders
 */
function setupLPCompositionSliders() {
    const lpSliders = [
        { id: 'institutional-lps', display: 'institutional-lps-value' },
        { id: 'family-office-lps', display: 'family-office-lps-value' },
        { id: 'individual-lps', display: 'individual-lps-value' }
    ];
    
    lpSliders.forEach(slider => {
        const sliderElement = document.getElementById(slider.id);
        const displayElement = document.getElementById(slider.display);
        
        if (sliderElement && displayElement) {
            // Set initial value
            displayElement.textContent = sliderElement.value + '%';
            
            // Update on input
            sliderElement.addEventListener('input', () => {
                displayElement.textContent = sliderElement.value + '%';
                
                // Ensure total equals 100
                ensureLPTotal();
                
                // Update LP total
                updateLPTotal();
            });
        }
    });
    
    // Initial calculation
    updateLPTotal();
}

/**
 * Update the LP composition total
 */
function updateLPTotal() {
    const lpCompositions = document.querySelectorAll('.lp-composition');
    let total = 0;
    
    lpCompositions.forEach(input => {
        total += parseInt(input.value) || 0;
    });
    
    const lpTotal = document.getElementById('lp-total');
    if (lpTotal) {
        lpTotal.textContent = total;
        
        if (total !== 100) {
            lpTotal.classList.add('text-danger');
        } else {
            lpTotal.classList.remove('text-danger');
        }
    }
}

/**
 * Ensure LP composition percentages total 100
 */
function ensureLPTotal() {
    const institutional = parseInt(document.getElementById('institutional-lps').value);
    const familyOffice = parseInt(document.getElementById('family-office-lps').value);
    const individual = parseInt(document.getElementById('individual-lps').value);
    
    const total = institutional + familyOffice + individual;
    
    document.getElementById('lp-total').textContent = total + '%';
    
    if (total !== 100) {
        document.getElementById('lp-total').classList.add('text-danger');
    } else {
        document.getElementById('lp-total').classList.remove('text-danger');
    }
}

// Add save game functionality to GameSimulation
GameSimulation.prototype.saveGameState = function() {
    // Create a simplified state object
    const state = {
        fund: this.fund,
        currentDeals: this.currentDeals,
        activeMarketEvents: this.activeMarketEvents,
        dealHistory: this.dealHistory,
        eventHistory: this.eventHistory,
        lessonLearned: this.lessonLearned,
        gamePhase: this.gamePhase,
        gameOver: this.gameOver
    };
    
    // Save to localStorage
    try {
        localStorage.setItem('ventureFundSimulator', JSON.stringify(state));
        console.log('Game state saved');
    } catch (error) {
        console.error('Error saving game state:', error);
    }
};
