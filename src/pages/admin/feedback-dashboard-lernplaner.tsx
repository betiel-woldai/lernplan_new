import { useState, useEffect } from 'react';
import Head from 'next/head';
import { MessageCircle, TrendingUp, Users, Calendar, Trash2, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

interface FeedbackItem {
  id: number;
  user_sub: string;
  user_email: string | null;
  user_role: string;
  session_id: string;
  self_management_support: number | null;
  comment: string | null;
  is_anonymous: boolean;
  trigger_action: 'subject_created' | 'session_saved';
  platform: string;
  created_at: string;
}

interface Summary {
  totalSubmissions: number;
  totalComments: number;
  avgRating: number;
  subjectCreatedCount: number;
  sessionSavedCount: number;
  anonymousCount: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function FeedbackDashboardLernplaner() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authForm, setAuthForm] = useState({ username: '', passkey: '' });
  const [authError, setAuthError] = useState('');

  const [feedbackData, setFeedbackData] = useState<FeedbackItem[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 0 });

  const [filters, setFilters] = useState({
    triggerAction: 'all',
    hasComment: 'all',
    startDate: '',
    endDate: '',
    page: 1
  });

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadFeedbackData();
    }
  }, [isAuthenticated, filters]);

  const checkAuthStatus = async () => {
    try {
      const basePath = process.env.NODE_ENV === 'production' ? '/dias/lernplaner' : '';
      const response = await fetch(`${basePath}/api/admin/lernplan-feedback`);
      if (response.ok) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    try {
      const basePath = process.env.NODE_ENV === 'production' ? '/dias/lernplaner' : '';
      const response = await fetch(`${basePath}/api/admin/lernplan-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });

      if (response.ok) {
        setIsAuthenticated(true);
        setAuthForm({ username: '', passkey: '' });
      } else {
        const error = await response.json();
        setAuthError(error.error || 'Authentication failed');
      }
    } catch (error) {
      setAuthError('Network error. Please try again.');
    }
  };

  const loadFeedbackData = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.append(key, value.toString());
        }
      });

      const basePath = process.env.NODE_ENV === 'production' ? '/dias/lernplaner' : '';
      const response = await fetch(`${basePath}/api/admin/lernplan-feedback?${params}`);
      if (response.ok) {
        const data = await response.json();
        setFeedbackData(data.data.feedback);
        setSummary(data.data.summary);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Failed to load feedback data:', error);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleDeleteFeedback = (feedbackId: number) => {
    setFeedbackToDelete(feedbackId);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteFeedback = async () => {
    if (!feedbackToDelete) return;

    setDeleting(true);
    try {
      const basePath = process.env.NODE_ENV === 'production' ? '/dias/lernplaner' : '';
      const response = await fetch(`${basePath}/api/admin/lernplan-feedback?feedback_id=${feedbackToDelete}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setShowDeleteConfirmation(false);
        setFeedbackToDelete(null);
        await loadFeedbackData();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to delete feedback'}`);
      }
    } catch (error) {
      console.error('Delete feedback error:', error);
      alert('Network error. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const cancelDeleteFeedback = () => {
    setShowDeleteConfirmation(false);
    setFeedbackToDelete(null);
  };

  const getRatingColor = (rating: number | null) => {
    if (!rating) return '#e5e7eb';
    if (rating >= 4) return '#10b981';
    if (rating >= 3) return '#f59e0b';
    return '#ef4444';
  };

  const getRatingLabel = (rating: number | null) => {
    if (!rating) return 'No rating';
    const labels = [
      'Stimme überhaupt nicht zu',
      'Stimme nicht zu',
      'Neutral',
      'Stimme zu',
      'Stimme vollkommen zu'
    ];
    return labels[rating - 1];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>Admin Login - Lernplaner Feedback Dashboard</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
            <div className="flex items-center justify-center mb-6">
              <MessageCircle className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
              Lernplaner Feedback Dashboard
            </h1>
            <form onSubmit={handleLogin} className="space-y-4">
              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                  {authError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={authForm.username}
                  onChange={(e) => setAuthForm(prev => ({ ...prev, username: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passkey
                </label>
                <input
                  type="password"
                  value={authForm.passkey}
                  onChange={(e) => setAuthForm(prev => ({ ...prev, passkey: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Lernplaner Feedback Dashboard</title>
      </Head>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <MessageCircle className="w-8 h-8 mr-3 text-blue-600" />
              Lernplaner Feedback Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Feedback zur Lernreflexion - &quot;DIAS unterstützt mich beim Selbstmanagement.&quot;
            </p>
          </div>

          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Submissions</p>
                    <p className="text-2xl font-bold text-gray-900">{summary.totalSubmissions}</p>
                  </div>
                  <Users className="w-10 h-10 text-blue-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Average Rating</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {summary.avgRating.toFixed(2)} / 5
                    </p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-green-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">With Comments</p>
                    <p className="text-2xl font-bold text-gray-900">{summary.totalComments}</p>
                  </div>
                  <MessageCircle className="w-10 h-10 text-purple-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Anonymous</p>
                    <p className="text-2xl font-bold text-gray-900">{summary.anonymousCount}</p>
                  </div>
                  <Calendar className="w-10 h-10 text-orange-600" />
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
            <div className="flex items-center mb-4">
              <Filter className="w-5 h-5 text-gray-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trigger Action
                </label>
                <select
                  value={filters.triggerAction}
                  onChange={(e) => handleFilterChange('triggerAction', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="all">All</option>
                  <option value="subject_created">Subject Created</option>
                  <option value="session_saved">Session Saved</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Has Comment
                </label>
                <select
                  value={filters.hasComment}
                  onChange={(e) => handleFilterChange('hasComment', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="all">All</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Feedback Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trigger
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {feedbackData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No feedback data found
                      </td>
                    </tr>
                  ) : (
                    feedbackData.map((feedback) => (
                      <tr key={feedback.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(feedback.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {feedback.is_anonymous ? (
                            <span className="text-gray-400 italic">Anonymous</span>
                          ) : (
                            <div>
                              <div className="text-gray-900">{feedback.user_email || 'N/A'}</div>
                              <div className="text-gray-400 text-xs">{feedback.user_sub.slice(0, 8)}...</div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {feedback.self_management_support ? (
                            <div>
                              <div
                                className="inline-block px-3 py-1 rounded-full text-white font-medium text-xs"
                                style={{ backgroundColor: getRatingColor(feedback.self_management_support) }}
                              >
                                {feedback.self_management_support} / 5
                              </div>
                              <div className="text-gray-500 text-xs mt-1">
                                {getRatingLabel(feedback.self_management_support)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">No rating</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                          {feedback.comment ? (
                            <div className="line-clamp-2" title={feedback.comment}>
                              {feedback.comment}
                            </div>
                          ) : (
                            <span className="text-gray-400">No comment</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              feedback.trigger_action === 'subject_created'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {feedback.trigger_action === 'subject_created'
                              ? 'Subject Created'
                              : 'Session Saved'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleDeleteFeedback(feedback.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Delete feedback"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-700">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Delete Feedback
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this feedback? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={confirmDeleteFeedback}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-300 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  onClick={cancelDeleteFeedback}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
