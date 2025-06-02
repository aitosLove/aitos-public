"use client";

import React, { useState, useEffect } from "react";
import { REFRESH_INTERVAL } from "./config";
import { getXPostsRecord } from "@/lib/action";
import { MessageSquare, Activity, RefreshCw, ChevronDown, ChevronUp, CheckCircle, XCircle, Clock, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface XPost {
  id: string;
  url: string | null;
  timestamp: string | null;
  text: string | null;
  authorUsername: string;
  authorDisplayName: string | null;
  replies: number | null;
  retweets: number | null;
  likes: number | null;
  views: number | null;
}

export function XpostDisplay() {
  const [posts, setPosts] = useState<XPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      const data = await getXPostsRecord();
      setPosts(data || []);
    } catch (err) {
      setError('Failed to fetch X posts');
    } finally {
      setLoading(false);
    }
  };
  
  const copyToClipboard = (text: string | null, id: string) => {
    if (!text) return;
    
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchPosts();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const togglePostExpansion = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getEngagementIcon = (type: string) => {
    switch (type) {
      case 'replies':
        return <MessageSquare className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />;
      case 'retweets':
        return <RefreshCw className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'likes':
        return <CheckCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />;
      default:
        return <Activity className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />;
    }
  };

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return '';
    
    const postDate = new Date(timestamp);
    const now = new Date();
    
    // Same day
    if (postDate.toDateString() === now.toDateString()) {
      return postDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
    
    // Within the last week
    const dayDiff = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24));
    if (dayDiff < 7) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return `${days[postDate.getDay()]} ${postDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })}`;
    }
    
    // Older posts
    return postDate.toLocaleDateString('en-US', {
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
          <h2 className="text-xl font-semibold text-primary">X Posts</h2>
          <p className="text-sm text-muted-foreground mt-1">Recent posts from X (formerly Twitter)</p>
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
        ) : posts.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No posts available
          </div>
        ) : (
          posts.map((post) => {
            const isExpanded = expandedPosts.has(post.id);
            const shouldTruncate = post.text && post.text.length > 150;
            
            return (
              <div 
                key={post.id}
                className="border-b border-border/30 last:border-0 py-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-primary">
                      <span className="text-md font-semibold">@{post.authorUsername}</span>
                      {post.authorDisplayName && (
                        <span className="text-xs text-muted-foreground">
                          ({post.authorDisplayName})
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(post.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    {post.text && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(post.text, post.id);
                        }}
                        className="p-1 text-muted-foreground hover:text-primary transition-colors"
                        title="Copy post"
                      >
                        {copiedId === post.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    )}
                    {shouldTruncate && (
                      <button 
                        onClick={(e) => togglePostExpansion(post.id, e)}
                        className="p-1 text-muted-foreground hover:text-primary transition-colors ml-1"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                </div>
                {post.text && (
                  <div className={`${shouldTruncate && !isExpanded ? 'max-h-32 overflow-hidden relative' : ''}`}>
                    <div className="post-content bg-primary/5 rounded-lg p-3">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        className="prose prose-sm max-w-none dark:prose-invert prose-pre:bg-primary/10 prose-pre:p-2 prose-pre:rounded prose-headings:mt-2 prose-headings:mb-1"
                      >
                        {shouldTruncate && !isExpanded 
                          ? `${post.text.substring(0, 150)}...`
                          : post.text
                        }
                      </ReactMarkdown>
                    </div>
                    {shouldTruncate && !isExpanded && (
                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card-background to-transparent pointer-events-none"></div>
                    )}
                  </div>
                )}
                
                <div className="flex mt-0 gap-4 text-xs text-muted-foreground">
                
                  {post.url && (
                    <a 
                      href={post.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline ml-auto"
                    >
                      View original
                    </a>
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
        <span>Showing {posts.length} post{posts.length !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}