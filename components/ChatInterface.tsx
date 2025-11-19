
import React, { useState, useRef, useEffect } from 'react';
import { Message, Sender, Project } from '../types';
import { Send, Loader2, Bot, User, Folder, MessageSquare, Plus, Trash2, Clock, ChevronRight, FileText, Text } from 'lucide-react';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isProcessing: boolean;
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (id: string) => void;
  onCreateProject: () => void;
  onDeleteProject: (id: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  isProcessing,
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onDeleteProject
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'projects'>('chat');
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, activeTab]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [inputValue]);

  const handleSend = () => {
    if (inputValue.trim() && !isProcessing) {
      onSendMessage(inputValue);
      setInputValue('');
      // Reset height
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800">
      {/* Sidebar Header / Tabs */}
      <div className="flex-shrink-0 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
        <div className="p-4 pb-2">
             <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Bot size={18} className="text-white" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-white">MolSim Assistant</h2>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wide">System Online</span>
                    </div>
                </div>
            </div>
            
            <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700/50">
                <button 
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all ${
                        activeTab === 'chat' 
                        ? 'bg-slate-700 text-white shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                >
                    <MessageSquare size={14} />
                    Chat
                </button>
                <button 
                    onClick={() => setActiveTab('projects')}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all ${
                        activeTab === 'projects' 
                        ? 'bg-slate-700 text-white shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                >
                    <Folder size={14} />
                    Projects
                </button>
            </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        
        {/* CHAT VIEW */}
        <div className={`absolute inset-0 flex flex-col transition-transform duration-300 ${activeTab === 'chat' ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                        <Bot size={48} className="text-slate-600 mb-4" />
                        <p className="text-slate-400 text-sm max-w-[200px]">
                            Try saying: "Load PDB 1CRN" or paste a protein sequence to fold it.
                        </p>
                    </div>
                )}
                
                {messages.map((msg) => (
                <div
                    key={msg.id}
                    className={`flex w-full ${msg.sender === Sender.User ? 'justify-end' : 'justify-start'}`}
                >
                    <div className={`flex max-w-[90%] gap-2 ${msg.sender === Sender.User ? 'flex-row-reverse' : 'flex-row'}`}>
                        
                        {/* Avatar */}
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                            msg.sender === Sender.User ? 'bg-indigo-600' : 'bg-blue-600'
                        }`}>
                            {msg.sender === Sender.User ? <User size={12} /> : <Bot size={12} />}
                        </div>

                        {/* Bubble */}
                        <div
                            className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm break-words whitespace-pre-wrap ${
                            msg.sender === Sender.User
                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                            }`}
                        >
                            {msg.text}
                        </div>
                    </div>
                </div>
                ))}
                {isProcessing && (
                <div className="flex w-full justify-start">
                    <div className="flex max-w-[85%] gap-2 flex-row">
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                            <Bot size={12} />
                        </div>
                        <div className="p-3 rounded-2xl rounded-tl-none bg-slate-800 border border-slate-700">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                            </div>
                        </div>
                    </div>
                </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-800 bg-slate-900">
                <div className="relative flex items-end">
                <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter command or paste sequence..."
                    rows={1}
                    className="w-full bg-slate-800 text-slate-200 placeholder-slate-500 border border-slate-700 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono text-sm resize-none"
                    disabled={isProcessing}
                    style={{ minHeight: '46px', maxHeight: '120px' }}
                />
                <button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isProcessing}
                    className="absolute right-2 bottom-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors h-8 w-8 flex items-center justify-center"
                >
                    {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </button>
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Gemini 2.5 Active</span>
                    <span>v1.0.5</span>
                </div>
            </div>
        </div>

        {/* PROJECTS VIEW */}
        <div className={`absolute inset-0 flex flex-col bg-slate-900 transition-transform duration-300 ${activeTab === 'projects' ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex-1 overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Simulations</h3>
                    <button 
                        onClick={onCreateProject}
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors"
                    >
                        <Plus size={14} />
                        New Project
                    </button>
                </div>

                <div className="space-y-3">
                    {projects.map(project => (
                        <div 
                            key={project.id}
                            onClick={() => onSelectProject(project.id)}
                            className={`group p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                                activeProjectId === project.id 
                                ? 'bg-blue-900/20 border-blue-500/50 shadow-md shadow-blue-900/10' 
                                : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
                            }`}
                        >
                             {activeProjectId === project.id && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                             )}
                             
                             <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded-md ${activeProjectId === project.id ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'}`}>
                                        <FileText size={14} />
                                    </div>
                                    <span className={`font-medium text-sm ${activeProjectId === project.id ? 'text-white' : 'text-slate-200'}`}>
                                        {project.name}
                                    </span>
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }}
                                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={12} />
                                </button>
                             </div>

                             <div className="flex items-center gap-4 pl-9">
                                 <div className="flex flex-col">
                                     <span className="text-[10px] text-slate-500 font-mono uppercase">Structure</span>
                                     <span className="text-xs text-slate-300 font-mono">{project.pdbId || 'N/A'}</span>
                                 </div>
                                 <div className="flex flex-col">
                                     <span className="text-[10px] text-slate-500 font-mono uppercase">Modified</span>
                                     <span className="text-xs text-slate-300">{formatDate(project.lastModified)}</span>
                                 </div>
                             </div>
                             
                             <div className="mt-3 pl-9 flex items-center gap-2">
                                 <span className={`px-2 py-0.5 rounded-full text-[10px] border ${
                                     project.status === 'active' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                     project.status === 'completed' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                     'bg-slate-500/10 border-slate-500/20 text-slate-400'
                                 }`}>
                                     {project.status}
                                 </span>
                             </div>
                        </div>
                    ))}

                    {projects.length === 0 && (
                        <div className="text-center py-10 px-4 border border-dashed border-slate-800 rounded-xl">
                            <Folder size={32} className="text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-400 text-sm">No projects found.</p>
                            <button onClick={onCreateProject} className="mt-4 text-blue-400 text-xs hover:underline">Create your first project</button>
                        </div>
                    )}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default ChatInterface;
