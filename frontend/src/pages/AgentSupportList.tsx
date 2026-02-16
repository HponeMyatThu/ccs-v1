import { useState, useEffect } from "react";
import { Edit2, Eye, Plus, Search, FileText, Globe, Layout ,ArrowLeft, } from 'lucide-react';
import { apiService } from "../services/api";

interface AgentSupportListProps {
  onEditPage: (page: any) => void;
  onCreatePage: () => void;
  onBackAgentPage: () => void;
  onDetailPage: (page: any) => void;
}
export default function AgentSupportList({ onEditPage, onCreatePage,onBackAgentPage,onDetailPage}: AgentSupportListProps) {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      const data = await apiService.getPages();
      setPages(data);
    } catch (err) {
      console.error("Failed to fetch pages", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPages = pages.filter(p => 
    p.page_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.section_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      {/* Header Actions */}
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search pages or sections..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={onCreatePage}
                className="flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition-all"
              >
                <Plus className="w-4 h-4" />
                Create New Page
              </button>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-sm font-semibold text-slate-700">Page Details</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-700">Section</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-700">Language</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-700">Visibility</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-700 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-500">Loading pages...</td></tr>
                    ) : filteredPages.map((page) => (
                      <tr key={page.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                              <Layout className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-slate-900">{page.page_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-mono text-sm">{page.section_name}</td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-1.5 text-slate-600">
                            <Globe className="w-3.5 h-3.5" />
                            {page.lang.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            page.visible ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {page.visible ? 'Visible' : 'Hidden'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => onDetailPage(page)}
                              className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => onEditPage(page)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="Edit Page"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
      </div>
      
    </div>
  );
};