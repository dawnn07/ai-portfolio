"use client";
import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { Send, Terminal, User, Bot, ChevronDown } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Screenplay, textsToScreenplay } from '@/features/messages/messages';
import { ViewerContext } from '@/features/vrmViewer/viewerContext';
import { speakCharacter } from '@/features/messages/speakCharacter';
import { motion, AnimatePresence } from "framer-motion";
import { DEFAULT_PARAM } from '@/features/constants/koeiroParam';
import { SYSTEM_PROMPT } from '@/features/constants/systemPromptConstants';
import { getChatResponseStream } from '@/features/chat/openAiChat';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface Message {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date | null;
}

const TerminalChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'system',
      content: 'Terminal Chat v2.0.0 with AI initialized...',
      timestamp: null
    },
    {
      id: 2,
      role: 'system',
      content: 'Type your message and press Enter to chat with AI.',
      timestamp: null
    }
  ]);

  const { viewer } = useContext(ViewerContext);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [chatProcessing, setChatProcessing] = useState(false);
  const messageIdCounterRef = useRef(3);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // API Keys from environment variables
  const koeiroKey = process.env.NEXT_PUBLIC_KOKORO_API_KEY!;
  const cohereKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY!;
  const koeiroParam = DEFAULT_PARAM;
  const systemPrompt = SYSTEM_PROMPT;

  useEffect(() => {
    // Set timestamps after hydration
    const now = new Date();
    setMessages(prev => prev.map(msg => ({
      ...msg,
      timestamp: msg.timestamp || now
    })));

    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSpeakAi = useCallback(
    async (
      screenplay: Screenplay,
      onStart?: () => void,
      onEnd?: () => void
    ) => {
      if (koeiroKey && viewer) {
        speakCharacter(screenplay, viewer, koeiroKey, onStart, onEnd);
      }
    },
    [viewer, koeiroKey]
  );

  const handleSendChat = useCallback(
    async (text: string) => {
      if (!cohereKey) {
        alert("Cohere API Key is not set in environment variables.");
        return;
      }
      const newMessage = text.trim();
      if (!newMessage) return;

      setChatProcessing(true);
      setIsTyping(true);

      // Add user message to display
      const userMessageId = messageIdCounterRef.current++;

      const userMessage: Message = {
        id: userMessageId,
        role: "user",
        content: newMessage,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);

      // Prepare messages for Cohere API
      const chatMessages: Message[] = [
        {
          id: 0,
          role: "system",
          content: systemPrompt,
          timestamp: null
        },
        ...messages.filter(msg => msg.role !== 'system' || msg.id <= 2),
        userMessage
      ];

      try {
        const stream = await getChatResponseStream(chatMessages, cohereKey);
        const reader = stream.getReader();

        // Create assistant message placeholder immediately
        const assistantMessageId = messageIdCounterRef.current++;

        const assistantMessage: Message = {
          id: assistantMessageId,
          role: "assistant",
          content: "",
          timestamp: new Date()
        };

        // Add assistant message placeholder
        setMessages(prev => [...prev, assistantMessage]);

        const sentences: string[] = [];
        let receivedMessage = "";
        let tag = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          if (value && typeof value === 'string') {
            receivedMessage += value;

            console.log("Full response so far:", receivedMessage);

            const tagMatch = receivedMessage.match(/^\[(.*?)\]/);
            if (tagMatch && tagMatch[0]) {
              tag = tagMatch[0];
              receivedMessage = receivedMessage.slice(tag.length);
            }

            // Update the assistant message in real-time
            setMessages(prev => prev.map(msg =>
              msg.id === assistantMessageId
                ? { ...msg, content: receivedMessage }
                : msg
            ));

            // Handle speech synthesis if needed
            if (koeiroKey && viewer) {
              const sentenceMatch = receivedMessage.match(
                /^(.+[.!?。．！？\n]|.{10,}[、,])/
              );

              console.log("Sentence match:", receivedMessage, sentenceMatch);

              if (sentenceMatch && sentenceMatch[0]) {
                const sentence = sentenceMatch[0];
                sentences.push(sentence);

                const aiText = `${tag} ${sentence}`
                const aiTalks = textsToScreenplay([aiText], koeiroParam);
                console.log("Converted screenplay:", aiTalks);
                if (aiTalks.length > 0) {
                  handleSpeakAi(aiTalks[0]);
                }
              }
            }
          }
        }

        console.log("Final received message:", receivedMessage);

        // Final update to ensure complete message is displayed
        setMessages(prev => prev.map(msg =>
          msg.id === assistantMessageId
            ? { ...msg, content: receivedMessage || "I apologize, but I couldn't generate a response." }
            : msg
        ));

      } catch (error) {
        console.error("Cohere API Error:", error);

        // Add error message
        const errorMessageId = messageIdCounterRef.current++;

        setMessages(prev => [...prev, {
          id: errorMessageId,
          role: "assistant",
          content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date()
        }]);
      } finally {
        setChatProcessing(false);
        setIsTyping(false);
      }
    },
    [cohereKey, systemPrompt, messages, handleSpeakAi, koeiroParam, koeiroKey, viewer]
  );

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

  const handleSendMessage = async () => {
    if (!inputValue.trim() || chatProcessing) return;

    const messageText = inputValue;
    setInputValue('');

    await handleSendChat(messageText);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const MessageIcon = ({ type }: { type: string }) => {
    switch (type) {
      case 'user':
        return <User className="w-3 h-3 sm:w-4 sm:h-4 text-chart-1" />;
      case 'assistant':
        return <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-chart-2" />;
      case 'system':
        return <Terminal className="w-3 h-3 sm:w-4 sm:h-4 text-chart-3" />;
      default:
        return <Terminal className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />;
    }
  };

  console.log("Rendering TerminalChat with messages:", messages);

  return (
    <motion.div className={cn(
      "w-full sm:max-w-xl sm:mx-auto max-h-[85vh] bg-background/90 text-foreground flex flex-col border-0 sm:border-2"
    )}
      animate={{ height: isOpen ? "100vh" : "auto" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}>
      <div className="flex items-center justify-between p-2 sm:p-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-chart-3" />
          <span className="text-sm font-semibold">Terminal Chat</span>
        </div>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant={"outline"} className={cn('h-6 w-6 rounded-none')}>
          <ChevronDown className={cn("transition-transform duration-300 ease-in-out", isOpen ? 'rotate-0' : 'rotate-180')} />
        </Button>
      </div>
      {/* Messages Container */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="messages"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-3"
          >
            {messages.map((message) => (
              <div key={message.id} className="flex items-start gap-2 sm:gap-3 group">
                <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                  <MessageIcon type={message.role} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                    <span className={`text-xs font-semibold ${message.role === 'user' ? 'text-chart-1' :
                        message.role === 'assistant' ? 'text-chart-2' :
                          'text-chart-3'
                      }`}>
                      {message.role === 'user' ? 'user@terminal' :
                        message.role === 'assistant' ? 'dawn@terminal' :
                          'system@terminal'}
                    </span>
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>

                  <div className={`text-xs sm:text-sm leading-relaxed ${message.role === 'user' ? 'text-chart-1' :
                      message.role === 'assistant' ? 'text-chart-2' :
                        'text-chart-3'
                    }`}>
                    <span className="text-muted-foreground select-none">$ </span>
                    <span className="whitespace-pre-wrap break-words overflow-wrap-anywhere">
                      {message.content}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                  <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-chart-2" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                    <span className="text-xs font-semibold text-chart-2">
                      dawn@terminal
                    </span>
                    <span className="text-xs text-muted-foreground">thinking...</span>
                  </div>
                  <div className="text-xs sm:text-sm text-chart-2">
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="border-t border-border bg-card p-2 sm:p-4 min-w-0">
        <div className="flex items-start gap-2 sm:gap-3">
          <User className="w-4 h-4 sm:w-5 sm:h-5 text-chart-1 flex-shrink-0 mt-1.5 sm:mt-2" />
          <span className="text-xs sm:text-sm text-chart-1 flex-shrink-0 mt-1.5 sm:mt-2 hidden sm:inline">
            user@terminal:~$
          </span>

          <div className="flex-1 min-w-0 relative">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={chatProcessing}
              className="w-full bg-transparent text-foreground placeholder-muted-foreground border-none outline-none font-mono text-xs sm:text-sm py-2 resize-none focus:ring-0 min-h-[2rem] sm:min-h-[2.5rem] max-h-24 sm:max-h-32 overflow-y-auto shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 break-all overflow-wrap-anywhere disabled:opacity-50"
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
            disabled={!inputValue.trim() || chatProcessing}
            className="p-1.5 sm:p-2 text-primary hover:text-primary/80 disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors duration-200 hover:bg-accent rounded-md border border-border hover:border-ring focus:ring-2 focus:ring-ring focus:ring-offset-2 mt-1 flex-shrink-0"
          >
            <Send className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>

        <div className="mt-1 sm:mt-2 text-xs text-muted-foreground sm:hidden">
          <span className="hidden sm:inline">Press Enter to send • Shift+Enter for new line</span>
          {!cohereKey && (
            <span className="text-red-400 ml-2 block sm:inline">
              ⚠ API key not configured
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TerminalChat;