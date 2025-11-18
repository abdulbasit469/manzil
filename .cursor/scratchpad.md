# Manzil (مَنزِل): Smart Career Counseling & University Guidance Portal

## Background and Motivation

### Project Overview
Manzil is a web + mobile portal designed to help Pakistani students make informed decisions about their higher education journey after intermediate (FSc, FA, ICS, ICOM). The platform addresses the critical gap in career counseling and centralized educational guidance in Pakistan.

### Core Problem
- Pakistani students lack professional career counseling at matric and intermediate levels
- No centralized platform for HEC-recognized universities, programs, and admissions
- Confusion about entry tests, degree scope, scholarships, and admission processes
- This leads to poor educational decisions, wasted resources, and unemployment

### Project Scope for 40% MVP
The initial 40% milestone will focus on establishing a complete full-stack foundation:
- **Backend API**: Authentication system (Login/Signup with JWT)
- **Backend API**: Basic student profile and dashboard endpoints
- **Backend API**: University information module (HEC-recognized universities database)
- **Backend API**: Basic career counseling questionnaire
- **Backend API**: Admin panel endpoints for data management
- **Frontend Web App**: React.js UI for all above features
- **Integration**: Complete frontend-backend integration with authentication flow

### Technology Stack (Selected)
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM (Local Installation)
- **Frontend**: React.js with React Router, Axios, Context API/Redux
- **UI Framework**: Material-UI (MUI) or Tailwind CSS for modern design
- **Authentication**: JWT (JSON Web Tokens) with localStorage
- **Architecture**: RESTful API backend + SPA (Single Page Application) frontend

---

## Key Challenges and Analysis

### Technical Challenges
1. **Database Design**: Need to structure data for universities, programs, admission criteria, merit lists, scholarships, and student profiles in a scalable way
2. **Authentication & Authorization**: Secure user authentication with role-based access (Student, Admin) across frontend and backend
3. **Data Collection**: Gathering authentic HEC university data, programs, and admission information
4. **Career Assessment Logic**: Designing a comprehensive 3-test system (Personality/RIASEC, Aptitude, Interest) with weighted aggregation (30%, 40%, 30%) and rule-based enhancements that accurately map to career paths
5. **API Design**: Creating clean, RESTful APIs that can serve both web and future mobile applications
6. **Frontend-Backend Integration**: Proper state management, API communication, error handling, and authentication flow
7. **UI/UX Design**: Creating an intuitive, modern interface suitable for Pakistani students with varying technical literacy

### Architectural Decisions
1. **Monolithic Backend**: Start with a single Node.js application for simplicity
2. **JWT Authentication**: Stateless authentication for scalability
3. **Role-Based Access Control**: Student and Admin roles
4. **Modular Code Structure**: Separate concerns (routes, controllers, models, middleware, services)
5. **Environment Configuration**: Use .env for sensitive data

### Data Structure Considerations
- **Users Collection**: Students and Admins with profiles
- **Universities Collection**: HEC-recognized institutions with detailed information
- **Programs Collection**: Degree programs with eligibility, scope, and requirements
- **Career Assessments Collection**: Store student assessment results (Personality, Aptitude, Interest tests with aggregated scores)
- **Scholarships Collection**: Financial aid and scholarship information (future)
- **Admissions Collection**: Deadlines, merit lists, application links (future)

---

## High-level Task Breakdown

### Phase 1: Project Setup & Infrastructure (Week 1)
**Success Criteria**: Development environment ready, project structure established, can run basic server

- [ ] **Task 1.1**: Initialize Node.js project with proper structure
  - Create project directory structure (MVC pattern)
  - Initialize npm and install core dependencies
  - Set up Git repository with proper .gitignore
  - **Success Criteria**: `npm start` runs without errors, folder structure is clear and organized

- [ ] **Task 1.2**: Configure development environment
  - Set up MongoDB connection (local or Atlas)
  - Create .env configuration file
  - Set up environment variables (PORT, DB_URI, JWT_SECRET)
  - Configure nodemon for development
  - **Success Criteria**: Server connects to MongoDB successfully, environment variables load properly

- [ ] **Task 1.3**: Implement basic Express server with middleware
  - Set up Express application
  - Configure CORS, body-parser, helmet for security
  - Create basic health check endpoint
  - Set up error handling middleware
  - **Success Criteria**: Server responds to GET /api/health, proper error responses work

### Phase 2: Authentication System (Week 2)
**Success Criteria**: Users can register, login, and access protected routes

- [ ] **Task 2.1**: Create User model and schema
  - Design User schema (name, email, password, role, profile fields)
  - Add password hashing with bcrypt
  - Add timestamps and validation
  - **Success Criteria**: Can create user documents in MongoDB with proper validation

- [ ] **Task 2.2**: Implement registration endpoint
  - Create POST /api/auth/register endpoint
  - Validate user input (email format, password strength)
  - Hash password before saving
  - Return appropriate success/error messages
  - **Success Criteria**: Can register new users via API, passwords are hashed, duplicate emails rejected

- [ ] **Task 2.3**: Implement login endpoint with JWT
  - Create POST /api/auth/login endpoint
  - Verify email and password
  - Generate JWT token with user payload
  - Return token and user info (excluding password)
  - **Success Criteria**: Valid credentials return JWT token, invalid credentials return 401 error

- [ ] **Task 2.4**: Create authentication middleware
  - Create JWT verification middleware
  - Implement role-based authorization middleware
  - Protect routes requiring authentication
  - **Success Criteria**: Protected routes reject requests without valid token, role checks work properly

### Phase 3: Student Profile & Dashboard (Week 3)
**Success Criteria**: Students can view and update their profiles, see basic dashboard

- [ ] **Task 3.1**: Extend User model with student profile fields
  - Add student-specific fields (intermediate type, marks, city, interests)
  - Create profile completion status logic
  - **Success Criteria**: Student profile fields save and retrieve correctly

