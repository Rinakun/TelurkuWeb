// Feed Management Module for Telurku Admin Dashboard

// Check if user can access feed management (admin or viewer)
async function canAccessFeedManagement() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    window.location.href = 'login.html';
    return false;
  }
  
  // Both admin and viewer can view feed records
  const admin = await isAdmin();
  const viewer = await isViewer();
  
  return admin || viewer;
}

// Render feed table
function renderFeedTable(feedRecords) {
  const tableBody = document.getElementById('feed-table-body');
  if (!tableBody) return;
  
  tableBody.innerHTML = '';
  
  if (feedRecords.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="7" class="text-center">No feed records found</td>`;
    tableBody.appendChild(row);
    return;
  }
  
  feedRecords.forEach(feed => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${feed.barns?.name || 'N/A'}</td>
      <td>${feed.profiles?.email || 'N/A'}</td>
      <td>${feed.type || 'N/A'}</td>
      <td>${feed.amount || 0}</td>
      <td>${formatDate(feed.date)}</td>
      <td>${formatDate(feed.created_at)}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="viewFeed('${feed.id}')" title="View">
          <i class="bi bi-eye"></i>
        </button>
        <button class="btn btn-sm btn-warning" onclick="editFeed('${feed.id}')" title="Edit">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="confirmDeleteFeed('${feed.id}')" title="Delete">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Load feed records on page load
async function loadFeedRecords() {
  try {
    const feedRecords = await getFeedRecords();
    renderFeedTable(feedRecords);
  } catch (error) {
    console.error('Error loading feed records:', error);
    showAlert('Error loading feed records: ' + error.message, 'danger');
  }
}

// View feed details
async function viewFeed(id) {
  try {
    const feed = await getFeedById(id);
    if (!feed) {
      showAlert('Feed record not found', 'warning');
      return;
    }
    
    // Store feed data for the detail view
    sessionStorage.setItem('currentFeed', JSON.stringify(feed));
    window.location.href = 'feed-details.html';
  } catch (error) {
    console.error('Error viewing feed:', error);
    showAlert('Error loading feed details: ' + error.message, 'danger');
  }
}

// Edit feed
async function editFeed(id) {
  try {
    const feed = await getFeedById(id);
    if (!feed) {
      showAlert('Feed record not found', 'warning');
      return;
    }
    
    // Store feed data for the edit form
    sessionStorage.setItem('editFeed', JSON.stringify(feed));
    window.location.href = 'feed-form.html';
  } catch (error) {
    console.error('Error editing feed:', error);
    showAlert('Error loading feed for editing: ' + error.message, 'danger');
  }
}

// Confirm delete feed
async function confirmDeleteFeed(id) {
  try {
    const feed = await getFeedById(id);
    if (!feed) {
      showAlert('Feed record not found', 'warning');
      return;
    }
    
    if (confirm(`Are you sure you want to delete this feed record for "${feed.barns?.name || 'Unknown Barn'}"? This action cannot be undone.`)) {
      await deleteFeedRecord(id);
      showAlert('Feed record deleted successfully', 'success');
      await loadFeedRecords(); // Reload the table
    }
  } catch (error) {
    console.error('Error deleting feed:', error);
    showAlert('Error deleting feed record: ' + error.message, 'danger');
  }
}

// Search feed records
async function searchFeedRecords() {
  const searchTerm = document.getElementById('search-input')?.value;
  if (!searchTerm) {
    await loadFeedRecords();
    return;
  }
  
  try {
    // For now, we'll filter on the client side since we don't have a specific search function
    const allFeeds = await getFeedRecords();
    const filteredFeeds = allFeeds.filter(feed => 
      (feed.barns?.name && feed.barns.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (feed.type && feed.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (feed.profiles?.email && feed.profiles.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    renderFeedTable(filteredFeeds);
  } catch (error) {
    console.error('Error searching feed records:', error);
    showAlert('Error searching feed records: ' + error.message, 'danger');
  }
}

// Filter feed records by type
async function filterFeedByType() {
  const feedType = document.getElementById('type-filter')?.value;
  if (!feedType || feedType === 'all') {
    await loadFeedRecords();
    return;
  }
  
  try {
    // For now, we'll filter on the client side
    const allFeeds = await getFeedRecords();
    const filteredFeeds = allFeeds.filter(feed => feed.type === feedType);
    renderFeedTable(filteredFeeds);
  } catch (error) {
    console.error('Error filtering feed records:', error);
    showAlert('Error filtering feed records: ' + error.message, 'danger');
  }
}

// Display feed details
function displayFeedDetails(feed) {
  if (!feed) return;
  
  document.getElementById('feed-barn').textContent = feed.barns?.name || 'N/A';
  document.getElementById('feed-profile').textContent = feed.profiles?.email || 'N/A';
  document.getElementById('feed-type').textContent = feed.type || 'N/A';
  document.getElementById('feed-amount').textContent = feed.amount || 0;
  document.getElementById('feed-date').textContent = formatDate(feed.date);
  document.getElementById('feed-created').textContent = formatDateTime(feed.created_at);
  document.getElementById('feed-device-id').textContent = feed.device_id || 'N/A';
  document.getElementById('feed-consumption-rate').textContent = feed.consumption_rate || 'N/A';
  document.getElementById('feed-estimated-days').textContent = feed.estimated_days_remaining || 'N/A';
  document.getElementById('feed-last-refill').textContent = formatDateTime(feed.last_refill);
}

// Load feed details page
async function loadFeedDetails() {
  const feedData = sessionStorage.getItem('currentFeed');
  if (!feedData) {
    showAlert('No feed data found', 'warning');
    window.location.href = 'feed.html';
    return;
  }
  
  try {
    const feed = JSON.parse(feedData);
    displayFeedDetails(feed);
  } catch (error) {
    console.error('Error loading feed details:', error);
    showAlert('Error loading feed details: ' + error.message, 'danger');
  }
}

// Load profiles for dropdown
async function loadProfilesForDropdown() {
  try {
    const profiles = await getProfiles();
    const profileSelect = document.getElementById('profile-id');
    
    if (!profileSelect) return;
    
    // Clear existing options except the first one
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

// Load barns for dropdown based on selected profile
async function loadBarnsForDropdown(profileId) {
  try {
    const barns = await getBarnsByProfileId(profileId);
    const barnSelect = document.getElementById('barn-id');
    
    if (!barnSelect) return;
    
    // Clear existing options except the first one
    while (barnSelect.children.length > 1) {
      barnSelect.removeChild(barnSelect.lastChild);
    }
    
    // Enable barn dropdown if we have barns
    if (barns.length > 0) {
      barnSelect.disabled = false;
      
      barns.forEach(barn => {
        const option = document.createElement('option');
        option.value = barn.id;
        option.textContent = barn.name;
        barnSelect.appendChild(option);
      });
    } else {
      // No barns found for this profile
      barnSelect.disabled = true;
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'No barns found for this profile';
      barnSelect.appendChild(option);
    }
  } catch (error) {
    console.error('Error loading barns:', error);
    showAlert('Error loading barns: ' + error.message, 'danger');
  }
}

// Load feed form data
async function loadFeedForm() {
  const editFeedData = sessionStorage.getItem('editFeed');
  if (editFeedData) {
    try {
      const feed = JSON.parse(editFeedData);
      
      // Update page title
      document.getElementById('page-title').textContent = 'Edit Feed Record';
      
      // Load profiles first
      await loadProfilesForDropdown();
      
      // Set profile
      const profileSelect = document.getElementById('profile-id');
      if (profileSelect) {
        profileSelect.value = feed.profile_id || '';
      }
      
      // Fill form with feed data
      document.getElementById('feed-id').value = feed.id || '';
      document.getElementById('type').value = feed.type || '';
      document.getElementById('amount').value = feed.amount || '';
      document.getElementById('date').value = feed.date || '';
      document.getElementById('device-id').value = feed.device_id || '';
      document.getElementById('consumption-rate').value = feed.consumption_rate || '';
      document.getElementById('estimated-days').value = feed.estimated_days_remaining || '';
      document.getElementById('last-refill').value = feed.last_refill ? new Date(feed.last_refill).toISOString().split('T')[0] : '';
      
      // Update save button text
      document.getElementById('save-btn-text').textContent = 'Update Feed';
      
      // Clear session storage
      sessionStorage.removeItem('editFeed');
    } catch (error) {
      console.error('Error loading feed data:', error);
      showAlert('Error loading feed data', 'danger');
    }
  } else {
    // For new feed, just load profiles
    await loadProfilesForDropdown();
  }
  
  // Setup event listeners after loading data
  setupFeedFormEventListeners();
}

// Setup event listeners for feed form
function setupFeedFormEventListeners() {
  // Form submission
  const form = document.getElementById('feed-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const saveBtn = document.getElementById('save-btn');
      const saveBtnText = document.getElementById('save-btn-text');
      const saveBtnSpinner = document.getElementById('save-btn-spinner');
      
      // Prevent multiple submissions
      if (saveBtn.disabled) return;
      
      // Show loading state
      saveBtn.disabled = true;
      saveBtnText.textContent = 'Saving...';
      saveBtnSpinner.classList.remove('d-none');
      
      try {
        // Get form data
        const formData = new FormData(form);
        const feedData = {
          profile_id: formData.get('profile-id'),
          type: formData.get('type'),
          amount: parseInt(formData.get('amount')) || 0,
          date: formData.get('date'),
          device_id: formData.get('device-id') || null,
          consumption_rate: parseFloat(formData.get('consumption-rate')) || null,
          estimated_days_remaining: parseInt(formData.get('estimated-days')) || null,
          last_refill: formData.get('last-refill') ? new Date(formData.get('last-refill')).toISOString() : null
        };
        
        const feedId = formData.get('feed-id');
        
        if (feedId) {
          // Update existing feed record
          await updateFeedRecord(feedId, feedData);
          showAlert('Feed record updated successfully', 'success');
        } else {
          // Create new feed record
          await createFeedRecord(feedData);
          showAlert('Feed record created successfully', 'success');
        }
        
        // Redirect to feed list page after a short delay
        setTimeout(() => {
          window.location.href = 'feed.html';
        }, 1000);
      } catch (error) {
        console.error('Error saving feed record:', error);
        showAlert('Error saving feed record: ' + error.message, 'danger');
      } finally {
        // Reset button state
        saveBtn.disabled = false;
        saveBtnText.textContent = feedId ? 'Update Feed' : 'Save Feed';
        saveBtnSpinner.classList.add('d-none');
      }
    });
  }
}