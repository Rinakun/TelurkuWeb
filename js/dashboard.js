// Dashboard Module for Telurku Admin Dashboard

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication
  const authenticated = await requireAuth();
  if (!authenticated) return;
  
  // Load dashboard data
  await loadDashboardData();
  
  // Setup event listeners
  setupDashboardEventListeners();
  
  // Update user info in UI
  updateUserInfo();
});

// Load dashboard data
async function loadDashboardData() {
  try {
    // Show loading state
    showLoadingState();
    
    // Fetch statistics
    const stats = await getBarnStatistics();
    updateDashboardStatistics(stats);
    
    // Fetch recent barns
    const recentBarns = await getRecentBarns(5);
    updateRecentBarnsTable(recentBarns);
    
    // Fetch activity data if needed
    await updateActivityChart();
    
    // Hide loading state
    hideLoadingState();
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showAlert('Error loading dashboard data: ' + error.message, 'danger');
    hideLoadingState();
  }
}

// Show loading state
function showLoadingState() {
  const loadingElements = document.querySelectorAll('.loading-placeholder');
  loadingElements.forEach(el => {
    el.style.display = 'block';
  });
  
  const contentElements = document.querySelectorAll('.dashboard-content');
  contentElements.forEach(el => {
    el.style.display = 'none';
  });
}

// Hide loading state
function hideLoadingState() {
  const loadingElements = document.querySelectorAll('.loading-placeholder');
  loadingElements.forEach(el => {
    el.style.display = 'none';
  });
  
  const contentElements = document.querySelectorAll('.dashboard-content');
  contentElements.forEach(el => {
    el.style.display = 'block';
  });
}

// Update dashboard statistics
function updateDashboardStatistics(stats) {
  // Update total barns
  const totalBarnsEl = document.getElementById('total-barns');
  if (totalBarnsEl) {
    animateNumber(totalBarnsEl, 0, stats.totalBarns || 0, 1000);
  }
  
  // Update total chickens
  const totalChickensEl = document.getElementById('total-chickens');
  if (totalChickensEl) {
    animateNumber(totalChickensEl, 0, stats.totalChickens || 0, 1000);
  }
  
  // Update daily eggs
  const dailyEggsEl = document.getElementById('daily-eggs');
  if (dailyEggsEl) {
    animateNumber(dailyEggsEl, 0, stats.dailyEggs || 0, 1000);
  }
  
  // Update alerts
  const alertsEl = document.getElementById('alerts');
  const totalAlerts = (stats.alerts || 0) + (stats.warnings || 0);
  if (alertsEl) {
    animateNumber(alertsEl, 0, totalAlerts, 1000);
    
    // Add visual indicator if there are alerts
    if (totalAlerts > 0) {
      alertsEl.parentElement.parentElement.classList.add('border-left-danger');
    }
  }
  
  // Update status distribution
  updateStatusDistribution(stats);
}

// Animate number counting
function animateNumber(element, start, end, duration) {
  const startTime = performance.now();
  
  function updateNumber(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    const current = Math.floor(start + (end - start) * progress);
    element.textContent = current.toLocaleString();
    
    if (progress < 1) {
      requestAnimationFrame(updateNumber);
    }
  }
  
  requestAnimationFrame(updateNumber);
}

// Update status distribution
function updateStatusDistribution(stats) {
  const okEl = document.getElementById('status-ok');
  const warningEl = document.getElementById('status-warning');
  const alertEl = document.getElementById('status-alert');
  
  if (okEl) okEl.textContent = stats.ok || 0;
  if (warningEl) warningEl.textContent = stats.warnings || 0;
  if (alertEl) alertEl.textContent = stats.alerts || 0;
}

// Update recent barns table
function updateRecentBarnsTable(barns) {
  const tableBody = document.getElementById('dashboard-barns-tbody');
  if (!tableBody) return;
  
  tableBody.innerHTML = '';
  
  if (barns.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="4" class="text-center">No barns found</td>`;
    tableBody.appendChild(row);
    return;
  }
  
  barns.forEach(barn => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <a href="#" onclick="viewBarn('${barn.id}')" class="text-decoration-none">
          ${barn.name}
        </a>
      </td>
      <td>${barn.chickens || 0}</td>
      <td>${barn.eggs_today || 0}</td>
      <td>
        <span class="badge bg-${getStatusColor(barn.status)}">${barn.status || 'unknown'}</span>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Update activity chart (placeholder for future implementation)
async function updateActivityChart() {
  const chartContainer = document.getElementById('activity-chart');
  if (!chartContainer) return;
  
  // This is a placeholder for future chart implementation
  // You can integrate Chart.js or another charting library here
  chartContainer.innerHTML = '<p class="text-muted">Activity chart coming soon</p>';
}

// Setup dashboard event listeners
function setupDashboardEventListeners() {
  // Refresh button
  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      refreshBtn.disabled = true;
      refreshBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Loading...';
      
      await loadDashboardData();
      
      refreshBtn.disabled = false;
      refreshBtn.innerHTML = '<i class="bi bi-arrow-clockwise"></i> Refresh';
    });
  }
  
  // Export button
  const exportBtn = document.getElementById('export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      exportDashboardData();
    });
  }
  
  // Date range filter
  const dateRangeFilter = document.getElementById('date-range-filter');
  if (dateRangeFilter) {
    dateRangeFilter.addEventListener('change', async () => {
      await loadDashboardData();
    });
  }
}

// Export dashboard data
function exportDashboardData() {
  // This is a placeholder for export functionality
  showAlert('Export functionality coming soon', 'info');
}

// Get status color for badge
function getStatusColor(status) {
  switch(status) {
    case 'ok': return 'success';
    case 'warning': return 'warning';
    case 'alert': return 'danger';
    default: return 'secondary';
  }
}

// Show alert message
function showAlert(message, type = 'info') {
  const alertContainer = document.getElementById('alert-container');
  if (!alertContainer) {
    // Fallback to native alert
    alert(message);
    return;
  }
  
  const alert = document.createElement('div');
  alert.className = `alert alert-${type} alert-dismissible fade show`;
  alert.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  alertContainer.appendChild(alert);
  
  // Auto dismiss after 5 seconds
  setTimeout(() => {
    alert.remove();
  }, 5000);
}

// Update user info in UI
function updateUserInfo() {
  const userRole = getCurrentUserRole();
  const userInfoEl = document.getElementById('user-info');
  
  if (userInfoEl && userRole) {
    userInfoEl.textContent = `Role: ${userRole.charAt(0).toUpperCase() + userRole.slice(1)}`;
  }
  
  // Hide admin-only elements for viewers
  if (userRole === 'viewer') {
    const adminElements = document.querySelectorAll('.admin-only');
    adminElements.forEach(el => {
      el.style.display = 'none';
    });
  }
}