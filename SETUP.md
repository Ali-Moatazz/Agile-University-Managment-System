# UniManage - Setup & Deployment Guide

## 🎯 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn package manager
- A Supabase account (free tier available at supabase.co)

### Installation Steps

1. **Install Dependencies**
```bash
npm install
```

2. **Configure Environment Variables**
```bash
# Copy the example file
cp .env.local.example .env.local

# Edit .env.local and add your Supabase credentials:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

3. **Get Supabase Credentials**
   - Visit https://supabase.co and create a new project
   - Go to **Settings > API** in your Supabase dashboard
   - Copy the **Project URL** and **Anon Public Key**
   - Paste them into `.env.local`

4. **Run Development Server**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

---

## 🔐 Authentication System

### Login / Sign Up
- Navigate to **http://localhost:3000**
- Choose your role: **Admin**, **Doctor**, **TA**, or **Student**
- Create an account or log in

### Demo Credentials
```
Email: demo@university.edu
Password: demo123
```

### Roles & Permissions

#### 👨‍💼 Admin
- ✅ Manage staff directory
- ✅ Create and manage student records
- ✅ Create course subjects
- ✅ Post system announcements
- ✅ Access full system reports

#### 👨‍🏫 Doctor / TA
- ✅ Browse course catalog
- ✅ Book classrooms and labs
- ✅ View and manage student grades
- ✅ View announcements
- ✅ Access faculty dashboard

#### 👨‍🎓 Student
- ✅ Browse course catalog
- ✅ Enroll in courses
- ✅ View enrolled courses
- ✅ Check personal grades
- ✅ Book study rooms
- ✅ View announcements

---

## 📊 User Stories Implementation

### 1️⃣ Staff Directory Management
- **Admin Pages**: `/staff`
- **Features**:
  - Add new staff members (Professor, TA, Admin roles)
  - Edit staff contact info and office locations
  - Remove staff from directory
  - View complete staff listing with contact details

### 2️⃣ Student Records Management
- **Admin Pages**: `/students`
- **Features**:
  - Create new student records
  - View all student records
  - Delete student records
  - Secure centralized storage
  - Unique student ID generation

### 3️⃣ Course Profile Creator
- **Admin Pages**: `/subjects`
- **Features**:
  - Create subjects with code, name, credits, type
  - System validates unique subject codes
  - Subjects immediately available in catalog
  - Support for Core and Elective courses

### 4️⃣ Catalog Search & Filter
- **Student Pages**: `/catalog`
- **Features**:
  - Search by keywords (Math, History, CS101, etc.)
  - Filter by course type (Core/Elective)
  - Display subject name, code, and credit hours
  - Real-time search results

### 5️⃣ Course Enrollment
- **Student Pages**: `/courses`, `/catalog`
- **Features**:
  - Click "Enroll" to add electives
  - Confirmation popup before enrollment
  - View enrolled courses in "My Courses"
  - Option to unenroll from courses

### 6️⃣ Admin Post Announcements
- **Admin Pages**: `/announcements/create`
- **Features**:
  - Title and content required
  - Validation prevents empty submissions
  - Success message on save
  - Announcements appear in feed

### 7️⃣ View Announcement Feed
- **All Users**: `/announcements`
- **Features**:
  - All announcements displayed
  - Sorted by most recent first
  - Title and content visible
  - Secure access for all roles

### 8️⃣ Private Grade Dashboard
- **Student Pages**: `/grades`
- **Features**:
  - View personal grades and feedback
  - See assessment scores
  - Calculate average performance
  - Encrypted and role-based access

### 9️⃣ View Room Availability
- **Faculty Pages**: `/rooms`
- **Features**:
  - View available classrooms and labs
  - Display room capacity and type
  - Filter by date and time
  - Only show unbooked rooms

### 🔟 Book a Room
- **Faculty/TA Pages**: `/rooms`
- **Features**:
  - Select available rooms
  - Choose date and time slots
  - System prevents double booking
  - Confirmation on successful booking

---

## 🗄️ Database Schema

### Tables Required (Create in Supabase)

```sql
-- Users/Authentication
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) CHECK (role IN ('admin', 'doctor', 'ta', 'student')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Staff
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) CHECK (role IN ('Professor', 'TA', 'Admin')),
  office_location VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Students
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  student_id VARCHAR(50) UNIQUE NOT NULL,
  major VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subjects
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  credits INT DEFAULT 3,
  description TEXT,
  type VARCHAR(50) CHECK (type IN ('Core', 'Elective')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enrollments
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  enrolled_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Grades
CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  score INT,
  feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Announcements
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Rooms
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  capacity INT,
  type VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Room Bookings
CREATE TABLE room_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  booked_by VARCHAR(255),
  booking_date DATE,
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🛠️ Troubleshooting

### Issue: "Unable to save" messages
**Solution**: 
- The system uses **localStorage as fallback** - data will save locally
- To use Supabase, configure `.env.local` with correct credentials
- Data will sync to Supabase once credentials are provided

### Issue: Environment variables not loading
**Solution**:
```bash
# Restart the development server
npm run dev

# Clear Node cache if needed
rm -rf .next
npm run dev
```

### Issue: Supabase connection errors
**Solution**:
- Check that `NEXT_PUBLIC_SUPABASE_URL` is correct
- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is not empty
- Ensure your IP is allowed in Supabase security settings

### Issue: Login not working
**Solution**:
- Use demo credentials: `demo@university.edu` / `demo123`
- Or create a new account with any email/password
- Authentication uses localStorage (no real backend validation initially)

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Visit https://vercel.com
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy!

```bash
# Or deploy via CLI
npm i -g vercel
vercel --prod
```

### Deploy to Other Platforms
- **Netlify**: Connect GitHub repo, add env vars, deploy
- **AWS Amplify**: Similar to Netlify
- **Docker**: Create a Dockerfile and deploy to any container service

---

## 📝 Project Structure

```
agile_university_managment_system/
├── app/
│   ├── page.tsx                    # Login/Signup page
│   ├── admin/page.tsx              # Admin dashboard
│   ├── faculty/page.tsx            # Faculty/TA dashboard
│   ├── student/page.tsx            # Student dashboard
│   ├── staff/page.tsx              # Staff management
│   ├── students/page.tsx           # Student management
│   ├── subjects/page.tsx           # Subject management
│   ├── catalog/page.tsx            # Course catalog
│   ├── courses/page.tsx            # My courses
│   ├── announcements/
│   │   ├── page.tsx               # View announcements
│   │   └── create/page.tsx        # Create announcement
│   ├── grades/page.tsx            # Grade dashboard
│   ├── rooms/page.tsx             # Room booking
│   ├── layout.tsx                 # Root layout with auth
│   └── globals.css                # Global styles
├── components/
│   ├── Navbar.tsx                 # Navigation bar
│   ├── StaffCard.tsx
│   ├── StudentCard.tsx
│   ├── SubjectCard.tsx
│   ├── RoomCard.tsx
│   └── AnnouncementCard.tsx
├── lib/
│   ├── supabase.js                # Supabase client config
│   └── auth-context.tsx           # Auth context & hooks
├── .env.local.example             # Environment template
└── package.json
```

---

## 💡 Features Highlight

✨ **Modern UI** - Beautiful gradients and responsive design  
🔐 **Role-Based Access** - Different views for each user type  
💾 **Data Persistence** - localStorage fallback + Supabase sync  
📱 **Responsive Design** - Works on desktop, tablet, mobile  
⚡ **Real-Time Updates** - Changes reflect immediately  
🎨 **Professional Styling** - Custom CSS with no external frameworks  

---

## 📞 Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review Supabase documentation
3. Check Next.js documentation
4. Review error messages in browser console

---

## 📄 License

This project is part of the Agile University Management System.

Happy coding! 🎉
