import {
  FileText, Unlock, ScanSearch, Layers, FormInput, FileOutput,
  Image, ImagePlus,
  Code, Braces, GitCompare,
  Download, Link2, Youtube,
  KeyRound, Timer, Ruler, LetterText,
  Minimize2, Scale, PenTool, EyeOff, ImageDown,
  Sparkles, Type, Smartphone, Palette, Star as StarIcon, Music, Film,
  Mail, ShieldX,
  Regex, Binary, Link as LinkIcon, Paintbrush, AlignLeft, FileCode, Hash,
} from "lucide-react";

export interface ToolDef {
  id: string; title: string; description: string; icon: any; route: string; category: string; phase: number; available: boolean;
}
export interface ToolCategory {
  id: string; label: string; icon: any; tools: ToolDef[];
}

const allTools: ToolDef[] = [
  // PDF
  { id: "pdf-link-genie", title: "PDF Link Extractor", description: "Extract all links from any PDF.", icon: FileText, route: "/pdf-link-genie", category: "pdf", phase: 0, available: true },
  { id: "pdf-password-remover", title: "PDF Password Remover", description: "Remove password protection from PDFs.", icon: Unlock, route: "/pdf-password-remover", category: "pdf", phase: 1, available: true },
  { id: "pdf-ocr", title: "PDF OCR", description: "Extract text from scanned PDFs & images.", icon: ScanSearch, route: "/pdf-ocr", category: "pdf", phase: 1, available: true },
  { id: "pdf-page-tools", title: "PDF Page Tools", description: "Delete, reorder, rotate & extract pages.", icon: Layers, route: "/pdf-page-tools", category: "pdf", phase: 1, available: true },
  { id: "pdf-form-filler", title: "PDF Form Filler", description: "Fill in interactive PDF form fields.", icon: FormInput, route: "/pdf-form-filler", category: "pdf", phase: 1, available: true },
  { id: "pdf-to-office", title: "PDF to Office", description: "Convert PDF to HTML or text.", icon: FileOutput, route: "/pdf-to-office", category: "pdf", phase: 1, available: true },
  { id: "pdf-compressor", title: "PDF Compressor", description: "Reduce PDF file size.", icon: Minimize2, route: "/pdf-compressor", category: "pdf", phase: 4, available: true },
  { id: "pdf-compare", title: "PDF Compare", description: "Side-by-side diff of two PDFs.", icon: Scale, route: "/pdf-compare", category: "pdf", phase: 4, available: true },
  { id: "pdf-redaction", title: "PDF Redaction", description: "Permanently black out content.", icon: EyeOff, route: "/pdf-redaction", category: "pdf", phase: 4, available: true },
  { id: "pdf-signature", title: "PDF Signature", description: "Draw or type signatures on PDFs.", icon: PenTool, route: "/pdf-signature", category: "pdf", phase: 4, available: true },
  { id: "pdf-image-extractor", title: "PDF Image Extractor", description: "Extract embedded images.", icon: ImageDown, route: "/pdf-image-extractor", category: "pdf", phase: 4, available: true },

  // IMAGE & MEDIA
  { id: "heic-converter", title: "HEIC Converter", description: "Convert iPhone HEIC to JPG/PNG.", icon: Image, route: "/heic-converter", category: "image", phase: 1, available: true },
  { id: "image-batch", title: "Image Batch Processor", description: "Resize, crop, convert in bulk.", icon: ImagePlus, route: "/image-batch", category: "image", phase: 1, available: true },
  { id: "glitch-art", title: "Glitch Art Generator", description: "Create retro glitch effects.", icon: Sparkles, route: "/glitch-art", category: "image", phase: 4, available: true },
  { id: "retro-text", title: "Retro Text Effects", description: "Vaporwave, zalgo, leet & more.", icon: Type, route: "/retro-text", category: "image", phase: 4, available: true },
  { id: "svg-optimizer", title: "SVG Optimizer", description: "Minify and clean SVG files.", icon: Code, route: "/svg-optimizer", category: "image", phase: 4, available: true },
  { id: "favicon-generator", title: "Favicon Generator", description: "Create a complete favicon package.", icon: StarIcon, route: "/favicon-generator", category: "image", phase: 4, available: true },
  { id: "audio-trimmer", title: "Audio Trimmer", description: "Trim and fade audio clips.", icon: Music, route: "/audio-trimmer", category: "image", phase: 2, available: false },
  { id: "video-to-gif", title: "Video to GIF", description: "Convert video to animated GIFs.", icon: Film, route: "/video-to-gif", category: "image", phase: 2, available: false },

  // TEXT & DATA
  { id: "markdown-editor", title: "Markdown Editor", description: "Write & preview markdown live.", icon: Code, route: "/markdown-editor", category: "text", phase: 1, available: true },
  { id: "json-toolkit", title: "JSON Toolkit", description: "Format, validate, minify & convert.", icon: Braces, route: "/json-toolkit", category: "text", phase: 1, available: true },
  { id: "text-diff", title: "Text Diff", description: "Compare two text blocks side-by-side.", icon: GitCompare, route: "/text-diff", category: "text", phase: 1, available: true },
  { id: "regex-tester", title: "Regex Tester", description: "Test regex with live highlighting.", icon: Regex, route: "/regex-tester", category: "text", phase: 5, available: true },
  { id: "base64-converter", title: "Base64 Converter", description: "Encode/decode text & files.", icon: Binary, route: "/base64-converter", category: "text", phase: 5, available: true },
  { id: "link-extractor", title: "Link Extractor", description: "Extract links from pasted text.", icon: Link2, route: "/link-extractor", category: "text", phase: 5, available: true },
  { id: "url-encoder", title: "URL Encoder", description: "Encode/decode URL components.", icon: LinkIcon, route: "/url-encoder", category: "text", phase: 5, available: true },
  { id: "html-entity-encoder", title: "HTML Entity Encoder", description: "Convert special chars to entities.", icon: Hash, route: "/html-entity-encoder", category: "text", phase: 5, available: true },
  { id: "color-converter", title: "Color Converter", description: "HEX, RGB, HSL with contrast check.", icon: Paintbrush, route: "/color-converter", category: "text", phase: 5, available: true },
  { id: "lorem-ipsum", title: "Lorem Ipsum", description: "Generate placeholder text.", icon: AlignLeft, route: "/lorem-ipsum", category: "text", phase: 5, available: true },
  { id: "css-minifier", title: "CSS Minifier", description: "Minify or beautify CSS code.", icon: FileCode, route: "/css-minifier", category: "text", phase: 5, available: true },

  // DOWNLOAD & FILE
  { id: "gdrive", title: "GDrive Direct Link", description: "Direct download links for Google Drive.", icon: Download, route: "/gdrive", category: "download", phase: 0, available: true },
  { id: "multi-url", title: "Multi URL Opener", description: "Open multiple URLs at once.", icon: Link2, route: "/multi-url", category: "download", phase: 0, available: true },
  { id: "youtube-thumbnail", title: "YouTube Thumbnail", description: "Grab all thumbnail resolutions.", icon: Youtube, route: "/youtube-thumbnail", category: "download", phase: 2, available: true },

  // PRODUCTIVITY
  { id: "newsletter", title: "Newsletter Subscriber", description: "Bulk-subscribe to newsletters.", icon: Mail, route: "/newsletter", category: "productivity", phase: 0, available: true },
  { id: "card-generator", title: "Test Card Generator", description: "Generate Luhn-valid test cards.", icon: KeyRound, route: "/card-generator", category: "productivity", phase: 0, available: true },
  { id: "password-generator", title: "Password Generator", description: "Generate secure passwords.", icon: KeyRound, route: "/password-generator", category: "productivity", phase: 3, available: true },
  { id: "pomodoro-timer", title: "Pomodoro Timer", description: "Focus timer with sessions.", icon: Timer, route: "/pomodoro-timer", category: "productivity", phase: 3, available: true },
  { id: "unit-converter", title: "Unit Converter", description: "Convert length, weight, temp & more.", icon: Ruler, route: "/unit-converter", category: "productivity", phase: 3, available: true },
  { id: "word-counter", title: "Word Counter", description: "Words, characters, reading time.", icon: LetterText, route: "/word-counter", category: "productivity", phase: 3, available: true },

  // SECURITY & PRIVACY
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
