import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import { useLanguage } from '../contexts/LanguageContext';
import { addEventListener } from '@/utils/eventBus';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  Filler 
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { 
  FaCalendar, 
  FaChartLine,
  FaBullseye, 
  FaAward, 
  FaFilter,
  FaClock,
  FaArrowUp,
  FaCheck,
  FaPercentage 
} from 'react-icons/fa';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ProgressData {
  date: string;
  hours: number;
  sessions: number;
  completedSessions: number;
  xp: number;
}

interface SubjectData {
  id: string;
  name: string;
  color: string;
  hours: number;
  sessions: number;
  completedSessions: number;
  progress: number;
  targetHours: number;
}

interface StreakData {
  date: string;
  streak: number;
  hasSession: boolean;
}

interface GoalData {
  id: string;
  name: string;
  targetHours: number;
  completedHours: number;
  progress: number;
  daysRemaining?: number;
}

interface AnalyticsData {
  progress?: ProgressData[];
  subjects?: SubjectData[];
  streaks?: StreakData[];
  goals?: GoalData[];
  summary?: {
    totalHours: number;
    totalSessions: number;
    completedSessions: number;
    totalXP: number;
    averageSessionLength: number;
    completionRate: number;
  };
}

export default function AnalyticsPage() {
  const { t } = useLanguage();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());
  const [realtimeUpdate, setRealtimeUpdate] = useState<boolean>(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, [period]);

  // Real-time event listeners
  useEffect(() => {
    const handleSessionCompleted = (event: any) => {
      console.log('📈 Analytics: Session completed', event.detail);
      setRealtimeUpdate(true);
      setLastUpdateTime(Date.now());
      
      // Auto-refresh analytics data after a brief delay
      setTimeout(() => {
        fetchAnalyticsData();
        setRealtimeUpdate(false);
      }, 1500);
    };

    const handleSubjectUpdated = (event: any) => {
      console.log('📈 Analytics: Subject updated', event.detail);
      setRealtimeUpdate(true);
      setLastUpdateTime(Date.now());
      
      // Refresh to update subject-related charts
      setTimeout(() => {
        fetchAnalyticsData();
        setRealtimeUpdate(false);
      }, 1000);
    };

    const handleProgressChanged = (event: any) => {
      console.log('📈 Analytics: Progress changed', event.detail);
      setLastUpdateTime(Date.now());
      
      // For progress changes, we might want to update specific data points
      // For now, we'll do a full refresh
      setTimeout(() => {
        fetchAnalyticsData();
      }, 500);
    };

    const handleXPGained = (event: any) => {
      console.log('📈 Analytics: XP gained', event.detail);
      setLastUpdateTime(Date.now());
      
      // Update analytics data to reflect XP changes
      setTimeout(() => {
        fetchAnalyticsData();
      }, 1000);
    };

    const handleSessionUpdated = (event: any) => {
      console.log('📈 Analytics: Session updated', event.detail);
      setRealtimeUpdate(true);
      setLastUpdateTime(Date.now());
      
      // Refresh analytics after session updates to maintain timeline synchronization
      setTimeout(() => {
        fetchAnalyticsData();
        setRealtimeUpdate(false);
      }, 1500);
    };

    // Add event listeners
    window.addEventListener('sessionCompleted', handleSessionCompleted);
    window.addEventListener('sessionUpdated', handleSessionUpdated);
    window.addEventListener('subjectUpdated', handleSubjectUpdated);
    window.addEventListener('progressChanged', handleProgressChanged);
    window.addEventListener('xpGained', handleXPGained);

    return () => {
      // Clean up event listeners
      window.removeEventListener('sessionCompleted', handleSessionCompleted);
      window.removeEventListener('sessionUpdated', handleSessionUpdated);
      window.removeEventListener('subjectUpdated', handleSubjectUpdated);
      window.removeEventListener('progressChanged', handleProgressChanged);
      window.removeEventListener('xpGained', handleXPGained);
    };
  }, []); // Empty dependency array since we don't want to recreate listeners

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/analytics?period=${period}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      
      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Chart Configuration Functions
  const getProgressChartConfig = () => {
    if (!analyticsData?.progress) return null;
    
    const data = {
      labels: analyticsData.progress.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [
        {
          label: 'Learning Hours',
          data: analyticsData.progress.map(item => item.hours),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.1,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
        },
        x: {
          grid: {
            display: false,
          },
        },
      },
    };

    return { data, options };
  };

  const getSubjectChartConfig = () => {
    if (!analyticsData?.subjects) return null;

    const subjectsWithHours = analyticsData.subjects.filter(subject => subject.hours > 0);
    
    if (subjectsWithHours.length === 0) {
      // Return placeholder data for empty state
      return {
        data: {
          labels: ['No Data'],
          datasets: [{
            data: [1],
            backgroundColor: ['#E5E7EB'],
            borderColor: ['#D1D5DB'],
            borderWidth: 1,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom' as const,
            },
          },
        },
      };
    }

    const data = {
      labels: subjectsWithHours.map(subject => subject.name),
      datasets: [
        {
          data: subjectsWithHours.map(subject => subject.hours),
          backgroundColor: subjectsWithHours.map(subject => subject.color),
          borderColor: subjectsWithHours.map(subject => subject.color),
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom' as const,
        },
      },
    };

    return { data, options };
  };

  const getStreakChartConfig = () => {
    if (!analyticsData?.streaks) return null;

    // Get last 14 days for better visualization
    const last14Days = analyticsData.streaks.slice(-14);
    
    const data = {
      labels: last14Days.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [
        {
          label: 'Current Streak',
          data: last14Days.map(item => item.streak),
          backgroundColor: last14Days.map(item => 
            item.hasSession ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'
          ),
          borderColor: last14Days.map(item => 
            item.hasSession ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'
          ),
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
        },
        x: {
          grid: {
            display: false,
          },
        },
      },
    };

    return { data, options };
  };

  if (loading) {
    return (
      <Layout title="Analytics - Lernplaner">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Analytics - Lernplaner">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">Error loading analytics data</div>
          <button 
            onClick={fetchAnalyticsData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${t('analytics.title')} - Lernplaner`}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-gray-900">{t('analytics.title')}</h1>
              {realtimeUpdate && (
                <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                  <span className="text-xs font-medium text-blue-700">Updating...</span>
                </div>
              )}
            </div>
            <p className="text-gray-600 mt-2">
              Track your learning progress and insights
              <span className="text-xs text-gray-400 ml-2">
                Last updated: {new Date(lastUpdateTime).toLocaleTimeString()}
              </span>
            </p>
          </div>
          
          {/* Period Filter */}
          <div className="flex items-center space-x-2">
            <FaFilter className="w-5 h-5 text-gray-500" />
            <select 
              value={period} 
              onChange={(e) => setPeriod(e.target.value as 'week' | 'month' | 'year')}
              className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="week">{t('period.thisWeek')}</option>
              <option value="month">{t('period.thisMonth')}</option>
              <option value="year">{t('period.thisYear')}</option>
            </select>
          </div>
        </div>

        {/* Summary Stats */}
        {analyticsData?.summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('analytics.totalHours')}</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.summary.totalHours}h</p>
                </div>
                <FaArrowUp className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('analytics.sessions')}</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.summary.totalSessions}</p>
                </div>
                <FaCalendar className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('analytics.totalXP')}</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.summary.totalXP}</p>
                </div>
                <FaAward className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Session</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.summary.averageSessionLength}h</p>
                </div>
                <FaBullseye className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.summary.completedSessions}</p>
                  <p className="text-xs text-gray-500">of {analyticsData.summary.totalSessions} sessions</p>
                </div>
                <FaCheck className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.summary.completionRate}%</p>
                  <p className="text-xs text-gray-500">completion rate</p>
                </div>
                <FaPercentage className="h-8 w-8 text-indigo-600" />
              </div>
            </div>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Progress Over Time */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Progress Over Time</h3>
            <div className="h-80">
              {getProgressChartConfig() ? (
                <Line data={getProgressChartConfig()!.data} options={getProgressChartConfig()!.options} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No progress data available for selected period
                </div>
              )}
            </div>
          </div>

          {/* Subject Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Distribution by Subject</h3>
            <div className="h-80">
              {getSubjectChartConfig() ? (
                <Pie data={getSubjectChartConfig()!.data} options={getSubjectChartConfig()!.options} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No subject data available
                </div>
              )}
            </div>
          </div>

          {/* Learning Streaks */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Streaks</h3>
            <div className="h-80">
              {getStreakChartConfig() ? (
                <Bar data={getStreakChartConfig()!.data} options={getStreakChartConfig()!.options} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No streak data available
                </div>
              )}
            </div>
          </div>

          {/* Goal Progress */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Goal Progress</h3>
            <div className="h-80">
              {analyticsData?.goals && analyticsData.goals.length > 0 ? (
                <div className="space-y-4">
                  {analyticsData.goals.slice(0, 5).map((goal) => (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">{goal.name}</span>
                        <span className="text-sm text-gray-500">
                          {goal.completedHours}h / {goal.targetHours}h ({goal.progress}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min(goal.progress, 100)}%` }}
                        ></div>
                      </div>
                      {goal.daysRemaining && (
                        <p className="text-xs text-gray-500">
                          {goal.daysRemaining > 0 ? `${goal.daysRemaining} days remaining` : 'Overdue'}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center mt-32">No goals found</p>
              )}
            </div>
          </div>
        </div>

        {/* Subject Details Table */}
        {analyticsData?.subjects && analyticsData.subjects.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Subject Details</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analyticsData.subjects.map((subject) => (
                    <tr key={subject.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-3"
                            style={{ backgroundColor: subject.color }}
                          ></div>
                          <span className="text-sm font-medium text-gray-900">{subject.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {subject.hours}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {subject.sessions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${Math.min(subject.progress, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">{subject.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}