- [ ] **Task 3.2**: Implement profile endpoints
  - Create GET /api/profile - get current user profile
  - Create PUT /api/profile - update profile
  - Create GET /api/profile/completion - get profile completion percentage
  - **Success Criteria**: Users can view and update their profiles, proper validation in place

- [ ] **Task 3.3**: Create basic dashboard endpoint
  - Create GET /api/dashboard - return personalized dashboard data
  - Include profile completion status
  - Include quick stats (saved universities, assessment status)
  - **Success Criteria**: Dashboard endpoint returns relevant user data

### Phase 4: University Information Module (Week 4-5)
**Success Criteria**: Universities database populated, students can browse and search universities

- [ ] **Task 4.1**: Design University and Program models
  - Create University schema (name, city, type, HEC ranking, facilities, contact)
  - Create Program schema (degree name, university, duration, fee, eligibility)
  - Establish relationships between models
  - **Success Criteria**: Can create and query university and program documents

- [ ] **Task 4.2**: Implement university CRUD endpoints (Admin)
  - Create POST /api/admin/universities - add university
  - Create PUT /api/admin/universities/:id - update university
  - Create DELETE /api/admin/universities/:id - delete university
  - Add admin-only authorization
  - **Success Criteria**: Admins can manage universities via API, students cannot access these endpoints

- [ ] **Task 4.3**: Implement public university browsing endpoints
  - Create GET /api/universities - list all universities with pagination
  - Create GET /api/universities/:id - get single university details
  - Add filtering (by city, type, ranking)
  - Add search functionality (by name)
  - **Success Criteria**: Students can browse universities with filters and search

- [ ] **Task 4.4**: Implement program endpoints
  - Create POST /api/admin/programs - add program (admin only)
  - Create GET /api/programs - list programs with filters
  - Create GET /api/programs/:id - get program details
  - Create GET /api/universities/:id/programs - get programs by university
  - **Success Criteria**: Programs are linked to universities, students can browse available programs

- [ ] **Task 4.5**: Seed initial university data
  - Research and compile data for top 10-15 Pakistani universities
  - Create seed script to populate database
  - Include at least 30-40 programs across universities
  - **Success Criteria**: Database has realistic sample data for demonstration

### Phase 5: Basic Career Counseling Module (Week 6) - COMPLETED (Basic Version)
**Success Criteria**: Students can take a basic career assessment and see results

- [x] **Task 5.1**: Design career assessment structure
  - Define question categories (interests, skills, preferences)
  - Create 15-20 meaningful questions
  - Define career path mappings (Engineering, Medical, Business, IT, Arts, etc.)
  - **Success Criteria**: Assessment structure documented and reviewed

- [x] **Task 5.2**: Create Assessment model
  - Create schema for storing assessment questions
  - Create schema for storing user responses
  - Link assessment results to user profile
  - **Success Criteria**: Can store and retrieve assessment data

- [x] **Task 5.3**: Implement assessment endpoints
  - Create GET /api/assessment/questions - get assessment questions
  - Create POST /api/assessment/submit - submit assessment responses
  - Create GET /api/assessment/results - get user's assessment results
  - Implement basic scoring logic
  - **Success Criteria**: Students can take assessment and receive career recommendations

- [x] **Task 5.4**: Create career recommendation logic
  - Map assessment scores to career paths
  - Return top 3-5 career recommendations with descriptions
  - Link recommended careers to relevant programs
  - **Success Criteria**: Assessment results show meaningful career recommendations

### Phase 11: Enhanced 3-Test Career Counseling Module (Current Priority)
**Success Criteria**: Complete 3-test system with weighted aggregation model implemented and working

#### Test 1: Personality Test (Holland Codes - RIASEC)
**Weight: 30% in final aggregation**

- [ ] **Task 11.1**: Design Personality Test structure
  - Research RIASEC model (Realistic, Investigative, Artistic, Social, Enterprising, Conventional)
  - Plan 30-40 questions (5-7 questions per RIASEC category)
  - Define question format: { id, question, riasecType }
  - Map RIASEC types to career fields:
    - Realistic → Engineering, Technical
    - Investigative → Medical, Research, Science
    - Artistic → Arts, Media, Design
    - Social → Teaching, Counseling, Healthcare
    - Enterprising → Business, Management, Sales
    - Conventional → Accounting, Administration, Finance
  - **Success Criteria**: Question structure documented, RIASEC mapping defined

- [ ] **Task 11.2**: Create Personality Test questions array
  - Create personalityQuestions array with 30-40 questions
  - Ensure 5-7 questions per RIASEC category
  - Questions should be clear and relevant to Pakistani students
  - Format: { id, question, riasecType }
  - **Success Criteria**: Array contains 30-40 questions, evenly distributed across 6 RIASEC types

- [ ] **Task 11.3**: Implement Personality Test scoring logic
  - Calculate score for each RIASEC type (Realistic, Investigative, Artistic, Social, Enterprising, Conventional)
  - Use same scoring scale as current test (Strongly Agree=5, Agree=4, Neutral=3, Disagree=2, Strongly Disagree=1)
  - Normalize each RIASEC score to 0-100 scale
  - Store normalized scores for aggregation
  - **Success Criteria**: Can calculate and normalize RIASEC scores correctly

- [ ] **Task 11.4**: Create Personality Test API endpoints
  - Create GET /api/assessment/personality/questions - return personality test questions
  - Create POST /api/assessment/personality/submit - submit personality test responses
  - Return normalized RIASEC scores
  - **Success Criteria**: API endpoints work, return correct question format and scores

#### Test 2: Aptitude Test
**Weight: 40% in final aggregation**

- [ ] **Task 11.5**: Design Aptitude Test structure
  - Plan 40 questions total:
    - Logical Reasoning: 10 questions
    - Mathematical Ability: 10 questions
    - Verbal Ability: 10 questions
    - Analytical Skills: 10 questions
  - Define question format: { id, question, options: [A, B, C, D], correctAnswer, category, skillType }
  - Map skill types to career fields:
    - Logical + Analytical → Engineering, CS
    - Mathematical → Engineering, Finance, Economics
    - Verbal → Business, Media, Law, Social Sciences
  - **Success Criteria**: Test structure documented, skill mappings defined

