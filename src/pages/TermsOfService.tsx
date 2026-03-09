import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const TermsOfService = () => (
  <div className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-lg font-bold tracking-tight font-display">ToolzWithMe</Link>
        <Link to="/tools"><Button variant="outline" size="sm">Open Tools</Button></Link>
      </div>
    </header>

    <main className="max-w-3xl mx-auto px-6 py-16 space-y-8">
      <div>
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-6">
          <ArrowLeft className="w-3 h-3" /> Back to Home
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Terms of Service</h1>
        <p className="text-muted-foreground text-sm">Last updated: March 9, 2026</p>
      </div>

      {[
        { title: "1. Acceptance of Terms", content: "By accessing or using ToolzWithMe, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services." },
        { title: "2. Description of Service", content: "ToolzWithMe provides free, browser-based web tools for file conversion, text processing, PDF manipulation, and other utility functions. All processing occurs locally in your browser unless otherwise stated." },
        { title: "3. User Accounts", content: "You may create an account to access additional features. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account." },
        { title: "4. Acceptable Use", content: `You agree not to:\n• Use the service for any illegal or unauthorized purpose\n• Attempt to gain unauthorized access to our systems\n• Upload malicious files or content\n• Interfere with or disrupt the service\n• Use automated systems to access the service in a manner that exceeds reasonable use` },
        { title: "5. Intellectual Property", content: "The ToolzWithMe service, including its design, code, and content, is protected by intellectual property laws. You may not copy, modify, or distribute our service without permission." },
        { title: "6. Disclaimer of Warranties", content: 'ToolzWithMe is provided "as is" without warranties of any kind, either express or implied. We do not guarantee that the service will be uninterrupted, error-free, or that results will be accurate.' },
        { title: "7. Limitation of Liability", content: "To the maximum extent permitted by law, ToolzWithMe shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service." },
        { title: "8. Data Processing", content: "Files processed through our tools are handled entirely in your browser. We do not store, access, or transmit your files to any server. You retain full ownership of all content you process." },
        { title: "9. Modifications", content: "We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the modified terms." },
        { title: "10. Termination", content: "We may terminate or suspend your access to the service at any time, without notice, for conduct that we believe violates these terms or is harmful to other users or the service." },
        { title: "11. Governing Law", content: "These terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles." },
        { title: "12. Contact", content: "For questions about these Terms, contact us at support@toolzwithme.com." },
      ].map((s) => (
        <section key={s.title} className="space-y-3">
          <h2 className="text-lg font-semibold">{s.title}</h2>
          <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{s.content}</p>
        </section>
      ))}
    </main>

    <footer className="border-t border-border py-6 text-center text-muted-foreground text-sm">
      © {new Date().getFullYear()} ToolzWithMe. All rights reserved. ·{" "}
      <Link to="/privacy" className="hover:text-foreground">Privacy</Link> ·{" "}
      <Link to="/contact" className="hover:text-foreground">Contact</Link> ·{" "}
      <Link to="/about" className="hover:text-foreground">About</Link>
    </footer>
  </div>
);

export default TermsOfService;
