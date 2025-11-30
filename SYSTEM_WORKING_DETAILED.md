# ⭐ SYSTEM WORKING (DETAILED EXPLANATION FOR FINAL YEAR PROJECT)
## Manzil - Smart Career Counseling & University Guidance Portal

---

## 🔐 MODULE 1: AUTHENTICATION SYSTEM

### 1.1 User Registration (Sign Up Process)

**Process Flow:**

1. **Student opens the application** and clicks **"Sign Up"** button.

2. **Registration Form** - Student enters:
   - **Full Name** (Validation: No numbers allowed)
   - **Email Address** (Unique, validated format)
   - **Password** (Validation: Must contain at least one uppercase, lowercase, digit, and special character)
   - Password validation error messages displayed in red below the password field

3. **Backend Processing:**
   - System checks if email already exists
   - If user exists but not verified → OTP resent
   - If new user → Account created with `isVerified: false`
   - Password is hashed using bcrypt (salt rounds: 10)
   - User role set to `'student'` by default

4. **OTP Generation & Email:**
   - 6-digit OTP automatically generated
   - OTP sent to student's email via Nodemailer
   - OTP stored in database with 10-minute expiry
   - Student redirected to OTP verification page

5. **Email Verification:**
   - Student enters 6-digit OTP
   - System validates OTP (checks expiry time)
   - If valid → `isVerified: true`
   - If expired → "OTP expired" message, option to resend
   - Account successfully verified

**📌 Purpose:** Ensure secure and verified user access to the platform, prevent fake accounts.

---

### 1.2 User Login

**Process Flow:**

1. **Login Form** - Student enters:
   - **Email Address**
   - **Password**

2. **Backend Authentication:**
   - System finds user by email
   - Compares password with hashed password in database
   - Checks if email is verified (`isVerified: true`)
   - If not verified → Error: "Please verify your email first"

3. **JWT Token Generation:**
   - If credentials valid → JWT token generated
   - Token contains: user ID, email, role
   - Token expiry: 7 days
   - Token sent to frontend in response

4. **Frontend Token Storage:**
   - Token stored in `localStorage`
   - Token added to all API requests as `Authorization: Bearer <token>`
   - User state stored in `AuthContext` (React Context API)
   - User redirected based on role:
     - **Student** → `/dashboard`
     - **Admin** → `/admin/dashboard`

5. **State Persistence:**
   - Token persists across page refreshes
   - On refresh, system checks token validity
   - If valid → User remains logged in
   - If invalid/expired → Redirected to login page

**📌 Purpose:** Secure access control, maintain user session, role-based routing.

---

### 1.3 Password Reset (Forgot Password)

**Process Flow:**

1. **Forgot Password Link:**
   - Student clicks "Forgot your password?" on login page
   - Redirected to `/forgot-password` page

2. **Email Submission:**
   - Student enters registered email
   - System generates secure reset token (crypto.randomBytes)
   - Reset token stored in database with expiry (1 hour)
   - Password reset link sent to email

3. **Password Reset:**
   - Student clicks link in email
   - Redirected to `/reset-password/:resetToken` page
   - System validates reset token (checks expiry)
   - Student enters new password (with validation)
   - Password confirmed (must match)
   - New password hashed and saved
   - Reset token cleared from database

**📌 Purpose:** Allow users to recover accounts if password is forgotten.

---

## 👤 MODULE 2: USER PROFILE MANAGEMENT

### 2.1 Profile Completion

**Process Flow:**

1. **Profile Redirect:**
   - After login, if profile incomplete → Dashboard shows "Complete Profile" card
   - Student clicks "Complete Profile" button
   - Redirected to `/profile` page

