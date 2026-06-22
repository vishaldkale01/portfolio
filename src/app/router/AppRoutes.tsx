import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const Home = lazy(() => import('../../pages/Home').then((module) => ({ default: module.Home })));
const Experience = lazy(() => import('../../pages/Experience').then((module) => ({ default: module.Experience })));
const Projects = lazy(() => import('../../pages/Projects').then((module) => ({ default: module.Projects })));
const Contact = lazy(() => import('../../pages/Contact').then((module) => ({ default: module.Contact })));
const AdminLogin = lazy(() => import('../../pages/AdminLogin').then((module) => ({ default: module.AdminLogin })));
const AdminDashboard = lazy(() =>
  import('../../pages/AdminDashboard').then((module) => ({ default: module.AdminDashboard }))
);
const Learning = lazy(() => import('../../pages/Learning'));
const PlanDetail = lazy(() => import('../../pages/PlanDetail'));
const TaskDetail = lazy(() => import('../../pages/TaskDetail'));
const AdminLearning = lazy(() => import('../../pages/AdminLearning'));

export function AppRoutes() {
  const fallback = (
    <div className="min-h-[50vh] flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );

  return (
    <MainLayout>
      <Suspense fallback={fallback}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/experience" element={<Experience />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/learning" element={<Learning />} />
          <Route path="/learning/:id" element={<PlanDetail />} />
          <Route path="/task/:taskId" element={<TaskDetail />} />
          <Route
            path="/admin/learning"
            element={
              <ProtectedRoute>
                <AdminLearning />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </MainLayout>
  );
}
