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

// Phase 1 – PDF
const PdfPasswordRemover = lazy(() => import("./pages/PdfPasswordRemover"));
const PdfOcr = lazy(() => import("./pages/PdfOcr"));
const PdfPageTools = lazy(() => import("./pages/PdfPageTools"));
const PdfFormFiller = lazy(() => import("./pages/PdfFormFiller"));
const PdfToOffice = lazy(() => import("./pages/PdfToOffice"));
// Phase 1 – Image
const HeicConverter = lazy(() => import("./pages/HeicConverter"));
const ImageBatch = lazy(() => import("./pages/ImageBatch"));
// Phase 1 – Text
const MarkdownEditor = lazy(() => import("./pages/MarkdownEditor"));
const JsonToolkit = lazy(() => import("./pages/JsonToolkit"));
const TextDiff = lazy(() => import("./pages/TextDiff"));
// Phase 2
const YoutubeThumbnail = lazy(() => import("./pages/YoutubeThumbnail"));
// Phase 3
const PasswordGenerator = lazy(() => import("./pages/PasswordGenerator"));
const PomodoroTimer = lazy(() => import("./pages/PomodoroTimer"));
const UnitConverter = lazy(() => import("./pages/UnitConverter"));
const WordCounter = lazy(() => import("./pages/WordCounter"));

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
              {/* Phase 1 – PDF */}
              <Route path="/pdf-password-remover" element={<PdfPasswordRemover />} />
              <Route path="/pdf-ocr" element={<PdfOcr />} />
              <Route path="/pdf-page-tools" element={<PdfPageTools />} />
              <Route path="/pdf-form-filler" element={<PdfFormFiller />} />
              <Route path="/pdf-to-office" element={<PdfToOffice />} />
              {/* Phase 1 – Image */}
              <Route path="/heic-converter" element={<HeicConverter />} />
              <Route path="/image-batch" element={<ImageBatch />} />
              {/* Phase 1 – Text */}
              <Route path="/markdown-editor" element={<MarkdownEditor />} />
              <Route path="/json-toolkit" element={<JsonToolkit />} />
              <Route path="/text-diff" element={<TextDiff />} />
              {/* Phase 2 */}
              <Route path="/youtube-thumbnail" element={<YoutubeThumbnail />} />
              {/* Phase 3 */}
              <Route path="/password-generator" element={<PasswordGenerator />} />
              <Route path="/pomodoro-timer" element={<PomodoroTimer />} />
              <Route path="/unit-converter" element={<UnitConverter />} />
              <Route path="/word-counter" element={<WordCounter />} />
              {/* Auth */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
