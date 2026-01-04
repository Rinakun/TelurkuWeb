// Authentication Module for Telurku Admin Dashboard

// Login function
async function login(email, password) {
  try {
    // Check if supabase client is available
    if (!supabase) {
      throw new Error('Supabase client is not initialized. Please refresh the page and try again.');
    }
    
    if (!supabase.auth) {
      throw new Error('Supabase auth is not available. Please refresh the page and try again.');
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    if (error) {
      throw error;
    }
    
    // Check user role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();
      
    if (profileError) {
      throw new Error('Failed to verify user role');
    }
    
    if (!profile || (profile.role !== 'admin' && profile.role !== 'viewer')) {
      throw new Error('Unauthorized access. Admin or viewer role required.');
    }
    
    // Store user session info
    sessionStorage.setItem('userRole', profile.role);
    sessionStorage.setItem('userId', data.user.id);
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Logout function
async function logout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Clear session storage
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userId');
    
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

// Check current session
async function getCurrentSession() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Session check error:', error);
    return null;
  }
}

// Check if user is admin
async function isAdmin() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    return profile?.role === 'admin';
  } catch (error) {
    console.error('Admin check error:', error);
    return false;
  }
}

// Check if user is viewer
async function isViewer() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    return profile?.role === 'viewer';
  } catch (error) {
    console.error('Viewer check error:', error);
    return false;
  }
}

// Get current user role
function getCurrentUserRole() {
  return sessionStorage.getItem('userRole');
}

// Get current user ID
function getCurrentUserId() {
  return sessionStorage.getItem('userId');
}

// Check if user is authenticated
async function isAuthenticated() {
  const session = await getCurrentSession();
  return session !== null;
}

// Redirect to login if not authenticated
async function requireAuth() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// Redirect non-admin users
async function requireAdmin() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    window.location.href = 'login.html';
    return false;
  }
  
  const admin = await isAdmin();
  if (!admin) {
    showAlert('Access denied. Admin privileges required.', 'danger');
    return false;
  }
  return true;
}

// Get all profiles (admin only)
async function getAllProfiles() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, role')
      .order('name', { ascending: true });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching profiles:', error);
    throw error;
  }
}