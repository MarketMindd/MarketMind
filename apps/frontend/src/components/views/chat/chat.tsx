import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { ExplainMode } from '@market-mind/common';
import { useToast } from '@/hooks/useToast';
import { useClientQueries } from '../../../hooks/useClientQueries';
import { ChatEmptyState } from './chatEmptyState';
import { ChatInputFooter } from './chatInputFooter';
import { ChatMessagesList } from './chatMessagesList';
import { ChatSidebar } from './chatSidebar';

const getUserFirstName = () => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      const payload = JSON.parse(jsonPayload);
      if (payload.fullName) return payload.fullName.split(' ')[0];
    } catch {
      // fallback
    }
  }
  return 'User';
};

export const Chat = () => {
  const [searchParams] = useSearchParams();
  const symbolParam = searchParams.get('symbol');
  const promptParam = searchParams.get('prompt');
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId?: string }>();
  const activeSessionId = sessionId || '';

  const { chat } = useClientQueries();
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [pendingMessage, setPendingMessage] = useState('');
  const [explainMode, setExplainMode] = useState<ExplainMode>(
    () => (localStorage.getItem('chatExplainMode') as ExplainMode) || 'easy',
  );

  const handleExplainModeChange = (mode: ExplainMode) => {
    setExplainMode(mode);
    localStorage.setItem('chatExplainMode', mode);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: sessions = [], isLoading: isLoadingSessions } = chat.useGetChatSessions();
  const { mutate: createSession, isPending: isCreatingSession } = chat.useCreateChatSession({
    onSuccess: (newSession) => {
      navigate(`/chat/${newSession.id}`, { replace: true });
    },
    onError: (err) => {
      toast({
        title: 'Failed to start conversation',
        description: err.message || 'Could not create a new chat session. Please try again.',
        variant: 'destructive',
      });
      if (pendingMessage) {
        setInput(pendingMessage);
        setPendingMessage('');
      }
    },
  });

  const { mutate: deleteSession } = chat.useDeleteChatSession();

  const {
    data: messages = [],
    isLoading: isLoadingMessages,
    error: messagesError,
  } = chat.useGetChatMessages(activeSessionId);

  const { mutate: sendMessage, isPending: isSendingMessage } = chat.useSendChatMessage(
    activeSessionId,
    {
      onError: (err, variables) => {
        toast({
          title: 'Failed to send message',
          description: err.message || 'There was an error sending your question. Please try again.',
          variant: 'destructive',
        });
        setInput(variables.content);
        // First message failed — the session is now empty, clean it up
        if (messages.length === 0 && activeSessionId) {
          deleteSession(activeSessionId);
          navigate('/chat', { replace: true });
        }
      },
    },
  );

  const isPendingSend = isSendingMessage || isCreatingSession;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSendingMessage]);

  // Redirect to /chat on invalid session
  useEffect(() => {
    if (messagesError && activeSessionId) {
      toast({
        title: 'Error loading chat',
        description:
          'The requested conversation does not exist or you do not have permission to view it.',
        variant: 'destructive',
      });
      navigate('/chat', { replace: true });
    }
  }, [messagesError, activeSessionId, navigate, toast]);

  // If arriving via "Ask AI" with a symbol, navigate to an existing session or pre-fill input
  useEffect(() => {
    if (symbolParam && sessions.length > 0) {
      const targetTitle = `${symbolParam.toUpperCase()} Discussion`;
      const existingSession = sessions.find((s) => s.title === targetTitle);
      if (existingSession) {
        navigate(`/chat/${existingSession.id}`, { replace: true });
      }
    }
  }, [symbolParam, sessions, navigate]);

  // Pre-fill the composer when arriving via an "Ask AI" entry point
  useEffect(() => {
    if (activeSessionId) return;
    if (promptParam) {
      setInput(promptParam);
    } else if (symbolParam) {
      setInput(`Tell me about ${symbolParam.toUpperCase()}`);
    }
  }, [promptParam, symbolParam, activeSessionId]);

  // Send the pending message once the session is created and URL has updated
  useEffect(() => {
    if (pendingMessage && activeSessionId) {
      sendMessage({ content: pendingMessage, explainMode });
      setPendingMessage('');
    }
  }, [activeSessionId, pendingMessage, sendMessage, explainMode]);

  const handleSend = (text?: string) => {
    const textToSend = (typeof text === 'string' ? text.trim() : '') || input.trim();
    if (!textToSend || isSendingMessage) return;

    if (!activeSessionId) {
      setPendingMessage(textToSend);
      createSession(symbolParam ? { symbol: symbolParam } : { title: 'New Chat' });
    } else {
      sendMessage({ content: textToSend, explainMode });
    }
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDeleteSession = (id: string) => {
    if (activeSessionId === id) navigate('/chat');
    deleteSession(id);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-background relative">
      <ChatSidebar
        isSidebarCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed((c) => !c)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        isLoadingSessions={isLoadingSessions}
        onNewChat={() => navigate('/chat')}
        onSelectSession={(id) => navigate(`/chat/${id}`)}
        onDeleteSession={handleDeleteSession}
      />

      <main className="flex-1 flex flex-col overflow-hidden h-full">
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 flex flex-col min-h-0 relative">
          {isLoadingMessages && activeSessionId ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-sm">Retrieving message history...</span>
            </div>
          ) : !activeSessionId || messages.length === 0 ? (
            <ChatEmptyState
              firstName={getUserFirstName()}
              input={input}
              onInputChange={setInput}
              onKeyDown={handleKeyDown}
              onSend={handleSend}
              isPendingSend={isPendingSend}
              explainMode={explainMode}
              onExplainModeChange={handleExplainModeChange}
            />
          ) : (
            <ChatMessagesList
              messages={messages}
              isSendingMessage={isSendingMessage}
              messagesEndRef={messagesEndRef}
            />
          )}
        </div>

        {activeSessionId && messages.length > 0 && (
          <ChatInputFooter
            input={input}
            onInputChange={setInput}
            onKeyDown={handleKeyDown}
            onSend={handleSend}
            isPendingSend={isPendingSend}
            explainMode={explainMode}
            onExplainModeChange={handleExplainModeChange}
          />
        )}
      </main>
    </div>
  );
};
