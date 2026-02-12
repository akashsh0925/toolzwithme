import DownloadCard from "@/components/DownloadCard";
import { HardDriveDownload } from "lucide-react";

const GDrive = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="relative z-10 space-y-10 w-full">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-2">
            <HardDriveDownload className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight text-foreground">
            GDrive<span className="text-primary">DL</span>
          </h1>
          <p className="text-muted-foreground text-base max-w-md mx-auto">
            Paste a Google Drive link and download the file directly. No sign-in required.
          </p>
        </div>
        <DownloadCard />
      </div>
    </div>
  );
};

export default GDrive;
