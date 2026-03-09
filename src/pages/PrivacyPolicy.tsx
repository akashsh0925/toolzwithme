import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => (
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
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm">Last updated: March 9, 2026</p>
      </div>

      {[
        { title: "1. Information We Collect", content: `ToolzWithMe is designed with privacy as a core principle. All file processing happens entirely within your browser — no files, documents, or images are ever uploaded to our servers.\n\nWe may collect:\n• Account information (email, display name) if you choose to create an account\n• Usage analytics (page views, tool usage counts) to improve our services\n• Cookies for essential site functionality and optional analytics` },
        { title: "2. How We Use Your Information", content: `We use collected information to:\n• Provide and maintain our services\n• Improve user experience and tool functionality\n• Send important service updates (if you've created an account)\n• Analyze aggregate usage patterns to prioritize new tools` },
        { title: "3. Cookies", content: `We use the following types of cookies:\n• Essential cookies: Required for site functionality (authentication, preferences)\n• Analytics cookies: Help us understand how visitors use our site (only with your consent)\n• Advertising cookies: Used by Google Ads to show relevant advertisements (only with your consent)\n\nYou can manage your cookie preferences at any time using the cookie consent banner.` },
        { title: "4. Third-Party Services", content: `We may use third-party services including:\n• Google Analytics for usage statistics\n• Google Ads for advertising\n• Authentication providers for secure sign-in\n\nThese services may collect information according to their own privacy policies.` },
        { title: "5. Data Security", content: "We implement appropriate security measures to protect your personal information. Since most processing occurs client-side, your sensitive data (files, documents) never reaches our servers." },
        { title: "6. Your Rights", content: `You have the right to:\n• Access your personal data\n• Request deletion of your account and associated data\n• Opt out of analytics and advertising cookies\n• Export your data\n\nTo exercise these rights, contact us at support@toolzwithme.com.` },
        { title: "7. Children's Privacy", content: "Our services are not directed to children under 13. We do not knowingly collect personal information from children under 13." },
        { title: "8. Changes to This Policy", content: "We may update this Privacy Policy from time to time. We will notify registered users of significant changes via email." },
        { title: "9. Contact Us", content: "If you have questions about this Privacy Policy, please contact us at support@toolzwithme.com or visit our Contact page." },
      ].map((s) => (
        <section key={s.title} className="space-y-3">
          <h2 className="text-lg font-semibold">{s.title}</h2>
          <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{s.content}</p>
        </section>
      ))}
    </main>

    <footer className="border-t border-border py-6 text-center text-muted-foreground text-sm">
      © {new Date().getFullYear()} ToolzWithMe. All rights reserved. ·{" "}
      <Link to="/terms" className="hover:text-foreground">Terms</Link> ·{" "}
      <Link to="/contact" className="hover:text-foreground">Contact</Link> ·{" "}
      <Link to="/about" className="hover:text-foreground">About</Link>
    </footer>
  </div>
);

export default PrivacyPolicy;
