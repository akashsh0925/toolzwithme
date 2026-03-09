import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const UsageGate = () => (
  <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm">
    <div className="text-center space-y-4 max-w-sm px-6">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-destructive/10 mx-auto">
        <Lock className="w-7 h-7 text-destructive" />
      </div>
      <h2 className="text-xl font-display font-bold text-foreground">Daily limit reached</h2>
      <p className="text-sm text-muted-foreground">
        You've used all 3 free uses for today. Sign in for unlimited access.
      </p>
      <div className="flex gap-3 justify-center">
        <Button asChild variant="outline" size="sm">
          <Link to="/login">Sign In</Link>
        </Button>
        <Button asChild size="sm">
          <Link to="/signup">Create Account</Link>
        </Button>
      </div>
    </div>
  </div>
);

export default UsageGate;
