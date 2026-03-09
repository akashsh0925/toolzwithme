import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

// Existing tools
import GDrive from "./pages/GDrive";
import PdfLinkGenie from "./pages/PdfLinkGenie";
import MultiUrlOpener from "./pages/MultiUrlOpener";
import NewsletterSubscriber from "./pages/NewsletterSubscriber";
import CardGenerator from "./pages/CardGenerator";
import TempEmail from "./pages/TempEmail";
import ThemePreview from "./pages/ThemePreview";

// Phase 1 - Text tools (lazy loaded)
const MarkdownEditor = lazy(() => import("./pages/MarkdownEditor"));
const JsonToolkit = lazy(() => import("./pages/JsonToolkit"));
const TextDiff = lazy(() => import("./pages/TextDiff"));

const queryClient = new QueryClient();

const Loader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="animate-pulse text-muted-foreground text-sm font-display">Loading tool…</div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tools" element={<Dashboard />} />
              {/* Existing tools */}
              <Route path="/gdrive" element={<GDrive />} />
              <Route path="/pdf-link-genie" element={<PdfLinkGenie />} />
              <Route path="/multi-url" element={<MultiUrlOpener />} />
              <Route path="/newsletter" element={<NewsletterSubscriber />} />
              <Route path="/card-generator" element={<CardGenerator />} />
              <Route path="/temp-email" element={<TempEmail />} />
              <Route path="/theme-preview" element={<ThemePreview />} />
              {/* Phase 1 - Text tools */}
              <Route path="/markdown-editor" element={<MarkdownEditor />} />
              <Route path="/json-toolkit" element={<JsonToolkit />} />
              <Route path="/text-diff" element={<TextDiff />} />
              {/* Auth */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/profile" element={<Profile />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
