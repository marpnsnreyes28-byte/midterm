# NDKC RFID Classroom Attendance System

A comprehensive web-based RFID attendance system built for Notre Dame of Kidapawan College, featuring real-time attendance tracking, teacher management, and automated classroom scheduling.

## 🚀 Features

### For Administrators
- **Teacher Management**: Add, edit, and manage teacher profiles across three departments (CBA, CTE, CECE)
- **RFID Registration**: Assign and manage RFID cards for teachers
- **Classroom Management**: Create and manage classroom locations and capacity
- **Schedule Management**: Set up class schedules with day, time, and subject details
- **Real-time Monitoring**: Live attendance tracking and notifications
- **Reporting**: Comprehensive attendance reports and analytics
- **Notification System**: Send announcements to teachers

### For Teachers
- **Secure Login**: Email-based authentication with NDKC domain restriction
- **Personal Dashboard**: View attendance history and personal schedules
- **Notification Center**: Receive important announcements from admin
- **Profile Management**: View personal information (admin-managed)

### RFID Terminal
- **Automatic Scanning**: Works with Hoba RFID readers
- **Schedule Validation**: Enforces strict schedule compliance with 15-minute grace period
- **Smart Tap Detection**: Automatically determines tap in/out based on current session
- **Fullscreen Kiosk Mode**: Optimized for dedicated terminal displays
- **Visual & Audio Feedback**: Clear success/failure indicators with sound notifications
- **Real-time Updates**: Live schedule and active session displays

## 🛠 Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time subscriptions)
- **UI Components**: Shadcn/ui, Radix UI primitives
- **Icons**: Lucide React
- **Animations**: Motion (Framer Motion)
- **Notifications**: Sonner
- **Deployment**: Vercel, Netlify, or self-hosted options

## 🎨 Design System

