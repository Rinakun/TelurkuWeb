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
  
  // Setup real-time updates
  setupRealtimeUpdates();
  
  // Check for alerts
  checkForAlerts();
});

// Setup real-time updates
function setupRealtimeUpdates() {
  // Update dashboard data every 30 seconds
  setInterval(async () => {
    try {
      // Only update if page is visible
      if (!document.hidden) {
        await loadDashboardData();
        console.log('Dashboard data refreshed');
      }
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
    }
  }, 30000); // 30 seconds
  
  // Check for alerts every 10 seconds
  setInterval(async () => {
    try {
      if (!document.hidden) {
        await checkForAlerts();
      }
    } catch (error) {
      console.error('Error checking for alerts:', error);
    }
  }, 10000); // 10 seconds
}

// Check for alerts and show notifications
async function checkForAlerts() {
  try {
    const stats = await getBarnStatistics();
    const totalAlerts = (stats.alerts || 0) + (stats.warnings || 0);
    
    // Get barns with alert status
    const { data: alertBarns, error } = await supabase
      .from('barns')
      .select('*')
      .in('status', ['alert', 'warning']);
      
    if (error) throw error;
    
    // Show notification if there are new alerts
    if (totalAlerts > 0 && alertBarns.length > 0) {
      const alertMessage = alertBarns.map(barn =>
        `${barn.name}: ${barn.status === 'alert' ? '🔴 Alert' : '🟡 Warning'}`
      ).join(', ');
      
      showNotification(alertMessage, totalAlerts > 0 ? 'danger' : 'warning');
    }
  } catch (error) {
    console.error('Error checking for alerts:', error);
  }
}

// Show browser notification
function showNotification(message, type = 'info') {
  // Check if browser notifications are supported and permitted
  if ("Notification" in window) {
    if (Notification.permission === "granted") {
      new Notification("Telurku Dashboard Alert", {
        body: message,
        icon: "/favicon.ico"
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification("Telurku Dashboard Alert", {
            body: message,
            icon: "/favicon.ico"
          });
        }
      });
    }
  }
  
  // Also show in-app notification
  showAlert(message, type);
}

