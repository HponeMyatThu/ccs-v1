import { useState, useEffect, FormEvent } from 'react';
import { apiService } from '../services/api';
import { Page, Content } from '../types';
import { ArrowLeft, Plus, Trash2, Upload, X, Save } from 'lucide-react';

interface ContentEntry {
  id?: number;
  title: string;
  short_desc: string;
  long_desc: string;
  images: { file?: File; url?: string; uploaded?: boolean }[];
}

interface PageFormProps {
  page?: Page;
  onBack: () => void;
  onSuccess: () => void;
}

export default function PageForm({ page, onBack, onSuccess }: PageFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [pageName, setPageName] = useState('');
  const [sectionName, setSectionName] = useState('');
  const [lang, setLang] = useState('en');
  const [contentType, setContentType] = useState('txt');
  const [visible, setVisible] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [attributes, setAttributes] = useState('');

  const [contents, setContents] = useState<ContentEntry[]>([
    { title: '', short_desc: '', long_desc: '', images: [] },
  ]);

  useEffect(() => {
    if (page) {
      setPageName(page.page_name);
      setSectionName(page.section_name);
      setLang(page.lang);
      setContentType(page.content_type);
      setVisible(page.visible);
      setDisplayOrder(page.display_order);
      setAttributes(page.attributes || '');
      loadContents(page.id);
    }
  }, [page]);

  const loadContents = async (pageId: number) => {
    try {
      const data = await apiService.getContentsByRef(pageId);
      if (data.length > 0) {
        setContents(
          data.map((content) => ({
            id: content.id,
            title: content.title || '',
            short_desc: content.short_desc || '',
            long_desc: content.long_desc || '',
            images: content.image_path
              ? content.image_path.split(',').map((url) => ({ url: url.trim(), uploaded: true }))
              : [],
          }))
        );
      }
    } catch (err) {
      console.error('Failed to load contents', err);
    }
  };

  const addContent = () => {
    setContents([...contents, { title: '', short_desc: '', long_desc: '', images: [] }]);
  };

  const removeContent = (index: number) => {
    setContents(contents.filter((_, i) => i !== index));
  };

  const updateContent = (index: number, field: keyof ContentEntry, value: string) => {
    const updated = [...contents];
    updated[index] = { ...updated[index], [field]: value };
    setContents(updated);
  };

  const addImage = (contentIndex: number, file: File) => {
    const updated = [...contents];
    updated[contentIndex].images.push({ file });
    setContents(updated);
  };

  const addImageUrl = (contentIndex: number, url: string) => {
    const updated = [...contents];
    updated[contentIndex].images.push({ url });
    setContents(updated);
  };

  const removeImage = (contentIndex: number, imageIndex: number) => {
    const updated = [...contents];
    updated[contentIndex].images.splice(imageIndex, 1);
    setContents(updated);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const pageData = {
        page_name: pageName,
        section_name: sectionName,
        lang,
        content_type: contentType,
        visible,
        display_order: displayOrder,
        attributes: attributes || undefined,
      };

      let pageId: number;
      if (page) {
        await apiService.updatePage(page.id, pageData);
        pageId = page.id;
      } else {
        const newPage = await apiService.createPage(pageData);
        pageId = newPage.id;
      }

      for (const content of contents) {
        const uploadedUrls: string[] = [];

        for (const image of content.images) {
          if (image.file) {
            const result = await apiService.uploadImage(image.file);
            uploadedUrls.push(result.image_path);
          } else if (image.url) {
            uploadedUrls.push(image.url);
          }
        }

        const contentData = {
          ref_id: pageId,
          title: content.title || undefined,
          short_desc: content.short_desc || undefined,
          long_desc: content.long_desc || undefined,
          image_path: uploadedUrls.length > 0 ? uploadedUrls.join(', ') : undefined,
        };

        if (content.id) {
          await apiService.updateContent(content.id, contentData);
        } else {
          await apiService.createContent(contentData);
        }
      }

      setSuccess(page ? 'Page updated successfully!' : 'Page created successfully!');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      setError('Failed to save page. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Pages
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            {page ? 'Edit Page' : 'Create New Page'}
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Page Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={pageName}
                  onChange={(e) => setPageName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  required
                  maxLength={20}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Section Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  required
                  maxLength={10}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Language <span className="text-red-500">*</span>
                </label>
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  required
                >
                  <option value="en">English (EN)</option>
                  <option value="es">Spanish (ES)</option>
                  <option value="fr">French (FR)</option>
                  <option value="de">German (DE)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Content Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  required
                >
                  <option value="txt">Text (TXT)</option>
                  <option value="img">Image (IMG)</option>
                  <option value="vid">Video (VID)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visible}
                    onChange={(e) => setVisible(e.target.checked)}
                    className="w-5 h-5 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
                  />
                  <span className="text-sm font-medium text-slate-700">Visible</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Attributes (JSON)
              </label>
              <textarea
                value={attributes}
                onChange={(e) => setAttributes(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                rows={3}
                placeholder='{"key": "value"}'
              />
            </div>

            <div className="border-t border-slate-200 pt-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Content Entries</h3>
                <button
                  type="button"
                  onClick={addContent}
                  className="flex items-center gap-2 bg-slate-100 text-slate-900 px-4 py-2 rounded-lg font-medium hover:bg-slate-200 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Content
                </button>
              </div>

              <div className="space-y-6">
                {contents.map((content, contentIndex) => (
                  <div
                    key={contentIndex}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-6 space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-slate-900">Content #{contentIndex + 1}</h4>
                      {contents.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeContent(contentIndex)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                      <input
                        type="text"
                        value={content.title}
                        onChange={(e) => updateContent(contentIndex, 'title', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white"
                        maxLength={50}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Short Description
                      </label>
                      <input
                        type="text"
                        value={content.short_desc}
                        onChange={(e) => updateContent(contentIndex, 'short_desc', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white"
                        maxLength={150}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Long Description
                      </label>
                      <textarea
                        value={content.long_desc}
                        onChange={(e) => updateContent(contentIndex, 'long_desc', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white"
                        rows={4}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Images</label>
                      <div className="space-y-3">
                        {content.images.map((image, imageIndex) => (
                          <div key={imageIndex} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200">
                            {image.file ? (
                              <span className="text-sm text-slate-700 flex-1 truncate">
                                {image.file.name}
                              </span>
                            ) : (
                              <span className="text-sm text-slate-700 flex-1 truncate">
                                {image.url}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => removeImage(contentIndex, imageIndex)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}

                        <div className="flex gap-3">
                          <label className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-dashed border-slate-300 text-slate-700 px-4 py-3 rounded-lg font-medium hover:border-slate-400 hover:bg-slate-50 cursor-pointer transition-all">
                            <Upload className="w-4 h-4" />
                            Upload File
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  addImage(contentIndex, file);
                                  e.target.value = '';
                                }
                              }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const url = prompt('Enter image URL:');
                              if (url) {
                                addImageUrl(contentIndex, url);
                              }
                            }}
                            className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-3 rounded-lg font-medium hover:bg-slate-50 transition-all"
                          >
                            <Plus className="w-4 h-4" />
                            Add URL
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : page ? 'Update Page' : 'Create Page'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