The system incorporates Notre Dame of Kidapawan College's traditional colors:
- **Green** (#22c55e) - Life and growth
- **Yellow/Gold** (#eab308) - Wisdom  
- **White** (#ffffff) - Purity
- **Blue** (#3b82f6) - Blessed Virgin Mary
- **Red** (#ef4444) - Courage
- **Black** (#1f2937) - Faith

Features both light and dark theme support with smooth transitions.

## 📋 Prerequisites

- Node.js 18 or higher
- Supabase account
- Modern web browser
- Hoba RFID reader (for terminals)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/ndkc-rfid-attendance.git
cd ndkc-rfid-attendance
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

Follow the detailed setup guide in `/SUPABASE_SETUP.md`:

1. Create a Supabase project
2. Run the database initialization script
3. Get your project credentials

### 4. Configure Supabase Credentials

Open `/lib/config.ts` and replace the placeholder values with your Supabase credentials:

```typescript
export const config = {
  supabase: {
    url: 'https://your-project-ref.supabase.co',  // Replace this
    anonKey: 'your-anon-key-here',                 // Replace this
  },
  // ... rest of config
}
```

**Alternative method** - Set via HTML (for deployment):

Add this to your `index.html` before other scripts:

```html
<script>
  window.ENV = {
    SUPABASE_URL: 'https://your-project-ref.supabase.co',
    SUPABASE_ANON_KEY: 'your-anon-key-here'
  };
</script>
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Login with Default Admin

- **Email**: admin@ndkc.edu.ph
- **Password**: admin123

⚠️ **Important**: Change the default password after first login!

## 📖 Documentation

- **[Supabase Setup Guide](./SUPABASE_SETUP.md)** - Complete database setup instructions
- **[RFID Terminal Guide](./RFID_TERMINAL_GUIDE.md)** - Terminal usage and configuration
- **[Deployment Guide](./DEPLOYMENT.md)** - Production deployment instructions

## 🏗 Project Structure

```
├── components/           # React components
│   ├── ui/              # Shadcn/ui components
│   ├── AuthProvider.tsx # Authentication context
│   ├── Dashboard.tsx    # Main dashboard
│   └── ...
├── lib/                 # Utilities and configurations
│   ├── supabase.ts     # Supabase client
│   ├── database.types.ts # TypeScript types
│   └── database-init.sql # Database schema
├── styles/             # Global styles
├── public/             # Static assets
└── App.tsx            # Main application component
```

## 🔧 Key Components

### Authentication System
- Supabase Auth integration
- Role-based access control (admin/teacher)
- Session management with auto-refresh
- Email domain restriction (@ndkc.edu.ph)

### RFID Terminal
- Automatic card scanning
- Schedule validation with grace period
- Room-specific access control
- Real-time feedback and notifications

### Database Schema
- **users** - Admin and teacher accounts
- **classrooms** - Physical classroom locations  
- **schedules** - Class schedules by teacher/classroom/day
- **attendance_records** - RFID tap in/out records
- **notifications** - System announcements

## 🚀 Deployment

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/ndkc-rfid-attendance)

### Other Platforms

- **Netlify**: Connect GitHub repo and deploy
- **Railway**: Automatic deployment from Git
- **DigitalOcean**: App Platform deployment
- **Self-hosted**: Docker or PM2 deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 🔒 Security Features

- Row Level Security (RLS) policies in Supabase
- JWT-based authentication
- HTTPS enforcement
- API rate limiting
- Input validation and sanitization
- Secure session management

## 📊 Database Features

- Real-time subscriptions for live updates
- Automatic timestamps and triggers
- Comprehensive indexing for performance
- Backup and recovery procedures
- Connection pooling and optimization

## 🎯 Usage Examples

### For System Administrators

1. **Adding a New Teacher**:
   - Go to Teacher Management
   - Click "Add Teacher"
   - Fill in details and assign RFID
   - Teacher receives NDKC email account

2. **Setting Up RFID Terminal**:
   - Navigate to RFID Terminal
   - Select classroom location
   - Launch fullscreen mode
   - Terminal is ready for scanning

3. **Creating Class Schedules**:
   - Go to Schedule Management
   - Select teacher and classroom
   - Set day, time, and subject
   - Schedule is enforced by RFID terminal

### For Teachers

1. **Checking Attendance**:
   - Tap RFID card at classroom terminal
   - System validates schedule automatically
   - Receive visual and audio confirmation

2. **Viewing Records**:
   - Login to teacher dashboard
   - View personal attendance history
   - Check upcoming schedules

## 🐛 Troubleshooting

### Common Issues

**Database Connection Failed**
- Check environment variables
- Verify Supabase project is active
- Review network connectivity

**RFID Terminal Not Reading**
- Ensure input focus is active
- Check Hoba reader connection
- Verify browser permissions

**Login Issues**
- Confirm email domain is @ndkc.edu.ph
- Check if user account exists
- Verify account is active

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Guidelines

- Follow TypeScript best practices
- Use existing UI components when possible
- Maintain consistent code formatting
- Update documentation for new features
- Test on multiple browsers and devices

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

**Notre Dame of Kidapawan College - IT Department**

- System Architecture: IT Team
- UI/UX Design: Academic Staff
- Database Design: IT Team
- RFID Integration: Technical Staff

## 📞 Support

For technical support or questions:

- **Email**: itsupport@ndkc.edu.ph
- **Phone**: +63 (64) 572-xxxx
- **Documentation**: See `/docs` folder
- **Issues**: GitHub Issues tab

## 🎓 About Notre Dame of Kidapawan College

Notre Dame of Kidapawan College is a Catholic educational institution in Kidapawan City, Philippines, committed to providing quality education guided by Christian values and academic excellence.

**Departments Supported**:
- **CBA** - College of Business Administration
- **CTE** - College of Teacher Education  
- **CECE** - College of Early Childhood Education

---

**Last Updated**: October 2025  
**Version**: 1.0.0  
**Status**: Production Ready

Made with ❤️ for Notre Dame of Kidapawan College