- [ ] **Task 11.6**: Create Aptitude Test questions array
  - Create aptitudeQuestions array with 40 questions
  - Ensure 10 questions per category (Logical, Math, Verbal, Analytical)
  - Each question must have 4 options (A, B, C, D) and correct answer
  - Questions should be appropriate difficulty for intermediate students
  - Format: { id, question, options: [A, B, C, D], correctAnswer, category, skillType }
  - **Success Criteria**: Array contains 40 questions, 10 per category, all with correct answers

- [ ] **Task 11.7**: Implement Aptitude Test scoring logic
  - Calculate % correct per section (Logical, Math, Verbal, Analytical)
  - Normalize each section score to 0-100 scale
  - Store normalized scores for aggregation
  - **Success Criteria**: Can calculate percentage correct and normalize scores per section

- [ ] **Task 11.8**: Create Aptitude Test API endpoints
  - Create GET /api/assessment/aptitude/questions - return aptitude test questions
  - Create POST /api/assessment/aptitude/submit - submit aptitude test responses
  - Return normalized scores per section
  - **Success Criteria**: API endpoints work, return questions with options and calculate scores correctly

#### Test 3: Interest Test (Expand Current)
**Weight: 30% in final aggregation**

- [ ] **Task 11.9**: Expand Interest Test questions
  - Review current 15 questions
  - Expand to 30-40 questions total
  - Add work environment preference questions (team vs solo, office vs field, structured vs flexible)
  - Add career field depth questions (specific interests within fields)
  - Maintain current category structure (engineering, medical, business, computerScience, arts)
  - **Success Criteria**: Array contains 30-40 questions covering interests and work preferences

- [ ] **Task 11.10**: Update Interest Test scoring logic
  - Keep current category scoring (engineering, medical, business, computerScience, arts)
  - Normalize category scores to 0-100 scale
  - Store normalized scores for aggregation
  - **Success Criteria**: Can normalize interest test scores to 0-100 scale

- [ ] **Task 11.11**: Update Interest Test API endpoints
  - Update GET /api/assessment/interest/questions - return expanded question set
  - Update POST /api/assessment/interest/submit - handle expanded responses
  - Return normalized category scores
  - **Success Criteria**: API returns expanded questions and normalized scores

#### Weighted Aggregation Model

- [ ] **Task 11.12**: Design weighted aggregation algorithm
  - Define formula: Final Score = (Personality × 0.30) + (Aptitude × 0.40) + (Interest × 0.30)
  - Plan normalization: All 3 test scores must be 0-100 before aggregation
  - Design rule-based enhancements:
    - Logical + Analytical (high) → Engineering boost
    - Creative + Communication (high) → Media boost
    - Mathematical + Analytical (high) → Finance/Economics boost
    - Social + Enterprising (high) → Business/Management boost
  - Map aggregated scores to career fields
  - **Success Criteria**: Algorithm documented with clear formulas and rules

- [ ] **Task 11.13**: Implement weighted aggregation function
  - Create function to normalize all test scores to 0-100
  - Apply weights: Personality (30%), Aptitude (40%), Interest (30%)
  - Combine into final career field scores
  - Apply rule-based enhancements
  - Return top 5-7 career recommendations
  - **Success Criteria**: Function correctly aggregates scores and applies rules

- [ ] **Task 11.14**: Update Assessment model schema
  - Extend schema to store all 3 test results separately
  - Add fields: personalityResults, aptitudeResults, interestResults
  - Add aggregatedResults with final scores
  - Maintain backward compatibility with existing assessments
  - **Success Criteria**: Schema supports storing all 3 tests and aggregated results

- [ ] **Task 11.15**: Create unified assessment submission endpoint
  - Create POST /api/assessment/submit-complete - submit all 3 tests at once
  - Accept: { personalityResponses, aptitudeResponses, interestResponses }
  - Calculate scores for each test
  - Run weighted aggregation
  - Apply rule-based enhancements
  - Save complete assessment results
  - Return final career recommendations
  - **Success Criteria**: Endpoint accepts all 3 tests, aggregates correctly, returns recommendations

- [ ] **Task 11.16**: Create individual test submission endpoints (optional)
  - Allow students to take tests separately over time
  - Create POST /api/assessment/personality/submit - save personality test only
  - Create POST /api/assessment/aptitude/submit - save aptitude test only
  - Create POST /api/assessment/interest/submit - save interest test only
  - Create GET /api/assessment/status - check which tests are completed
  - Create POST /api/assessment/aggregate - aggregate when all 3 tests complete
  - **Success Criteria**: Students can take tests separately and aggregate when ready

#### Frontend Implementation

- [ ] **Task 11.17**: Design 3-test UI flow
  - Plan multi-step assessment interface
  - Step 1: Personality Test (30-40 questions)
  - Step 2: Aptitude Test (40 questions with multiple choice)
  - Step 3: Interest Test (30-40 questions)
  - Step 4: Results page with aggregated recommendations
  - Add progress indicator showing which test is active
  - Allow saving progress (optional)
  - **Success Criteria**: UI flow documented, user journey clear

- [ ] **Task 11.18**: Create Personality Test UI component
  - Create PersonalityTest.jsx component
  - Display questions with 5-point scale (Strongly Agree to Strongly Disagree)
  - Show progress (Question X/40)
  - Submit and navigate to next test
  - **Success Criteria**: Component renders questions, collects responses, submits correctly

- [ ] **Task 11.19**: Create Aptitude Test UI component
  - Create AptitudeTest.jsx component
  - Display questions with 4 multiple choice options (A, B, C, D)
  - Show progress (Question X/40)
  - Allow reviewing answers before submission
  - Submit and navigate to next test
  - **Success Criteria**: Component renders MCQs, collects answers, submits correctly

