import {
  FileText, Unlock, ScanSearch, Layers, FormInput, FileOutput,
  Image, ImagePlus,
  Code, Braces, GitCompare,
  // Phase 2+
  Download, Link2, Hash, Copy, Instagram, Youtube,
  Scissors, Film,
  // Phase 3+
  KeyRound, Timer, Ruler, LetterText, Clipboard,
  Receipt, FileUser, SplitSquareHorizontal,
  // Phase 4+
  Minimize2, Scale, PenTool, EyeOff, Signature, ImageDown,
  Video, Globe, Sparkles, Type, Smartphone, Palette, Star as StarIcon, Music,
  // Phase 5+
  Mail, UserRound, Fingerprint, Trash2, ShieldX,
  Vote, Clock, Focus, Rss, TabletSmartphone, BookOpen, LinkIcon,
} from "lucide-react";

export interface ToolDef {
  id: string;
  title: string;
  description: string;
  icon: any;
  route: string;
  category: string;
  phase: number;
  available: boolean;
}

export interface ToolCategory {
  id: string;
  label: string;
  icon: any;
  tools: ToolDef[];
}

const allTools: ToolDef[] = [
  // ─── CATEGORY: PDF ───
  { id: "pdf-link-genie", title: "PDF Link Extractor", description: "Extract all links from any PDF.", icon: FileText, route: "/pdf-link-genie", category: "pdf", phase: 0, available: true },
  { id: "pdf-password-remover", title: "PDF Password Remover", description: "Remove password protection from PDFs.", icon: Unlock, route: "/pdf-password-remover", category: "pdf", phase: 1, available: true },
  { id: "pdf-ocr", title: "PDF OCR", description: "Add searchable text layer to scanned PDFs.", icon: ScanSearch, route: "/pdf-ocr", category: "pdf", phase: 1, available: true },
  { id: "pdf-page-tools", title: "PDF Page Tools", description: "Delete, reorder, rotate & extract pages.", icon: Layers, route: "/pdf-page-tools", category: "pdf", phase: 1, available: true },
  { id: "pdf-form-filler", title: "PDF Form Filler", description: "Fill in interactive PDF form fields.", icon: FormInput, route: "/pdf-form-filler", category: "pdf", phase: 1, available: true },
  { id: "pdf-to-office", title: "PDF to Office", description: "Convert PDF to HTML or text.", icon: FileOutput, route: "/pdf-to-office", category: "pdf", phase: 1, available: true },
  { id: "pdf-compressor", title: "PDF Compressor", description: "Reduce PDF file size with quality options.", icon: Minimize2, route: "/pdf-compressor", category: "pdf", phase: 4, available: false },
  { id: "pdf-compare", title: "PDF Compare", description: "Side-by-side diff of two PDF files.", icon: Scale, route: "/pdf-compare", category: "pdf", phase: 4, available: false },
  { id: "pdf-redaction", title: "PDF Redaction", description: "Permanently black out sensitive content.", icon: EyeOff, route: "/pdf-redaction", category: "pdf", phase: 4, available: false },
  { id: "pdf-signature", title: "PDF Signature", description: "Draw or upload signatures on PDFs.", icon: PenTool, route: "/pdf-signature", category: "pdf", phase: 4, available: false },
  { id: "pdf-image-extractor", title: "PDF Image Extractor", description: "Extract all embedded images from a PDF.", icon: ImageDown, route: "/pdf-image-extractor", category: "pdf", phase: 4, available: false },

  // ─── CATEGORY: IMAGE & MEDIA ───
  { id: "heic-converter", title: "HEIC Converter", description: "Convert iPhone HEIC images to JPG/PNG.", icon: Image, route: "/heic-converter", category: "image", phase: 1, available: true },
  { id: "image-batch", title: "Image Batch Processor", description: "Resize, crop, convert images in bulk.", icon: ImagePlus, route: "/image-batch", category: "image", phase: 1, available: true },
  { id: "glitch-art", title: "Glitch Art Generator", description: "Create retro glitch effects on images.", icon: Sparkles, route: "/glitch-art", category: "image", phase: 4, available: false },
  { id: "retro-text", title: "Retro Text Effects", description: "ASCII, vaporwave, zalgo & more.", icon: Type, route: "/retro-text", category: "image", phase: 4, available: false },
  { id: "fake-screenshot", title: "Fake Screenshot", description: "Create mockup screenshots of social posts.", icon: Smartphone, route: "/fake-screenshot", category: "image", phase: 4, available: false },
  { id: "svg-optimizer", title: "SVG Optimizer", description: "Minify and clean SVG files.", icon: Code, route: "/svg-optimizer", category: "image", phase: 4, available: false },
  { id: "favicon-generator", title: "Favicon Generator", description: "Create a complete favicon package.", icon: StarIcon, route: "/favicon-generator", category: "image", phase: 4, available: false },
  { id: "audio-trimmer", title: "Audio Trimmer", description: "Trim and fade audio clips.", icon: Music, route: "/audio-trimmer", category: "image", phase: 2, available: false },
  { id: "video-to-gif", title: "Video to GIF", description: "Convert video clips to animated GIFs.", icon: Film, route: "/video-to-gif", category: "image", phase: 2, available: false },

  // ─── CATEGORY: TEXT & DATA ───
  { id: "markdown-editor", title: "Markdown Editor", description: "Write & preview markdown with live rendering.", icon: Code, route: "/markdown-editor", category: "text", phase: 1, available: true },
  { id: "json-toolkit", title: "JSON Toolkit", description: "Format, validate, minify & convert JSON.", icon: Braces, route: "/json-toolkit", category: "text", phase: 1, available: true },
  { id: "text-diff", title: "Text Diff", description: "Compare two text blocks side-by-side.", icon: GitCompare, route: "/text-diff", category: "text", phase: 1, available: true },

  // ─── CATEGORY: DOWNLOAD & FILE ───
  { id: "gdrive", title: "GDrive Direct Link", description: "Generate direct download links for Google Drive.", icon: Download, route: "/gdrive", category: "download", phase: 0, available: true },
  { id: "multi-url", title: "Multi URL Opener", description: "Open multiple URLs at once.", icon: Link2, route: "/multi-url", category: "download", phase: 0, available: true },
  { id: "youtube-thumbnail", title: "YouTube Thumbnail", description: "Grab thumbnails in all resolutions.", icon: Youtube, route: "/youtube-thumbnail", category: "download", phase: 2, available: false },

  // ─── CATEGORY: PRODUCTIVITY ───
  { id: "newsletter", title: "Newsletter Subscriber", description: "Bulk-subscribe to newsletters.", icon: Mail, route: "/newsletter", category: "productivity", phase: 0, available: true },
  { id: "card-generator", title: "Test Card Generator", description: "Generate Luhn-valid test card numbers.", icon: KeyRound, route: "/card-generator", category: "productivity", phase: 0, available: true },

  // ─── CATEGORY: SECURITY & PRIVACY ───
  { id: "temp-email", title: "Temp Email", description: "Disposable email with live inbox.", icon: Mail, route: "/temp-email", category: "security", phase: 0, available: true },
];

export const categories: ToolCategory[] = [
  { id: "pdf", label: "PDF Tools", icon: FileText, tools: allTools.filter(t => t.category === "pdf") },
  { id: "image", label: "Image & Media", icon: Image, tools: allTools.filter(t => t.category === "image") },
  { id: "text", label: "Text & Data", icon: Code, tools: allTools.filter(t => t.category === "text") },
  { id: "download", label: "Download & File", icon: Download, tools: allTools.filter(t => t.category === "download") },
  { id: "productivity", label: "Productivity", icon: Timer, tools: allTools.filter(t => t.category === "productivity") },
  { id: "security", label: "Security & Privacy", icon: ShieldX, tools: allTools.filter(t => t.category === "security") },
];

export const getAvailableTools = () => allTools.filter(t => t.available);
export const getAllTools = () => allTools;
export const getToolById = (id: string) => allTools.find(t => t.id === id);
