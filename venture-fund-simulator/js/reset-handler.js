/**
 * Venture Fund Simulator - Reset Handler Module
 * Handles resetting the game state for a new fund
 */

// Function to properly reset the game state
function resetGameState() {
    console.log('Resetting game state');
    
    // Reset the game simulation
    gameSimulation.fund = null;
    gameSimulation.currentDeals = [];
    gameSimulation.activeMarketEvents = [];
    gameSimulation.gamePhase = 'setup';
    gameSimulation.gameOver = false;
    gameSimulation.dealHistory = [];
    gameSimulation.eventHistory = [];
    gameSimulation.lessonLearned = [];
    
    // Change to setup phase
    document.querySelectorAll('.game-phase').forEach(el => {
        el.classList.add('d-none');
        el.classList.remove('active');
    });
    
    const setupPhase = document.getElementById('setup-phase');
    if (setupPhase) {
        setupPhase.classList.remove('d-none');
        setupPhase.classList.add('active');
    }
    
    // Update navigation
    const phaseLinks = document.querySelectorAll('#game-phases a');
    phaseLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.phase === 'setup') {
            link.classList.add('active');
        }
    });
    
    // Reset form fields
    document.getElementById('fund-name').value = 'My Venture Fund';
    document.getElementById('fund-size').value = '50';
    
    // Reset criteria weights
    document.getElementById('team-weight').value = '30';
    document.getElementById('market-weight').value = '25';
    document.getElementById('traction-weight').value = '20';
    document.getElementById('product-weight').value = '15';
    document.getElementById('business-weight').value = '10';
    document.getElementById('criteria-total').textContent = '100';
    
    // Reset LP composition
    document.getElementById('institutional-lps').value = '40';
    document.getElementById('family-offices').value = '30';
    document.getElementById('individual-lps').value = '30';
    document.getElementById('lp-total').textContent = '100';
    
    console.log('Game state reset successfully');
    
    // Make sure the Start Investing button is properly set up
    setupStartInvestingButton();
}

// Function to set up the Start Investing button
function setupStartInvestingButton() {
    console.log('Setting up Start Investing button');
    
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
        if (typeof startAutoSimulation === 'function') {
            startAutoSimulation();
        } else {
            console.error('startAutoSimulation function not found');
        }
    });
    
    console.log('Start Investing button set up successfully');
}

// Initialize the reset functionality when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing reset handler');
    
    // Set up the Start New Fund button
    const restartGameBtn = document.getElementById('restart-game-btn');
    if (restartGameBtn) {
        // Remove any existing event listeners
        const newRestartBtn = restartGameBtn.cloneNode(true);
        restartGameBtn.parentNode.replaceChild(newRestartBtn, restartGameBtn);
        
        // Add our event listener
        newRestartBtn.addEventListener('click', function() {
            console.log('Start New Fund button clicked');
            resetGameState();
        });
        
        console.log('Start New Fund button initialized');
    } else {
        console.error('Start New Fund button not found');
    }
    
    // Set up the Start Investing button
    setupStartInvestingButton();
});
