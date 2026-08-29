import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './hooks/useAuth';
import { RequireAuth } from './components/RequireAuth';
import { AdminLayout } from './components/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Enquiries from './pages/Enquiries';

import Students from './pages/Students';
import NewStudent from './pages/NewStudent';
import StudentProfile from './pages/StudentProfile';
import Courses from './pages/Courses';
import Fees from './pages/Fees';
import JoiningList from './pages/JoiningList';
import Certificates from './pages/Certificates';
import CertificateGenerator from './pages/CertificateGenerator';
import VerifyCertificate from './pages/VerifyCertificate';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/verify/:id" element={<VerifyCertificate />} />
            
            <Route
              path="/"
              element={
                <RequireAuth>
                  <AdminLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="enquiries" element={<Enquiries />} />
              <Route path="students" element={<Students />} />
              <Route path="students/new" element={<NewStudent />} />
              <Route path="students/:id" element={<StudentProfile />} />
              <Route path="courses" element={<Courses />} />
              <Route path="fees" element={<Fees />} />
              <Route path="joining-list" element={<JoiningList />} />
              <Route path="certificates" element={<Certificates />} />
              <Route path="certificate-generator" element={<CertificateGenerator />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
