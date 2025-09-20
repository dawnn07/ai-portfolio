"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Send, Terminal, User, Bot } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface Message {
  id: number;
  type: string;
  content: string;
  timestamp: Date | null;
}

const TerminalChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'system',
      content: 'Terminal Chat v1.0.0 initialized...',
      timestamp: null // Will be set after hydration
    },
    {
      id: 2,
      type: 'system',
      content: 'Type your message and press Enter to chat.',
      timestamp: null // Will be set after hydration
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [messageIdCounter, setMessageIdCounter] = useState(3); // Start from 3 since we have 2 initial messages
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const now = new Date();
    setMessages(prev => prev.map(msg => ({
      ...msg,
      timestamp: msg.timestamp || now
    })));
    setIsHydrated(true);
    
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 128);
      textarea.style.height = `${newHeight}px`;
    }
  }, [inputValue]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateResponse = async (userMessage: string) => {
    setIsTyping(true);
    
    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const responses = [
      `Processing command: "${userMessage}"`,
      'Command executed successfully.',
      'Data retrieved from neural network...',
      'Analysis complete. How can I assist further?',
      'System status: All operations nominal.',
      'Request acknowledged. Processing...',
      'Terminal response generated.',
    ];
    
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    const newMessageId = messageIdCounter;
    setMessageIdCounter(prev => prev + 1);
    
    setMessages(prev => [...prev, {
      id: newMessageId,
      type: 'assistant',
      content: response,
      timestamp: new Date()
    }]);
    
    setIsTyping(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newMessageId = messageIdCounter;
    setMessageIdCounter(prev => prev + 1);

    const userMessage: Message = {
      id: newMessageId,
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    await simulateResponse(inputValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date | null) => {
    if (!date || !isHydrated) return '--:--:--'; // Show placeholder during SSR
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const MessageIcon = ({ type }: { type: string }) => {
    switch(type) {
      case 'user':
        return <User className="w-4 h-4 text-chart-1" />;
      case 'assistant':
        return <Bot className="w-4 h-4 text-chart-2" />;
      case 'system':
        return <Terminal className="w-4 h-4 text-chart-3" />;
      default:
        return <Terminal className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="max-w-xl min-w-xl max-h-[85vh] mx-auto h-screen bg-background/90 text-foreground flex flex-col border-2">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div key={message.id} className="flex items-start gap-3 group">
            <div className="flex-shrink-0 mt-1">
              <MessageIcon type={message.type} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-semibold ${
                  message.type === 'user' ? 'text-chart-1' :
                  message.type === 'assistant' ? 'text-chart-2' :
                  'text-chart-3'
                }`}>
                  {message.type === 'user' ? 'user@terminal' :
                   message.type === 'assistant' ? 'ai@terminal' :
                   'system@terminal'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatTime(message.timestamp)}
                </span>
              </div>
              
              <div className={`text-sm leading-relaxed ${
                message.type === 'user' ? 'text-chart-1' :
                message.type === 'assistant' ? 'text-chart-2' :
                'text-chart-3'
              }`}>
                <span className="text-muted-foreground select-none">$ </span>
                <span className="whitespace-pre-wrap break-words overflow-wrap-anywhere">{message.content}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <Bot className="w-4 h-4 text-chart-2" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-chart-2">
                  ai@terminal
                </span>
                <span className="text-xs text-muted-foreground">typing...</span>
              </div>
              <div className="text-sm text-chart-2">
                <span className="text-muted-foreground select-none">$ </span>
                <span className="inline-flex gap-1">
                  <span className="animate-pulse">●</span>
                  <span className="animate-pulse">●</span>
                  <span className="animate-pulse">●</span>
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card p-4 min-w-0">
        <div className="flex items-start gap-3">
          <User className="w-5 h-5 text-chart-1 flex-shrink-0 mt-2" />
          <span className="text-sm text-chart-1 flex-shrink-0 mt-2">user@terminal:~$</span>
          
          <div className="flex-1 min-w-0 relative">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full bg-transparent text-foreground placeholder-muted-foreground border-none outline-none font-mono text-sm py-2 resize-none focus:ring-0 min-h-[2.5rem] max-h-32 overflow-y-auto shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 break-all overflow-wrap-anywhere"
              rows={1}
              style={{ 
                height: 'auto',
                wordBreak: 'break-all',
                overflowWrap: 'anywhere'
              }}
            />
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="p-2 text-primary hover:text-primary/80 disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors duration-200 hover:bg-accent rounded-md border border-border hover:border-ring focus:ring-2 focus:ring-ring focus:ring-offset-2 mt-1 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        <div className="mt-2 text-xs text-muted-foreground">
          Press Enter to send • Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

export default TerminalChat;