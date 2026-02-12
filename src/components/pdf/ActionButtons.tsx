import { useState } from 'react';
import { Download, Copy, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ExtractedLink, exportToCSV, copyLinksToClipboard, isSafeUrl } from '@/lib/pdf-extractor';
import { toast } from 'sonner';

interface ActionButtonsProps {
  links: ExtractedLink[];
  selectedLinks: ExtractedLink[];
  fileName: string;
  onReset: () => void;
  onClearSelection: () => void;
}

export function ActionButtons({ links, selectedLinks, fileName, onReset, onClearSelection }: ActionButtonsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const targetLinks = selectedLinks.length > 0 ? selectedLinks : links;
  const hasSelection = selectedLinks.length > 0;

  const handleCopy = async () => {
    try {
      await copyLinksToClipboard(targetLinks);
      toast.success(`${targetLinks.length} link${targetLinks.length !== 1 ? 's' : ''} copied to clipboard`);
    } catch { toast.error('Failed to copy links'); }
  };

  const handleExportCSV = () => {
    try {
      exportToCSV(targetLinks, fileName);
      toast.success('CSV file downloaded');
    } catch { toast.error('Failed to export CSV'); }
  };

  const openLinks = () => {
    if (targetLinks.length === 0) { toast.error('No links to open'); return; }
    let blocked = 0, skipped = 0;
    targetLinks.forEach((link) => {
      if (!isSafeUrl(link.url)) { skipped++; return; }
      const newWindow = window.open(link.url, '_blank', 'noopener,noreferrer');
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') blocked++;
    });
    if (skipped > 0) toast.warning(`${skipped} unsafe URL(s) were skipped for security reasons.`);
    if (blocked > 0) toast.error(`${blocked} tabs blocked. Please allow popups for this site.`, { duration: 5000 });
    else if (skipped === 0) toast.success(`Opened ${targetLinks.length} links`);
    else toast.success(`Opened ${targetLinks.length - skipped} links`);
  };

  const handleOpenLinks = () => {
    if (targetLinks.length === 0) { toast.error('No links to open'); return; }
    if (targetLinks.length > 10) { setConfirmOpen(true); return; }
    openLinks();
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {hasSelection && <span className="text-sm text-muted-foreground">{selectedLinks.length} selected</span>}
      <Button onClick={handleCopy} variant="secondary" className="gap-2" disabled={targetLinks.length === 0}>
        <Copy className="w-4 h-4" />{hasSelection ? `Copy ${selectedLinks.length}` : 'Copy All'}
      </Button>
      <Button onClick={handleExportCSV} className="gap-2" disabled={targetLinks.length === 0}>
        <Download className="w-4 h-4" />{hasSelection ? `Export ${selectedLinks.length}` : 'Export CSV'}
      </Button>
      <Button onClick={handleOpenLinks} variant="secondary" className="gap-2" disabled={targetLinks.length === 0}>
        <ExternalLink className="w-4 h-4" />{hasSelection ? `Open ${selectedLinks.length}` : 'Open All'}
      </Button>
      {hasSelection && <Button onClick={onClearSelection} variant="ghost" size="sm">Clear selection</Button>}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Open many tabs?</AlertDialogTitle>
            <AlertDialogDescription>You are about to open {targetLinks.length} tabs. Your browser may block this unless popups are allowed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setConfirmOpen(false); openLinks(); }}>Open tabs</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Button onClick={onReset} variant="outline" className="gap-2 ml-auto">
        <RefreshCw className="w-4 h-4" />New PDF
      </Button>
    </div>
  );
}
