import React, { useState } from 'react';
import { Cpu, Copy, Check, ExternalLink, ChevronDown, Activity, Clock, Shield } from 'lucide-react';

const ModernAgentProfile = () => {
  const [copied, setCopied] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  
  const address = "0x12345678abcdef...9012";
  const agentStatus = "Active";

  const handleCopy = () => {
    // Simulate copy functionality
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleStats = () => {
    setStatsOpen(!statsOpen);
  };

  return (
    <div className="modern-card p-6 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-5">
          {/* Logo/Avatar */}
          <div className="h-16 w-16 bg-amber-50 rounded-full flex items-center justify-center">
            <Cpu className="h-8 w-8 text-amber-500" />
          </div>

          {/* Agent Info */}
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">BSCAI</h1>
              <div className="status-indicator active">
                <span className="status-dot active"></span>
                {agentStatus}
              </div>
              <div className="badge secondary">Agent</div>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Blockchain Intelligence, Simplified
            </p>

            {/* Address with copy functionality */}
            <div 
              className="mt-3 flex items-center px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-md cursor-pointer group max-w-fit"
              onClick={handleCopy}
            >
              <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                {address}
              </span>
              
              {copied ? (
                <Check className="h-4 w-4 text-green-500 ml-2" />
              ) : (
                <Copy className="h-4 w-4 text-gray-400 ml-2 group-hover:text-amber-500 transition-colors" />
              )}
              
              <a 
                href="#" 
                className="ml-2 text-gray-400 hover:text-amber-500 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
        
        {/* Quick Stats Toggle */}
        <button 
          className="modern-button secondary icon"
          onClick={toggleStats}
          aria-label="Toggle stats"
        >
          <ChevronDown className={`h-5 w-5 transition-transform ${statsOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>
      
      {/* Expandable Stats Section */}
      {statsOpen && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="modern-card p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-full">
                <Activity className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Active Tasks</div>
                <div className="text-2xl font-semibold text-gray-900 dark:text-gray-50">7</div>
              </div>
            </div>
          </div>
          
          <div className="modern-card p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-full">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Uptime</div>
                <div className="text-2xl font-semibold text-gray-900 dark:text-gray-50">12d 7h</div>
              </div>
            </div>
          </div>
          
          <div className="modern-card p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-full">
                <Shield className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Security</div>
                <div className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Protected</div>
              </div>
            </div>
          </div>
          
          <div className="modern-card p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-full">
                <Cpu className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Memory Usage</div>
                <div className="text-2xl font-semibold text-gray-900 dark:text-gray-50">1.2 GB</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernAgentProfile;