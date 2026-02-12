import { Link2, FileText, Layers } from 'lucide-react';
import { ExtractionResult } from '@/lib/pdf-extractor';

interface ExtractionStatsProps {
  result: ExtractionResult;
}

export function ExtractionStats({ result }: ExtractionStatsProps) {
  const stats = [
    { icon: Link2, label: 'Links Found', value: result.links.length },
    { icon: Layers, label: 'Total Pages', value: result.totalPages },
    { icon: FileText, label: 'File', value: result.fileName, isText: true },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <stat.icon className="w-6 h-6 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            {stat.isText ? (
              <p className="font-medium truncate" title={String(stat.value)}>{stat.value}</p>
            ) : (
              <p className="text-2xl font-bold">{stat.value}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
