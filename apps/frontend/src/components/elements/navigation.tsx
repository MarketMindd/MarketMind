import { ArrowRight, Briefcase, LayoutDashboard, LogOut, MessageSquare, type LucideIcon } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { APP_ROUTES } from '../../consts/routes';
import { useClientQueries } from '../../hooks/useClientQueries';
import { useIsAuthenticated } from '../../hooks/useIsAuthenticated';
import { cn } from '../../utils/tailwindUtils';
import { Button } from './button';

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    auth: { useSignOut },
  } = useClientQueries();
  const { mutate: signOut } = useSignOut({
    onSuccess: () => {
      navigate(APP_ROUTES.SIGN_IN);
    },
  });

  const isAuthenticated = useIsAuthenticated();

  type NavItem = { path: string; label: string; icon: LucideIcon; disabled?: boolean };
  const navItems: NavItem[] = [
    { path: APP_ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { path: APP_ROUTES.PORTFOLIO, label: 'Portfolio', icon: Briefcase },
    { path: APP_ROUTES.CHAT, label: 'AI Chat', icon: MessageSquare },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to={isAuthenticated ? APP_ROUTES.DASHBOARD : APP_ROUTES.HOME}
            className="flex items-center gap-2 group"
          >
            <img src={logo} alt="MarketMind Logo" className="w-9 h-9 rounded-lg" />
            <span className="text-xl font-semibold">
              <span className="text-foreground">Market</span>
              <span className="text-primary">Mind</span>
            </span>
          </Link>

          {isAuthenticated ? (
            <>
              <div className="hidden sm:flex items-center gap-1">
                {navItems.map(({ path, label, icon: Icon, disabled = false }) => {
                  if (disabled) {
                    return (
                      <div
                        key={path}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground/40 cursor-not-allowed select-none"
                        title="Coming Soon"
                      >
                        <Icon size={18} />
                        {label}
                      </div>
                    );
                  }
                  return (
                    <Link
                      key={path}
                      to={path}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                        location.pathname === path ||
                          (path === APP_ROUTES.CHAT && location.pathname.startsWith('/chat/'))
                          ? 'bg-primary/20 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
                      )}
                    >
                      <Icon size={18} />
                      {label}
                    </Link>
                  );
                })}
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => signOut()}
              >
                <LogOut size={18} />
                <span className="hidden sm:inline ml-2">Logout</span>
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to={APP_ROUTES.SIGN_IN}>
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to={APP_ROUTES.SIGN_UP}>
                <Button variant="glow">
                  Get Started
                  <ArrowRight size={18} />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      {isAuthenticated && (
        <div className="sm:hidden flex items-center justify-around py-2 border-t border-border/50">
          {navItems.map(({ path, label, icon: Icon, disabled = false }) => {
            if (disabled) {
              return (
                <div
                  key={path}
                  className="flex flex-col items-center gap-1 px-4 py-1 text-xs font-medium text-muted-foreground/40 cursor-not-allowed select-none"
                  title="Coming Soon"
                >
                  <Icon size={20} />
                  {label}
                </div>
              );
            }
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  'flex flex-col items-center gap-1 px-4 py-1 text-xs font-medium transition-all duration-200',
                  location.pathname === path ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                <Icon size={20} />
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
};
