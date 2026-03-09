import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import GDrive from "./pages/GDrive";
import PdfLinkGenie from "./pages/PdfLinkGenie";
import ThemePreview from "./pages/ThemePreview";
import MultiUrlOpener from "./pages/MultiUrlOpener";
import NewsletterSubscriber from "./pages/NewsletterSubscriber";
import CardGenerator from "./pages/CardGenerator";
import TempEmail from "./pages/TempEmail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tools" element={<Dashboard />} />
            <Route path="/gdrive" element={<GDrive />} />
            <Route path="/pdf-link-genie" element={<PdfLinkGenie />} />
            <Route path="/multi-url" element={<MultiUrlOpener />} />
            <Route path="/theme-preview" element={<ThemePreview />} />
            <Route path="/newsletter" element={<NewsletterSubscriber />} />
            <Route path="/card-generator" element={<CardGenerator />} />
            <Route path="/temp-email" element={<TempEmail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/profile" element={<Profile />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
