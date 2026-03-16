import React, { useEffect, useState, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { api, BASE_URL } from '../api';
import { motion } from 'motion/react';
import { Plus, Edit2, Trash2, Download, X, Image as ImageIcon, FileText } from 'lucide-react';

export const Admin = () => {
  const { t } = useLanguage();
  const [ppts, setPpts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPpt, setEditingPpt] = useState<any>(null);

  // Form state
  const [name, setName] = useState('');
  const [descRu, setDescRu] = useState('');
  const [sDescRu, setSDescRu] = useState('');
  const [descEn, setDescEn] = useState('');
  const [sDescEn, setSDescEn] = useState('');
  const [price, setPrice] = useState<number>(0.0);
  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);

  const fetchPpts = async () => {
    setLoading(true);
    try {
      const data = await api.ppt.getAll();
      setPpts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPpts();
  }, []);

  const openModal = (ppt: any = null) => {
    setEditingPpt(ppt);
    if (ppt) {
      setName(ppt.name);
      setDescRu(ppt.descriptionRu);
      setSDescRu(ppt.shortDescriptionRu);
      setDescEn(ppt.descriptionEn);
      setSDescEn(ppt.shortDescriptionEn);
      setPrice(ppt.price);
    } else {
      setName('');
      setDescRu('');
      setSDescRu('');
      setDescEn('');
      setSDescEn('');
      setPrice(0.0);
    }
    setFile(null);
    setImages([]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPpt(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('descRu', descRu);
    formData.append('sDescRu', sDescRu);
    formData.append('descEn', descEn);
    formData.append('sDescEn', sDescEn);
    formData.append('price', price.toString());

    if (file) {
      formData.append('file', file);
    }

    if (images.length > 0) {
      images.forEach((img) => formData.append('images', img));
    }

    try {
      if (editingPpt) {
        await api.ppt.update(editingPpt.id, formData);
      } else {
        if (!file) throw new Error('File is required for new presentation');
        await api.ppt.create(formData);
      }
      closeModal();
      fetchPpts();
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Error saving presentation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this presentation?')) {
      try {
        await api.ppt.delete(id);
        fetchPpts();
      } catch (error) {
        console.error(error);
        alert('Error deleting presentation');
      }
    }
  };

  // Drag & Drop handlers
  const onFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files;
    if (dropped && dropped.length > 0) {
      setFile(dropped[0]);
    }
  };

  const onImagesDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    if (dropped.length > 0) {
      setImages((prev) => [...prev, ...dropped]);
    }
  };

  const preventDefaults = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
      <div className="flex-grow bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{t('admin_dashboard')}</h1>
            <button
                onClick={() => openModal()}
                className="bg-[#fd2d55] text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-sm flex items-center gap-2"
            >
              <Plus size={20} />
              {t('create_new')}
            </button>
          </div>

          {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fd2d55]"></div>
              </div>
          ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="p-4 font-semibold text-gray-600">Image</th>
                      <th className="p-4 font-semibold text-gray-600">{t('name')}</th>
                      <th className="p-4 font-semibold text-gray-600">Bought</th>
                      <th className="p-4 font-semibold text-gray-600">Price</th>
                      <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {ppts.map((ppt) => (
                        <tr key={ppt.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-4">
                            <div className="w-16 h-12 bg-gray-100 rounded overflow-hidden">
                              {ppt.images && ppt.images.length > 0 ? (
                                  <img
                                      src={`${BASE_URL.replace('/api', '')}/${ppt.images[0].replace('./', '')}`}
                                      alt=""
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                  />
                              ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <ImageIcon size={20} />
                                  </div>
                              )}
                            </div>
                          </td>
                          <td className="p-4 font-medium text-gray-900">{ppt.name}</td>
                          <td className="p-4 text-gray-500">{ppt.bought}</td>
                          <td className="p-4 text-gray-500">{ppt.price}</td>
                          <td className="p-4">
                            <div className="flex justify-end gap-2">
                              <a
                                  href={`${BASE_URL.replace('/api', '')}/${ppt.path.replace('./', '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                  title={t('download')}
                              >
                                <Download size={20} />
                              </a>
                              <button
                                  onClick={() => openModal(ppt)}
                                  className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                                  title={t('edit')}
                              >
                                <Edit2 size={20} />
                              </button>
                              <button
                                  onClick={() => handleDelete(ppt.id)}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title={t('delete')}
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          </td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
              >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingPpt ? t('edit') : t('create_new')}
                  </h2>
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors p-2">
                    <X size={24} />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto flex-grow">
                  <form id="ppt-form" onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t('name')}</label>
                      <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#fd2d55] outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">{t('sdesc_ru')}</label>
                        <textarea
                            required
                            value={sDescRu}
                            onChange={(e) => setSDescRu(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#fd2d55] outline-none h-24 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">{t('sdesc_en')}</label>
                        <textarea
                            required
                            value={sDescEn}
                            onChange={(e) => setSDescEn(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#fd2d55] outline-none h-24 resize-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">{t('desc_ru')}</label>
                        <textarea
                            required
                            value={descRu}
                            onChange={(e) => setDescRu(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#fd2d55] outline-none h-32 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">{t('desc_en')}</label>
                        <textarea
                            required
                            value={descEn}
                            onChange={(e) => setDescEn(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#fd2d55] outline-none h-32 resize-none"
                        />
                      </div>
                    </div>
                    <div>
                      <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t('price')}</label>
                      <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={price}
                          onChange={(e) => {
                            const val = e.target.value;
                            console.log(val);
                            const parsedValue = Number.parseFloat(val.replace(',', '.'))
                            console.log(parsedValue);
                            setPrice(isNaN(parsedValue) ? 0 : parsedValue);
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#fd2d55] outline-none h-10 resize-none"
                      />
                      </div>
                    </div>
                    {/* File Dropzone */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t('file')} {editingPpt && '(Leave empty to keep current)'}
                      </label>
                      <div
                          onClick={() => fileInputRef.current?.click()}
                          onDrop={onFileDrop}
                          onDragOver={preventDefaults}
                          onDragEnter={preventDefaults}
                          className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#fd2d55] transition-colors cursor-pointer bg-gray-50"
                      >
                        <FileText className="mx-auto text-gray-400 mb-2" size={32} />
                        <span className="text-sm text-gray-500">
                      {file ? file.name : 'Drag & drop PPT here or click'}
                    </span>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="hidden"
                            accept=".ppt,.pptx,.pptm,.ppsx"
                        />
                      </div>
                    </div>

                    {/* Images Dropzone */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t('images')} {editingPpt && '(Leave empty to keep current)'}
                      </label>
                      <div
                          onClick={() => imagesInputRef.current?.click()}
                          onDrop={onImagesDrop}
                          onDragOver={preventDefaults}
                          onDragEnter={preventDefaults}
                          className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#fd2d55] transition-colors cursor-pointer bg-gray-50"
                      >
                        <ImageIcon className="mx-auto text-gray-400 mb-2" size={32} />
                        <span className="text-sm text-gray-500">
                      {images.length > 0 ? `${images.length} images selected` : 'Drag & drop images or click'}
                    </span>
                        <input
                            type="file"
                            ref={imagesInputRef}
                            onChange={(e) => setImages(e.target.files ? Array.from(e.target.files) : [])}
                            className="hidden"
                            accept="image/*"
                            multiple
                        />
                      </div>

                      {/* Preview */}
                      {images.length > 0 && (
                          <div className="mt-4 grid grid-cols-3 gap-3">
                            {images.map((img, idx) => (
                                <div key={idx} className="relative group">
                                  <img
                                      src={URL.createObjectURL(img)}
                                      alt="preview"
                                      className="w-full h-24 object-cover rounded-lg border"
                                  />
                                  <button
                                      type="button"
                                      onClick={() => removeImage(idx)}
                                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                            ))}
                          </div>
                      )}
                    </div>
                  </form>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-4">
                  <button
                      type="button"
                      onClick={closeModal}
                      className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button
                      type="submit"
                      form="ppt-form"
                      disabled={submitting}
                      className="bg-[#fd2d55] text-white px-8 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting && (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    )}
                    {t('save')}
                  </button>
                </div>
              </motion.div>
            </div>
        )}
      </div>
  );
};
