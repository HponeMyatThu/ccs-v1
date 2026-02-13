import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/api";
import { Page } from "../types";
import { Plus, Edit, Eye, EyeOff, LogOut, FileText } from "lucide-react";

interface PagesListProps {
  onCreatePage: () => void;
  onAgentSupportPage: () => void;
  onEditPage: (page: Page) => void;
}

export default function PagesList({
  onCreatePage,
  onAgentSupportPage,
  onEditPage,
}: PagesListProps) {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { logout, agent } = useAuth();

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      setLoading(true);
      const data = await apiService.getPages();
      setPages(data);
      setError("");
    } catch (err) {
      setError("Failed to load pages");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-2 rounded-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">
                Pages Manager
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">
                Agent:{" "}
                <span className="font-medium text-slate-900">
                  {agent?.agent_number}
                </span>
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">All Pages</h2>
            <p className="text-slate-600 mt-1">Manage your content pages</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onAgentSupportPage}
              className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
            >
              View Agent Support portal
            </button>
            <button
              onClick={onCreatePage}
              className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
            >
              <Plus className="w-5 h-5" />
              Create Page
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            </div>
          </div>
        ) : pages.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No pages yet
            </h3>
            <p className="text-slate-600 mb-6">
              Get started by creating your first page
            </p>
            <button
              onClick={onCreatePage}
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Page
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map((page) => (
              <div
                key={page.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">
                      {page.page_name}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {page.section_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {page.visible ? (
                      <Eye className="w-4 h-4 text-green-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500">Language:</span>
                    <span className="font-medium text-slate-900 uppercase">
                      {page.lang}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500">Type:</span>
                    <span className="font-medium text-slate-900 uppercase">
                      {page.content_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500">Order:</span>
                    <span className="font-medium text-slate-900">
                      {page.display_order}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onEditPage(page)}
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-900 px-4 py-2 rounded-lg font-medium hover:bg-slate-200 transition-all"
                >
                  <Edit className="w-4 h-4" />
                  Edit Page
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
