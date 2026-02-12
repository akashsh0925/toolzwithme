import { useState, useMemo } from 'react';
import { ExternalLink, Copy, Search, X } from 'lucide-react';
import { ExtractedLink } from '@/lib/pdf-extractor';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface LinkTableProps {
  links: ExtractedLink[];
  selectedIds: Set<string>;
  onSelectionChange: (selectedIds: Set<string>) => void;
}

export function LinkTable({ links, selectedIds, onSelectionChange }: LinkTableProps) {
  const [filterText, setFilterText] = useState('');

  const filteredLinks = useMemo(() => {
    if (!filterText.trim()) return links;
    const query = filterText.toLowerCase();
    return links.filter(link => link.title.toLowerCase().includes(query) || link.url.toLowerCase().includes(query));
  }, [links, filterText]);

  const copyLink = async (url: string) => {
    await navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) newSelection.delete(id);
    else newSelection.add(id);
    onSelectionChange(newSelection);
  };

  const toggleSelectAll = () => {
    const allFilteredSelected = filteredLinks.every(l => selectedIds.has(l.id));
    const newSelection = new Set(selectedIds);
    if (allFilteredSelected) {
      filteredLinks.forEach(l => newSelection.delete(l.id));
    } else {
      filteredLinks.forEach(l => newSelection.add(l.id));
    }
    onSelectionChange(newSelection);
  };

  const allFilteredSelected = filteredLinks.length > 0 && filteredLinks.every(l => selectedIds.has(l.id));
  const someFilteredSelected = filteredLinks.some(l => selectedIds.has(l.id)) && !allFilteredSelected;

  if (links.length === 0) {
    return <div className="text-center py-12 text-muted-foreground"><p>No links found in this PDF</p></div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Filter by title or URL..." value={filterText} onChange={(e) => setFilterText(e.target.value)} className="pl-9 pr-9" />
          {filterText && (
            <button onClick={() => setFilterText('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      {filterText && <p className="text-sm text-muted-foreground">Showing {filteredLinks.length} of {links.length} links</p>}
      {filteredLinks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border border-border rounded-lg bg-card"><p>No links match your filter</p></div>
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12 text-center">
                  <Checkbox checked={allFilteredSelected} onCheckedChange={toggleSelectAll} aria-label="Select all" />
                </TableHead>
                <TableHead className="w-12 text-center font-semibold">#</TableHead>
                <TableHead className="font-semibold">Title</TableHead>
                <TableHead className="font-semibold">URL</TableHead>
                <TableHead className="w-20 text-center font-semibold">Page</TableHead>
                <TableHead className="w-24 text-center font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLinks.map((link, index) => (
                <TableRow key={link.id} className={`hover:bg-accent/50 transition-colors ${selectedIds.has(link.id) ? 'bg-accent/30' : ''}`}>
                  <TableCell className="text-center">
                    <Checkbox checked={selectedIds.has(link.id)} onCheckedChange={() => toggleSelection(link.id)} />
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground font-mono text-sm">{links.indexOf(link) + 1}</TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate" title={link.title}>{link.title}</TableCell>
                  <TableCell className="max-w-[300px]">
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate block font-mono text-sm" title={link.url}>{link.url}</a>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-secondary text-secondary-foreground font-mono text-sm">{link.pageNumber}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => copyLink(link.url)} className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground" title="Copy link"><Copy className="w-4 h-4" /></button>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground" title="Open link"><ExternalLink className="w-4 h-4" /></a>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