- [ ] **Task 11.20**: Update Interest Test UI component
  - Update existing Assessment.jsx or create InterestTest.jsx
  - Display expanded 30-40 questions
  - Show progress (Question X/40)
  - Submit and navigate to results
  - **Success Criteria**: Component displays all questions, collects responses correctly

- [ ] **Task 11.21**: Create Assessment Results page
  - Create ComprehensiveResults.jsx component
  - Display aggregated career recommendations (top 5-7)
  - Show breakdown: Personality scores, Aptitude scores, Interest scores
  - Show final weighted scores per career field
  - Display related programs for each recommended career
  - Add "Retake Assessment" option
  - **Success Criteria**: Results page shows all scores and recommendations clearly

- [ ] **Task 11.22**: Create Assessment Dashboard/Progress page
  - Show which tests are completed (Personality ✓, Aptitude ✓, Interest ✓)
  - Show completion status (0/3, 1/3, 2/3, 3/3)
  - Allow continuing incomplete tests
  - Show "View Results" button when all 3 tests complete
  - **Success Criteria**: Students can see progress and continue from where they left off

- [ ] **Task 11.23**: Update routing and navigation
  - Update routes to support multi-step assessment
  - Add route: /assessment/personality
  - Add route: /assessment/aptitude
  - Add route: /assessment/interest
  - Add route: /assessment/results
  - Update navigation to show assessment status
  - **Success Criteria**: Routing works, students can navigate between tests

#### Testing & Validation

- [ ] **Task 11.24**: Test Personality Test scoring
  - Test with sample responses
  - Verify RIASEC scores calculate correctly
  - Verify normalization to 0-100 works
  - Test edge cases (all same answer, mixed answers)
  - **Success Criteria**: Scoring logic works correctly for all scenarios

- [ ] **Task 11.25**: Test Aptitude Test scoring
  - Test with sample responses (correct and incorrect)
  - Verify percentage calculation per section
  - Verify normalization to 0-100 works
  - Test with all correct, all wrong, mixed answers
  - **Success Criteria**: Scoring logic calculates percentages and normalizes correctly

- [ ] **Task 11.26**: Test Interest Test scoring
  - Test with expanded question set
  - Verify category scores calculate correctly
  - Verify normalization to 0-100 works
  - **Success Criteria**: Expanded test scores correctly

- [ ] **Task 11.27**: Test weighted aggregation
  - Test with various score combinations
  - Verify weights apply correctly (30%, 40%, 30%)
  - Test rule-based enhancements trigger correctly
  - Verify final career recommendations are logical
  - **Success Criteria**: Aggregation produces meaningful career recommendations

- [ ] **Task 11.28**: End-to-end testing
  - Complete all 3 tests as a student
  - Verify results save correctly
  - Verify results display correctly
  - Test retaking assessment
  - Test partial completion (save progress)
  - **Success Criteria**: Complete user flow works without errors

### Phase 6: Admin Panel Backend (Week 7)
**Success Criteria**: Admin can manage users, universities, and view basic analytics

- [ ] **Task 6.1**: Implement admin user management
  - Create GET /api/admin/users - list all users with pagination
  - Create GET /api/admin/users/:id - get user details
  - Create PUT /api/admin/users/:id/role - change user role
  - Create DELETE /api/admin/users/:id - delete user
  - **Success Criteria**: Admin can view and manage users

- [ ] **Task 6.2**: Implement admin analytics endpoints
  - Create GET /api/admin/stats - overall statistics
  - Count total users, universities, programs
  - Count assessments completed
  - **Success Criteria**: Admin can see basic platform statistics

### Phase 7: Frontend Setup & Authentication UI (Week 8)
**Success Criteria**: React app initialized, login/signup pages working with backend

- [ ] **Task 7.1**: Initialize React.js project
  - Create React app with Vite or Create React App
  - Set up project folder structure (components, pages, services, context)
  - Install dependencies (React Router, Axios, MUI/Tailwind)
  - Configure proxy or CORS for backend communication
  - **Success Criteria**: React app runs on localhost, can make API calls to backend

- [ ] **Task 7.2**: Create authentication pages (Login & Signup)
  - Design Login page with email/password form
  - Design Signup page with registration form
  - Add form validation (client-side)
  - Create beautiful UI with Material-UI or Tailwind CSS
  - **Success Criteria**: Login and Signup pages render with proper styling

- [ ] **Task 7.3**: Implement authentication integration
  - Create auth service for API calls (login, signup)
  - Set up Context API or Redux for global auth state
  - Store JWT token in localStorage
  - Implement protected route component
  - Add logout functionality
  - **Success Criteria**: Users can register, login, logout; token persists; protected routes work

- [ ] **Task 7.4**: Create navigation and layout
  - Create header/navbar component (with user menu when logged in)
  - Create sidebar/footer components
  - Implement routing with React Router
  - Add role-based navigation (Student vs Admin views)
  - **Success Criteria**: Navigation works, different views for authenticated/unauthenticated users

### Phase 8: Frontend Core Pages (Week 9)
**Success Criteria**: All main student-facing pages completed and functional

- [ ] **Task 8.1**: Create Student Dashboard page
  - Design dashboard layout with profile completion widget
  - Show quick stats (universities saved, assessment status)
  - Display personalized welcome message
  - Connect to GET /api/dashboard endpoint
  - **Success Criteria**: Dashboard displays real data from backend

- [ ] **Task 8.2**: Create Profile page
  - Design profile form (intermediate type, marks, city, interests)
  - Implement profile update functionality
  - Show profile completion percentage
  - Add form validation and error handling
  - **Success Criteria**: Students can view and update their profiles

- [ ] **Task 8.3**: Create Universities browse page
  - Design university listing with cards/table view
  - Implement pagination
  - Add search bar and filters (by city, type)
  - Connect to GET /api/universities endpoint
  - **Success Criteria**: Students can browse, search, and filter universities

