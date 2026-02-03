// Charts for analytics
document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts
    initializeVisitorsChart();
    initializeRequestsChart();
    
    // Update live visitor count
    updateLiveVisitors();
});

// Visitors Chart
function initializeVisitorsChart() {
    const ctx = document.getElementById('visitorsChart');
    if (!ctx) return;
    
    // Get visitor data from localStorage or generate initial data
    const visitorData = getVisitorData();
    
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: visitorData.dates,
            datasets: [{
                label: 'Website Visitors',
                data: visitorData.counts,
                backgroundColor: 'rgba(99, 102, 241, 0.8)',
                borderColor: '#6366f1',
                borderWidth: 1,
                borderRadius: 4,
                hoverBackgroundColor: '#8b5cf6'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 26, 46, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#a0a0c0',
                    borderColor: '#25253a',
                    borderWidth: 1,
                    cornerRadius: 6,
                    padding: 12
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(37, 37, 58, 0.3)',
                        borderColor: 'rgba(37, 37, 58, 0.3)'
                    },
                    ticks: {
                        color: '#70708c'
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(37, 37, 58, 0.3)',
                        borderColor: 'rgba(37, 37, 58, 0.3)'
                    },
                    ticks: {
                        color: '#70708c',
                        stepSize: 1,
                        callback: function(value) {
                            if (value % 1 === 0) {
                                return value;
                            }
                        }
                    }
                }
            }
        }
    });
    
    // Update chart daily
    setInterval(() => {
        updateVisitorStats();
        const newData = getVisitorData();
        chart.data.labels = newData.dates;
        chart.data.datasets[0].data = newData.counts;
        chart.update('none');
    }, 60000); // Update every minute
}

// Requests Chart
function initializeRequestsChart() {
    const ctx = document.getElementById('requestsChart');
    if (!ctx) return;
    
    // Get execution data
    const executionData = getExecutionData();
    
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: executionData.hours,
            datasets: [{
                label: 'Script Executions',
                data: executionData.counts,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#10b981',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 26, 46, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#a0a0c0',
                    borderColor: '#25253a',
                    borderWidth: 1,
                    cornerRadius: 6,
                    padding: 12
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(37, 37, 58, 0.3)',
                        borderColor: 'rgba(37, 37, 58, 0.3)'
                    },
                    ticks: {
                        color: '#70708c'
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(37, 37, 58, 0.3)',
                        borderColor: 'rgba(37, 37, 58, 0.3)'
                    },
                    ticks: {
                        color: '#70708c',
                        stepSize: 1,
                        callback: function(value) {
                            if (value % 1 === 0) {
                                return value;
                            }
                        }
                    }
                }
            }
        }
    });
    
    // Update chart every 5 minutes
    setInterval(() => {
        const newData = getExecutionData();
        chart.data.datasets[0].data = newData.counts;
        chart.update('none');
    }, 300000);
}

// Get visitor data
function getVisitorData() {
    const today = new Date().toDateString();
    const stats = JSON.parse(localStorage.getItem('pevolution_stats') || '{}');
    
    // Initialize visitor data for last 7 days
    const dates = [];
    const counts = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        dates.push(dateStr);
        
        // Get count for this day
        const dayKey = date.toDateString();
        counts.push(stats.dailyVisitors?.[dayKey] || 0);
    }
    
    return { dates, counts };
}

// Get execution data
function getExecutionData() {
    const stats = JSON.parse(localStorage.getItem('pevolution_stats') || '{}');
    const executionLogs = stats.executionLogs || [];
    
    // Group by hour for last 24 hours
    const hours = [];
    const counts = [];
    
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
        const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
        const hourStr = hour.getHours().toString().padStart(2, '0') + ':00';
        hours.push(hourStr);
        
        // Count executions for this hour
        const hourStart = new Date(hour);
        hourStart.setMinutes(0, 0, 0);
        const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
        
        const count = executionLogs.filter(log => {
            const logTime = new Date(log.timestamp);
            return logTime >= hourStart && logTime < hourEnd;
        }).length;
        
        counts.push(count);
    }
    
    return { hours, counts };
}

// Update visitor stats
function updateVisitorStats() {
    const today = new Date().toDateString();
    const stats = JSON.parse(localStorage.getItem('pevolution_stats') || '{}');
    
    // Initialize stats if not exists
    if (!stats.dailyVisitors) stats.dailyVisitors = {};
    if (!stats.totalVisitors) stats.totalVisitors = 0;
    
    // Increment today's visitors
    stats.dailyVisitors[today] = (stats.dailyVisitors[today] || 0) + 1;
    stats.totalVisitors++;
    
    // Update web visitors counter
    const webVisitorsEl = document.getElementById('webVisitors');
    if (webVisitorsEl) {
        webVisitorsEl.textContent = stats.totalVisitors;
        
        // Update bar
        const maxVisitors = Math.max(100, stats.totalVisitors); // Dynamic max
        const percentage = Math.min(100, (stats.totalVisitors / maxVisitors) * 100);
        webVisitorsEl.nextElementSibling?.querySelector('.bar-fill')?.style.setProperty('width', percentage + '%');
    }
    
    localStorage.setItem('pevolution_stats', JSON.stringify(stats));
}

// Update live visitors
function updateLiveVisitors() {
    const liveVisitorsEl = document.getElementById('liveVisitors');
    if (!liveVisitorsEl) return;
    
    // Simulate random live visitors (1-5)
    const liveCount = Math.floor(Math.random() * 5) + 1;
    liveVisitorsEl.textContent = `${liveCount} visitors online`;
    
    // Update every 30 seconds
    setInterval(() => {
        const newCount = Math.floor(Math.random() * 5) + 1;
        liveVisitorsEl.textContent = `${newCount} visitors online`;
    }, 30000);
}

// Track script execution (called when loader is copied)
function trackScriptExecution(scriptId) {
    const stats = JSON.parse(localStorage.getItem('pevolution_stats') || '{}');
    
    // Initialize execution logs
    if (!stats.executionLogs) stats.executionLogs = [];
    if (!stats.totalExecutions) stats.totalExecutions = 0;
    
    // Add execution log
    stats.executionLogs.push({
        scriptId: scriptId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
    });
    
    // Keep only last 1000 logs
    if (stats.executionLogs.length > 1000) {
        stats.executionLogs = stats.executionLogs.slice(-1000);
    }
    
    // Update total executions
    stats.totalExecutions++;
    
    // Update UI
    const totalExecutionsEl = document.getElementById('totalExecutions');
    if (totalExecutionsEl) {
        totalExecutionsEl.textContent = stats.totalExecutions;
        
        // Update bar (scale based on executions)
        const maxExecutions = Math.max(100, stats.totalExecutions);
        const percentage = Math.min(100, (stats.totalExecutions / maxExecutions) * 100);
        totalExecutionsEl.nextElementSibling?.querySelector('.bar-fill')?.style.setProperty('width', percentage + '%');
    }
    
    localStorage.setItem('pevolution_stats', JSON.stringify(stats));
}