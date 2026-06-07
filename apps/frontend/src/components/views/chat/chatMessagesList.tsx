import { Bot } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '@market-mind/common';
import { ChatMessage } from '../../elements/chatMessage';

interface ChatMessagesListProps {
  messages: ChatMessageType[];
  isSendingMessage: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export const ChatMessagesList = ({
  messages,
  isSendingMessage,
  messagesEndRef,
}: ChatMessagesListProps) => {
  return (
    <div className="max-w-3xl mx-auto w-full space-y-6 flex-1">
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}

      {isSendingMessage && (
        <div className="flex gap-3 items-start animate-fade-in">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Bot size={18} className="text-primary" />
          </div>
          <div className="glass-card border border-border/40 rounded-2xl px-4 py-3 max-w-[80%] flex items-center gap-1.5 h-10">
            <span
              className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
              style={{ animationDelay: '0ms' }}
            />
            <span
              className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
              style={{ animationDelay: '150ms' }}
            />
            <span
              className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
              style={{ animationDelay: '300ms' }}
            />
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