// Load dashboard data
async function loadDashboardData() {
  try {
    // Show loading state
    showLoadingState();
    
    // Fetch statistics
    const stats = await getBarnStatistics();
    updateDashboardStatistics(stats);
    
    // Fetch recent barns with pagination
    const recentBarns = await getRecentBarnsWithPagination(1, 5);
    updateRecentBarnsTable(recentBarns.data);
    updatePaginationControls(recentBarns.total, 1, 5);
    
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
    row.innerHTML = `<td colspan="5" class="text-center">No barns found</td>`;
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
        <div class="d-flex align-items-center">
          <span class="badge bg-${getStatusColor(barn.status)} me-2">${barn.status || 'unknown'}</span>
          ${getBarnStatusIndicator(barn)}
        </div>
      </td>
      <td>
        <div class="btn-group btn-group-sm" role="group">
          <button type="button" class="btn btn-outline-primary" onclick="viewBarn('${barn.id}')" title="View Details">
            <i class="bi bi-eye"></i>
          </button>
          <button type="button" class="btn btn-outline-secondary" onclick="quickEditBarn('${barn.id}')" title="Quick Edit">
            <i class="bi bi-pencil"></i>
          </button>
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Get barn status indicator with details
function getBarnStatusIndicator(barn) {
  const status = barn.status || 'unknown';
  let indicator = '';
  
  switch(status) {
    case 'ok':
      indicator = '<i class="bi bi-check-circle-fill text-success" title="All systems operational"></i>';
      break;
    case 'warning':
      indicator = '<i class="bi bi-exclamation-triangle-fill text-warning" title="Attention needed"></i>';
      break;
    case 'alert':
      indicator = '<i class="bi bi-x-circle-fill text-danger" title="Immediate action required"></i>';
      break;
    default:
      indicator = '<i class="bi bi-question-circle-fill text-secondary" title="Status unknown"></i>';
  }
  
  return indicator;
}

// View barn details
function viewBarn(barnId) {
  // Store barn ID in session storage
  sessionStorage.setItem('viewBarnId', barnId);
  // Redirect to barn details page
  window.location.href = 'barn-details.html';
}

// Quick edit barn (opens modal)
async function quickEditBarn(barnId) {
  try {
    // Get barn data
    const barn = await getBarnById(barnId);
    
    // Create modal for quick edit
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'quickEditModal';
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Quick Edit: ${barn.name}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form id="quickEditForm">
              <div class="mb-3">
                <label for="quickChickens" class="form-label">Chickens</label>
                <input type="number" class="form-control" id="quickChickens" value="${barn.chickens || 0}" min="0">
              </div>
              <div class="mb-3">
                <label for="quickEggs" class="form-label">Daily Eggs</label>
                <input type="number" class="form-control" id="quickEggs" value="${barn.eggs_today || 0}" min="0">
              </div>
              <div class="mb-3">
                <label for="quickStatus" class="form-label">Status</label>
                <select class="form-select" id="quickStatus">
                  <option value="ok" ${barn.status === 'ok' ? 'selected' : ''}>OK</option>
                  <option value="warning" ${barn.status === 'warning' ? 'selected' : ''}>Warning</option>
                  <option value="alert" ${barn.status === 'alert' ? 'selected' : ''}>Alert</option>
                </select>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" onclick="saveQuickEdit('${barnId}')">Save Changes</button>
          </div>
        </div>
      </div>
    `;
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Show modal
    const modalInstance = new bootstrap.Modal(document.getElementById('quickEditModal'));
    modalInstance.show();
    
    // Remove modal from DOM when hidden
    document.getElementById('quickEditModal').addEventListener('hidden.bs.modal', function() {
      document.body.removeChild(modal);
    });
  } catch (error) {
    console.error('Error opening quick edit:', error);
    showAlert('Error opening quick edit: ' + error.message, 'danger');
  }
}

// Save quick edit changes
async function saveQuickEdit(barnId) {
  try {
    const chickens = parseInt(document.getElementById('quickChickens').value) || 0;
    const eggsToday = parseInt(document.getElementById('quickEggs').value) || 0;
    const status = document.getElementById('quickStatus').value;
    
    // Validate input
    if (chickens < 0 || eggsToday < 0) {
      showAlert('Values cannot be negative', 'warning');
      return;
    }
    
    // Update barn
    await updateBarn(barnId, {
      chickens: chickens,
      eggs_today: eggsToday,
      status: status
    });
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('quickEditModal'));
    modal.hide();
    
    // Refresh data
    await loadDashboardData();
    
    showAlert('Barn updated successfully', 'success');
  } catch (error) {
    console.error('Error saving quick edit:', error);
    showAlert('Error saving changes: ' + error.message, 'danger');
  }
}

// Update activity chart
async function updateActivityChart() {
  const chartContainer = document.getElementById('activity-chart');
  if (!chartContainer) return;
  
  try {
    // Get date range from filter
    const dateRangeFilter = document.getElementById('date-range-filter');
    const dateRange = dateRangeFilter ? dateRangeFilter.value : 'month';
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch(dateRange) {
      case 'today':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }
    
    // Fetch barn data for the chart
    const { data, error } = await supabase
      .from('barns')
      .select('name, eggs_today, chickens, status');
      
    if (error) throw error;
    
    // Clear previous chart
    chartContainer.innerHTML = '';
    
    // Create canvas for chart
    const canvas = document.createElement('canvas');
    chartContainer.appendChild(canvas);
    
    // Prepare data for chart
    const barnNames = data.map(barn => barn.name);
    const eggProduction = data.map(barn => barn.eggs_today || 0);
    const chickenCounts = data.map(barn => barn.chickens || 0);
    
    // Create chart
    const ctx = canvas.getContext('2d');
    const activityChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: barnNames,
        datasets: [
          {
            label: 'Daily Egg Production',
            data: eggProduction,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            yAxisID: 'y'
          },
          {
            label: 'Chicken Count',
            data: chickenCounts,
            type: 'line',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
            yAxisID: 'y1',
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Egg Production'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Chicken Count'
            },
            grid: {
              drawOnChartArea: false,
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Barn Performance Overview'
          }
        }
      }
    });
    
    // Store chart instance for later updates
    window.activityChart = activityChart;
    
  } catch (error) {
    console.error('Error updating activity chart:', error);
    chartContainer.innerHTML = '<p class="text-danger">Error loading chart data</p>';
  }
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
async function exportDashboardData() {
  try {
    // Get current date range
    const dateRangeFilter = document.getElementById('date-range-filter');
    const dateRange = dateRangeFilter ? dateRangeFilter.value : 'month';
    
    // Get barn statistics
    const stats = await getBarnStatistics();
    
    // Get all barns data
    const barns = await getBarns();
    
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add header row
    csvContent += "Dashboard Export\n";
    csvContent += "Date Range: " + dateRange + "\n";
    csvContent += "Export Date: " + new Date().toLocaleString() + "\n\n";
    
    // Add statistics
    csvContent += "Statistics\n";
    csvContent += "Metric,Value\n";
    csvContent += "Total Barns," + stats.totalBarns + "\n";
    csvContent += "Total Chickens," + stats.totalChickens + "\n";
    csvContent += "Daily Egg Production," + stats.dailyEggs + "\n";
    csvContent += "Alerts," + stats.alerts + "\n";
    csvContent += "Warnings," + stats.warnings + "\n";
    csvContent += "OK Status," + stats.ok + "\n\n";
    
    // Add barns data
    csvContent += "Barns Data\n";
    csvContent += "Name,Chickens,Daily Eggs,Temperature,Humidity,Status,Created At\n";
    
    barns.forEach(barn => {
      csvContent += '"' + barn.name + '",' + (barn.chickens || 0) + ',' + (barn.eggs_today || 0) + ',' + (barn.temperature || 0) + ',' + (barn.humidity || 0) + ',"' + (barn.status || 'unknown') + '","' + new Date(barn.created_at).toLocaleString() + '"\n';
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "dashboard_export_" + dateRange + "_" + new Date().toISOString().split('T')[0] + ".csv");
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    
    showAlert('Dashboard data exported successfully', 'success');
  } catch (error) {
    console.error('Error exporting dashboard data:', error);
    showAlert('Error exporting data: ' + error.message, 'danger');
  }
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

// Quick add barn (function kept for potential future use)
// function quickAddBarn() {
//   // Redirect to barn form
//   window.location.href = 'barn-form.html';
// }

// Quick add feed (function kept for potential future use)
// function quickAddFeed() {
//   // Redirect to feed form
//   window.location.href = 'feed-form.html';
// }

// Get recent barns with pagination
async function getRecentBarnsWithPagination(page = 1, limit = 5) {
  try {
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Get total count
    const { count } = await supabase
      .from('barns')
      .select('*', { count: 'exact', head: true });
    
    // Get paginated data
    const { data, error } = await supabase
      .from('barns')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
      
    if (error) throw error;
    
    return {
      data: data || [],
      total: count || 0,
      page: page,
      limit: limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  } catch (error) {
    console.error('Error fetching paginated barns:', error);
    throw error;
  }
}

// Update pagination controls
function updatePaginationControls(total, currentPage, limit) {
  const paginationContainer = document.getElementById('barns-pagination');
  if (!paginationContainer) return;
  
  const totalPages = Math.ceil(total / limit);
  
  // Clear existing pagination
  paginationContainer.innerHTML = '';
  
  // Don't show pagination if there's only one page
  if (totalPages <= 1) return;
  
  // Create pagination container
  const pagination = document.createElement('nav');
  pagination.setAttribute('aria-label', 'Barns pagination');
  
  // Create pagination list
  const paginationList = document.createElement('ul');
  paginationList.className = 'pagination justify-content-center';
  
  // Previous button
  const prevItem = document.createElement('li');
  prevItem.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
  prevItem.innerHTML = `
    <a class="page-link" href="#" onclick="changeBarnsPage(${currentPage - 1})" tabindex="-1">
      <i class="bi bi-chevron-left"></i>
    </a>
  `;
  paginationList.appendChild(prevItem);
  
  // Page numbers
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);
  
  for (let i = startPage; i <= endPage; i++) {
    const pageItem = document.createElement('li');
    pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
    pageItem.innerHTML = `
      <a class="page-link" href="#" onclick="changeBarnsPage(${i})">${i}</a>
    `;
    paginationList.appendChild(pageItem);
  }
  
  // Next button
  const nextItem = document.createElement('li');
  nextItem.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
  nextItem.innerHTML = `
    <a class="page-link" href="#" onclick="changeBarnsPage(${currentPage + 1})">
      <i class="bi bi-chevron-right"></i>
    </a>
  `;
  paginationList.appendChild(nextItem);
  
  pagination.appendChild(paginationList);
  paginationContainer.appendChild(pagination);
}

// Change barns page
async function changeBarnsPage(page) {
  try {
    // Get paginated barns
    const result = await getRecentBarnsWithPagination(page, 5);
    
    // Update table
    updateRecentBarnsTable(result.data);
    
    // Update pagination controls
    updatePaginationControls(result.total, page, 5);
  } catch (error) {
    console.error('Error changing barns page:', error);
    showAlert('Error loading page: ' + error.message, 'danger');
  }
}