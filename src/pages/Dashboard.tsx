import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Users, FileText, IndianRupee, TrendingUp, Sparkles, Activity } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { format, subMonths } from 'date-fns';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

export default function Dashboard() {
  const { profile } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEnquiries: 0,
    activeStudents: 0,
    pendingFees: 0
  });
  
  const [enrollmentData, setEnrollmentData] = useState<any[]>([]);
  const [enquiryStatusData, setEnquiryStatusData] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Total Enquiries
      const { count: enquiriesCount, error: enquiriesError } = await supabase
        .from('enquiries')
        .select('*', { count: 'exact', head: true });
        
      if (enquiriesError) console.error(enquiriesError);

      // 2. Active Students
      const { count: studentsCount, error: studentsError } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .in('status', ['enrolled', 'in_progress']);
        
      if (studentsError) console.error(studentsError);

      // 3. Pending Fees
      const { data: feesData, error: feesError } = await supabase
        .from('installments')
        .select('amount_due, amount_paid, status')
        .neq('status', 'paid');
        
      if (feesError) console.error(feesError);
      
      const totalPendingFees = feesData?.reduce((sum, item) => {
        return sum + (Number(item.amount_due || 0) - Number(item.amount_paid || 0));
      }, 0) || 0;

      setStats({
        totalEnquiries: enquiriesCount || 0,
        activeStudents: studentsCount || 0,
        pendingFees: totalPendingFees
      });

      // 4. Chart Data: Monthly Enrollments (Last 6 Months)
      const { data: recentEnrollments } = await supabase
        .from('enrollments')
        .select('created_at')
        .gte('created_at', subMonths(new Date(), 6).toISOString())
        .order('created_at', { ascending: true });

      if (recentEnrollments) {
        const monthlyCounts: Record<string, number> = {};
        
        // Initialize last 6 months with 0
        for (let i = 5; i >= 0; i--) {
          const monthKey = format(subMonths(new Date(), i), 'MMM yyyy');
          monthlyCounts[monthKey] = 0;
        }

        recentEnrollments.forEach((enr) => {
          const monthKey = format(new Date(enr.created_at), 'MMM yyyy');
          if (monthlyCounts[monthKey] !== undefined) {
            monthlyCounts[monthKey]++;
          }
        });

        const barData = Object.keys(monthlyCounts).map(key => ({
          name: key,
          students: monthlyCounts[key]
        }));
        setEnrollmentData(barData);
      }

      // 5. Chart Data: Enquiries by Status
      const { data: statusData } = await supabase
        .from('enquiries')
        .select('status');
        
      if (statusData) {
        const counts: Record<string, number> = {
          'new': 0,
          'follow_up': 0,
          'converted': 0,
          'closed': 0
        };
        
        statusData.forEach((enq) => {
          counts[enq.status] = (counts[enq.status] || 0) + 1;
        });

        const pieData = [
          { name: 'New', value: counts['new'], color: '#3B82F6' },       // Blue
          { name: 'Follow Up', value: counts['follow_up'], color: '#F59E0B' }, // Yellow
          { name: 'Converted', value: counts['converted'], color: '#10B981' }, // Green
          { name: 'Closed', value: counts['closed'], color: '#EF4444' }        // Red
        ].filter(d => d.value > 0); 
        
        setEnquiryStatusData(pieData);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-t-4 border-blue-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-r-4 border-indigo-400 animate-spin" style={{ animationDirection: 'reverse' }}></div>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      className="max-w-7xl mx-auto font-sans"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600 drop-shadow-sm flex items-center gap-3">
            Dashboard Overview <Sparkles className="text-indigo-500 w-8 h-8" />
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Welcome back, <span className="font-semibold text-gray-700">{profile?.full_name?.split(' ')[0] || 'Admin'}</span>! Here's what's happening today.
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        {/* Enquiries Stat */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -5, scale: 1.02 }}
          className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl p-6 shadow-xl shadow-blue-500/20 text-white"
        >
          <div className="absolute -right-6 -top-6 text-white/10 rotate-12 pointer-events-none">
            <FileText size={120} />
          </div>
          <div className="relative z-10 flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 border border-white/20 shadow-inner">
              <FileText className="text-white w-8 h-8" />
            </div>
            <div>
              <p className="text-blue-100 font-medium uppercase tracking-wider text-sm mb-1">Total Enquiries</p>
              <h3 className="text-4xl font-black tracking-tight">{stats.totalEnquiries}</h3>
            </div>
          </div>
        </motion.div>

        {/* Active Students Stat */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -5, scale: 1.02 }}
          className="relative overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-600 rounded-3xl p-6 shadow-xl shadow-emerald-500/20 text-white"
        >
          <div className="absolute -right-6 -top-6 text-white/10 rotate-12 pointer-events-none">
            <Users size={120} />
          </div>
          <div className="relative z-10 flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 border border-white/20 shadow-inner">
              <Users className="text-white w-8 h-8" />
            </div>
            <div>
              <p className="text-emerald-50 font-medium uppercase tracking-wider text-sm mb-1">Active Students</p>
              <h3 className="text-4xl font-black tracking-tight">{stats.activeStudents}</h3>
            </div>
          </div>
        </motion.div>

        {/* Pending Fees Stat */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -5, scale: 1.02 }}
          className="relative overflow-hidden bg-gradient-to-br from-rose-400 to-red-600 rounded-3xl p-6 shadow-xl shadow-rose-500/20 text-white"
        >
          <div className="absolute -right-6 -top-6 text-white/10 rotate-12 pointer-events-none">
            <IndianRupee size={120} />
          </div>
          <div className="relative z-10 flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 border border-white/20 shadow-inner">
              <IndianRupee className="text-white w-8 h-8" />
            </div>
            <div>
              <p className="text-rose-100 font-medium uppercase tracking-wider text-sm mb-1">Pending Fees</p>
              <h3 className="text-4xl font-black tracking-tight">
                ₹{stats.pendingFees.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </h3>
            </div>
          </div>
        </motion.div>
        
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Bar Chart: Enrollments */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 flex flex-col transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Enrollment Trends</h2>
              <p className="text-sm text-gray-500 font-medium">Students joined over the last 6 months</p>
            </div>
          </div>
          <div className="flex-1 min-h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={enrollmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity={1} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} dy={12} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} />
                <RechartsTooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(8px)',
                    padding: '12px 16px',
                    fontWeight: 'bold',
                    color: '#0f172a'
                  }}
                  itemStyle={{ color: '#4F46E5', fontWeight: 'bold' }}
                />
                <Bar dataKey="students" fill="url(#barGradient)" radius={[8, 8, 0, 0]} maxBarSize={45} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie Chart: Enquiry Status */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 flex flex-col transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Enquiries Breakdown</h2>
              <p className="text-sm text-gray-500 font-medium">Distribution of logged enquiries</p>
            </div>
          </div>
          <div className="flex-1 min-h-[320px]">
            {enquiryStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={enquiryStatusData}
                    cx="50%"
                    cy="45%"
                    innerRadius={80}
                    outerRadius={115}
                    paddingAngle={6}
                    dataKey="value"
                    animationDuration={1500}
                    stroke="none"
                  >
                    {enquiryStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(8px)',
                      padding: '12px 16px',
                      fontWeight: 'bold',
                      color: '#0f172a'
                    }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={40} 
                    iconType="circle"
                    formatter={(value) => <span className="text-gray-700 font-medium ml-1">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Activity size={48} className="text-gray-200 mb-3" />
                <p>No enquiry data available</p>
              </div>
            )}
          </div>
        </motion.div>

      </div>

    </motion.div>
  );
}