2. **Profile Form Fields:**

   **Personal Information:**
   - Full Name (pre-filled, editable)
   - Email (pre-filled, disabled - cannot change)
   - Phone Number (11-digit validation)
   - City (dropdown/input)

   **Academic Information:**
   - Intermediate Type:
     - FSc Pre-Engineering
     - FSc Pre-Medical
     - ICS
     - ICOM
     - FA
     - Other
   - Intermediate Marks (0-1100)
   - Matric Marks (0-1100)
   - Interests (multiple selection)

3. **Profile Submission:**
   - Form validation (required fields, format checks)
   - Data sent to `PUT /api/profile` endpoint
   - Backend updates user document in MongoDB
   - `profileCompleted` status calculated automatically
   - Success message displayed

4. **Profile Completion Calculation:**
   ```
   Required Fields: name, email, phone, city, intermediateType, 
                   intermediateMarks, matricMarks, interests
   
   Completion % = (Filled Required Fields / Total Required Fields) × 100
   ```

5. **Dashboard Integration:**
   - Dashboard displays profile completion percentage
   - Progress bar shows visual completion status
   - "Complete Profile" button visible until 100% complete

**📌 Purpose:** Collect comprehensive student data for accurate career recommendations, merit calculations, and university eligibility analysis.

---

### 2.2 Profile Update

**Process Flow:**

1. **View Profile:**
   - Student navigates to `/profile` page
   - Current profile data loaded from `GET /api/profile`
   - Form pre-filled with existing data

2. **Edit Profile:**
   - Student modifies any field
   - Real-time validation
   - Submit button saves changes

3. **Update Processing:**
   - `PUT /api/profile` endpoint called
   - Backend validates and updates user document
   - Profile completion recalculated
   - Success message: "Profile updated successfully!"

**📌 Purpose:** Allow students to keep their information up-to-date.

---

## 🏠 MODULE 3: STUDENT DASHBOARD

### 3.1 Dashboard Overview

**Dashboard Components:**

1. **Welcome Section:**
   - Personalized greeting: "Welcome, [Student Name]!"
   - Subtitle: "Your Career Guidance Dashboard"
   - Dark gradient background (triangle-type design)

2. **Profile Completion Card:**
   - Shows completion percentage (e.g., "29% Complete")
   - Visual progress bar with gradient animation
   - "Complete Profile" button (if incomplete)
   - "View Profile" link (if complete)

3. **Career Assessment Card:**
   - Status: "Take Assessment" or "View Results"
   - Description: "Discover your ideal career path through our assessment"
   - Button redirects to assessment page

4. **Universities Card:**
   - Description: "Explore HEC-recognized universities and find the perfect match"
   - "Browse Universities" button
   - Redirects to universities listing page

5. **Quick Stats Card:**
   - Saved Universities count
   - Applications count
   - Dark gradient background with white text

**📌 Purpose:** Centralized hub where students can access all platform features and see their progress.

---

### 3.2 Dashboard Data Flow

**Backend Processing:**

1. **API Endpoint:** `GET /api/dashboard`

2. **Data Aggregation:**
   - Fetch user profile from database
   - Calculate profile completion percentage
   - Check assessment completion status
   - Count saved universities (if implemented)
   - Count applications in progress (if implemented)

3. **Response Structure:**
   ```json
   {
     "dashboard": {
       "profileCompletion": 29,
       "stats": {
         "assessmentTaken": false,
         "savedUniversities": 0,
         "applicationsInProgress": 0
       }
     }
   }
   ```

4. **Frontend Rendering:**
   - Dashboard component receives data
   - Cards render with dynamic content
   - Progress bars animate to show percentages
   - Buttons enable/disable based on status

**📌 Purpose:** Provide real-time personalized data to guide student actions.

---

## 🎯 MODULE 4: CAREER COUNSELING SYSTEM (3-TEST ASSESSMENT)

### 4.1 Assessment Overview

**System Architecture:**

The career counseling module uses a **3-test comprehensive assessment system** with **weighted aggregation** to generate accurate career recommendations.

