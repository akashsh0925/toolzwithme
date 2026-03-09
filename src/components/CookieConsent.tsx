import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";

const COOKIE_KEY = "toolzwithme_cookie_consent";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-4xl mx-auto rounded-xl border border-border bg-card shadow-lg p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Cookie className="w-5 h-5 text-primary shrink-0 mt-0.5 sm:mt-0" />
        <div className="flex-1 text-sm text-muted-foreground">
          We use cookies to enhance your experience and analyze site traffic. By clicking "Accept All", you consent to our use of cookies.{" "}
          <Link to="/privacy" className="text-primary hover:underline">Learn more</Link>.
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleDecline}>
            Decline
          </Button>
          <Button size="sm" onClick={handleAccept}>
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