- [ ] **Task 8.4**: Create University detail page
  - Show detailed university information
  - Display programs offered by the university
  - Add "Save University" functionality (optional for MVP)
  - **Success Criteria**: Clicking a university shows all its details and programs

- [ ] **Task 8.5**: Create Career Assessment page
  - Design assessment UI (questions with options)
  - Implement multi-step form or single-page questionnaire
  - Add progress indicator
  - Submit assessment and show results
  - Display recommended careers with descriptions
  - **Success Criteria**: Students can complete assessment and see career recommendations

### Phase 9: Admin Panel Frontend (Week 10)
**Success Criteria**: Admin can manage users and universities through UI

- [ ] **Task 9.1**: Create Admin Dashboard
  - Design admin dashboard with statistics cards
  - Show total users, universities, programs, assessments
  - Connect to GET /api/admin/stats endpoint
  - **Success Criteria**: Admin sees platform statistics on dashboard

- [ ] **Task 9.2**: Create Admin Users Management page
  - Display users table with pagination
  - Add search and filter functionality
  - Implement user role change functionality
  - Add user delete functionality (with confirmation)
  - **Success Criteria**: Admin can view, search, and manage users

- [ ] **Task 9.3**: Create Admin Universities Management page
  - Display universities table with edit/delete actions
  - Create "Add University" form/modal
  - Create "Edit University" form/modal
  - Implement delete with confirmation
  - **Success Criteria**: Admin can add, edit, and delete universities

- [ ] **Task 9.4**: Create Admin Programs Management page
  - Display programs table linked to universities
  - Create "Add Program" form with university selector
  - Implement edit and delete functionality
  - **Success Criteria**: Admin can manage programs for universities

### Phase 10: Testing, Polish & Documentation (Week 11)
**Success Criteria**: Full application tested, polished, documented, and demo-ready

- [ ] **Task 10.1**: Write API tests
  - Test authentication flows (register, login, protected routes)
  - Test CRUD operations for universities and programs
  - Test career assessment flow
  - Use Jest or Mocha for testing
  - **Success Criteria**: Core endpoints have passing tests

- [ ] **Task 10.2**: Test frontend functionality
  - Test all user flows (signup, login, profile, browse, assessment)
  - Test admin functionality (user management, university CRUD)
  - Check responsive design on different screen sizes
  - Fix bugs and improve error messages
  - **Success Criteria**: All features work smoothly, no critical bugs

- [ ] **Task 10.3**: Polish UI and improve UX
  - Add loading spinners for API calls
  - Improve error messages and validation feedback
  - Add success notifications (toast messages)
  - Ensure consistent styling across pages
  - Add empty states (no universities, no assessment taken)
  - **Success Criteria**: Application feels professional and polished

- [ ] **Task 10.4**: Create comprehensive documentation
  - Document API endpoints with Postman collection
  - Create README with setup instructions
  - Document environment variables needed
  - Add code comments for complex logic
  - **Success Criteria**: Another developer can set up and run the project

- [ ] **Task 10.5**: Prepare demo and presentation
  - Seed database with realistic sample data (10-15 universities, 30-40 programs)
  - Create test accounts (student and admin)
  - Prepare demo script showing all features
  - Take screenshots for presentation
  - **Success Criteria**: Can demonstrate complete 40% MVP smoothly

---

## Project Status Board

### Week 1: Backend Project Setup (In Progress)
- [x] Task 1.1: Initialize Node.js project with proper structure
- [x] Task 1.2: Configure development environment with MongoDB
- [x] Task 1.3: Implement basic Express server with middleware

### Week 2: Backend Authentication (Completed)
- [x] Task 2.1: Create User model and schema
- [x] Task 2.2: Implement registration endpoint
- [x] Task 2.3: Implement login endpoint with JWT
- [x] Task 2.4: Create authentication middleware

### Week 3: Backend Student Profile (Completed)
- [x] Task 3.1: Extend User model with student profile fields
- [x] Task 3.2: Implement profile endpoints
- [x] Task 3.3: Create basic dashboard endpoint

### Week 4-5: Backend University Module (In Progress)
- [x] Task 4.1: Design University and Program models
- [x] Task 4.2: Implement university CRUD endpoints (Admin)
- [x] Task 4.3: Implement public university browsing endpoints
- [x] Task 4.4: Implement program endpoints
- [ ] Task 4.5: Seed initial university data (Next)

### Week 6: Backend Career Counseling (Basic Version Completed)
- [x] Task 5.1: Design career assessment structure
- [x] Task 5.2: Create Assessment model
- [x] Task 5.3: Implement assessment endpoints
- [x] Task 5.4: Create career recommendation logic

### Phase 11: Enhanced 3-Test Career Counseling Module (IN PROGRESS)
**Status**: Planning complete, ready for implementation

**Backend Tasks**:
- [x] Task 11.1: Design Personality Test structure ✅
- [x] Task 11.2: Create Personality Test questions array (36 questions - 6 per RIASEC type) ✅
- [x] Task 11.3: Implement Personality Test scoring logic ✅
- [x] Task 11.4: Create Personality Test API endpoints ✅
- [x] Task 11.5: Design Aptitude Test structure ✅
- [x] Task 11.6: Create Aptitude Test questions array (40 questions - 10 per category) ✅
- [x] Task 11.7: Implement Aptitude Test scoring logic ✅
- [x] Task 11.8: Create Aptitude Test API endpoints ✅
- [x] Task 11.9: Expand Interest Test questions (15 → 36 questions) ✅
- [x] Task 11.10: Update Interest Test scoring logic ✅
- [x] Task 11.11: Update Interest Test API endpoints ✅
- [x] Task 11.12: Design weighted aggregation algorithm ✅
- [x] Task 11.13: Implement weighted aggregation function ✅
- [x] Task 11.14: Update Assessment model schema ✅
- [x] Task 11.15: Create unified assessment submission endpoint ✅
- [x] Task 11.16: Create individual test submission endpoints (optional) ✅

