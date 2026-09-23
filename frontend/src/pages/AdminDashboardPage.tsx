import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { adminAPI } from '../api/client';
import { RootState } from '../redux/store';

interface Course {
  courseId: string;
  title: string;
  instructor: { name: string };
  status: string;
}

interface Analytics {
  totalUsers: number;
  totalCourses: number;
  publishedCourses: number;
  totalEnrollments: number;
  averageRating: number;
}

interface PlatformUser {
  userId: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

const roleColors: { [key: string]: string } = {
  student: 'bg-blue-100 text-blue-800',
  instructor: 'bg-purple-100 text-purple-800',
  admin: 'bg-gray-800 text-white',
  support_agent: 'bg-teal-100 text-teal-800'
};

const AdminDashboardPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'analytics' | 'courses' | 'users'>('analytics');
  const user = useSelector((state: RootState) => state.auth.user);

  // Add Support User form state
  const [showAddAgentForm, setShowAddAgentForm] = useState(false);
  const [agentFormData, setAgentFormData] = useState({ name: '', email: '', password: '' });
  const [agentError, setAgentError] = useState('');
  const [agentSuccess, setAgentSuccess] = useState('');
  const [creatingAgent, setCreatingAgent] = useState(false);

  // Call hooks BEFORE early return
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminData();
    }
  }, [user?.role]);

  // Redirect if not admin (after hooks)
  if (user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  const fetchAdminData = async () => {
    try {
      const [pendingRes, publishedRes, analyticsRes, usersRes] = await Promise.all([
        adminAPI.getPendingCourses(),
        adminAPI.getPublishedCourses(),
        adminAPI.getAnalytics(),
        adminAPI.getAllUsers()
      ]);

      // Merge both lists so the Course Review tab can show pending AND published courses
      setCourses([...pendingRes.data, ...publishedRes.data]);
      setAnalytics(analyticsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSupportAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setAgentError('');
    setAgentSuccess('');

    if (!agentFormData.name.trim() || !agentFormData.email.trim() || !agentFormData.password) {
      setAgentError('All fields are required');
      return;
    }

    try {
      setCreatingAgent(true);
      await adminAPI.createSupportAgent(agentFormData);
      setAgentFormData({ name: '', email: '', password: '' });
      setShowAddAgentForm(false);
      setAgentSuccess('Support user created!');
      setTimeout(() => setAgentSuccess(''), 3000);
      await fetchAdminData();
    } catch (err: any) {
      console.error('Error creating support user:', err);
      setAgentError(err.response?.data?.error || 'Failed to create support user');
    } finally {
      setCreatingAgent(false);
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      await adminAPI.suspendUser(userId);
      await fetchAdminData();
    } catch (error) {
      alert('Failed to suspend user');
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      await adminAPI.activateUser(userId);
      await fetchAdminData();
    } catch (error) {
      alert('Failed to activate user');
    }
  };

  const handleApproveCourse = async (courseId: string) => {
    try {
      await adminAPI.approveCourse(courseId);
      alert('Course approved!');
      await fetchAdminData();
    } catch (error) {
      alert('Failed to approve course');
    }
  };

  const handleRejectCourse = async (courseId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      try {
        await adminAPI.rejectCourse(courseId, reason);
        alert('Course rejected!');
        await fetchAdminData();
      } catch (error) {
        alert('Failed to reject course');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-8">Admin Dashboard</h1>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setSelectedTab('analytics')}
            className={`px-6 py-2 font-bold rounded-lg transition ${
              selectedTab === 'analytics'
                ? 'bg-secondary text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setSelectedTab('courses')}
            className={`px-6 py-2 font-bold rounded-lg transition ${
              selectedTab === 'courses'
                ? 'bg-secondary text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Course Review
          </button>
          <button
            onClick={() => setSelectedTab('users')}
            className={`px-6 py-2 font-bold rounded-lg transition ${
              selectedTab === 'users'
                ? 'bg-secondary text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Users
          </button>
        </div>

        {/* Analytics Tab */}
        {selectedTab === 'analytics' && analytics && (
          <div className="grid grid-cols-5 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-semibold uppercase">Total Users</p>
              <p className="text-4xl font-bold text-primary mt-2">{analytics.totalUsers}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-semibold uppercase">Total Courses</p>
              <p className="text-4xl font-bold text-secondary mt-2">{analytics.totalCourses}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-semibold uppercase">Published</p>
              <p className="text-4xl font-bold text-accent mt-2">{analytics.publishedCourses}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-semibold uppercase">Enrollments</p>
              <p className="text-4xl font-bold text-warning mt-2">{analytics.totalEnrollments}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-semibold uppercase">Avg Rating</p>
              <p className="text-4xl font-bold text-danger mt-2">⭐ {analytics.averageRating}</p>
            </div>
          </div>
        )}

        {/* Course Review Tab */}
        {selectedTab === 'courses' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-primary mb-4">Pending Reviews</h2>

            {courses.filter((c) => c.status === 'under_review').length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-600">No courses pending review</p>
              </div>
            ) : (
              courses
                .filter((c) => c.status === 'under_review')
                .map((course) => (
                  <div key={course.courseId} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-primary mb-1">{course.title}</h3>
                        <p className="text-gray-600">by {course.instructor.name}</p>
                      </div>

                      <div className="space-x-2">
                        <button
                          onClick={() => handleApproveCourse(course.courseId)}
                          className="px-4 py-2 bg-accent text-white font-bold rounded hover:bg-green-700 transition"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleRejectCourse(course.courseId)}
                          className="px-4 py-2 bg-danger text-white font-bold rounded hover:bg-red-700 transition"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            )}

            <div className="mt-8">
              <h2 className="text-2xl font-bold text-primary mb-4">Published Courses</h2>
              <div className="grid grid-cols-1 gap-4">
                {courses
                  .filter((c) => c.status === 'published')
                  .slice(0, 3)
                  .map((course) => (
                    <div key={course.courseId} className="bg-white rounded-lg shadow p-4">
                      <h3 className="font-bold text-primary">{course.title}</h3>
                      <p className="text-sm text-gray-600">by {course.instructor.name}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {selectedTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-primary">All Users</h2>
              <button
                onClick={() => {
                  setShowAddAgentForm(!showAddAgentForm);
                  setAgentError('');
                }}
                className="px-4 py-2 bg-secondary text-white font-bold rounded-lg hover:bg-primary transition"
              >
                {showAddAgentForm ? 'Cancel' : '+ Add Support User'}
              </button>
            </div>

            {showAddAgentForm && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-primary mb-4">New Support User</h3>
                <form onSubmit={handleAddSupportAgent} className="space-y-4">
                  {agentError && (
                    <p className="text-danger text-sm font-semibold">{agentError}</p>
                  )}
                  {agentSuccess && (
                    <p className="text-accent text-sm font-semibold">{agentSuccess}</p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Name"
                      value={agentFormData.name}
                      onChange={(e) => setAgentFormData({ ...agentFormData, name: e.target.value })}
                      className="border border-gray-300 rounded-lg px-3 py-2"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={agentFormData.email}
                      onChange={(e) => setAgentFormData({ ...agentFormData, email: e.target.value })}
                      className="border border-gray-300 rounded-lg px-3 py-2"
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={agentFormData.password}
                      onChange={(e) => setAgentFormData({ ...agentFormData, password: e.target.value })}
                      className="border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={creatingAgent}
                    className="px-6 py-2 bg-accent text-white font-bold rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {creatingAgent ? 'Creating...' : 'Create Support User'}
                  </button>
                </form>
              </div>
            )}

            {!showAddAgentForm && agentSuccess && (
              <p className="text-accent text-sm font-semibold">{agentSuccess}</p>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u.userId}>
                      <td className="px-6 py-4 font-semibold text-gray-800">{u.name}</td>
                      <td className="px-6 py-4 text-gray-600">{u.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            roleColors[u.role] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            u.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {u.status === 'active' ? (
                          <button
                            onClick={() => handleSuspendUser(u.userId)}
                            className="px-3 py-1 bg-danger text-white text-sm font-bold rounded hover:bg-red-700 transition"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivateUser(u.userId)}
                            className="px-3 py-1 bg-accent text-white text-sm font-bold rounded hover:bg-green-700 transition"
                          >
                            Activate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <p className="text-gray-600 text-center py-8">No users found</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
