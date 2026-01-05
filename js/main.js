// Main Application Module for Telurku Admin Dashboard

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication
  const authenticated = await requireAuth();
  if (!authenticated) return;
  
  // Load page-specific content
  await loadPageContent();
  
  // Setup event listeners
  setupEventListeners();
  
  // Update user info in UI
  updateUserInfo();
});

// Load page-specific content based on current page
async function loadPageContent() {
  const currentPath = window.location.pathname;
  const currentPage = currentPath.split('/').pop();
  
  try {
    switch(currentPage) {
      case 'index.html':
      case '':
        await loadDashboardContent();
        break;
      case 'barns.html':
        await loadBarns();
        break;
      case 'barn-details.html':
        await loadBarnDetails();
        break;
      case 'barn-form.html':
        await loadBarnForm();
        break;
      case 'feed.html':
        await loadFeedRecords();
        break;
      case 'feed-details.html':
        await loadFeedDetails();
        break;
      case 'feed-form.html':
        await loadFeedForm();
        await setupFeedFormEventListeners();
        break;
    }
  } catch (error) {
    console.error('Error loading page content:', error);
    showAlert('Error loading page content: ' + error.message, 'danger');
  }
}

// Load dashboard content
async function loadDashboardContent() {
  try {
    const stats = await getBarnStatistics();
    updateDashboardStats(stats);
    
    const recentBarns = await getRecentBarns(5);
    updateRecentBarnsTable(recentBarns);
  } catch (error) {
    console.error('Error loading dashboard content:', error);
    showAlert('Error loading dashboard content: ' + error.message, 'danger');
  }
}

// Update dashboard statistics
function updateDashboardStats(stats) {
  const totalBarnsEl = document.getElementById('total-barns');
  const totalChickensEl = document.getElementById('total-chickens');
  const dailyEggsEl = document.getElementById('daily-eggs');
  const alertsEl = document.getElementById('alerts');
  
  if (totalBarnsEl) totalBarnsEl.textContent = stats.totalBarns || 0;
  if (totalChickensEl) totalChickensEl.textContent = stats.totalChickens || 0;
  if (dailyEggsEl) dailyEggsEl.textContent = stats.dailyEggs || 0;
  if (alertsEl) alertsEl.textContent = (stats.alerts || 0) + (stats.warnings || 0);
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
      <td>${barn.name}</td>
      <td>${barn.chickens || 0}</td>
      <td>${barn.eggs_today || 0}</td>
      <td><span class="badge bg-${getStatusColor(barn.status)}">${barn.status || 'unknown'}</span></td>
    `;
    tableBody.appendChild(row);
  });
}

// Setup event listeners
function setupEventListeners() {
  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  console.log('Looking for logout button with ID: logout-btn');
  if (logoutBtn) {
    console.log('Logout button found, adding event listener');
    logoutBtn.addEventListener('click', async () => {
      console.log('Logout button clicked');
      try {
        await logout();
        console.log('Logout successful, redirecting to login.html');
        window.location.href = 'login.html';
      } catch (error) {
        console.error('Logout error:', error);
        showAlert('Error during logout: ' + error.message, 'danger');
      }
    });
  } else {
    console.log('Logout button not found');
  }
  
  // Barn form submission is handled in barns.js
  
  // Search input
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(searchBarns, 300));
  }
  
  // Status filter
  const statusFilter = document.getElementById('status-filter');
  if (statusFilter) {
    statusFilter.addEventListener('change', filterBarnsByStatus);
  }
}

// Handle barn form submission
async function handleBarnFormSubmit() {
  try {
    const formData = new FormData(document.getElementById('barn-form'));
    const barnId = formData.get('barn-id');
    
    const barnData = {
      name: formData.get('name'),
      chickens: parseInt(formData.get('chickens')) || 0,
      eggs_today: parseInt(formData.get('eggs_today')) || 0,
      temperature: parseFloat(formData.get('temperature')) || 0,
      humidity: parseFloat(formData.get('humidity')) || 0,
      status: formData.get('status') || 'ok',
      profile_id: formData.get('profile-id')
    };
    
    // Validate form data
    if (!barnData.name) {
      showAlert('Barn name is required', 'warning');
      return;
    }
    
    if (!barnData.profile_id) {
      showAlert('Please select a profile', 'warning');
      return;
    }
    
    if (barnId) {
      // Update existing barn
      await updateBarn(barnId, barnData);
      showAlert('Barn updated successfully', 'success');
    } else {
      // Create new barn
      await createBarn(barnData);
      showAlert('Barn created successfully', 'success');
    }
    
    // Clear form data from session
    sessionStorage.removeItem('editBarn');
    
    // Redirect to barns list
    window.location.href = 'barns.html';
  } catch (error) {
    console.error('Error saving barn:', error);
    showAlert('Error saving barn: ' + error.message, 'danger');
  }
}

// Load barn form
async function loadBarnForm() {
  const editBarnData = sessionStorage.getItem('editBarn');
  
  if (editBarnData) {
    try {
      const barn = JSON.parse(editBarnData);
      populateBarnForm(barn);
      
      // Update page title
      const pageTitle = document.querySelector('h1');
      if (pageTitle) {
        pageTitle.textContent = 'Edit Barn';
      }
    } catch (error) {
      console.error('Error loading barn for editing:', error);
      showAlert('Error loading barn data: ' + error.message, 'danger');
    }
  }
}

// Populate barn form with data
function populateBarnForm(barn) {
  const form = document.getElementById('barn-form');
  if (!form) return;
  
  form.querySelector('[name="barn-id"]').value = barn.id || '';
  form.querySelector('[name="name"]').value = barn.name || '';
  form.querySelector('[name="chickens"]').value = barn.chickens || 0;
  form.querySelector('[name="eggs_today"]').value = barn.eggs_today || 0;
  form.querySelector('[name="temperature"]').value = barn.temperature || 0;
  form.querySelector('[name="humidity"]').value = barn.humidity || 0;
  form.querySelector('[name="status"]').value = barn.status || 'ok';
  form.querySelector('[name="profile-id"]').value = barn.profile_id || '';
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

// Debounce function for search
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Utility function to format dates
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
}

// Utility function to format date and time
function formatDateTime(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString();
}