**Test Structure:**
- **Test 1: Personality Test (RIASEC Model)** - 30% weight
- **Test 2: Aptitude Test** - 40% weight
- **Test 3: Interest Test** - 30% weight

---

### 4.2 Test 1: Personality Test (RIASEC Model)

**Process Flow:**

1. **Test Initiation:**
   - Student clicks "Take Assessment" from dashboard
   - System checks assessment status
   - If personality test not completed → Shows Personality Test

2. **Test Structure:**
   - **Total Questions:** 36 questions
   - **Distribution:** 6 questions per RIASEC type
   - **RIASEC Types:**
     - **Realistic (R):** Practical, hands-on, technical
     - **Investigative (I):** Analytical, scientific, research-oriented
     - **Artistic (A):** Creative, expressive, innovative
     - **Social (S):** Helping, teaching, counseling
     - **Enterprising (E):** Leadership, business, sales
     - **Conventional (C):** Organized, structured, administrative

3. **Question Format:**
   - Each question: Statement about preferences/behavior
   - Answer Scale: 5-point Likert scale
     - Strongly Agree (5 points)
     - Agree (4 points)
     - Neutral (3 points)
     - Disagree (2 points)
     - Strongly Disagree (1 point)

4. **Scoring Algorithm:**
   ```
   For each RIASEC type:
     Raw Score = Sum of all answers for that type
     Max Possible = 6 questions × 5 = 30
     Normalized Score = (Raw Score / Max Possible) × 100
   ```

5. **Career Field Mapping:**
   - Realistic → Engineering, Technical, Construction
   - Investigative → Medical, Research, Science, Healthcare
   - Artistic → Arts, Media, Design, Creative
   - Social → Teaching, Counseling, Social Work
   - Enterprising → Business, Management, Sales, Entrepreneurship
   - Conventional → Finance, Accounting, Administration

6. **Test Submission:**
   - Student answers all 36 questions
   - Click "Submit" button
   - Responses sent to `POST /api/assessment/personality/submit`
   - Backend calculates RIASEC scores
   - Results normalized to 0-100 scale
   - Results saved in database
   - `testsCompleted.personality = true`

7. **Next Step:**
   - System automatically moves to Aptitude Test
   - Progress indicator shows: "Test 1 of 3 Complete"

**📌 Purpose:** Identify personality traits and match them to suitable career environments using proven psychological model (Holland Codes).

---

### 4.3 Test 2: Aptitude Test

**Process Flow:**

1. **Test Initiation:**
   - After Personality Test completion
   - System shows Aptitude Test interface

2. **Test Structure:**
   - **Total Questions:** 40 questions
   - **Distribution:** 10 questions per category
   - **Categories:**
     - **Logical Reasoning:** Pattern recognition, sequences, logic
     - **Mathematical Ability:** Calculations, problem-solving, algebra
     - **Verbal Ability:** Language comprehension, vocabulary, grammar
     - **Analytical Skills:** Critical thinking, analysis, evaluation

3. **Question Format:**
   - Multiple Choice Questions (MCQ)
   - Each question has 4 options: A, B, C, D
   - One correct answer per question
   - Questions appropriate for intermediate-level students

4. **Scoring Algorithm:**
   ```
   For each category:
     Correct Answers = Count of correct responses
     Total Questions = 10
     Percentage = (Correct Answers / Total Questions) × 100
     Normalized Score = Percentage (already 0-100 scale)
   ```

5. **Skill Type Mapping:**
   - Logical + Analytical (high) → Engineering, Computer Science
   - Mathematical (high) → Engineering, Finance, Economics
   - Verbal (high) → Business, Media, Law, Social Sciences

6. **Test Submission:**
   - Student answers all 40 questions
   - Can review answers before submission
   - Click "Submit" button
   - Responses sent to `POST /api/assessment/aptitude/submit`
   - Backend calculates percentage correct per section
   - Results normalized to 0-100 scale per section
   - Results saved in database
   - `testsCompleted.aptitude = true`

