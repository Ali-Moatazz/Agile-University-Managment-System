# 📚 UniManage - User Guide

## 🎯 Quick Overview

UniManage is a comprehensive university management system with **role-based access control**. Each user type (Admin, Doctor/Faculty, TA, Student) has a personalized experience with relevant tools and dashboards.

---

## 🚀 Getting Started

### Step 1: Access the Application
```
http://localhost:3000
```

### Step 2: Choose Your Role
You'll see a login screen with 4 role options:
- **👨‍💼 Admin** - Manage the entire system
- **👨‍🏫 Doctor** - Faculty with full course access
- **🏫 TA** - Teaching assistant with limited privileges
- **👨‍🎓 Student** - Standard student access

### Step 3: Sign Up or Login
- **First time?** Click "Sign Up" button
- **Already registered?** Click "Login" button
- **Demo account?** Use: `demo@university.edu` / `demo123`

---

## 👨‍💼 Admin Dashboard

### What Admins Can Do:
1. **Manage Staff** - Add/edit/delete professors and TAs
2. **Manage Students** - Create and organize student records
3. **Create Subjects** - Build the course catalog
4. **Post Announcements** - Communicate with entire university
5. **View Catalog** - See all courses in the system

### How to Use Each Feature:

#### 👔 Staff Directory
```
Path: /staff
```
- **Add Staff**: Click "+ Add Staff Member" → Fill form → Save
- **Edit Staff**: Click edit icon on card → Modify → Update
- **Delete Staff**: Click delete icon → Confirm deletion

**Required Fields**: Name, Email, Office Location, Role

#### 👥 Student Management
```
Path: /students
```
- **Add Student**: Click "+ Add Student" → Enter details → Create
- **View Students**: See all students in grid view
- **Delete Student**: Click delete icon to remove

**Required Fields**: Name, Email, Student ID, Major

#### 📚 Subject Creator
```
Path: /subjects
```
- **Create Subject**: Click "+ Create Subject" → Enter details:
  - Code: `CS101` (must be unique)
  - Name: `Introduction to Programming`
  - Type: Core or Elective
  - Credits: 1-6
  - Description: Course details
- **Edit/Delete**: Available from subject cards

#### 📢 Create Announcements
```
Path: /announcements/create
```
- Write title (required)
- Write content (required)
- Click "Create Announcement"
- **Appears immediately** in all users' announcement feed

#### 📊 View Catalog
```
Path: /catalog
```
- Search by course name or code
- Filter by Core/Elective
- See all course details

---

## 👨‍🏫 Faculty/TA Dashboard

### What Faculty Can Do:
1. **Browse Catalog** - View all available courses
2. **Book Rooms** - Reserve classrooms for lectures
3. **Manage Grades** - Enter and track student grades
4. **View Announcements** - Stay informed of updates
5. **Access Reports** - Generate course statistics

### Feature Breakdown:

#### 📚 Course Catalog
```
Path: /catalog
```
- Search by keyword or course code
- Filter courses by type (Core/Elective)
- View course details: code, credits, description
- See student enrollment numbers

#### 🏢 Book a Room
```
Path: /rooms
```
- Select a room from available list
- Choose date and time slot
- Verify no conflicts
- Confirm booking
- **Success**: Room is reserved for your use

**Room Details**: Capacity, type, availability status

#### 📈 Manage Grades
```
Path: /grades
```
- View all courses you're teaching
- See enrolled students per course
- Enter/update student scores
- Add feedback comments
- Calculate class averages

#### 📢 View Announcements
```
Path: /announcements
```
- See all announcements sorted by newest first
- Read full title and content
- Filter by date if needed

---

## 👨‍🎓 Student Dashboard

### What Students Can Do:
1. **Browse Catalog** - Explore all available courses
2. **Enroll in Courses** - Add courses to your schedule
3. **View My Courses** - See enrolled courses
4. **Check Grades** - View your scores and feedback
5. **Book Study Rooms** - Reserve group study spaces
6. **Read Announcements** - Stay updated

### Feature Breakdown:

#### 📚 Course Catalog
```
Path: /catalog
```
- **Search**: Find courses by name or code
  - Example: "Math", "CS101", "History"
- **Filter**: Toggle between Core and Elective courses
- **View Details**: See code, credits, description
- **Enroll**: Click "Enroll" button

**Enrollment Process**:
1. Click "Enroll" on a course card
2. See confirmation popup: "Are you sure?"
3. Click "Confirm"
4. Course automatically added to "My Courses"

#### 📖 My Courses
```
Path: /courses
```
- See all enrolled courses
- View course details: code, credits, professor
- Option to **unenroll** if needed
- Track credits towards graduation

**Unenroll Process**:
1. Find course in list
2. Click "Unenroll" button
3. Confirm removal
4. Course removed from schedule

#### 📊 My Grades
```
Path: /grades
```
- View all completed assessments
- See score for each assignment/exam
- Read instructor feedback
- View GPA calculation (if available)
- See grade distribution

**Grade Details**:
- Subject Name
- Score (e.g., 85/100)
- Percentage (85%)
- Professor/TA Feedback
- Grade Letter (A, B, C, etc.)

#### 🏢 Book Study Room
```
Path: /rooms
```
- View available study rooms and labs
- See room capacity and amenities
- Select date and time
- Reserve the room
- **Confirmation**: Room is booked for you

