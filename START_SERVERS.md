# How to Start Manzil Application

## Prerequisites
- MongoDB should be running on `mongodb://localhost:27017`
- Node.js installed

## Start Backend Server

Open Terminal 1:
```bash
cd C:\Users\ab887\Desktop\manzil
npm run dev
```

Backend will run on: **http://localhost:5000**

## Start Frontend Server

Open Terminal 2:
```bash
cd C:\Users\ab887\Desktop\manzil\frontend
npm run dev
```

Frontend will run on: **http://localhost:3000**

## First Time Setup

1. **Start both servers** (backend and frontend)
2. **Open browser**: http://localhost:3000
3. **Sign Up** with a new account
4. **Login** and explore the features

## Test Flow

### For Students:
1. Sign up → Login
2. Complete Profile (add intermediate marks, city, etc.)
3. Browse Universities
4. Take Career Assessment
5. View Career Recommendations

### For Testing Admin Features:
You need to manually change a user's role to 'admin' in MongoDB:

```javascript
// Connect to MongoDB
use manzil
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

Then login as admin to:
- View platform statistics
- Manage users
- Add universities and programs

## API Endpoints Available

### Authentication
- POST `/api/auth/register` - Register user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user

### Profile
- GET `/api/profile` - Get profile
- PUT `/api/profile` - Update profile
- GET `/api/profile/completion` - Profile completion %

### Dashboard
- GET `/api/dashboard` - Student dashboard data

### Universities (Public)
- GET `/api/universities` - List universities (with search, filters)
- GET `/api/universities/:id` - Get single university
- GET `/api/universities/:id/programs` - Get university programs

### Programs (Public)
- GET `/api/programs` - List all programs

### Career Assessment
- GET `/api/assessment/questions` - Get assessment questions
- POST `/api/assessment/submit` - Submit assessment
- GET `/api/assessment/results` - Get results

### Admin (Protected - Admin Only)
- GET `/api/admin/users` - List all users
- GET `/api/admin/stats` - Platform statistics
- POST `/api/universities` - Add university
- PUT `/api/universities/:id` - Update university
- DELETE `/api/universities/:id` - Delete university
- POST `/api/programs` - Add program

## Notes

- Backend runs on port **5000**
- Frontend runs on port **3000**
- Make sure MongoDB is running before starting backend
- JWT tokens are stored in localStorage
- CORS is configured for localhost:3000

## Troubleshooting

**Backend won't start:**
- Check if MongoDB is running
- Check if port 5000 is available

**Frontend won't start:**
- Check if port 3000 is available
- Make sure you're in the `frontend` directory

**Can't login:**
- Check backend console for errors
- Make sure MongoDB connection is successful
- Check browser console for errors