7. **Next Step:**
   - System automatically moves to Interest Test
   - Progress indicator shows: "Test 2 of 3 Complete"

**📌 Purpose:** Assess cognitive abilities and skills to determine academic strengths and career suitability.

---

### 4.4 Test 3: Interest Test

**Process Flow:**

1. **Test Initiation:**
   - After Aptitude Test completion
   - System shows Interest Test interface

2. **Test Structure:**
   - **Total Questions:** 36 questions
   - **Distribution:** 6 questions per category + 6 work environment questions
   - **Categories:**
     - Engineering
     - Medical
     - Business
     - Computer Science
     - Arts
     - Work Environment Preferences

3. **Question Format:**
   - Each question: Statement about interests/preferences
   - Answer Scale: 5-point Likert scale
     - Strongly Agree (5 points)
     - Agree (4 points)
     - Neutral (3 points)
     - Disagree (2 points)
     - Strongly Disagree (1 point)

4. **Scoring Algorithm:**
   ```
   For each category:
     Raw Score = Sum of all answers for that category
     Max Possible = 6 questions × 5 = 30
     Normalized Score = (Raw Score / Max Possible) × 100
   ```

5. **Career Mapping:**
   - Engineering → Engineering careers and programs
   - Medical → Medical careers and programs
   - Business → Business careers and programs
   - Computer Science → IT/CS careers and programs
   - Arts → Arts, Media, Creative careers

6. **Test Submission:**
   - Student answers all 36 questions
   - Click "Submit" button
   - Responses sent to `POST /api/assessment/interest/submit`
   - Backend calculates category scores
   - Results normalized to 0-100 scale
   - Top 5 careers identified per category
   - Results saved in database
   - `testsCompleted.interest = true`

7. **Auto-Aggregation Trigger:**
   - When all 3 tests completed → System automatically triggers aggregation
   - Weighted scores calculated
   - Final recommendations generated

**📌 Purpose:** Identify student interests and preferences to match with suitable career fields and programs.

---

### 4.5 Weighted Aggregation & Recommendation Engine

**Process Flow:**

1. **Aggregation Trigger:**
   - When all 3 tests completed (`testsCompleted.personality = true`, `aptitude = true`, `interest = true`)
   - System automatically calls aggregation function
   - Or student can manually trigger via `POST /api/assessment/submit-complete`

2. **Weighted Aggregation Formula:**
   ```
   Final Career Field Score = 
     (Personality Test Score × 0.30) + 
     (Aptitude Test Score × 0.40) + 
     (Interest Test Score × 0.30)
   ```

3. **Score Normalization:**
   - All test scores already normalized to 0-100 scale
   - Each test contributes weighted percentage to final score

4. **Rule-Based Enhancements:**
   System applies additional boosts based on specific patterns:
   
   - **Engineering Boost:**
     - If Logical Reasoning + Analytical Skills (both high) → Engineering score increased
   
   - **Media/Arts Boost:**
     - If Creative + Communication skills (both high) → Arts/Media score increased
   
   - **Finance/Economics Boost:**
     - If Mathematical + Analytical (both high) → Finance/Economics score increased
   
   - **Business/Management Boost:**
     - If Social + Enterprising (both high) → Business/Management score increased

5. **Career Field Mapping:**
   ```
   Personality Results → Career Fields (30% weight)
   Aptitude Results → Career Fields (40% weight)
   Interest Results → Career Fields (30% weight)
   
   Combined → Final Career Field Scores
   ```

6. **Top Career Selection:**
   - All career fields sorted by final scores (descending)
   - Top 5-7 careers selected
   - Each career includes:
     - Career name
     - Final score (0-100)
     - Description
     - Related degree programs
     - Category (Engineering, Medical, Business, etc.)

