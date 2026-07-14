import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { RequireAuth } from "@/components/RequireAuth";
import { RequireAdmin } from "@/components/RequireAdmin";
import Index from "./pages/Index.tsx";
import Program from "./pages/Program.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import Home from "./pages/app/Home.tsx";
import Earnings from "./pages/app/Earnings.tsx";
import Promotions from "./pages/app/Promotions.tsx";
import NewClaim from "./pages/app/NewClaim.tsx";
import Dashboard from "./pages/app/Dashboard.tsx";
import Support from "./pages/app/Support.tsx";
import Profile from "./pages/app/Profile.tsx";
import AdminClaims from "./pages/admin/AdminClaims.tsx";
import AdminPayouts from "./pages/admin/AdminPayouts.tsx";
import AdminReports from "./pages/admin/AdminReports.tsx";
import AdminUsers from "./pages/admin/AdminUsers.tsx";
import AdminContent from "./pages/admin/AdminContent.tsx";
import AdminProducts from "./pages/admin/AdminProducts.tsx";
import AdminBonusCodes from "./pages/admin/AdminBonusCodes.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/program" element={<Program />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route path="/app" element={<RequireAuth><Home /></RequireAuth>} />
            <Route path="/app/earnings" element={<RequireAuth><Earnings /></RequireAuth>} />
            <Route path="/app/promotions" element={<RequireAuth><Promotions /></RequireAuth>} />
            <Route path="/app/claims/new" element={<RequireAuth><NewClaim /></RequireAuth>} />
            <Route path="/app/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/app/support" element={<RequireAuth><Support /></RequireAuth>} />
            <Route path="/app/profile" element={<RequireAuth><Profile /></RequireAuth>} />

            <Route path="/admin" element={<RequireAdmin><AdminClaims /></RequireAdmin>} />
            <Route path="/admin/payouts" element={<RequireAdmin><AdminPayouts /></RequireAdmin>} />
            <Route path="/admin/reports" element={<RequireAdmin><AdminReports /></RequireAdmin>} />
            <Route path="/admin/users" element={<RequireAdmin><AdminUsers /></RequireAdmin>} />
            <Route path="/admin/content" element={<RequireAdmin><AdminContent /></RequireAdmin>} />
            <Route path="/admin/products" element={<RequireAdmin><AdminProducts /></RequireAdmin>} />
            <Route path="/admin/bonus-codes" element={<RequireAdmin><AdminBonusCodes /></RequireAdmin>} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