**Frontend Tasks**:
- [x] Task 11.17: Design 3-test UI flow ✅
- [x] Task 11.18: Create Personality Test UI component ✅
- [x] Task 11.19: Create Aptitude Test UI component ✅
- [x] Task 11.20: Update Interest Test UI component ✅
- [x] Task 11.21: Create Assessment Results page ✅
- [x] Task 11.22: Create Assessment Dashboard/Progress page ✅
- [x] Task 11.23: Update routing and navigation ✅

**Testing Tasks**:
- [x] Task 11.24: Test Personality Test scoring ✅
- [x] Task 11.25: Test Aptitude Test scoring ✅
- [x] Task 11.26: Test Interest Test scoring ✅
- [x] Task 11.27: Test weighted aggregation ✅
- [x] Task 11.28: End-to-end testing ✅

### Week 7: Backend Admin Panel (Completed)
- [x] Task 6.1: Implement admin user management
- [x] Task 6.2: Implement admin analytics endpoints

### Week 8: Frontend Setup & Authentication UI (Completed)
- [x] Task 7.1: Initialize React.js project
- [x] Task 7.2: Create authentication pages (Login & Signup)
- [x] Task 7.3: Implement authentication integration
- [x] Task 7.4: Create navigation and layout

### Week 9: Frontend Core Pages (Completed)
- [x] Task 8.1: Create Student Dashboard page
- [x] Task 8.2: Create Profile page
- [x] Task 8.3: Create Universities browse page
- [x] Task 8.4: Create University detail page (merged with browse)
- [x] Task 8.5: Create Career Assessment page

### Week 10: Frontend Admin Panel (Not Started)
- [ ] Task 9.1: Create Admin Dashboard
- [ ] Task 9.2: Create Admin Users Management page
- [ ] Task 9.3: Create Admin Universities Management page
- [ ] Task 9.4: Create Admin Programs Management page

### Week 11: Testing, Polish & Documentation (Not Started)
- [ ] Task 10.1: Write API tests
- [ ] Task 10.2: Test frontend functionality
- [ ] Task 10.3: Polish UI and improve UX
- [ ] Task 10.4: Create comprehensive documentation
- [ ] Task 10.5: Prepare demo and presentation

---

## Current Status / Progress Tracking

**Current Phase**: Full-Stack Application Complete (~70% of 40% MVP) - Ready for Testing

**Last Updated**: Completed Weeks 1-9 (Backend + Frontend Core Features)

**✅ BACKEND COMPLETED (Weeks 1-7)**:
- ✅ Node.js + Express server setup with MongoDB connection
- ✅ Complete authentication system (Register, Login, JWT, Protected Routes)
- ✅ User profile management with completion tracking  
- ✅ Dashboard endpoint for students
- ✅ University CRUD (Admin: Create, Update, Delete; Public: Browse, Search, Filter)
- ✅ Program CRUD linked to universities
- ✅ Career assessment with 15 questions and scoring algorithm
- ✅ Career recommendations based on assessment results
- ✅ Admin panel APIs (User management, Statistics)
- ✅ Role-based authorization (Student/Admin)

**✅ FRONTEND COMPLETED (Weeks 8-9)**:
- ✅ React.js with Vite setup
- ✅ Authentication UI (Login & Signup pages with beautiful design)
- ✅ AuthContext for global state management
- ✅ Protected Routes component
- ✅ Navbar with dynamic menu (logged in/out states)
- ✅ Student Dashboard with profile completion and stats
- ✅ Profile page (complete profile with all fields)
- ✅ Universities browse page (search, filter by city/type)
- ✅ Career Assessment page (15 questions with results display)
- ✅ Responsive design with modern UI

**API Endpoints** (Total: 25+):
- Auth: /api/auth/register, /login, /me
- Profile: /api/profile (GET, PUT), /completion
- Dashboard: /api/dashboard
- Universities: /api/universities (GET, POST, PUT, DELETE), /:id, /:id/programs
- Programs: /api/programs (GET, POST, PUT, DELETE), /:id
- Assessment: /api/assessment/questions, /submit, /results
- Admin: /api/admin/users, /users/:id/role, /stats

**How to Test**:
1. Start Backend: `cd manzil && npm run dev` (Port 5000)
2. Start Frontend: `cd frontend && npm run dev` (Port 3000)
3. Open browser: http://localhost:3000
4. Sign up, login, and test all features

**Recent Updates**:
- ✅ Signup now redirects to OTP verification page
- ✅ Black & white theme applied across entire app
- ✅ **OTP Email Verification FULLY IMPLEMENTED & WORKING!**
  - 6-digit OTP generated on signup
  - OTP sent via email (ab887812@gmail.com)
  - Email verification required before login
  - OTP expires in 10 minutes
  - Resend OTP functionality
  - User cannot login without verification
  - TLS certificate issue fixed
- ✅ Dashboard UI improved (text overflow fixed)

**FYP PROPOSAL REQUIREMENTS:**

### Career Assessment System (As Per Proposal):
**REQUIRED: 3 Comprehensive Tests** (Currently only 1 basic test implemented)

1. **Personality Test (Holland Codes)** - NOT IMPLEMENTED
   - RIASEC Model: Realistic, Investigative, Artistic, Social, Enterprising, Conventional
   - 30-40 questions
   - Maps to career fields

2. **Aptitude Test** - NOT IMPLEMENTED
   - Logical Reasoning (10 questions)
   - Mathematical Ability (10 questions)
   - Verbal Ability (10 questions)
   - Analytical Skills (10 questions)
   - Total: 40 questions

3. **Interest Test** - PARTIALLY IMPLEMENTED (needs expansion)
   - Current: 15 basic questions
   - Required: 30-40 detailed questions
   - Career field preferences
   - Work environment preferences

