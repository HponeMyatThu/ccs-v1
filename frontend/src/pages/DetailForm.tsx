import {
  ArrowLeft,
  Globe,
  Layout,
  Calendar,
  Settings,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { Page, Content } from "../types";

interface DetailViewProps {
  pages?: Page;
  contents: Content[];
  onBackAgentPage: () => void;
}

export default function DetailView({
  pages,
  contents,
  onBackAgentPage,
}: DetailViewProps) {
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

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
            <span className="text-xs font-bold uppercase tracking-wider">
              {pages?.section_name}
            </span>
          </div>

          <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">
            {pages?.page_name}
          </h1>

          <div className="flex flex-wrap gap-6 text-slate-500 text-sm">
            <div className="flex items-center gap-2">
              <Globe size={14} />
              <span>
                Language:{" "}
                <strong className="text-slate-700">
                  {pages?.lang.toUpperCase()}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              <span>
                Order:{" "}
                <strong className="text-slate-700">
                  {pages?.display_order}
                </strong>
              </span>
            </div>
            {pages?.attributes && (
              <div className="flex items-center gap-2">
                <Settings size={14} />
                <span className="font-mono text-[10px] bg-slate-50 px-2 py-1 rounded">
                  {pages?.attributes}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* 3. Content Sections (The Loop) */}
        <div className="space-y-24">
          {contents.length > 0 ? (
            contents.map((content, index) => (
              <section key={content.id || index} className="group border-b border-slate-50 pb-16 last:border-0">
                {/* Step Title - Spans full width or stays above */}
                {content.title && (
                  <div className="flex items-center gap-4 mb-8">
                    <span className="flex-shrink-0 w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                      {content.title}
                    </h2>
                  </div>
                )}

                {/* 2-Column Grid: Left (Content) | Right (Images) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                  
                  {/* Left Column: Descriptions */}
                  <div className="space-y-6">
                    {content.short_desc && (
                      <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-xl">
                        <p className="text-blue-800 font-medium italic">
                          {content.short_desc}
                        </p>
                      </div>
                    )}

                    {content.long_desc && (
                      <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-lg whitespace-pre-wrap">
                        {content.long_desc}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Images (The "Under" view for multiple images) */}
                  <div className="space-y-6">
                    {content.image_path ? (
                      <div className="flex flex-col gap-6 items-center justify-center min-h-screen">
                        {content.image_path.split(",").map((url, i) => (
                          <div
                            key={i}
                            className="group/img relative rounded-3xl overflow-hidden bg-slate-100 border-4 border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <img
                              src={`${API_BASE_URL}/pre-view${url.trim()}`}
                              alt={`Step ${index + 1} view ${i + 1}`}
                              className="w-full h-auto object-cover transition-transform duration-700 group-hover/img:scale-105"
                            />
                            {/* Caption for multiple images */}
                            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md text-white text-[10px] px-3 py-1 rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity">
                              Visual Reference {i + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-64 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                        <ImageIcon size={40} strokeWidth={1} className="mb-2 opacity-50" />
                        <p className="text-xs font-medium uppercase tracking-widest">No visual aid provided</p>
                      </div>
                    )}
                  </div>

                </div>
              </section>
            ))
          ) : (
            /* Empty State unchanged */
            <div className="py-20 text-center border-2 border-dashed  border-slate-100 rounded-3xl">
              <FileText className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-slate-400">No content entries found for this page.</p>
            </div>
          )}
        </div>
      </main>

      {/* 4. Simple Footer */}
      <footer className="max-w-4xl mx-auto px-6 py-20 border-t border-slate-100 text-center text-slate-400 text-xs">
        &copy; {new Date().getFullYear()} Agent Support System &bull; Ref ID:{" "}
        {pages?.id}
      </footer>
    </div>
  );
}
