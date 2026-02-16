import { useState, useEffect } from "react";
import { ArrowLeft, Globe, Layout, Calendar, Settings, FileText, Image as ImageIcon } from 'lucide-react';
import { Page, Content } from '../types';

interface DetailViewProps {
  pages?: Page;
  contents: Content[];
  onBackAgentPage: () => void;
}

export default function DetailView({ pages, contents, onBackAgentPage }: DetailViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={onBackAgentPage}
              className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Pages
            </button>
          </div>
        </div>
      </div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 2. Page Header (Metadata) */}
        <header className="mb-16 border-b border-slate-100 pb-10">
          <div className="flex items-center gap-2 text-blue-600 mb-4">
            <Layout size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">{pages?.section_name}</span>
          </div>
          
          <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">
            {pages?.page_name}
          </h1>

          <div className="flex flex-wrap gap-6 text-slate-500 text-sm">
            <div className="flex items-center gap-2">
              <Globe size={14} />
              <span>Language: <strong className="text-slate-700">{pages?.lang.toUpperCase()}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              <span>Order: <strong className="text-slate-700">{pages?.display_order}</strong></span>
            </div>
            {pages?.attributes && (
              <div className="flex items-center gap-2">
                <Settings size={14} />
                <span className="font-mono text-[10px] bg-slate-50 px-2 py-1 rounded">{pages?.attributes}</span>
              </div>
            )}
          </div>
        </header>

        {/* 3. Content Sections (The Loop) */}
        <div className="space-y-20">
          {contents.length > 0 ? (
            contents.map((content, index) => (
              <section key={content.id || index} className="group relative">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  
                  {/* Content Text */}
                  <div className="md:col-span-8">
                    {content.title && (
                      <h2 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-blue-600 transition-colors">
                        {content.title}
                      </h2>
                    )}
                    
                    {content.short_desc && (
                      <p className="text-lg text-slate-500 mb-6 leading-relaxed italic">
                        {content.short_desc}
                      </p>
                    )}

                    {content.long_desc && (
                      <div className="prose prose-slate max-w-none text-slate-700 leading-loose whitespace-pre-wrap">
                        {content.long_desc}
                      </div>
                    )}
                  </div>

                  {/* Content Media (Images) */}
                  <div className="md:col-span-4">
                    {content.image_path ? (
                      <div className="space-y-4">
                        {content.image_path.split(',').map((url, i) => (
                          <div key={i} className="rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                            <img 
                              src={url.trim()} 
                              alt={`Content ${index} visual ${i}`} 
                              className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full min-h-[100px] border-2 border-dashed border-slate-100 rounded-2xl flex items-center justify-center text-slate-300">
                        <ImageIcon size={32} strokeWidth={1} />
                      </div>
                    )}
                  </div>
                </div>
              </section>
            ))
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
              <FileText className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-slate-400">No content entries found for this page.</p>
            </div>
          )}
        </div>
      </main>

      {/* 4. Simple Footer */}
      <footer className="max-w-4xl mx-auto px-6 py-20 border-t border-slate-100 text-center text-slate-400 text-xs">
        &copy; {new Date().getFullYear()} Agent Support System &bull; Ref ID: {pages?.id}
      </footer>
    </div>
  );
}