### Weighted Aggregation Model:
- Personality Test: 30% weight
- Aptitude Test: 40% weight
- Interest Test: 30% weight
- Combined score → Degree recommendation
- Rule-based mapping: logical + analytical → Engineering

**Recent Completion:**
- ✅ **ENTIRE UI PROFESSIONAL REDESIGN COMPLETE!**
- ✅ **Admin Panel Frontend - PROFESSIONAL DESIGN COMPLETE!**
- ✅ **Student Dashboard - PROFESSIONAL DESIGN COMPLETE!**
  - Admin Dashboard with statistics
  - User Management (view, edit role, delete)
  - University Management (add, edit, delete)
  - Program Management (add, edit, delete)
  - Assessment Analytics (view all, top careers, statistics)
  - Role-based navigation (Admin vs Student)
  - Protected admin routes
  - Smart role-based redirects (Admin → /admin, Student → /dashboard)
  - Fixed: Admin no longer sees student dashboard
  - **PROFESSIONAL UI REDESIGN:**
    - ✅ Removed ALL emojis from UI
    - ✅ Modern corporate design with clean borders
    - ✅ Professional color scheme (black/white/grey)
    - ✅ Unique gradient backgrounds on cards
    - ✅ **HORIZONTAL CARD LAYOUTS** (icon on left, content on right)
    - ✅ Arrow indicators on action cards (→)
    - ✅ Bottom border animation on action cards
    - ✅ Left border animation on activity items
    - ✅ Smooth cubic-bezier transitions
    - ✅ Gradient icons with unique colors per card
    - ✅ Decorative circles on stat cards
    - ✅ Professional hover states with lift effect
    - ✅ Better typography and spacing
    - ✅ Enhanced table design
    - ✅ Improved button styles
    - ✅ Professional modal dialogs
    - ✅ Fully responsive (2 columns on tablet, 1 on mobile)
    - ✅ **FULL-WIDTH LAYOUT** - No wasted space on sides
    - ✅ 4-column grid on desktop (auto 2-column on smaller screens)
    - ✅ Edge-to-edge design with 60px padding
    - ✅ Better space utilization across all screen sizes
    - ✅ **ALL EMOJIS REMOVED** from entire application (100% emoji-free!)
      - Removed 🎉 from Assessment results
      - Replaced ✅❌ with VERIFIED/PENDING badges in Admin Users
    - ✅ Student Dashboard redesigned with same professional style
    - ✅ Universities page updated with modern cards
    - ✅ Assessment page updated with professional borders
    - ✅ Consistent design language across all pages
    - ✅ Shimmer animation on progress bars
    - ✅ Enhanced hover states everywhere

**Next Steps** (Remaining for 40% MVP): 
1. ⚠️ **CRITICAL: Implement 3-Test Career Assessment System** (Phase 11 - See detailed breakdown below)
   - Personality Test (Holland Codes - RIASEC) - 30-40 questions, 30% weight
   - Aptitude Test (Logical, Math, Verbal, Analytical) - 40 questions, 40% weight
   - Interest Test (Expand current test) - 30-40 questions, 30% weight
   - Weighted Aggregation Model with rule-based enhancements
2. Testing & Polish (Week 11)
3. Seed sample university data for demo
4. Final bug fixes and deployment prep

---

## Testing Admin Panel

**Admin Credentials Created:**
- Email: admin@manzil.com
- Password: admin123

**Admin Panel URLs:**
1. Dashboard: http://localhost:3000/admin
2. User Management: http://localhost:3000/admin/users
3. Universities: http://localhost:3000/admin/universities
4. Programs: http://localhost:3000/admin/programs
5. Analytics: http://localhost:3000/admin/assessments

**How to Test:**
1. Login with admin credentials
2. You'll see admin navigation menu (Dashboard, Users, Universities, Programs, Analytics)
3. Test all CRUD operations:
   - Add/Edit/Delete Universities
   - Add/Edit/Delete Programs
   - View Users and change roles
   - View assessment analytics

---

## Executor's Feedback or Assistance Requests

### Current Priority: 3-Test Career Counseling Module
**Status**: IN PROGRESS - Backend implementation started

**Progress Update** (Executor):
- ✅ **Tasks 11.1-11.4 COMPLETED**: Personality Test (RIASEC) fully implemented
  - 36 questions created (6 per RIASEC type)
  - Scoring logic with normalization to 0-100 scale
  - API endpoints: GET /api/assessment/personality/questions, POST /api/assessment/personality/submit
  - RIASEC to career field mapping implemented
  
- ✅ **Tasks 11.5-11.8 COMPLETED**: Aptitude Test fully implemented
  - 40 questions created (10 per category: Logical, Math, Verbal, Analytical)
  - Multiple choice questions with correct answers
  - Scoring logic calculates % correct per section and normalizes to 0-100
  - API endpoints: GET /api/assessment/aptitude/questions, POST /api/assessment/aptitude/submit
  - Skill type to career field mapping implemented

- ✅ **Tasks 11.9-11.11 COMPLETED**: Interest Test expanded and updated
  - Expanded from 15 to 36 questions (6 per category + 6 work environment questions)
  - Added work environment preference questions
  - Updated scoring logic with normalization to 0-100 scale
  - API endpoints: GET /api/assessment/interest/questions, POST /api/assessment/interest/submit
  - Maintains backward compatibility with existing endpoints

- ✅ **Tasks 11.12-11.16 COMPLETED**: Weighted Aggregation Model fully implemented
  - Weighted aggregation function: Personality (30%) + Aptitude (40%) + Interest (30%)
  - Rule-based enhancements implemented:
    - Logical + Analytical (high) → Engineering boost
    - Creative + Communication (high) → Media/Arts boost
    - Mathematical + Analytical (high) → Finance/Economics boost
    - Social + Enterprising (high) → Business/Management boost
  - Assessment model schema updated to store all 3 test results separately
  - Unified submission endpoint: POST /api/assessment/submit-complete
  - Assessment status endpoint: GET /api/assessment/status
  - Individual test endpoints available for separate submission

