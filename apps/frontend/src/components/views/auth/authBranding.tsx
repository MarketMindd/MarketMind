import Logo from '@/assets/logo.png';

export const AuthBranding = () => {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-background to-background p-12 flex-col justify-between relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative">
        <div className="flex items-center gap-3 mb-12">
          <img
            src={Logo}
            alt="MarketMind Logo"
            className="w-12 h-12 rounded-xl"
          />
          <span className="text-2xl font-semibold">
            <span className="text-foreground">Market</span>
            <span className="text-primary">Mind</span>
          </span>
        </div>

        <h1 className="text-4xl font-bold text-foreground leading-tight mb-6">
          AI-Powered Stock
          <br />
          <span className="gradient-text">Recommendations</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-md">
          Make smarter investment decisions with clear, explainable AI insights
          tailored to your risk profile.
        </p>
      </div>

      <div className="relative space-y-6">
        <div className="glass-card p-4 max-w-sm animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-primary font-semibold">AAPL</span>
            <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full">
              Invest
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Strong services growth and AI integration potential...
          </p>
        </div>

        <div className="glass-card p-4 max-w-xs ml-12 animate-fade-in stagger-1">
          <div className="text-2xl font-semibold text-foreground">87%</div>
          <div className="text-sm text-muted-foreground">Confidence Score</div>
        </div>
      </div>
    </div>
  );
};
