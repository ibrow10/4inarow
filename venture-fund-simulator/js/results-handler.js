/**
 * Venture Fund Simulator - Results Handler
 * Handles the rendering and functionality of the results section
 */

// Function to handle the Results tab click
function enableResultsTab() {
    console.log('Enabling Results tab functionality');
    
    // Get the Results tab link
    const resultsLink = document.querySelector('#game-phases a[data-phase="results"]');
    if (!resultsLink) {
        console.error('Results tab link not found');
        return;
    }
    
    // Add click event listener to the Results tab
    resultsLink.addEventListener('click', function(e) {
        e.preventDefault();
        
        console.log('Results tab clicked');
        
        // If we have a fund, render the results
        if (gameSimulation && gameSimulation.fund) {
            // Show the results phase
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
            
            // Render results data
            renderResultsData();
        } else {
            alert('Please set up and run a fund simulation first!');
        }
    });
}

// Function to render the results data
function renderResultsData() {
    console.log('Rendering results data');
    
    if (!gameSimulation || !gameSimulation.fund) {
        console.error('No fund data available');
        return;
    }
    
    const fund = gameSimulation.fund;
    
    // Update fund details
    document.getElementById('result-fund-name').textContent = fund.name || 'Unnamed Fund';
    document.getElementById('result-fund-size').textContent = fund.size || '0';
    
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
    
    // Update other metrics in the results section
    document.getElementById('final-irr').textContent = `${fund.irr.toFixed(1)}%`;
    document.getElementById('final-moic').textContent = `${fund.moic.toFixed(2)}x`;
    document.getElementById('total-investments').textContent = fund.totalInvestments;
    document.getElementById('successful-exits').textContent = fund.successfulExits;
    document.getElementById('failed-investments').textContent = fund.failedInvestments;
    document.getElementById('management-fees').textContent = `$${fund.managementFeesCollected.toFixed(1)}M`;
    document.getElementById('carried-interest-earned').textContent = `$${fund.carriedInterestEarned.toFixed(1)}M`;
    
    // Calculate and display fund economics
    calculateFundEconomics(fund);
    
    // Render portfolio table
    renderPortfolioTable();
    
    // Render performance chart
    renderPerformanceChart();
    
    // Render investment distribution chart
    renderInvestmentDistributionChart();
    
    // Render top investments
    renderTopInvestments();
    
    // Render lessons learned
    renderLessonsLearned();
}

// Function to render the portfolio table
function renderPortfolioTable() {
    const tableBody = document.getElementById('portfolio-results-table');
    if (!tableBody) {
        console.error('Portfolio results table not found');
        return;
    }
    
    // Clear existing content
    tableBody.innerHTML = '';
    
    // Combine all investments from history
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
}

