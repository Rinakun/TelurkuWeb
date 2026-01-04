// Barn Management Module for Telurku Admin Dashboard

// Render barns table
function renderBarnsTable(barns) {
  const tableBody = document.getElementById('barns-table-body');
  if (!tableBody) return;
  
  tableBody.innerHTML = '';
  
  if (barns.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="7" class="text-center">No barns found</td>`;
    tableBody.appendChild(row);
    return;
  }
  
  barns.forEach(barn => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${barn.name}</td>
      <td>${barn.chickens || 0}</td>
      <td>${barn.eggs_today || 0}</td>
      <td>${barn.temperature || 0}°C</td>
      <td>${barn.humidity || 0}%</td>
      <td><span class="badge bg-${getStatusColor(barn.status)}">${barn.status || 'unknown'}</span></td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="viewBarn('${barn.id}')" title="View">
          <i class="bi bi-eye"></i>
        </button>
        <button class="btn btn-sm btn-warning" onclick="editBarn('${barn.id}')" title="Edit">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="confirmDeleteBarn('${barn.id}')" title="Delete">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });
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

// Load barns on page load
async function loadBarns() {
  try {
    const barns = await getBarns();
    renderBarnsTable(barns);
  } catch (error) {
    console.error('Error loading barns:', error);
    showAlert('Error loading barns: ' + error.message, 'danger');
  }
}

// View barn details
async function viewBarn(id) {
  try {
    const barn = await getBarnById(id);
    if (!barn) {
      showAlert('Barn not found', 'warning');
      return;
    }
    
    // Store barn data for the detail view
    sessionStorage.setItem('currentBarn', JSON.stringify(barn));
    window.location.href = 'barn-details.html';
  } catch (error) {
    console.error('Error viewing barn:', error);
    showAlert('Error loading barn details: ' + error.message, 'danger');
  }
}

// Edit barn
async function editBarn(id) {
  try {
    const barn = await getBarnById(id);
    if (!barn) {
      showAlert('Barn not found', 'warning');
      return;
    }
    
    // Store barn data for the edit form
    sessionStorage.setItem('editBarn', JSON.stringify(barn));
    window.location.href = 'barn-form.html';
  } catch (error) {
    console.error('Error editing barn:', error);
    showAlert('Error loading barn for editing: ' + error.message, 'danger');
  }
}

// Confirm delete barn
async function confirmDeleteBarn(id) {
  try {
    const barn = await getBarnById(id);
    if (!barn) {
      showAlert('Barn not found', 'warning');
      return;
    }
    
    if (confirm(`Are you sure you want to delete "${barn.name}"? This action cannot be undone.`)) {
      await deleteBarn(id);
      showAlert('Barn deleted successfully', 'success');
      await loadBarns(); // Reload the table
    }
  } catch (error) {
    console.error('Error deleting barn:', error);
    showAlert('Error deleting barn: ' + error.message, 'danger');
  }
}

// Search barns
async function searchBarns() {
  const searchTerm = document.getElementById('search-input')?.value;
  if (!searchTerm) {
    await loadBarns();
    return;
  }
  
  try {
    const barns = await searchBarns(searchTerm);
    renderBarnsTable(barns);
  } catch (error) {
    console.error('Error searching barns:', error);
    showAlert('Error searching barns: ' + error.message, 'danger');
  }
}

// Filter barns by status
async function filterBarnsByStatus() {
  const status = document.getElementById('status-filter')?.value;
  if (!status || status === 'all') {
    await loadBarns();
    return;
  }
  
  try {
    const barns = await filterBarnsByStatus(status);
    renderBarnsTable(barns);
  } catch (error) {
    console.error('Error filtering barns:', error);
    showAlert('Error filtering barns: ' + error.message, 'danger');
  }
}

// Display barn details
function displayBarnDetails(barn) {
  if (!barn) return;
  
  document.getElementById('barn-name').textContent = barn.name || 'N/A';
  document.getElementById('barn-chickens').textContent = barn.chickens || 0;
  document.getElementById('barn-eggs-today').textContent = barn.eggs_today || 0;
  document.getElementById('barn-temperature').textContent = `${barn.temperature || 0}°C`;
  document.getElementById('barn-humidity').textContent = `${barn.humidity || 0}%`;
  document.getElementById('barn-status').innerHTML = `<span class="badge bg-${getStatusColor(barn.status)}">${barn.status || 'unknown'}</span>`;
  document.getElementById('barn-created').textContent = new Date(barn.created_at).toLocaleDateString();
  document.getElementById('barn-updated').textContent = new Date(barn.updated_at).toLocaleDateString();
}

// Load barn details page
async function loadBarnDetails() {
  const barnData = sessionStorage.getItem('currentBarn');
  if (!barnData) {
    showAlert('No barn data found', 'warning');
    window.location.href = 'barns.html';
    return;
  }
  
  try {
    const barn = JSON.parse(barnData);
    displayBarnDetails(barn);
    
    // Load audit log if available
    try {
      const auditLog = await getBarnAuditLog(barn.id);
      displayAuditLog(auditLog);
    } catch (error) {
      console.log('Audit log not available:', error.message);
    }
  } catch (error) {
    console.error('Error loading barn details:', error);
    showAlert('Error loading barn details: ' + error.message, 'danger');
  }
}

// Display audit log
function displayAuditLog(auditLog) {
  const auditLogContainer = document.getElementById('audit-log');
  if (!auditLogContainer || !auditLog || auditLog.length === 0) {
    if (auditLogContainer) {
      auditLogContainer.innerHTML = '<p class="text-muted">No audit log available</p>';
    }
    return;
  }
  
  let logHtml = '<div class="table-responsive"><table class="table table-sm"><thead><tr><th>Operation</th><th>Date</th><th>Details</th></tr></thead><tbody>';
  
  auditLog.forEach(entry => {
    const date = new Date(entry.created_at).toLocaleString();
    logHtml += `
      <tr>
        <td><span class="badge bg-${getOperationColor(entry.operation)}">${entry.operation}</span></td>
        <td>${date}</td>
        <td>${formatAuditDetails(entry)}</td>
      </tr>
    `;
  });
  
  logHtml += '</tbody></table></div>';
  auditLogContainer.innerHTML = logHtml;
}

// Get operation color for badge
function getOperationColor(operation) {
  switch(operation) {
    case 'CREATE': return 'success';
    case 'UPDATE': return 'warning';
    case 'DELETE': return 'danger';
    default: return 'secondary';
  }
}

// Format audit details
function formatAuditDetails(entry) {
  if (entry.operation === 'DELETE') {
    return 'Barn was deleted';
  }
  
  const data = entry.operation === 'CREATE' ? entry.new_data : entry.old_data;
  if (!data) return 'No details available';
  
  return `Barn: ${data.name || 'N/A'}`;
}

// Handle barn form submission
async function handleBarnFormSubmit(e) {
  e.preventDefault();
  
  const saveBtn = document.getElementById('save-btn');
  const saveBtnText = document.getElementById('save-btn-text');
  const saveBtnSpinner = document.getElementById('save-btn-spinner');
  
  // Prevent multiple submissions
  if (saveBtn.disabled) return;
  
  // Check if profile is selected
  const profileId = document.getElementById('profile-id').value;
  if (!profileId) {
    showAlert('Please select a profile', 'warning');
    return;
  }
  
  // Show loading state
  saveBtn.disabled = true;
  saveBtnText.textContent = 'Saving...';
  saveBtnSpinner.classList.remove('d-none');
  
  try {
    const formData = new FormData(document.getElementById('barn-form'));
    const barnData = {
      name: formData.get('name'),
      chickens: parseInt(formData.get('chickens')) || 0,
      eggs_today: parseInt(formData.get('eggs_today')) || 0,
      temperature: parseFloat(formData.get('temperature')) || 0,
      humidity: parseFloat(formData.get('humidity')) || 0,
      status: formData.get('status') || 'ok',
      profile_id: profileId
    };
    
    const barnId = formData.get('barn-id');
    
    console.log('Submitting barn data:', barnData);
    
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
    
    // Redirect to barns list after a short delay
    setTimeout(() => {
      window.location.href = 'barns.html';
    }, 1000);
  } catch (error) {
    console.error('Error saving barn:', error);
    showAlert('Error saving barn: ' + error.message, 'danger');
  } finally {
    // Reset button state
    saveBtn.disabled = false;
    saveBtnText.textContent = barnId ? 'Update Barn' : 'Save Barn';
    saveBtnSpinner.classList.add('d-none');
  }
}

// Setup event listeners
function setupEventListeners() {
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

  // Refresh button
  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      refreshBtn.disabled = true;
      refreshBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Loading...';
      
      await loadBarns();
      
      refreshBtn.disabled = false;
      refreshBtn.innerHTML = '<i class="bi bi-arrow-clockwise"></i> Refresh';
    });
  }

  // Barn form submission
  const barnForm = document.getElementById('barn-form');
  if (barnForm) {
    barnForm.addEventListener('submit', handleBarnFormSubmit);
  }

  // Profile selection change
  const profileSelect = document.querySelector('[name="profile-id"]');
  if (profileSelect) {
    profileSelect.addEventListener('change', async (e) => {
      const profileId = e.target.value;
      if (profileId) {
        await loadBarnsForDropdown(profileId);
      } else {
        // Clear barns dropdown
        const barnSelect = document.querySelector('[name="barn-id"]');
        while (barnSelect.children.length > 1) {
          barnSelect.removeChild(barnSelect.lastChild);
        }
      }
    });
  }
}

// Load barn form
async function loadBarnForm() {
 const editBarnData = sessionStorage.getItem('editBarn');
 
 if (editBarnData) {
   try {
     const barn = JSON.parse(editBarnData);
     
     // Update page title
     const pageTitle = document.querySelector('h1');
     if (pageTitle) {
       pageTitle.textContent = 'Edit Barn';
     }
     
     // Load profiles first
     await loadProfilesForDropdown();
     
     // Set profile
     const profileSelect = document.querySelector('[name="profile-id"]');
     if (profileSelect) {
       profileSelect.value = barn.profile_id || '';
     }
     
     // Fill form with barn data
     document.querySelector('[name="barn-id"]').value = barn.id || '';
     document.querySelector('[name="name"]').value = barn.name || '';
     document.querySelector('[name="status"]').value = barn.status || 'ok';
     document.querySelector('[name="chickens"]').value = barn.chickens || '';
     document.querySelector('[name="eggs_today"]').value = barn.eggs_today || '';
     document.querySelector('[name="temperature"]').value = barn.temperature || '';
     document.querySelector('[name="humidity"]').value = barn.humidity || '';
     
     // Clear session storage
     sessionStorage.removeItem('editBarn');
   } catch (error) {
     console.error('Error loading barn data:', error);
     showAlert('Error loading barn data: ' + error.message, 'danger');
   }
 } else {
   // For new barn, just load profiles
   await loadProfilesForDropdown();
 }
}

// Load profiles for dropdown (for barn form)
async function loadProfilesForDropdown() {
 try {
   const profiles = await getProfiles();
   const profileSelect = document.querySelector('[name="profile-id"]');
   
   if (!profileSelect) return;
   
   // Clear existing options except first one
   while (profileSelect.children.length > 1) {
     profileSelect.removeChild(profileSelect.lastChild);
   }
   
   profiles.forEach(profile => {
     const option = document.createElement('option');
     option.value = profile.id;
     option.textContent = `${profile.name || profile.email}`;
     profileSelect.appendChild(option);
   });
 } catch (error) {
   console.error('Error loading profiles:', error);
   showAlert('Error loading profiles: ' + error.message, 'danger');
 }
}