**Room Info**:
- Room number/name
- Capacity (how many students)
- Equipment available
- Booking status

#### 📢 Announcements
```
Path: /announcements
```
- Read all important announcements
- Sorted by newest first
- See posting date and author
- Check for deadlines and events

---

## 💾 Data Persistence

### How Your Data is Saved

The system uses a **two-tier storage approach**:

1. **Primary**: Supabase Database
   - When environment variables are configured
   - Data syncs to the cloud
   - Persistent across sessions

2. **Fallback**: Browser LocalStorage
   - Works immediately without setup
   - Data saved locally in your browser
   - Perfect for testing

**Result**: Your data is ALWAYS saved! ✅

---

## 🔄 Common Workflows

### Workflow 1: Admin Creates Course & Students Enroll

```
1. ADMIN
   ├─ Login as Admin
   ├─ Go to Subjects (/subjects)
   ├─ Click "+ Create Subject"
   ├─ Fill in course details
   └─ Save ✓

2. STUDENT
   ├─ Login as Student
   ├─ Go to Catalog (/catalog)
   ├─ Search for new course (appears immediately!)
   ├─ Click "Enroll"
   └─ Course added to My Courses ✓

3. FACULTY
   ├─ Login as Faculty
   ├─ Go to Grades (/grades)
   ├─ See enrolled students
   ├─ Enter grades and feedback
   └─ Students can see grades ✓
```

### Workflow 2: Faculty Books Room

```
1. FACULTY
   ├─ Login as Faculty/TA
   ├─ Go to Book Room (/rooms)
   ├─ Select available room
   ├─ Choose date and time
   ├─ Confirm booking
   └─ Room reserved ✓
```

### Workflow 3: Admin Posts Announcement

```
1. ADMIN
   ├─ Login as Admin
   ├─ Go to Create Announcement
   ├─ Write title and content
   ├─ Click "Create"
   └─ Announcement posted ✓

2. ALL USERS
   ├─ Go to Announcements (/announcements)
   ├─ See new announcement at top
   ├─ Read full content
   └─ Stay informed ✓
```

---

## 🎯 Tips & Best Practices

### For Admins:
- ✅ Create subjects BEFORE students try to enroll
- ✅ Validate subject codes are unique
- ✅ Post announcements for important deadlines
- ✅ Keep staff information up-to-date
- ✅ Review student records regularly

### For Faculty/TA:
- ✅ Book rooms well in advance
- ✅ Enter grades promptly after assessments
- ✅ Provide constructive feedback to students
- ✅ Check announcements for system updates
- ✅ Verify room availability before planning

### For Students:
- ✅ Browse catalog early to plan your semester
- ✅ Enroll in core courses first
- ✅ Check grades regularly to monitor progress
- ✅ Read all announcements for deadlines
- ✅ Book study rooms for group projects

---

## ⚠️ Important Notes

### About Logins
- Each role has a **separate view** of the system
- You can only see/do what's relevant to your role
- Switching roles requires logging out and back in
- Your data is role-specific and secure

### About Data
- All data is saved automatically
- Works with or without Supabase configured
- Data persists even after closing the browser
- No data is lost during development

### About Rooms
- Double bookings are **prevented**
- Only unbooked time slots are available
- Admins can see all bookings
- Faculty can only see their own bookings

### About Grades
- **Only visible to students who earned them**
- Only visible to faculty teaching the course
- Admins can see all grades
- Grades are final once entered

---

## 🆘 Troubleshooting

### "I can't log in"
- Try using demo credentials: `demo@university.edu` / `demo123`
- Make sure role is selected before logging in
- Check browser console for error messages

### "My data isn't saving"
- That's actually normal! The system saves to **localStorage by default**
- If Supabase is not configured, data saves locally (still persists!)
- Data is secure and won't disappear

### "I can't see other users' data"
- This is **intentional**! Each role has limited access
- Students can't see other students' grades
- Faculty can only see their courses
- This protects privacy and security

### "A button doesn't work"
- Try refreshing the page
- Check that you filled in all required fields
- Look for error messages in red
- Check browser console for technical details

### "I see a role I didn't expect"
- Make sure you're logged in as the correct role
- Check the navbar (top-right) for your role
- If wrong, click "Logout" and log in again

---

## 🎓 Testing Scenarios

Try these to explore the system:

**Scenario 1: Create a Full Course**
1. Login as Admin
2. Create a subject: "Advanced Python Programming"
3. Logout, Login as Student
4. Search and enroll in it
5. Verify it appears in "My Courses"

**Scenario 2: Grade a Student**
1. Login as Faculty
2. Go to Grades section
3. Enter a grade (85/100)
4. Add feedback: "Great work!"
5. Logout, Login as Student
6. View grade in "My Grades"

**Scenario 3: Broadcast an Announcement**
1. Login as Admin
2. Create announcement: "Midterms next week!"
3. Logout, Login as different role
4. See announcement in feed (appears for everyone!)

---

## 📞 Need More Help?

1. **Read**: Check SETUP.md for technical details
2. **Review**: This guide covers all features
3. **Debug**: Check browser console (F12)
4. **Ask**: Check error messages for hints

---

Happy learning and managing! 🎉
