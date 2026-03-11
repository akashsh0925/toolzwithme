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
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookieConsent from "./components/CookieConsent";

// Existing tools
import GDrive from "./pages/GDrive";
import PdfLinkGenie from "./pages/PdfLinkGenie";
import MultiUrlOpener from "./pages/MultiUrlOpener";
import NewsletterSubscriber from "./pages/NewsletterSubscriber";
import CardGenerator from "./pages/CardGenerator";
import TempEmail from "./pages/TempEmail";
import ThemePreview from "./pages/ThemePreview";

// All lazy-loaded tools
const PdfPasswordRemover = lazy(() => import("./pages/PdfPasswordRemover"));
const PdfOcr = lazy(() => import("./pages/PdfOcr"));
const PdfPageTools = lazy(() => import("./pages/PdfPageTools"));
const PdfFormFiller = lazy(() => import("./pages/PdfFormFiller"));
const PdfToOffice = lazy(() => import("./pages/PdfToOffice"));
const PdfCompressor = lazy(() => import("./pages/PdfCompressor"));
const PdfCompare = lazy(() => import("./pages/PdfCompare"));
const PdfRedaction = lazy(() => import("./pages/PdfRedaction"));
const PdfSignature = lazy(() => import("./pages/PdfSignature"));
const PdfImageExtractor = lazy(() => import("./pages/PdfImageExtractor"));
const HeicConverter = lazy(() => import("./pages/HeicConverter"));
const ImageBatch = lazy(() => import("./pages/ImageBatch"));
const GlitchArt = lazy(() => import("./pages/GlitchArt"));
const RetroText = lazy(() => import("./pages/RetroText"));
const SvgOptimizer = lazy(() => import("./pages/SvgOptimizer"));
const FaviconGenerator = lazy(() => import("./pages/FaviconGenerator"));
const MarkdownEditor = lazy(() => import("./pages/MarkdownEditor"));
const JsonToolkit = lazy(() => import("./pages/JsonToolkit"));
const TextDiff = lazy(() => import("./pages/TextDiff"));
const RegexTester = lazy(() => import("./pages/RegexTester"));
const Base64Converter = lazy(() => import("./pages/Base64Converter"));
const UrlEncoder = lazy(() => import("./pages/UrlEncoder"));
const HtmlEntityEncoder = lazy(() => import("./pages/HtmlEntityEncoder"));
const ColorConverter = lazy(() => import("./pages/ColorConverter"));
const LoremIpsum = lazy(() => import("./pages/LoremIpsum"));
const CssMinifier = lazy(() => import("./pages/CssMinifier"));
const YoutubeThumbnail = lazy(() => import("./pages/YoutubeThumbnail"));
const PasswordGenerator = lazy(() => import("./pages/PasswordGenerator"));
const PomodoroTimer = lazy(() => import("./pages/PomodoroTimer"));
const UnitConverter = lazy(() => import("./pages/UnitConverter"));
const WordCounter = lazy(() => import("./pages/WordCounter"));
const LinkExtractor = lazy(() => import("./pages/LinkExtractor"));

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
              <Route path="/gdrive" element={<GDrive />} />
              <Route path="/pdf-link-genie" element={<PdfLinkGenie />} />
              <Route path="/multi-url" element={<MultiUrlOpener />} />
              <Route path="/newsletter" element={<NewsletterSubscriber />} />
              <Route path="/card-generator" element={<CardGenerator />} />
              <Route path="/temp-email" element={<TempEmail />} />
              <Route path="/theme-preview" element={<ThemePreview />} />
              <Route path="/pdf-password-remover" element={<PdfPasswordRemover />} />
              <Route path="/pdf-ocr" element={<PdfOcr />} />
              <Route path="/pdf-page-tools" element={<PdfPageTools />} />
              <Route path="/pdf-form-filler" element={<PdfFormFiller />} />
              <Route path="/pdf-to-office" element={<PdfToOffice />} />
              <Route path="/pdf-compressor" element={<PdfCompressor />} />
              <Route path="/pdf-compare" element={<PdfCompare />} />
              <Route path="/pdf-redaction" element={<PdfRedaction />} />
              <Route path="/pdf-signature" element={<PdfSignature />} />
              <Route path="/pdf-image-extractor" element={<PdfImageExtractor />} />
              <Route path="/heic-converter" element={<HeicConverter />} />
              <Route path="/image-batch" element={<ImageBatch />} />
              <Route path="/glitch-art" element={<GlitchArt />} />
              <Route path="/retro-text" element={<RetroText />} />
              <Route path="/svg-optimizer" element={<SvgOptimizer />} />
              <Route path="/favicon-generator" element={<FaviconGenerator />} />
              <Route path="/markdown-editor" element={<MarkdownEditor />} />
              <Route path="/json-toolkit" element={<JsonToolkit />} />
              <Route path="/text-diff" element={<TextDiff />} />
              <Route path="/regex-tester" element={<RegexTester />} />
              <Route path="/base64-converter" element={<Base64Converter />} />
              <Route path="/url-encoder" element={<UrlEncoder />} />
              <Route path="/html-entity-encoder" element={<HtmlEntityEncoder />} />
              <Route path="/color-converter" element={<ColorConverter />} />
              <Route path="/lorem-ipsum" element={<LoremIpsum />} />
              <Route path="/css-minifier" element={<CssMinifier />} />
              <Route path="/youtube-thumbnail" element={<YoutubeThumbnail />} />
              <Route path="/password-generator" element={<PasswordGenerator />} />
              <Route path="/pomodoro-timer" element={<PomodoroTimer />} />
              <Route path="/unit-converter" element={<UnitConverter />} />
              <Route path="/word-counter" element={<WordCounter />} />
              <Route path="/link-extractor" element={<LinkExtractor />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <CookieConsent />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
