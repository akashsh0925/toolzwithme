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
  Droplets, FileImage, Info, SquareStack,
  Merge, Scissors, ImageIcon, Lock, Crop, Contrast, FilePlus, Heading, Stamp, Maximize,
  RotateCw, Eraser, ShieldCheck, FileSearch, LayoutGrid, FileX, ZoomIn,
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
  { id: "pdf-watermark", title: "PDF Watermark", description: "Add text watermarks with opacity & rotation.", icon: Droplets, route: "/pdf-watermark", category: "pdf", phase: 5, available: true },
  { id: "pdf-metadata-editor", title: "PDF Metadata Editor", description: "Edit title, author, keywords.", icon: Info, route: "/pdf-metadata-editor", category: "pdf", phase: 5, available: true },
  { id: "pdf-page-numbers", title: "Page Number Stamper", description: "Add page numbers with custom format.", icon: Hash, route: "/pdf-page-numbers", category: "pdf", phase: 5, available: true },
  { id: "pdf-flatten", title: "PDF Flatten", description: "Flatten form fields & annotations.", icon: SquareStack, route: "/pdf-flatten", category: "pdf", phase: 5, available: true },
  { id: "image-to-pdf", title: "Image to PDF", description: "Combine images into a single PDF.", icon: FileImage, route: "/image-to-pdf", category: "pdf", phase: 5, available: true },
  { id: "pdf-merge", title: "PDF Merge", description: "Combine multiple PDFs into one.", icon: Merge, route: "/pdf-merge", category: "pdf", phase: 6, available: true },
  { id: "pdf-split", title: "PDF Split", description: "Split a PDF into separate files.", icon: Scissors, route: "/pdf-split", category: "pdf", phase: 6, available: true },
  { id: "pdf-to-image", title: "PDF to Image", description: "Convert pages to PNG or JPG.", icon: ImageIcon, route: "/pdf-to-image", category: "pdf", phase: 6, available: true },
  { id: "pdf-encrypt", title: "PDF Encrypt", description: "Add password protection.", icon: Lock, route: "/pdf-encrypt", category: "pdf", phase: 6, available: true },
  { id: "pdf-crop", title: "PDF Crop", description: "Adjust margins and crop pages.", icon: Crop, route: "/pdf-crop", category: "pdf", phase: 6, available: true },
  { id: "pdf-grayscale", title: "PDF Grayscale", description: "Convert color PDFs to grayscale.", icon: Contrast, route: "/pdf-grayscale", category: "pdf", phase: 6, available: true },
  { id: "pdf-blank-page", title: "Blank Page Inserter", description: "Insert blank pages into a PDF.", icon: FilePlus, route: "/pdf-blank-page", category: "pdf", phase: 6, available: true },
  { id: "pdf-header-footer", title: "PDF Header & Footer", description: "Add headers and footers.", icon: Heading, route: "/pdf-header-footer", category: "pdf", phase: 6, available: true },
  { id: "pdf-image-stamp", title: "PDF Image Stamp", description: "Overlay an image on every page.", icon: Stamp, route: "/pdf-image-stamp", category: "pdf", phase: 6, available: true },
  { id: "pdf-page-size", title: "Page Size Converter", description: "Convert to different page sizes.", icon: Maximize, route: "/pdf-page-size", category: "pdf", phase: 6, available: true },
  { id: "pdf-rotate", title: "PDF Rotate", description: "Rotate pages by 90°, 180°, or 270°.", icon: RotateCw, route: "/pdf-rotate", category: "pdf", phase: 7, available: true },
  { id: "pdf-remove-annotations", title: "Remove Annotations", description: "Strip all annotations & comments.", icon: Eraser, route: "/pdf-remove-annotations", category: "pdf", phase: 7, available: true },
  { id: "pdf-sanitize", title: "Sanitize PDF", description: "Remove metadata, JS & hidden data.", icon: ShieldCheck, route: "/pdf-sanitize", category: "pdf", phase: 7, available: true },
  { id: "pdf-info", title: "PDF Info / Inspector", description: "View page sizes, metadata & version.", icon: FileSearch, route: "/pdf-info", category: "pdf", phase: 7, available: true },
  { id: "pdf-overlay", title: "Overlay PDFs", description: "Layer one PDF on top of another.", icon: Layers, route: "/pdf-overlay", category: "pdf", phase: 7, available: true },
  { id: "pdf-nup", title: "Multi-Page Layout", description: "Put 2/4/6/9 pages per sheet.", icon: LayoutGrid, route: "/pdf-nup", category: "pdf", phase: 7, available: true },
  { id: "pdf-remove-blank-pages", title: "Remove Blank Pages", description: "Detect & strip blank pages.", icon: FileX, route: "/pdf-remove-blank-pages", category: "pdf", phase: 7, available: true },
  { id: "pdf-scale-pages", title: "Scale Pages", description: "Scale content up or down.", icon: ZoomIn, route: "/pdf-scale-pages", category: "pdf", phase: 7, available: true },

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