// Function to render the performance chart
function renderPerformanceChart() {
    console.log('Rendering performance chart');
    
    // Get the canvas element
    const performanceCanvas = document.getElementById('performance-chart');
    if (!performanceCanvas) {
        console.error('Performance chart canvas not found');
        return;
    }
    
    // Get the context
    const ctx = performanceCanvas.getContext('2d');
    
    // Check if we have fund data
    if (!gameSimulation.fund) {
        console.error('No fund data available');
        return;
    }
    
    const fund = gameSimulation.fund;
    
    // Destroy existing chart if it exists
    if (window.performanceChart) {
        window.performanceChart.destroy();
    }
    
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
        window.performanceChart = new Chart(ctx, {
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
    } catch (error) {
        console.error('Error creating performance chart:', error);
    }
}

// Function to render the investment distribution chart
function renderInvestmentDistributionChart() {
    // This is a placeholder for the investment distribution chart
    // Implementation would be similar to renderPerformanceChart
    console.log('Investment distribution chart rendering would go here');
}

// Function to render top investments
function renderTopInvestments() {
    const topInvestmentsContainer = document.getElementById('top-investments');
    if (!topInvestmentsContainer) return;
    
    topInvestmentsContainer.innerHTML = '';
    
    // Get all investments with exits
    const exitedInvestments = [];
    
    for (const event of gameSimulation.eventHistory) {
        if (event.type === 'exit' && event.startup) {
            exitedInvestments.push({
                startup: event.startup,
                multiple: event.details.multiple,
                type: event.details.type
            });
        }
    }
    
    // Sort by multiple (highest first)
    exitedInvestments.sort((a, b) => b.multiple - a.multiple);
    
    // Take top 3 or fewer
    const topInvestments = exitedInvestments.slice(0, 3);
    
    if (topInvestments.length === 0) {
        topInvestmentsContainer.innerHTML = '<p class="text-muted">No successful exits yet.</p>';
        return;
    }
    
    // Create cards for each top investment
    topInvestments.forEach(investment => {
        const card = document.createElement('div');
        card.className = 'card mb-3';
        
        card.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${investment.startup.name}</h5>
                <h6 class="card-subtitle mb-2 text-muted">${INDUSTRY_DATA[investment.startup.industry].name}</h6>
                <p class="card-text">
                    <strong>Exit Type:</strong> ${investment.type}<br>
                    <strong>Return Multiple:</strong> ${investment.multiple.toFixed(2)}x<br>
                    <strong>Investment Amount:</strong> $${investment.startup.investmentAmount.toFixed(1)}M
                </p>
            </div>
        `;
        
        topInvestmentsContainer.appendChild(card);
    });
}

// Function to render lessons learned
function renderLessonsLearned() {
    const lessonsContainer = document.getElementById('lessons-learned');
    if (!lessonsContainer) return;
    
    lessonsContainer.innerHTML = '';
    
    if (!gameSimulation.lessonLearned || gameSimulation.lessonLearned.length === 0) {
        lessonsContainer.innerHTML = '<p class="text-muted">No lessons learned yet.</p>';
        return;
    }
    
    // Create cards for each lesson
    gameSimulation.lessonLearned.forEach(lesson => {
        const card = document.createElement('div');
        card.className = 'card mb-3';
        
        card.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${lesson.title}</h5>
                <p class="card-text">${lesson.description}</p>
            </div>
        `;
        
        lessonsContainer.appendChild(card);
    });
}

// Function to calculate and display fund economics
function calculateFundEconomics(fund) {
    // Standard venture capital economics
    const managementFeeRate = 2; // 2% standard management fee
    const carryRate = 20; // 20% standard carried interest
    
    // Calculate management fees
    // Years 1-5: Full management fee on committed capital
    // Years 6-10: Reduced management fee (typically on invested capital)
    const fundSize = fund.size;
    const earlyYearsFee = (fundSize * (managementFeeRate / 100)) * 5; // 5 years at full rate
    
    // For years 6-10, we typically charge on invested capital only, and often at a reduced rate
    // Let's assume 1.5% on 80% of the fund (assuming 80% is deployed)
    const reducedFeeRate = 1.5;
    const deployedCapitalPercentage = 0.8;
    const lateYearsFee = (fundSize * deployedCapitalPercentage * (reducedFeeRate / 100)) * 5; // 5 years at reduced rate
    
    const totalManagementFees = earlyYearsFee + lateYearsFee;
    
    // Calculate carried interest
    // Carried interest is typically 20% of profits after returning the original capital
    const totalCapitalReturned = fund.totalReturned || (fund.moic * fundSize);
    const profit = Math.max(0, totalCapitalReturned - fundSize);
    const carriedInterest = profit * (carryRate / 100);
    
    // Calculate LP returns
    const lpReturns = totalCapitalReturned - carriedInterest;
    
    // Calculate total GP compensation
    const totalGpCompensation = totalManagementFees + carriedInterest;
    
    // Update the UI with calculated values
    document.getElementById('finance-fund-size').textContent = fundSize.toFixed(1);
    document.getElementById('finance-mgmt-fee-rate').textContent = managementFeeRate.toFixed(1);
    document.getElementById('finance-mgmt-fees-early').textContent = earlyYearsFee.toFixed(1);
    document.getElementById('finance-mgmt-fees-late').textContent = lateYearsFee.toFixed(1);
    document.getElementById('finance-mgmt-fees-total').textContent = totalManagementFees.toFixed(1);
    document.getElementById('finance-carry-rate').textContent = carryRate.toFixed(0);
    document.getElementById('finance-capital-returned').textContent = totalCapitalReturned.toFixed(1);
    document.getElementById('finance-profit').textContent = profit.toFixed(1);
    document.getElementById('finance-carry-earned').textContent = carriedInterest.toFixed(1);
    document.getElementById('finance-gp-total').textContent = totalGpCompensation.toFixed(1);
    document.getElementById('finance-lp-returns').textContent = lpReturns.toFixed(1);
}

// Initialize the results tab functionality when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing results handler');
    enableResultsTab();
});
