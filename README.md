# LAVORO - Advanced Recruitment Platform

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC?logo=tailwindcss)

A modern, full-stack job recruitment platform that connects candidates with companies. Built with Next.js 16, React 19, and Prisma.

## ✨ Features

### For Candidates
- 🔍 Browse and search job listings
- 📝 Apply to positions with one click
- 📄 Upload and manage CV/Resume
- 📊 Track application status
- 🔔 Real-time notifications

### For Enterprises
- 📋 Post and manage job offers
- 👥 Review candidate applications
- 📅 Schedule interviews with meeting links
- 📈 Dashboard with analytics
- 🏢 Company profile management

### For Administrators
- 👤 User management and moderation
- 🛡️ Account activation/deactivation
- 📊 Platform-wide statistics
- 🗂️ Application & interview oversight

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Styling** | TailwindCSS 4, Lucide Icons |
| **Authentication** | NextAuth.js with JWT |
| **Database** | MySQL with Prisma ORM |
| **Forms** | React Hook Form + Zod validation |
| **Notifications** | Sonner (toast notifications) |

## 📁 Project Structure

```
LAVORO/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── public/                # Static assets
├── src/
│   ├── actions/           # Server actions
│   ├── app/
│   │   ├── admin/         # Admin dashboard
│   │   ├── api/           # API routes
│   │   ├── auth/          # Login/Register pages
│   │   ├── candidate/     # Candidate dashboard
│   │   ├── enterprise/    # Enterprise dashboard
│   │   └── jobs/          # Public job listings
│   ├── components/        # Reusable components
│   └── lib/               # Utilities & configs
└── job-recruitment-api/   # Jakarta EE backend (optional)
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/
naji-abdellah/LAVORO.git
   cd LAVORO
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   DATABASE_URL="mysql://user:password@localhost:3306/lavoro"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Seed the database (optional)**
   ```bash
   npx prisma db seed
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |

## 🗄️ Database Schema

### Core Models

- **User** - Base user with email, password, role
- **CandidateProfile** - Extended candidate info (skills, CV, bio)
- **EnterpriseProfile** - Company details (name, description, logo)
- **JobOffer** - Job postings with requirements
- **Application** - Job applications with status tracking
- **Interview** - Scheduled interviews with meeting links
- **Notification** - User notifications

### User Roles

| Role | Description |
|------|-------------|
| `ADMIN` | Platform administrator |
| `CANDIDATE` | Job seeker |
| `ENTERPRISE` | Company/employer |

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## 🔒 Authentication

The platform uses NextAuth.js with credentials provider:

- JWT-based sessions (30-day expiry)
- Role-based access control
- Password hashing with bcrypt
- Account activation/deactivation support

## 🎨 UI/UX Features

- Modern glassmorphism design
- Animated gradients and floating elements
- Responsive layout (mobile-first)
- Custom scrollbars
- Toast notifications
- Loading states and skeletons

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🔗 Connect with Me

- [LinkedIn](https://www.linkedin.com/in/naji-abdellah-834411315/)
- [GitHub](https://github.com/naji-abdellah) 
- naji.abdellah.cp@gmail.com 

---

Made with ❤️ by **NAJI ABDELLAH**
