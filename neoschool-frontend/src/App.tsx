import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import AppLayout from "@/components/AppLayout";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Students from "./pages/Students";
import Subjects from "./pages/Subjects";
import ExamMarks from "./pages/ExamMarks";
import Teachers from "./pages/Teachers";
import ExamMarksForm from "./pages/ExamMarksForm";
import ViewExamMarks from "./pages/ViewExamMarks";
import Results from "./pages/Results";
import Dashboard from "./components/dashboard/Dashboard";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Grades from "./pages/Grades";
import Exams from "./pages/Exams";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Layout component that includes the AppLayout
const Layout = () => {
  return (
    <ProtectedRoute>
      <AppProvider>
        <AppLayout>
          <Outlet />
        </AppLayout>
      </AppProvider>
    </ProtectedRoute>
  );
};

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="students" element={<Students />} />
                <Route path="/exam-marks" element={<ExamMarks />} />
                <Route path="/exam-marks/:id" element={<ViewExamMarks />} />
              <Route path="/results" element={<Results />} />
                <Route path="teachers" element={<Teachers />} />
                <Route path="subjects" element={<Subjects />} />
                <Route path="grades" element={<Grades />} />
                <Route path="exams" element={<Exams />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