7. **Results Storage:**
   - Aggregated results saved in `AssessmentResponse` document
   - `aggregatedResults` field contains:
     - `finalCareerScores`: Object with all career field scores
     - `topCareers`: Array of top 5-7 recommendations
     - `testWeights`: { personality: 0.30, aptitude: 0.40, interest: 0.30 }
     - `ruleBasedEnhancements`: Array of applied rules

8. **Results Display:**
   - Student redirected to Results page
   - Shows breakdown of all 3 test scores
   - Shows final aggregated scores
   - Displays top career recommendations with descriptions
   - Lists related degree programs for each career

**📌 Purpose:** Combine multiple assessment dimensions to generate accurate, personalized career recommendations using evidence-based psychological models.

---

### 4.6 Assessment Results Page

**Display Components:**

1. **Test Score Breakdown:**
   - Personality Test: RIASEC scores (6 types with percentages)
   - Aptitude Test: Section scores (4 categories with percentages)
   - Interest Test: Category scores (5 categories with percentages)

2. **Final Recommendations:**
   - Top 5-7 career recommendations
   - Each career shows:
     - Career name
     - Match score (0-100)
     - Detailed description
     - Related degree programs
     - Career category

3. **Visualization:**
   - Progress bars for each test
   - Score percentages
   - Career cards with gradient styling

4. **Actions:**
   - "Retake Assessment" button (allows redoing all tests)
   - "View Universities" button (browse recommended programs)
   - "Save Results" (optional - for future reference)

**📌 Purpose:** Present comprehensive assessment results in an understandable format to guide student career decisions.

---

## 🏛️ MODULE 5: UNIVERSITY INFORMATION SYSTEM

### 5.1 University Database

**University Model Structure:**

Each university document contains:
- **Basic Information:**
  - Name (unique, required)
  - City (required)
  - Type: Public or Private
  - HEC Ranking (optional)
  
- **Contact Information:**
  - Website URL
  - Email address
  - Phone number
  - Physical address
  
- **Additional Details:**
  - Description
  - Facilities (array: library, labs, hostel, sports, etc.)
  - Established Year
  - Logo (image URL)
  - Active Status (isActive: true/false)

**📌 Purpose:** Maintain comprehensive database of HEC-recognized universities in Pakistan.

---

### 5.2 University Browsing

**Process Flow:**

1. **Access Universities Page:**
   - Student clicks "Browse Universities" from dashboard
   - Or navigates to `/universities` route
   - Universities listing page loads

2. **Search Functionality:**
   - Search bar at top of page
   - Real-time search as student types
   - Searches university name
   - Results filter instantly

3. **Filter Options:**
   - **Filter by City:** Dropdown with all cities
   - **Filter by Type:** Public / Private
   - Filters can be combined
   - "Clear Filters" button resets all

4. **University Cards Display:**
   - Grid layout (responsive: 3 columns desktop, 2 tablet, 1 mobile)
   - Each card shows:
     - University name
     - City
     - Type (Public/Private badge)
     - HEC Ranking (if available)
     - Short description (truncated)
   - Cards have hover effects (lift animation)

5. **University Details:**
   - Click on university card
   - Shows full university information:
     - Complete description
     - All facilities
     - Contact information
     - Programs offered (linked from Programs collection)
   - "View Programs" button shows all programs

6. **Pagination:**
   - If many universities → Pagination controls
   - Shows page numbers
   - "Previous" / "Next" buttons

**📌 Purpose:** Help students discover and explore universities based on their preferences and location.

---

### 5.3 Program Information

**Program Model Structure:**

Each program document contains:
- **Basic Information:**
  - Program Name (e.g., "BS Computer Science")
  - University (reference to University document)
  - Degree Type (BS, MS, PhD, etc.)
  - Duration (years)
  
- **Details:**
  - Fee Structure (annual/semester)
  - Eligibility Criteria
  - Description
  - Career Scope

**Program-University Relationship:**
- Programs linked to universities via `university` field (ObjectId reference)
- One university can have multiple programs
- Programs can be filtered by university

