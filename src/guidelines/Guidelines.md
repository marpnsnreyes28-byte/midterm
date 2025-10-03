# Notre Dame of Kidapawan College - RFID System Guidelines

## Authentication System

This application uses **Supabase** for authentication and database management.

### Important Notes

1. **Security**: The system uses Supabase Auth for secure user authentication and session management.

2. **Data Storage**: 
   - Authentication is handled by Supabase Auth
   - User profiles and app data are stored in Supabase PostgreSQL database
   - Real-time updates via Supabase subscriptions
   - Offline-friendly with local state management

3. **User Types**:
   - **Admin**: One admin account created during initial setup
   - **Teachers**: Created by admin with official NDKC emails (@ndkc.edu.ph)

## Design Guidelines

### Theme Colors
The system uses Notre Dame's traditional colors:
- **Green**: #22c55e (life and growth)
- **Yellow/Gold**: #fbbf24, #f59e0b (wisdom)
- **White**: #ffffff (purity)
- **Blue**: #3b82f6 (Blessed Virgin Mary)
- **Red**: #ef4444 (courage)
- **Black**: #000000 (faith)

### Theme Toggle
- Light green theme for day mode
- Dark green theme for night mode
- Theme selection persists across sessions

### Background
- Campus image with automatic zoom effect (zooms every 30 seconds)
- 10% opacity overlay
- Smooth transitions

## Development Guidelines

### General Rules
* Maintain responsive layouts using flexbox and grid
* Keep components modular and reusable
* Follow the existing file structure
* Use TypeScript for type safety
* Handle errors gracefully with user-friendly messages

### Data Management
* All app data (teachers, classrooms, schedules, attendance, notifications) stored in Supabase
* Real-time updates through Supabase subscriptions
* Local state management for optimal performance
* Always validate data before storage

### Security
* Supabase Auth handles password encryption and security
* Row Level Security (RLS) policies protect data access
* Validate NDKC email format for teachers
* Session management handled by Supabase
* Check user permissions before operations

### UI/UX
* Use shadcn/ui components for consistency
* Show loading states during async operations
* Provide clear error messages
* Confirm destructive actions (delete, etc.)
* Use Notre Dame color scheme throughout

## Component Structure

### Core Components
- **AuthProvider**: Manages authentication state and data operations
- **SetupGuard**: Controls initial setup flow
- **LoginForm**: Handles login and admin registration
- **Dashboard**: Routes to Admin or Teacher dashboard
- **AdminDashboard**: Full system management interface
- **TeacherDashboard**: Limited view for teachers

### Data Flow
1. User authenticates through Supabase Auth
2. Session managed by Supabase
3. User profile loaded from Supabase database
4. App data loaded from Supabase with real-time subscriptions
5. Local state management for optimal performance