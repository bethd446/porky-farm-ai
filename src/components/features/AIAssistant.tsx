import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { hapticLight } from '@/lib/haptic-feedback';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * Assistant IA virtuel - Inspiré de Hory AI Assistant
 * Chat flottant avec animations fluides
 */
export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Bonjour ! Je suis votre assistant PorcPro. Comment puis-je vous aider aujourd\'hui ?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    hapticLight();

    // Simuler une réponse de l'IA (à remplacer par une vraie API)
    setTimeout(() => {
      const responses = [
        'Je comprends votre question. Laissez-moi vous aider avec cela.',
        'Excellente question ! Voici ce que je peux vous dire...',
        'D\'accord, je vais vous guider pour résoudre ce problème.',
        'Merci pour cette information. Voici ma réponse...',
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: randomResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
      hapticLight();
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Bouton flottant */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            hapticLight();
          }}
          className={cn(
            'fixed bottom-6 right-6 z-50',
            'h-16 w-16 rounded-full',
            'bg-gradient-to-br from-primary to-primary/80',
            'shadow-2xl hover:shadow-primary/50',
            'flex items-center justify-center',
            'text-white',
            'transition-all duration-300',
            'hover:scale-110 active:scale-95',
            'animate-bounce-in'
          )}
          aria-label="Ouvrir l'assistant IA"
        >
          <MessageCircle className="h-7 w-7" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full border-2 border-background animate-pulse" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <Card
          className={cn(
            'fixed bottom-6 right-6 z-50',
            'w-[90vw] max-w-md h-[600px]',
            'shadow-2xl border-primary/20',
            'flex flex-col',
            'animate-scale-in',
            'bg-gradient-to-b from-card to-card/95 backdrop-blur-sm'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Assistant PorcPro</h3>
                <p className="text-xs text-muted-foreground">En ligne</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsOpen(false);
                hapticLight();
              }}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-2',
                    'animate-fade-in',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border shadow-sm'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {message.role === 'user' && (
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-card border border-border rounded-2xl px-4 py-2 shadow-sm">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-card">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tapez votre message..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                size="icon"
                className="h-10 w-10"
              >
                {isTyping ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              L'assistant peut vous aider avec vos porcs, statistiques et plus encore
            </p>
          </div>
        </Card>
      )}
    </>
  );
}