**API Endpoints:**
- `GET /api/programs` - List all programs (with filters)
- `GET /api/programs/:id` - Get program details
- `GET /api/universities/:id/programs` - Get programs by university
- `POST /api/admin/programs` - Add program (admin only)
- `PUT /api/admin/programs/:id` - Update program (admin only)
- `DELETE /api/admin/programs/:id` - Delete program (admin only)

**📌 Purpose:** Provide detailed information about degree programs offered by universities to help students make informed decisions.

---

## 👨‍💼 MODULE 6: ADMIN PANEL

### 6.1 Admin Authentication

**Process Flow:**

1. **Admin Login:**
   - Separate "Login as Admin" button on login/signup pages
   - Redirects to `/admin-login` page
   - Admin enters email and password

2. **Role Verification:**
   - Backend checks if user exists
   - Verifies password
   - Checks if `role === 'admin'`
   - If not admin → Error: "Access denied. Admin only."
   - If admin → JWT token generated with admin role

3. **Admin Dashboard Access:**
   - Admin redirected to `/admin/dashboard`
   - Admin navigation menu appears
   - All admin routes protected by `AdminRoute` component

**📌 Purpose:** Secure admin access with role-based authentication.

---

### 6.2 Admin Dashboard

**Dashboard Components:**

1. **Statistics Cards:**
   - Total Users count
   - Total Universities count
   - Total Programs count
   - Total Assessments completed
   - Cards with gradient backgrounds and icons

2. **Quick Actions:**
   - "Manage Users" card
   - "Manage Universities" card
   - "Manage Programs" card
   - "View Assessments" card

3. **Recent Activity:**
   - List of recent user registrations
   - Recent assessment completions
   - Activity timeline

**API Endpoint:** `GET /api/admin/stats`

**📌 Purpose:** Provide admin with platform overview and quick access to management functions.

---

### 6.3 User Management

**Features:**

1. **View All Users:**
   - Table displaying all registered users
   - Columns: Name, Email, Role, Verification Status, Registration Date
   - Pagination for large user lists
   - Search functionality

2. **Change User Role:**
   - Admin can change user role (student ↔ admin)
   - Dropdown selector in user row
   - Confirmation dialog before change
   - Updates database immediately

3. **Delete Users:**
   - Delete button for each user
   - Confirmation dialog ("Are you sure?")
   - User and related data removed from database

**API Endpoints:**
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id/role` - Change user role
- `DELETE /api/admin/users/:id` - Delete user

**📌 Purpose:** Allow admin to manage user accounts and maintain platform security.

---

### 6.4 University Management

**Features:**

1. **Add University:**
   - "Add University" button opens form modal
   - Form fields: Name, City, Type, HEC Ranking, Website, Email, Phone, Address, Description, Facilities, Established Year
   - Validation: Required fields, format checks
   - Submit creates new university in database

2. **Edit University:**
   - "Edit" button on each university row
   - Opens pre-filled form with existing data
   - Admin modifies fields
   - Submit updates university document

3. **Delete University:**
   - "Delete" button with confirmation
   - Removes university from database
   - Related programs may be affected (cascade handling)

4. **University List:**
   - Table showing all universities
   - Columns: Name, City, Type, HEC Ranking, Actions
   - Search and filter options

**API Endpoints:**
- `GET /api/admin/universities` - List all (admin view)
- `POST /api/admin/universities` - Add university
- `PUT /api/admin/universities/:id` - Update university
- `DELETE /api/admin/universities/:id` - Delete university

**📌 Purpose:** Allow admin to maintain and update university database.

---

### 6.5 Program Management

**Features:**

1. **Add Program:**
   - "Add Program" button opens form
   - Form includes university selector (dropdown)
   - Fields: Name, University, Degree, Duration, Fee, Eligibility, Description, Career Scope
   - Validation ensures university selected

2. **Edit Program:**
   - Edit button opens pre-filled form
   - Admin can change all fields including university
   - Updates saved to database

3. **Delete Program:**
   - Delete button with confirmation
   - Removes program from database

4. **Program List:**
   - Table showing all programs
   - Columns: Name, University, Degree, Duration, Fee, Actions
   - Filter by university option

**API Endpoints:**
- `GET /api/admin/programs` - List all programs
- `POST /api/admin/programs` - Add program
- `PUT /api/admin/programs/:id` - Update program
- `DELETE /api/admin/programs/:id` - Delete program

**📌 Purpose:** Allow admin to manage degree programs and link them to universities.

---

### 6.6 Assessment Analytics

**Features:**

1. **View All Assessments:**
   - Table showing all completed assessments
   - Columns: Student Name, Email, Tests Completed, Completion Date
   - Shows which tests are completed (Personality ✓, Aptitude ✓, Interest ✓)

2. **Top Career Recommendations:**
   - Statistics showing most recommended careers
   - Count of students recommended each career
   - Visual charts/graphs (if implemented)

3. **Assessment Statistics:**
   - Total assessments completed
   - Average completion time
   - Most common career recommendations

**API Endpoint:** `GET /api/admin/assessments`

**📌 Purpose:** Provide insights into assessment usage and career recommendation trends.

---

## 🔄 DATA FLOW DIAGRAMS

### Complete User Journey (Student):

```
1. Sign Up
   ↓
