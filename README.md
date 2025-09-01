# 🎓 Mentor Connect

A comprehensive mentorship platform connecting mentors and mentees for meaningful learning experiences. Built with modern web technologies and real-time communication features.

![Mentor Connect](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)
![Node](https://img.shields.io/badge/Node.js-18+-green.svg)
![React](https://img.shields.io/badge/React-18+-blue.svg)

## ✨ Features

### 🔐 **Authentication & User Management**
- Secure JWT-based authentication
- Role-based access control (Mentor, Mentee, Admin)
- Profile completion tracking and validation
- Password security with bcrypt hashing

### 👥 **User Roles & Capabilities**

**Mentors:**
- Create detailed professional profiles
- Set availability schedules  
- Accept/reject mentee requests
- Conduct mentoring sessions
- Receive ratings and feedback

**Mentees:**
- Browse and search mentor profiles
- Send mentorship requests
- Book appointment slots
- Rate completed sessions
- Track learning progress

**Admins:**
- Comprehensive dashboard with analytics
- User management (view, suspend, activate)
- Appointment oversight and management
- System monitoring and statistics

### 📅 **Appointment Management**
- Real-time appointment booking system
- Status tracking (Requested → Accepted → Completed/Cancelled)
- Calendar integration-ready architecture
- Automated status workflows

### 💬 **Real-time Messaging**
- Socket.io powered instant messaging
- Appointment-based chat rooms
- Message persistence and history
- Unread message indicators
- Real-time typing indicators

### ⭐ **Rating & Feedback System**
- Post-session rating system (1-5 stars)
- Written feedback and comments
- Mentor rating aggregation
- Review moderation capabilities

### 🛡️ **Security & Performance**
- Input sanitization and validation
- Rate limiting protection
- CORS configuration
- SQL injection prevention
- XSS protection with helmet.js
- Comprehensive error handling

## 🏗️ **Tech Stack**

### **Frontend**
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Socket.io Client** - Real-time communication
- **Vite** - Fast build tool and dev server

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type-safe server development
- **Socket.io** - Real-time communication
- **Prisma** - Database ORM
- **SQLite** - Development database
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

### **Database**
- **SQLite** (Development) - File-based database
- **Prisma Schema** - Database modeling
- **Prisma Migrations** - Database versioning

### **Development Tools**
- **Nodemon** - Development auto-restart
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Concurrently** - Run multiple commands

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ installed
- npm or yarn package manager
- Git for version control

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mentor-connect.git
   cd mentor-connect
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install backend dependencies
   cd backend
   npm install
   cd ..

   # Install frontend dependencies
   cd frontend
   npm install
   cd ..
   ```

3. **Environment Setup**
   ```bash
   # Backend environment
   cd backend
   cp .env.example .env
   # Edit .env file with your configuration
   ```

   **Required Environment Variables:**
   ```env
   # Database
   DATABASE_URL="file:./dev.db"

   # JWT Secret (generate a secure random string)
   JWT_SECRET="your-super-secret-jwt-key"

   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Frontend URL (for CORS)
   FRONTEND_URL="http://localhost:3000"
   ```

4. **Database Setup**
   ```bash
   cd backend
   npx prisma migrate dev --name init
   npx prisma db seed
   cd ..
   ```

5. **Start Development Servers**
   ```bash
   # Start both frontend and backend
   npm run dev
   ```

   **Or start individually:**
   ```bash
   # Backend only (http://localhost:5000)
   npm run dev:backend

   # Frontend only (http://localhost:3000)
   npm run dev:frontend
   ```

### **Default Admin Account**
- **Email:** admin@example.com
- **Password:** admin123
- **Role:** Administrator

## 📁 **Project Structure**

```
mentor-connect/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Custom middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   ├── types/           # TypeScript types
│   │   └── server.ts        # Express server
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Database seeding
│   └── package.json
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utility functions
│   │   └── App.tsx          # Main app component
│   └── package.json
├── README.md
├── package.json             # Root package scripts
└── .gitignore
```

## 🎯 **Usage Guide**

### **For Mentees:**
1. Register with mentee role
2. Complete your profile (goals, institute, course)
3. Browse available mentors by expertise
4. Send appointment requests to mentors
5. Wait for mentor acceptance
6. Join chat for communication
7. Attend scheduled sessions
8. Rate and review completed sessions

### **For Mentors:**
1. Register with mentor role  
2. Complete detailed profile (expertise, bio, experience)
3. Set your availability schedule
4. Review incoming mentee requests
5. Accept suitable requests
6. Communicate via integrated chat
7. Conduct mentoring sessions
8. Mark sessions as completed

### **For Admins:**
1. Access admin dashboard
2. Monitor user registrations and activities
3. View appointment statistics
4. Manage user accounts (suspend/activate)
5. Oversee system health and performance

## 🔧 **Available Scripts**

```bash
# Root level scripts
npm run dev          # Start both frontend and backend
npm run dev:backend  # Start backend only
npm run dev:frontend # Start frontend only
npm run build        # Build both projects
npm run test         # Run all tests

# Backend scripts
cd backend
npm run dev          # Start development server
npm run build        # Build TypeScript
npm run start        # Start production server
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with sample data

# Frontend scripts  
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🗄️ **Database Schema**

### **Core Models:**
- **User** - Stores user accounts (mentors, mentees, admins)
- **Appointment** - Manages mentorship sessions
- **Message** - Real-time chat messages
- **Rating** - Session ratings and feedback

### **Key Relationships:**
- Users can have multiple appointments (mentor/mentee roles)
- Appointments contain multiple messages
- Each appointment can have one rating
- Users can give and receive multiple ratings

## 🔐 **Security Features**

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with salt rounds
- **Input Validation** - Comprehensive data validation
- **Rate Limiting** - API abuse prevention
- **CORS Protection** - Cross-origin request security
- **SQL Injection Prevention** - Prisma ORM protection
- **XSS Protection** - Helmet.js security headers

## 🚀 **Deployment**

### **Frontend (Netlify/Vercel)**
```bash
cd frontend
npm run build
# Deploy dist/ folder
```

### **Backend (Railway/Render/Heroku)**
```bash
cd backend
npm run build
# Deploy built application
```

### **Environment Variables for Production:**
```env
NODE_ENV=production
DATABASE_URL="your-production-database-url"
JWT_SECRET="secure-production-jwt-secret"
FRONTEND_URL="https://your-frontend-domain.com"
```

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- Built with modern web development best practices
- Inspired by the need for quality mentorship platforms
- Community-driven development approach

## 📞 **Support**

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation files in the project
- Review the code comments for implementation details

---

**Made with ❤️ for the mentorship community**
