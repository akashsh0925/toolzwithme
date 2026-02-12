import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs`;

const SAFE_URL_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'];

export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return SAFE_URL_PROTOCOLS.includes(parsed.protocol);
  } catch {
    return false;
  }
}

export interface ExtractedLink {
  id: string;
  url: string;
  title: string;
  pageNumber: number;
}

export interface ExtractionResult {
  links: ExtractedLink[];
  totalPages: number;
  fileName: string;
}

export async function extractLinksFromPDF(
  file: File,
  onProgress?: (progress: number) => void
): Promise<ExtractionResult> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const links: ExtractedLink[] = [];
  const totalPages = pdf.numPages;

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const annotations = await page.getAnnotations();

    for (const annotation of annotations) {
      if (annotation.subtype === 'Link' && annotation.url && isSafeUrl(annotation.url)) {
        links.push({
          id: `${pageNum}-${links.length}`,
          url: annotation.url,
          title: annotation.title || annotation.url,
          pageNumber: pageNum,
        });
      }
    }

    if (onProgress) {
      onProgress((pageNum / totalPages) * 100);
    }
  }

  return { links, totalPages, fileName: file.name };
}

export function exportToCSV(links: ExtractedLink[], fileName: string): void {
  const headers = ['Title', 'URL', 'Page Number'];
  const rows = links.map(link => [
    `"${link.title.replace(/"/g, '""')}"`,
    `"${link.url.replace(/"/g, '""')}"`,
    link.pageNumber.toString(),
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName.replace('.pdf', '')}_links.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function copyLinksToClipboard(links: ExtractedLink[]): Promise<void> {
  const text = links.map(link => link.url).join('\n');
  return navigator.clipboard.writeText(text);
}
