# UniManage - University Management System

A comprehensive university management platform built with **Next.js** and **Supabase**. This application provides integrated solutions for managing staff, students, courses, announcements, grades, and room bookings.

## 🎯 Features

### 1. **Directory Management (Staff)**
- Add, edit, and remove staff members
- Manage contact info and office locations
- Support for multiple roles (Professor, TA, Admin)
- Secure staff directory

### 2. **Student Records Management**
- Create and manage student records
- Track student ID, email, and major
- Centralized secure data storage
- Easy student record retrieval

### 3. **Course Profile Creator**
- Create subject profiles with code, name, credits, and description
- Validate unique subject codes
- Categorize courses as Core or Elective
- Manage course catalog

### 4. **Catalog Search & Filter**
- Browse all available courses
- Search by keywords, course code, or name
- Filter by course type (Core/Elective)
- Real-time search results

### 5. **Course Enrollment**
- Students can enroll in available courses
- View personal course list
- Unenroll from courses
- Manage curriculum

### 6. **Announcements**
- Post announcements with title and content
- View announcement feed sorted by most recent
- Admin can create and delete announcements
- Real-time notification system

### 7. **Grade Dashboard**
- View personal grades and feedback
- See assessment scores
- Calculate average performance
- Secure grade visibility

### 8. **Room Management & Booking**
- View available classrooms and labs
- Filter rooms by type and capacity
- Book rooms with date/time slots
- Prevent double bookings
- Faculty and TA room booking

## 📁 Project Structure

```
agile_university_managment_system/
├── app/
│   ├── page.tsx                    # Home page
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles
│   ├── staff/
│   │   └── page.tsx               # Staff directory
│   ├── students/
│   │   └── page.tsx               # Student records
│   ├── subjects/
│   │   └── page.tsx               # Create courses
│   ├── catalog/
│   │   └── page.tsx               # Browse & search catalog
│   ├── courses/
│   │   └── page.tsx               # My enrolled courses
│   ├── announcements/
│   │   ├── page.tsx               # View announcements
│   │   └── create/
│   │       └── page.tsx           # Create announcement
│   ├── grades/
│   │   └── page.tsx               # Grade dashboard
│   └── rooms/
│       └── page.tsx               # Room booking
├── components/
│   ├── Navbar.tsx                 # Navigation bar
│   ├── StaffCard.tsx              # Staff display card
│   ├── StudentCard.tsx            # Student display card
│   ├── SubjectCard.tsx            # Course display card
│   ├── RoomCard.tsx               # Room display card
│   └── AnnouncementCard.tsx       # Announcement display card
├── lib/
│   └── supabase.ts                # Supabase client & types
├── package.json                   # Dependencies
├── .env.example                   # Environment variables template
└── README.md                      # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd agile_university_managment_system
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

4. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Schema

### Tables Required in Supabase

**Staff**
```sql
- id (UUID, Primary Key)
- name (Text)
- email (Text)
- role (Text: Professor, TA, Admin)
- office_location (Text)
- phone (Text, Optional)
- created_at (Timestamp)
```

**Students**
```sql
- id (UUID, Primary Key)
- name (Text)
- email (Text)
- student_id (Text, Unique)
- major (Text, Optional)
- created_at (Timestamp)
```

**Subjects**
```sql
- id (UUID, Primary Key)
- code (Text, Unique)
- name (Text)
- credits (Integer)
- description (Text)
- type (Text: Core, Elective)
- created_at (Timestamp)
```

**Enrollments**
```sql
- id (UUID, Primary Key)
- student_id (UUID, Foreign Key)
- subject_id (UUID, Foreign Key)
- enrolled_at (Timestamp)
```

**Grades**
```sql
- id (UUID, Primary Key)
- student_id (UUID, Foreign Key)
- subject_id (UUID, Foreign Key)
- score (Integer)
- feedback (Text)
- created_at (Timestamp)
```

**Announcements**
```sql
- id (UUID, Primary Key)
- title (Text)
- content (Text)
- created_by (Text)
- created_at (Timestamp)
- updated_at (Timestamp)
```

**Rooms**
```sql
- id (UUID, Primary Key)
- name (Text)
- type (Text: Classroom, Lab, Seminar)
- capacity (Integer)
- building (Text)
- created_at (Timestamp)
```

**Room_Bookings**
```sql
- id (UUID, Primary Key)
- room_id (UUID, Foreign Key)
- booked_by (Text)
- date (Date)
- start_time (Time)
- end_time (Time)
- subject (Text)
- created_at (Timestamp)
```

## 🎨 UI/UX Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Clean Interface**: Modern, professional design with intuitive navigation
- **Real-time Feedback**: Success and error messages for all operations
- **Loading States**: Smooth loading indicators while fetching data
- **Search & Filter**: Advanced search and filtering capabilities
- **Accessible Forms**: Well-structured forms with validation

## 🔒 Security Features

- Data stored securely in Supabase
- Grade data encrypted and only visible to students and instructors
- Role-based access control
- Environment variables for sensitive data
- HTTPS-only Supabase connections

## 📚 Built With

- **Next.js 16** - React framework for production
- **Supabase** - PostgreSQL database and authentication
- **TypeScript** - Type-safe JavaScript
- **CSS3** - Modern styling
- **React Hooks** - State management

## 🔧 Development

### Build for production
```bash
npm run build
npm start
```

### Lint code
```bash
npm run lint
```

## 📝 API Integration

All data operations are handled through Supabase client-side queries:

```typescript
import { supabase } from '@/lib/supabase'

// Fetch data
const { data, error } = await supabase
  .from('table_name')
  .select('*')

// Insert data
const { data, error } = await supabase
  .from('table_name')
  .insert([{ column: value }])

// Update data
const { data, error } = await supabase
  .from('table_name')
  .update({ column: value })
  .eq('id', id)

// Delete data
const { error } = await supabase
  .from('table_name')
  .delete()
  .eq('id', id)
```

## 🐛 Troubleshooting

**Connection Issues**
- Verify Supabase URL and API key are correct
- Check network connectivity
- Review browser console for errors

**Data Not Loading**
- Ensure database tables are created
- Check Supabase RLS policies
- Verify database connections

**Build Errors**
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `npm install`
- Check Node.js version compatibility

## 📄 License

This project is part of an agile university management system educational initiative.

## 👥 Team

Developed using Agile/Scrum methodology with sprint-based implementation.

---

**Last Updated**: April 2026
**Version**: 1.0.0

