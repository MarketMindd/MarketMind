interface PortfolioStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const PortfolioState = ({
  title,
  message,
  actionLabel,
  onAction,
}: PortfolioStateProps) => {
  return (
    <section className="rounded-2xl border border-slate-800 bg-gradient-to-br from-[#121c34] to-[#0b162d] p-8 text-center">
      <h2 className="text-2xl font-semibold text-slate-100">{title}</h2>
      <p className="mt-2 text-base text-slate-400">{message}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 rounded-xl border border-cyan-400 px-4 py-2 text-sm font-semibold text-cyan-300 hover:bg-cyan-400/10"
        >
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
};
