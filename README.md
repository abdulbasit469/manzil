# Manzil (مَنزِل) - Smart Career Counseling & University Guidance Portal

A comprehensive web platform helping Pakistani students make informed decisions about their higher education journey after intermediate (FSc, FA, ICS, ICOM).

## 🎯 Project Overview

Manzil addresses the critical gap in career counseling and centralized educational guidance in Pakistan by providing:
- AI-powered career counseling and aptitude assessment
- Comprehensive database of HEC-recognized universities and programs
- Admission guidance with deadlines and merit list history
- Scholarship and financial aid information
- Entry test preparation resources

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password hashing

### Frontend (Coming Soon)
- **React.js** with React Router
- **Material-UI** or **Tailwind CSS**
- **Axios** for API calls
- **Context API** for state management

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (Local installation or MongoDB Atlas)
- Git

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/abdulbasit469/manzil.git
   cd manzil
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Create a `.env` file in the root directory
   - Add the following variables:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/manzil
   JWT_SECRET=your_secret_key_here
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:3000
   ```

   **AI Career Counselor (optional, proposal-aligned NLP):** Add a Google Gemini API key so open-ended questions get natural-language answers (FAQs still match first for accuracy):

   ```env
   GEMINI_API_KEY=your_key_from_ai.google.dev
   # Optional: GEMINI_MODEL=gemini-1.5-flash
   ```

   Get a key: [Google AI Studio](https://aistudio.google.com/apikey). Without this key, the chatbot still works using the expanded FAQ + token-overlap matching.

4. **Start MongoDB**
   - Make sure MongoDB is running on your system
   - Default connection: `mongodb://localhost:27017`

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Access the API**
   - API Base URL: `http://localhost:5000`
   - Health Check: `http://localhost:5000/api/health`

## 📁 Project Structure

```
manzil/
├── backend/
│   ├── config/         # Configuration files (database, etc.)
│   ├── controllers/    # Request handlers
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware (auth, validation)
│   ├── utils/          # Utility functions
│   └── server.js       # Main entry point
├── .env                # Environment variables (not in git)
├── .gitignore
├── package.json
└── README.md
```

## 🚀 API Endpoints

### Public Routes
- `GET /` - Welcome message
- `GET /api/health` - Health check

### Authentication (Coming Soon)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Universities (Coming Soon)
- `GET /api/universities` - Get all universities
- `GET /api/universities/:id` - Get university details

### Career Assessment (Coming Soon)
- `GET /api/assessment/questions` - Get assessment questions
- `POST /api/assessment/submit` - Submit assessment

## 📝 Development Progress

### ✅ Phase 1: Project Setup (Week 1)
- [x] Initialize Node.js project
- [x] Set up Express server
- [x] Configure MongoDB connection
- [x] Set up project structure (MVC pattern)
- [ ] Test MongoDB connection

### 🔄 Phase 2: Authentication System (Week 2)
- [ ] Create User model
- [ ] Implement registration endpoint
- [ ] Implement login endpoint
- [ ] Create authentication middleware

### 📅 Upcoming Phases
- Phase 3: Student Profile & Dashboard
- Phase 4: University Information Module
- Phase 5: Career Counseling Module
- Phase 6: Admin Panel
- Phase 7-10: Frontend Development
- Phase 11: Testing & Documentation

## 👥 Contributors

- **Abdul Basit** - Developer

## 📄 License

ISC License

## 📧 Contact

For questions or feedback, please contact through the GitHub repository.

---

**Note**: This is a Final Year Project (FYP) for demonstrating career counseling and university guidance system for Pakistani students.










