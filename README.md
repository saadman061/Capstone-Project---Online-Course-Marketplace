# Quick Start Guide — 5 Minute Setup

## Prerequisites Check
- ✅ Node.js v16+ installed (`node --version`)
- ✅ MySQL 8.0+ running (`mysql --version`)
- ✅ Git installed

## Step 1: Clone & Install (2 min)

```bash
cd course-marketplace

# Backend
cd backend
npm install
cd ..

# Frontend
cd frontend
npm install
cd ..
```

## Step 2: Database Setup (1 min)

```bash
# Create database
mysql -u root -p < database/schema.sql

# Or manually:
# 1. Open MySQL Workbench
# 2. Run SQL file: database/schema.sql
# 3. Verify: SELECT * FROM course_marketplace.users;
```

## Step 3: Start Backend (1 min)

```bash
cd backend

# Create .env file
cat > .env << EOF
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=course_marketplace
JWT_SECRET=super-secret-key-change-in-production
EOF

# Start server
npm run dev
```

**Expected output:**
```
✅ Database connection established
✅ Server running on http://localhost:5000
📚 API Documentation: http://localhost:5000/api/v1/docs
```

## Step 4: Start Frontend (1 min)

```bash
cd frontend

# Create .env file
echo "REACT_APP_API_URL=http://localhost:5000/api/v1" > .env

# Start app
npm start
```

**Browser opens:** http://localhost:3000

---

## Test the Application

### 1. Register as Student
- Click "Sign Up"
- Email: `student@example.com`
- Password: `password123`
- Role: Student
- Submit ✓

### 2. Register as Instructor
- Click "Sign Up"
- Email: `instructor@example.com`
- Password: `password123`
- Role: Instructor
- Submit ✓

### 3. Explore Courses
- Click "Courses" or "Explore Courses"
- See featured courses on homepage
- View course details

### 4. Add to Cart
- Click "Add to Cart" on any course
- Check cart icon (shows count)
- Click cart to view items

### 5. Instructor Features (after login as instructor)
- Visit `/instructor/dashboard`
- Create new course
- Add modules and lessons
- Submit for review

### 6. Admin Features (manual setup)
```bash
# In MySQL Workbench, change a user's role:
UPDATE users SET role = 'admin' WHERE email = 'student@example.com';
```
- Log in as that admin
- Visit `/admin/dashboard`
- Approve/reject courses
- Suspend users

---

## Common Issues

### "Cannot find module 'reflect-metadata'"
```bash
cd backend
npm install reflect-metadata
```

### "Database connection failed"
```bash
# Check MySQL is running
mysql -u root -p -e "SELECT 1;"

# Verify database created
mysql -u root -p -e "USE course_marketplace; SHOW TABLES;"
```

### "Port 3000 is already in use"
```bash
# Find and kill the process
lsof -i :3000
kill -9 <PID>

# Or use a different port
PORT=3001 npm start
```

### "CORS error when fetching from frontend"
- Confirm backend is running on port 5000
- Check `REACT_APP_API_URL` is set to `http://localhost:5000/api/v1`
- Backend CORS is enabled: `app.use(cors())`

---

## Project Structure

```
course-marketplace/
├── backend/                      # Express + TypeORM API
│   ├── src/entities/            # Database entities (User, Course, etc.)
│   ├── src/routes/              # API endpoints
│   ├── src/middleware/          # Auth, validation
│   ├── ormconfig.json           # TypeORM config
│   ├── package.json
│   └── .env                     # Environment variables (create this)
│
├── frontend/                     # React + Redux SPA
│   ├── src/components/          # Reusable components
│   ├── src/pages/               # Page components
│   ├── src/api/                 # API client (axios)
│   ├── src/redux/               # State management
│   ├── src/App.tsx              # Main app
│   ├── package.json
│   └── .env                     # Environment variables (create this)
│
├── database/
│   └── schema.sql               # MySQL schema
│
├── README.md                     # Full documentation
├── ARCHITECTURE.md               # System design
└── QUICKSTART.md                # This file
```

---

## Next Steps

1. **Read the documentation:**
   - `README.md` — Full API reference and features
   - `ARCHITECTURE.md` — System design and MVC pattern

2. **Explore the code:**
   - Backend: `backend/src/entities/User.ts` — Data models
   - Backend: `backend/src/routes/auth.routes.ts` — API endpoints
   - Frontend: `frontend/src/pages/LoginPage.tsx` — React component

3. **Run API tests:**
   ```bash
   # Use Postman or curl
   curl -X POST http://localhost:5000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"student@example.com","password":"password123"}'
   ```

4. **Extend the project:**
   - Add new courses via instructor dashboard
   - Implement payment processing (Stripe integration)
   - Add course categories and filtering
   - Build student progress tracking

---

## Frontend Routes (After Login)

- `/` — Home
- `/courses` — Course catalogue
- `/courses/:courseId` — Course detail
- `/student/dashboard` — My enrollments
- `/instructor/dashboard` — My courses
- `/admin/dashboard` — Admin panel
- `/checkout` — Shopping cart
- `/login` — Sign in
- `/register` — Sign up

---

## Backend API Endpoints (Sample)

```bash
# Auth
POST   /api/v1/auth/register
POST   /api/v1/auth/login

# Courses
GET    /api/v1/courses
GET    /api/v1/courses/:id
POST   /api/v1/courses              (instructor only)
PUT    /api/v1/courses/:id          (instructor only)

# Enrollments
GET    /api/v1/enrollments
POST   /api/v1/enrollments

# Admin
GET    /api/v1/admin/courses
POST   /api/v1/admin/courses/:id/approve
POST   /api/v1/admin/courses/:id/reject
```

---

**Ready to build? 🚀 Start with Step 1 above!**