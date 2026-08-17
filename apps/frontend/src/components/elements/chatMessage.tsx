import { Children, type ReactNode } from 'react';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import type { ChatMessage as ChatMessageType } from '@market-mind/common';
import { cn } from '../../utils/tailwindUtils';
import { colorizePriceChanges } from '../../utils/textUtils';

const colorizeChildren = (children: ReactNode): ReactNode =>
  Children.map(children, (child) => (typeof child === 'string' ? colorizePriceChanges(child) : child));

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isAI = message.role === 'model';
  const timestamp = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    : '';

  return (
    <div
      className={cn(
        'flex gap-3 animate-fade-in',
        isAI ? 'items-start' : 'items-start flex-row-reverse',
      )}
    >
      <div
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
          isAI ? 'bg-primary/20' : 'bg-secondary',
        )}
      >
        {isAI ? (
          <Bot size={18} className="text-primary" />
        ) : (
          <User size={18} className="text-muted-foreground" />
        )}
      </div>

      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3',
          isAI ? 'glass-card border border-border/40 text-foreground' : 'bg-primary text-primary-foreground',
        )}
      >
        <div className="text-sm leading-relaxed">
          {isAI ? (
            <ReactMarkdown
              components={{
                a: ({ href, children }) => {
                  if (href && href.startsWith('/')) {
                    return (
                      <Link
                        to={href}
                        className="text-primary hover:underline font-semibold"
                      >
                        {children}
                      </Link>
                    );
                  }
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-semibold"
                    >
                      {children}
                    </a>
                  );
                },
                h1: ({ children }) => <h1 className="text-lg font-bold mt-4 mb-2 first:mt-0">{colorizeChildren(children)}</h1>,
                h2: ({ children }) => <h2 className="text-base font-bold mt-3 mb-1.5 first:mt-0">{colorizeChildren(children)}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-bold mt-2 mb-1 first:mt-0">{colorizeChildren(children)}</h3>,
                p: ({ children }) => <p className="mb-2 last:mb-0">{colorizeChildren(children)}</p>,
                ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="mb-0.5 last:mb-0">{colorizeChildren(children)}</li>,
                code: ({ children }) => <code className="bg-secondary/60 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          ) : (
            <div className="whitespace-pre-wrap">{message.content}</div>
          )}
        </div>
        <span
          className={cn(
            'text-[10px] mt-2 block',
            isAI ? 'text-muted-foreground' : 'text-primary-foreground/70',
          )}
        >
          {timestamp}
        </span>
      </div>
    </div>
  );
};