- ✅ **Tasks 11.17-11.23 COMPLETED**: Frontend UI Components fully implemented
  - AssessmentFlow component manages multi-step test flow
  - PersonalityTest component with progress tracking
  - AptitudeTest component with multiple choice questions
  - InterestTest component (expanded)
  - AssessmentResults component showing aggregated results with breakdown
  - Assessment status/dashboard showing test completion
  - Routing updated to use new AssessmentFlow
  - CSS styling for all new components
  - Auto-aggregation when all 3 tests are completed

- ✅ **Tasks 11.24-11.28 COMPLETED**: Testing & Validation
  - Created test suite (backend/tests/assessmentTest.js)
  - Personality Test scoring validated ✅
  - Aptitude Test scoring validated ✅
  - Interest Test scoring validated ✅
  - Weighted aggregation formula verified ✅
  - All tests passing successfully

**🎉 PHASE 11 COMPLETE! 🎉**
All 28 tasks completed successfully. The 3-Test Career Counseling Module is fully implemented and tested.

**Recommended Implementation Order**:
1. Backend: Personality Test (Tasks 11.1-11.4)
2. Backend: Aptitude Test (Tasks 11.5-11.8)
3. Backend: Interest Test Expansion (Tasks 11.9-11.11)
4. Backend: Weighted Aggregation (Tasks 11.12-11.16)
5. Frontend: UI Components (Tasks 11.17-11.23)
6. Testing: Validation (Tasks 11.24-11.28)

**Key Considerations**:
- Maintain backward compatibility with existing 15-question assessment
- All test scores must be normalized to 0-100 before aggregation
- Rule-based enhancements should boost relevant career fields
- Students should be able to take tests separately or all at once
- Progress saving is optional but recommended for better UX

### Outstanding Questions:
1. **UI Framework Choice**: Would you prefer **Material-UI (MUI)** or **Tailwind CSS** for the frontend? 
   - MUI: Pre-built components, faster development, modern look
   - Tailwind: More customization, utility-first, lightweight
   
2. **University Data**: Do you have access to HEC university data, or should I compile data manually for 10-15 top Pakistani universities for the demo?

3. **MongoDB Path**: Need to verify exact path to MongoDB binaries. Is it in a specific version folder like `C:\Program Files\MongoDB\Server\6.0\bin` or similar?

4. **Assessment Flow**: Should students be able to:
   - Take all 3 tests in one session? (Recommended: Yes)
   - Save progress and continue later? (Recommended: Yes, optional)
   - See results after each individual test? (Recommended: No, only after all 3)

### Notes:
- Full-stack architecture: Backend API serves frontend React SPA
- JWT authentication will work across both backend and frontend
- API-first design ensures clean separation of concerns
- All endpoints will be tested with Postman before frontend integration
- MongoDB's flexible schema allows us to evolve data structures as needed
- 3-test system aligns with FYP proposal requirements
- Weighted aggregation ensures balanced recommendations (not relying on single test)

---

## Lessons Learned

### Technical Decisions Made:
1. **Node.js + Express**: Chosen for rapid development and JavaScript ecosystem familiarity
2. **MongoDB Local**: Using local installation at C:\Program Files\MongoDB, flexible schema good for evolving requirements
3. **JWT**: Stateless authentication, scalable, works for web (and future mobile)
4. **MVC Pattern**: Clear separation of concerns, maintainable backend codebase
5. **React.js**: Component-based architecture, rich ecosystem, widely used
6. **Full-Stack in 40% MVP**: Including both backend and frontend to deliver complete working application

### Best Practices to Follow:
- Include info useful for debugging in the program output (from user lessons)
- Read files before editing them (from user lessons)
- Handle npm audit vulnerabilities as they arise (from user lessons)
- Never use git --force without asking user first (from user lessons)
- Always validate user input at API level
- Never store passwords in plain text
- Use proper HTTP status codes
- Handle errors gracefully with meaningful messages

### Project-Specific Considerations:
- Focus on simplicity first - don't over-engineer
- Each task should be completable and testable independently
- HEC data authenticity is crucial for project credibility
- Career assessment algorithm should be evidence-based, even if simple
- Consider Pakistan-specific context (cities, education system, entry tests)

---

## Future Enhancements (Beyond 40% MVP)

### 40% MVP Includes (Current Scope):
✅ Full authentication system (Login/Signup)
✅ Student profile and dashboard
✅ University browsing with search and filters
✅ Program information linked to universities
✅ Basic career assessment questionnaire with recommendations
✅ Admin panel for managing users, universities, and programs
✅ Complete React.js frontend integration
✅ Beautiful, modern UI design

### For 60% Milestone:
- Admission deadlines and application tracking
- Entry test information module (NTS, ECAT, MDCAT, USAT)
- Historical merit list data (last 5 years)
- Detailed eligibility criteria and weightage calculators
- Scholarship information database (Ehsaas, PEEF, HEC, university-specific)
- University comparison tool (compare 2-3 side-by-side)
- User favorites and bookmarking system

### For 80% Milestone:
- Financial guidance module (Fee vs ROI calculator)
- Student loan and installment information
- Email notifications for deadlines and updates
- Advanced filtering (by fee range, location, facilities)
- University reviews and ratings (by students)
- Program scope and job market information
- Salary expectations by degree

### For 100% Completion:
- AI Chatbot for instant career counseling
- ML-based recommendation system (personalized suggestions)
- Push notifications (web and mobile)
- Alumni connect and mentor network
- Career roadmap generator with milestones
- Integration with university admission portals
- Mobile app (Flutter) for Android and iOS
- Analytics dashboard for policy makers

### Post-FYP Ideas:
- Job market trends integration with real-time data
- Placement statistics by university and program
- Virtual university tours (360° photos/videos)
- Live chat with university representatives
- Application fee payment integration
- Document verification and submission system
- Career success stories and case studies

