// API Service Module for Telurku Admin Dashboard

// Get all barns
async function getBarns() {
  try {
    const { data, error } = await supabase
      .from('barns')
      .select(`
        *,
        profiles(name, email)
      `)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching barns:', error);
    throw error;
  }
}

// Get barn by ID
async function getBarnById(id) {
  try {
    const { data, error } = await supabase
      .from('barns')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching barn:', error);
    throw error;
  }
}

// Create new barn
async function createBarn(barnData) {
  try {
    const { data, error } = await supabase
      .from('barns')
      .insert([barnData])
      .select();
      
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error creating barn:', error);
    throw error;
  }
}

// Update barn
async function updateBarn(id, barnData) {
  try {
    const { data, error } = await supabase
      .from('barns')
      .update(barnData)
      .eq('id', id)
      .select();
      
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error updating barn:', error);
    throw error;
  }
}

// Delete barn
async function deleteBarn(id) {
  try {
    const { error } = await supabase
      .from('barns')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting barn:', error);
    throw error;
  }
}

// Get barn statistics
async function getBarnStatistics() {
  try {
    const { data, error } = await supabase
      .from('barns')
      .select('*');
      
    if (error) throw error;
    
    // Calculate statistics
    const stats = {
      totalBarns: data.length,
      totalChickens: data.reduce((sum, barn) => sum + (barn.chickens || 0), 0),
      dailyEggs: data.reduce((sum, barn) => sum + (barn.eggs_today || 0), 0),
      alerts: data.filter(barn => barn.status === 'alert').length,
      warnings: data.filter(barn => barn.status === 'warning').length,
      ok: data.filter(barn => barn.status === 'ok').length
    };
    
    return stats;
  } catch (error) {
    console.error('Error fetching barn statistics:', error);
    throw error;
  }
}

// Search barns by name
async function searchBarns(searchTerm) {
  try {
    const { data, error } = await supabase
      .from('barns')
      .select(`
        *,
        profiles(name, email)
      `)
      .ilike('name', `%${searchTerm}%`)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error searching barns:', error);
    throw error;
  }
}

// Filter barns by status
async function filterBarnsByStatus(status) {
  try {
    const { data, error } = await supabase
      .from('barns')
      .select(`
        *,
        profiles(name, email)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error filtering barns:', error);
    throw error;
  }
}

// Get recent barns (limit to 5 for dashboard)
async function getRecentBarns(limit = 5) {
  try {
    const { data, error } = await supabase
      .from('barns')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching recent barns:', error);
    throw error;
  }
}

// Get barn audit log
async function getBarnAuditLog(barnId) {
  try {
    const { data, error } = await supabase
      .from('barn_audit_log')
      .select('*')
      .eq('barn_id', barnId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching audit log:', error);
    throw error;
  }
}

// Feed Management Functions

// Get all feed records
async function getFeedRecords() {
  try {
    const { data, error } = await supabase
      .from('feed')
      .select(`
        *,
        barns(name),
        profiles(email)
      `)
      .order('date', { ascending: false });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching feed records:', error);
    throw error;
  }
}

// Get feed record by ID
async function getFeedById(id) {
  try {
    const { data, error } = await supabase
      .from('feed')
      .select(`
        *,
        barns(name),
        profiles(email)
      `)
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching feed record:', error);
    throw error;
  }
}

// Get profiles for dropdown selection
async function getProfiles() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email')
      .order('name', { ascending: true });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching profiles:', error);
    throw error;
  }
}

// Get barns by profile ID
async function getBarnsByProfileId(profileId) {
  try {
    const { data, error } = await supabase
      .from('barns')
      .select('*')
      .eq('profile_id', profileId)
      .order('name', { ascending: true });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching barns for profile:', error);
    throw error;
  }
}

// Get feed records by barn ID
async function getFeedByBarnId(barnId) {
  try {
    const { data, error } = await supabase
      .from('feed')
      .select('*')
      .eq('barn_id', barnId)
      .order('date', { ascending: false });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching feed records for barn:', error);
    throw error;
  }
}

// Create new feed record
async function createFeedRecord(feedData) {
  try {
    const { data, error } = await supabase
      .from('feed')
      .insert([feedData])
      .select();
      
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error creating feed record:', error);
    throw error;
  }
}

// Update feed record
async function updateFeedRecord(id, feedData) {
  try {
    const { data, error } = await supabase
      .from('feed')
      .update(feedData)
      .eq('id', id)
      .select();
      
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error updating feed record:', error);
    throw error;
  }
}

// Delete feed record
async function deleteFeedRecord(id) {
  try {
    const { error } = await supabase
      .from('feed')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting feed record:', error);
    throw error;
  }
}

// Get feed statistics
async function getFeedStatistics() {
  try {
    const { data, error } = await supabase
      .from('feed')
      .select('*');
      
    if (error) throw error;
    
    // Calculate statistics
    const stats = {
      totalRecords: data.length,
      totalAmount: data.reduce((sum, record) => sum + (record.amount || 0), 0),
      averageConsumptionRate: data.reduce((sum, record) => sum + (record.consumption_rate || 0), 0) / data.length,
      lowStockAlerts: data.filter(record =>
        record.estimated_days_remaining && record.estimated_days_remaining < 7
      ).length
    };
    
    return stats;
  } catch (error) {
    console.error('Error fetching feed statistics:', error);
    throw error;
  }
}