2. Email Verification (OTP)
   ↓
3. Login
   ↓
4. Dashboard (Profile Completion Prompt)
   ↓
5. Complete Profile
   ↓
6. Dashboard (All Features Available)
   ↓
7. Take Career Assessment
   ├─→ Personality Test (36 questions)
   ├─→ Aptitude Test (40 questions)
   └─→ Interest Test (36 questions)
   ↓
8. View Assessment Results
   ↓
9. Browse Universities (Based on Recommendations)
   ↓
10. View Programs
   ↓
11. Make Informed Decision
```

### Assessment Aggregation Flow:

```
Personality Test Results (30% weight)
         +
Aptitude Test Results (40% weight)
         +
Interest Test Results (30% weight)
         ↓
   Normalization (0-100 scale)
         ↓
   Weighted Aggregation
         ↓
   Rule-Based Enhancements
         ↓
   Career Field Mapping
         ↓
   Top 5-7 Recommendations
         ↓
   Results Display
```

---

## 🗄️ DATABASE SCHEMA

### User Collection:
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'student' | 'admin',
  phone: String,
  city: String,
  intermediateType: String,
  intermediateMarks: Number,
  matricMarks: Number,
  interests: [String],
  profileCompleted: Boolean,
  isVerified: Boolean,
  otp: String,
  otpExpiry: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### University Collection:
```javascript
{
  _id: ObjectId,
  name: String (unique),
  city: String,
  type: 'Public' | 'Private',
  hecRanking: Number,
  website: String,
  email: String,
  phone: String,
  address: String,
  description: String,
  facilities: [String],
  establishedYear: Number,
  logo: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Program Collection:
```javascript
{
  _id: ObjectId,
  name: String,
  university: ObjectId (ref: University),
  degree: String,
  duration: Number,
  fee: Number,
  eligibility: String,
  description: String,
  careerScope: String,
  createdAt: Date,
  updatedAt: Date
}
```

### AssessmentResponse Collection:
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  personalityResults: {
    riasecScores: { R, I, A, S, E, C },
    normalizedScores: { R, I, A, S, E, C },
    careerFields: Object
  },
  aptitudeResults: {
    sectionScores: { logical, math, verbal, analytical },
    normalizedSectionScores: Object,
    skillScores: Object,
    careerFields: Object,
    totalCorrect: Number,
    totalQuestions: Number
  },
  interestResults: {
    categoryScores: Object,
    normalizedScores: Object,
    workEnvironmentScore: Number,
    topCareers: Array
  },
  aggregatedResults: {
    finalCareerScores: Object,
    topCareers: Array,
    testWeights: { personality, aptitude, interest },
    ruleBasedEnhancements: Array
  },
  testsCompleted: {
    personality: Boolean,
    aptitude: Boolean,
    interest: Boolean
  },
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 SECURITY FEATURES

1. **Password Security:**
   - Bcrypt hashing (salt rounds: 10)
   - Password validation (uppercase, lowercase, digit, special character)
   - Minimum length: 6 characters

2. **Authentication:**
   - JWT tokens (7-day expiry)
   - Token stored in localStorage
   - Automatic token validation on API calls

3. **Authorization:**
   - Role-based access control (Student/Admin)
   - Protected routes (middleware checks)
   - Admin-only endpoints

4. **Email Verification:**
   - OTP system (6-digit, 10-minute expiry)
   - Prevents fake accounts
   - Resend OTP functionality

5. **Input Validation:**
   - Frontend validation (immediate feedback)
   - Backend validation (server-side security)
   - SQL injection prevention (MongoDB NoSQL)

6. **CORS Protection:**
   - Configured allowed origins
   - Credentials support
   - Secure headers (Helmet.js)

---

## 📊 API ENDPOINTS SUMMARY

### Authentication:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-otp` - Verify email OTP
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `PUT /api/auth/reset-password/:token` - Reset password

### Profile:
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `GET /api/profile/completion` - Get completion percentage

### Dashboard:
- `GET /api/dashboard` - Get dashboard data

### Universities:
- `GET /api/universities` - List universities (with search/filter)
- `GET /api/universities/:id` - Get university details
- `GET /api/universities/:id/programs` - Get programs by university

### Programs:
- `GET /api/programs` - List programs (with filters)
- `GET /api/programs/:id` - Get program details

### Assessment:
- `GET /api/assessment/personality/questions` - Get personality questions
- `POST /api/assessment/personality/submit` - Submit personality test
- `GET /api/assessment/aptitude/questions` - Get aptitude questions
- `POST /api/assessment/aptitude/submit` - Submit aptitude test
- `GET /api/assessment/interest/questions` - Get interest questions
- `POST /api/assessment/interest/submit` - Submit interest test
- `POST /api/assessment/submit-complete` - Submit all 3 tests
- `GET /api/assessment/status` - Check test completion status
- `GET /api/assessment/results` - Get aggregated results

### Admin:
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id/role` - Change user role
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/universities` - List universities (admin)
- `POST /api/admin/universities` - Add university
- `PUT /api/admin/universities/:id` - Update university
- `DELETE /api/admin/universities/:id` - Delete university
- `GET /api/admin/programs` - List programs (admin)
- `POST /api/admin/programs` - Add program
- `PUT /api/admin/programs/:id` - Update program
- `DELETE /api/admin/programs/:id` - Delete program
- `GET /api/admin/assessments` - View all assessments

---

## 🎯 SUMMARY

**Manzil** is a comprehensive career guidance platform that:

1. **Securely authenticates** students with email verification
2. **Collects comprehensive profiles** for personalized recommendations
3. **Provides 3-test assessment system** (Personality, Aptitude, Interest) with weighted aggregation
4. **Generates accurate career recommendations** using evidence-based algorithms
5. **Offers university and program database** with search and filter capabilities
6. **Enables admin management** of users, universities, and programs
7. **Maintains modern, responsive UI** with professional design

The system is built using **Node.js/Express backend** and **React.js frontend**, with **MongoDB** for data storage, following **RESTful API architecture** and **MVC pattern** for maintainability and scalability.

---

**Note:** This document describes the **currently implemented modules** as per the FYP project codebase. Future enhancements (Merit Calculator, Entry Test Mock Exams, Admission Calendar, Scholarship Information, University Comparison Tool) are planned for later milestones.


