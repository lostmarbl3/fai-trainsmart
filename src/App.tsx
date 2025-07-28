import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import WorkoutBuilder from "./pages/WorkoutBuilder";
import ClientManagement from "./pages/ClientManagement";
import MyWorkouts from "./pages/MyWorkouts";
import Calendar from "./pages/Calendar";
import Programs from "./pages/Programs";
import Progress from "./pages/Progress";
import Workouts from "./pages/Workouts";
import Billing from "./pages/Billing";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/workout-builder" element={<WorkoutBuilder />} />
            <Route path="/workout-builder/:id" element={<WorkoutBuilder />} />
            <Route path="/clients" element={<ClientManagement />} />
            <Route path="/my-workouts" element={<MyWorkouts />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/workouts" element={<Workouts />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
