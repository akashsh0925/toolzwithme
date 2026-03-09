import { useAuth } from '@/hooks/useAuth';

interface UsageBadgeProps {
  remaining: number;
  limit: number;
}

const UsageBadge = ({ remaining, limit }: UsageBadgeProps) => {
  const { user } = useAuth();
  if (user) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-xs text-muted-foreground font-display">
      <span className={remaining <= 1 ? 'text-destructive font-semibold' : ''}>
        {remaining}/{limit}
      </span>{' '}
      free uses left today
    </div>
  );
};

export default UsageBadge;
