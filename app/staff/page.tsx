'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, Staff, Subject } from '@/lib/supabase' // Added Subject import
import { useAuth } from '@/lib/auth-context'
import StaffCard from '@/components/StaffCard'

interface StaffFormData extends Partial<Staff> {
  password?: string
}

export default function StaffPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [staff, setStaff] = useState<Staff[]>([])
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]) // New state for dropdown
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<StaffFormData>({
    name: '',
    email: '',
    role: 'Professor',
    office_location: '',
    phone: '',
    password: '',
    assigned_subject: '' // Initialize new field
  })
  const [message, setMessage] = useState('')

  // Check authorization
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/')
    }
  }, [user, router])

  useEffect(() => {
    fetchStaff()
    fetchAvailableSubjects() // Load subjects when page opens
  }, [])

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setStaff(data || [])
    } catch (error) {
      console.error('Error fetching staff:', error)
      setMessage('❌ Failed to load staff records')
    } finally {
      setLoading(false)
    }
  }

  // New function to get subjects for the dropdown
  const fetchAvailableSubjects = async () => {
    const { data } = await supabase.from('subjects').select('*').order('name');
    if (data) setAvailableSubjects(data);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.office_location) {
      setMessage('❌ Please fill in all required fields');
      return;
    }

    try {
      if (editingId) {
        // Logic for editing existing staff
        const { error } = await supabase
          .from('staff')
          .update({
            name: formData.name,
            email: formData.email,
            role: formData.role,
            office_location: formData.office_location,
            phone: formData.phone,
            assigned_subject: formData.assigned_subject // Update field
          })
          .eq('id', editingId);

        if (error) throw error;

        if (formData.assigned_subject) {
          const selectedSub = availableSubjects.find(s => s.name === formData.assigned_subject);
          if (selectedSub) {
            // Use upsert so it updates if the link already exists
            await supabase.from('doctor_subjects').upsert({
              profile_id: formData.profile_id, 
              subject_id: selectedSub.id
            });
          }
        }
        setMessage('✓ Staff updated successfully!');
      } else {
        // --- NEW STAFF CREATION ---
        if (!formData.password || formData.password.length < 6) {
          setMessage('❌ Password must be at least 6 characters');
          return;
        }

        const { data, error: authError } = await supabase.auth.signUp({
          email: formData.email!,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
              role: formData.role === 'Professor' ? 'doctor' : formData.role?.toLowerCase()
            }
          }
        });

        if (authError) throw authError;
        if (!data.user) throw new Error("Failed to create auth user");

        const newUser = data.user; 

        // Insert including the subject name
        const { error: staffError } = await supabase
          .from('staff')
          .insert([{
            profile_id: newUser.id,
            name: formData.name,
            email: formData.email,
            role: formData.role,
            office_location: formData.office_location,
            phone: formData.phone,
            assigned_subject: formData.assigned_subject // Save the text name
          }]);

        if (staffError) throw staffError;

        if (formData.assigned_subject) {
          // We find the ID of the subject from our loaded 'availableSubjects' list
          const selectedSub = availableSubjects.find(s => s.name === formData.assigned_subject);
          
          if (selectedSub) {
            await supabase.from('doctor_subjects').insert({
              profile_id: newUser.id, // The Doctor's ID
              subject_id: selectedSub.id // The Subject's actual UUID
            });
          }
        }

        


        setMessage('✓ Staff member added successfully!');
      }

      setFormData({ name: '', email: '', role: 'Professor', office_location: '', phone: '', password: '', assigned_subject: '' });
      setEditingId(null);
      setShowForm(false);
      fetchStaff();
      
    } catch (error: any) {
      console.error('Error saving staff:', error);
      setMessage(`❌ Error: ${error.message || 'Failed to save record'}`);
    }
  };

  const handleEdit = (item: Staff) => {
    setFormData(item)
    setEditingId(item.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      try {
        const { error } = await supabase.from('staff').delete().eq('id', id)
        if (error) throw error
        setMessage('✓ Staff deleted successfully!')
        fetchStaff()
      } catch (error) {
        console.error('Error deleting staff:', error)
        setMessage('❌ Failed to delete staff record')
      }
    }
  }

  return (
    <main className="container">
      {/* ... Header and Stats UI (Keep as is) ... */}
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '2rem', borderRadius: '1rem', marginBottom: '2rem', color: 'white' }}>
        <h1 className="text-3xl font-bold mb-2">👔 Staff Directory</h1>
        <p style={{ opacity: 0.9 }}>Manage and organize staff members across the university</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div><p style={{ color: '#6b7280' }}>Total Staff: <strong style={{ color: '#667eea' }}>{staff.length}</strong></p></div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: '', email: '', role: 'Professor', office_location: '', phone: '', password: '', assigned_subject: '' }); }} style={{ background: showForm ? '#ef4444' : '#667eea', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', fontWeight: '600', cursor: 'pointer' }}>
          {showForm ? '✕ Cancel' : '+ Add Staff Member'}
        </button>
      </div>

      {message && <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>{message}</div>}

      {showForm && (
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h3>{editingId ? 'Edit Staff Member' : 'Add New Staff Member'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Role *</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as any })} className="form-input" required>
                  <option value="Professor">Professor</option>
                  <option value="TA">TA</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              
              {/* --- NEW DROPDOWN SECTION --- */}
              <div className="form-group">
                <label className="form-label">Assign Subject</label>
                <select 
                  value={formData.assigned_subject || ''} 
                  onChange={(e) => setFormData({ ...formData, assigned_subject: e.target.value })} 
                  className="form-input"
                >
                  <option value="">-- No Subject Assigned --</option>
                  {availableSubjects.map((sub) => (
                    <option key={sub.id} value={sub.name}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Office Location *</label>
                <input type="text" value={formData.office_location} onChange={(e) => setFormData({ ...formData, office_location: e.target.value })} className="form-input" required />
              </div>
              {!editingId && (
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="form-input" required />
                </div>
              )}
            </div>
            <button type="submit" className="btn btn-primary">{editingId ? 'Update Staff' : 'Add Staff Member'}</button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex-center p-8"><div className="spinner"></div></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {staff.map((s) => (
            <StaffCard key={s.id} staff={s} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </main>
  )
}