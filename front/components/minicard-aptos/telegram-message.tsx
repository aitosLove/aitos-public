"use client";

import React, { useState, useEffect } from "react";
import { REFRESH_INTERVAL } from "./config";
import { getTgMessageRecord } from "@/lib/action";
import { MessageSquare, Activity, RefreshCw, ChevronDown, ChevronUp, CheckCircle, XCircle, Clock, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface TelegramMessage {
  id: string;
  content: string;
  status: "pending" | "sent" | "failed";
  sentAt: Date | null;
  recipient?: string;
  channel?: string;
}

export function TelegramMessageCard() {
  const [messages, setMessages] = useState<TelegramMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchMessages = async () => {
    try {
      const data = await getTgMessageRecord();
      setMessages(data?.map(item => ({
        id: item.id,
        content: item.content.toString(),
        status: item.status,
        sentAt: item.sentAt,
      })) || []);
    } catch (err) {
      setError('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };
  
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchMessages();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const toggleMessageExpansion = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'failed':
        return <XCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />;
      case 'pending':
        return <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />;
      default:
        return <MessageSquare className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return "text-emerald-600 dark:text-emerald-400";
      case 'failed':
        return "text-rose-600 dark:text-rose-400";
      case 'pending':
        return "text-amber-600 dark:text-amber-400";
      default:
        return "text-slate-600 dark:text-slate-400";
    }
  };

  const formatTime = (date: Date | null) => {
    if (!date) return '--:--';
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatTimestamp = (date: Date | null) => {
    if (!date) return '';
    
    const messageDate = new Date(date);
    const now = new Date();
    
    // Same day
    if (messageDate.toDateString() === now.toDateString()) {
      return formatTime(date);
    }
    
    // Within the last week
    const dayDiff = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));
    if (dayDiff < 7) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return `${days[messageDate.getDay()]} ${formatTime(date)}`;
    }
    
    // Older messages
    return messageDate.toLocaleDateString('en-US', {
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="bg-card-background p-6 rounded-xl border border-border shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-primary">Telegram Messages</h2>
          <p className="text-sm text-muted-foreground mt-1">Outgoing notification messages</p>
        </div>
        <button 
          className="p-2 text-muted-foreground hover:text-primary transition-colors"
          onClick={handleManualRefresh}
        >
          <RefreshCw className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="space-y-4 max-h-[56rem] overflow-y-auto pr-1">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="py-3 animate-pulse">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 w-24 bg-primary/10 rounded"></div>
                  <div className="h-3 w-16 bg-primary/10 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-24 bg-primary/5 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-3 text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No messages available
          </div>
        ) : (
          messages.map((message) => {
            const isExpanded = expandedMessages.has(message.id);
            const shouldTruncate = message.content.length > 150;
            
            return (
              <div 
                key={message.id}
                className="border-b border-border/30 last:border-0 py-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-1 ${getStatusColor(message.status)}`}>
                      {getStatusIcon(message.status)}
                      <span className="text-xs font-medium capitalize">{message.status}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(message.sentAt)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(message.content, message.id);
                      }}
                      className="p-1 text-muted-foreground hover:text-primary transition-colors"
                      title="Copy message"
                    >
                      {copiedId === message.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    {shouldTruncate && (
                      <button 
                        onClick={(e) => toggleMessageExpansion(message.id, e)}
                        className="p-1 text-muted-foreground hover:text-primary transition-colors ml-1"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                </div>
                <div className={`${shouldTruncate && !isExpanded ? 'max-h-32 overflow-hidden relative' : ''}`}>
                  <div className="message-content bg-primary/5 rounded-lg p-3">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      className="prose prose-sm max-w-none dark:prose-invert prose-pre:bg-primary/10 prose-pre:p-2 prose-pre:rounded prose-headings:mt-2 prose-headings:mb-1"
                    >
                      {shouldTruncate && !isExpanded 
                        ? `${message.content.substring(0, 150)}...`
                        : message.content
                      }
                    </ReactMarkdown>
                  </div>
                  {shouldTruncate && !isExpanded && (
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card-background to-transparent pointer-events-none"></div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5" />
          <span>Updates every {REFRESH_INTERVAL / 1000}s</span>
        </div>
        <span>Showing {messages.length} message{messages.length !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}