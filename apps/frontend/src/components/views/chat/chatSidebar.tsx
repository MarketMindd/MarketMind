import {
  Loader2,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  SquarePen,
  Trash2,
} from 'lucide-react';
import { ChatSession } from '@market-mind/common';
import { cn } from '@/utils/tailwindUtils';
import { Button } from '../../elements/button';

interface ChatSidebarProps {
  isSidebarCollapsed: boolean;
  onToggle: () => void;
  sessions: ChatSession[];
  activeSessionId: string;
  isLoadingSessions: boolean;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
}

export const ChatSidebar = ({
  isSidebarCollapsed,
  onToggle,
  sessions,
  activeSessionId,
  isLoadingSessions,
  onNewChat,
  onSelectSession,
  onDeleteSession,
}: ChatSidebarProps) => {
  return (
    <aside
      className={cn(
        'border-r border-border/40 bg-card/20 flex flex-col flex-shrink-0 overflow-hidden',
        'transition-[width] duration-300 ease-in-out',
        isSidebarCollapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      {/*
       * Layout trick: the icon+label group shrinks to max-w-0 and gains mr-auto
       * when expanded so it pushes the toggle button to the right edge.
       * When collapsed the group is 0 px, and mx-auto on the toggle centers it
       * in the remaining 40 px inner space (64 px aside − 2×12 px px-3 padding).
       */}
      <div className="flex items-center px-3 border-b border-border/40 h-[65px] flex-shrink-0">
        <div
          className={cn(
            'flex items-center gap-2 overflow-hidden transition-[max-width] duration-300 ease-in-out',
            isSidebarCollapsed ? 'max-w-0' : 'max-w-[200px] mr-auto',
          )}
        >
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center animate-pulse-glow flex-shrink-0">
            <Sparkles size={16} className="text-primary" />
          </div>
          <span className="font-semibold text-sm whitespace-nowrap select-none">MarketMind AI</span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn(
            'text-muted-foreground hover:text-foreground flex-shrink-0',
            isSidebarCollapsed && 'mx-auto',
          )}
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isSidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={18} />}
        </Button>
      </div>

      {/* ── New Chat button ─────────────────────────────────────────────────── */}
      <div className="flex justify-center p-3 border-b border-border/40 flex-shrink-0">
        <Button
          onClick={onNewChat}
          variant="glow"
          size={isSidebarCollapsed ? 'icon' : 'default'}
          className={cn(
            'flex items-center overflow-hidden transition-[width] duration-300',
            isSidebarCollapsed ? 'justify-center' : 'w-full justify-center gap-2',
          )}
          title={isSidebarCollapsed ? 'New Chat' : undefined}
        >
          <SquarePen className="w-4 h-4 flex-shrink-0" />
          {!isSidebarCollapsed && (
            <span
              className={cn(
                'whitespace-nowrap overflow-hidden transition-[max-width,opacity] duration-300',
                isSidebarCollapsed ? 'max-w-0 opacity-0' : 'max-w-[120px] opacity-100',
              )}
            >
              New chat
            </span>
          )}
        </Button>
      </div>

      {/* ── "Recent" label ──────────────────────────────────────────────────── */}
      <div
        className={cn(
          'flex-shrink-0 overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out',
          isSidebarCollapsed ? 'max-h-0 opacity-0' : 'max-h-10 opacity-100',
        )}
      >
        <div className="px-4 py-2 mt-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider select-none">
          Recent
        </div>
      </div>

      {/* ── Session list (hidden when collapsed → only the 2 icon buttons show) ── */}
      <div
        className={cn(
          'flex-1 overflow-y-auto p-2 space-y-1 min-w-0',
          isSidebarCollapsed && 'hidden',
        )}
      >
        {isLoadingSessions ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span
              className={cn(
                'text-xs whitespace-nowrap overflow-hidden transition-[max-width,opacity] duration-300',
                isSidebarCollapsed ? 'max-w-0 opacity-0' : 'max-w-[160px] opacity-100',
              )}
            >
              Loading chats...
            </span>
          </div>
        ) : sessions.length === 0 ? (
          <div
            className={cn(
              'text-center py-10 text-xs text-muted-foreground select-none transition-opacity duration-300',
              isSidebarCollapsed ? 'opacity-0' : 'opacity-100',
            )}
          >
            No conversations yet.
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className={cn(
                'group flex items-center gap-2 rounded-lg cursor-pointer transition-all duration-200 p-2',
                isSidebarCollapsed && 'justify-center',
                activeSessionId === session.id
                  ? 'bg-primary/20 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              )}
              onClick={() => onSelectSession(session.id)}
              title={isSidebarCollapsed ? session.title : undefined}
            >
              <MessageSquare size={16} className="flex-shrink-0" />

              {/* Title: slides out with sidebar */}
              <span
                className={cn(
                  'text-sm truncate flex-1 min-w-0 whitespace-nowrap overflow-hidden',
                  'transition-[max-width,opacity] duration-300',
                  isSidebarCollapsed ? 'max-w-0 opacity-0' : 'max-w-full opacity-100',
                )}
              >
                {session.title}
              </span>

              {/* Delete: hidden when collapsed, revealed on row hover when expanded */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
                className={cn(
                  'p-1 rounded flex-shrink-0 hover:text-destructive transition-all duration-200',
                  isSidebarCollapsed
                    ? 'w-0 overflow-hidden opacity-0 pointer-events-none p-0'
                    : 'opacity-0 group-hover:opacity-100',
                )}
                title="Delete conversation"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};
