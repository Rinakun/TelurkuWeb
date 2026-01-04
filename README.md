# Telurku Admin Dashboard

A web-based admin dashboard for managing barn (kandang) data for the Telurku egg production monitoring application.

## Features

- Authentication with role-based access control (Admin/Viewer)
- CRUD operations for barn management
- Dashboard with statistics and overview
- Search and filter functionality
- Responsive design
- Real-time data updates

## Prerequisites

1. A Supabase project with the database schema applied
2. Admin users created in the profiles table with role='admin'

## Setup Instructions

### 1. Database Setup

1. Open your Supabase project dashboard
2. Navigate to the SQL Editor
3. Execute the SQL script from `supabase_schema.sql` to apply all necessary schema changes
4. Create admin users by updating their role in the profiles table:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your-admin-email@example.com';
   ```

### 2. Configuration

1. Open `config/supabase-config.js`
2. Replace the placeholder values with your actual Supabase credentials:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```

### 3. Deployment

The dashboard can be deployed to any static hosting service:

#### Netlify
1. Create a new site from your Git repository
2. Configure environment variables for Supabase URL and keys
3. Deploy the site

#### Vercel
1. Import your Git repository
2. Configure environment variables
3. Deploy

#### GitHub Pages
1. Enable GitHub Pages in your repository settings
2. Select the main branch as source
3. Note: You'll need to handle environment variables differently

## File Structure

```
admin-dashboard/
├── index.html              # Main dashboard page
├── login.html              # Login page
├── barns.html              # Barns list page
├── barn-form.html           # Add/Edit barn form
├── barn-details.html        # Barn details page
├── README.md               # This file
├── css/
│   ├── main.css            # Main styles
│   └── components.css      # Component-specific styles
├── js/
│   ├── main.js            # Main application logic
│   ├── auth.js            # Authentication module
│   ├── api.js             # API service module
│   ├── barns.js           # Barn management module
│   └── dashboard.js       # Dashboard module
├── config/
│   └── supabase-config.js # Supabase configuration
└── assets/
    ├── images/            # Image assets
    └── icons/             # Icon assets
```

## User Roles

### Admin
- Full access to all CRUD operations for barns
- Can create, read, update, and delete barns
- Can view audit logs

### Viewer
- Read-only access to barn data
- Can view barn details but cannot modify them

## Security Considerations

- Never expose your Supabase service role key in client-side code
- Row Level Security (RLS) policies are properly configured
- All user inputs are validated on both client and server side
- HTTPS is used for all communications

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Common Issues

1. **Login fails with "Unauthorized access"**
   - Ensure the user has the correct role in the profiles table
   - Check that the RLS policies are properly applied

2. **Cannot save barn data**
   - Verify that the user has admin privileges
   - Check browser console for error messages

3. **Data not loading**
   - Check Supabase connection settings
   - Verify that the database schema is correctly applied

### Getting Help

1. Check the browser console for error messages
2. Verify your Supabase configuration
3. Ensure all SQL schema changes have been applied
4. Check that your Supabase project is active

## Future Enhancements

- Advanced analytics and reporting
- Bulk operations for barn management
- Export functionality (CSV, PDF)
- Integration with IoT sensors for real-time data
- Mobile responsive design improvements
- Multi-language support

## License

This project is proprietary to Telurku.