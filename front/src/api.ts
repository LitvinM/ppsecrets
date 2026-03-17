import {Language} from './translations';

export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5091/api';

export const getAuthToken = () => localStorage.getItem('token');

export const setAuthToken = (token: string) => localStorage.setItem('token', token);

export const removeAuthToken = () => localStorage.removeItem('token');

const request = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is FormData, don't set Content-Type, let browser set it with boundary
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorData.message || errorMsg;
    } catch {
      try {
        errorMsg = await response.text() || errorMsg;
      } catch {}
    }
    throw new Error(errorMsg);
  }

  // Handle empty responses (like 204 No Content)
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const api = {
  auth: {
    register: (data: any, lang: Language) =>
        request(`/auth/register?lang=${lang}`, {
          method: 'POST',
          body: JSON.stringify(data),
        }),
    verifyEmail: (data: any) => request('/auth/verify-email', {method: 'POST', body: JSON.stringify(data),}),
    login: (data: any) => request('/Auth/login', { method: 'POST', body: JSON.stringify(data) }),
  },
  ppt: {
    getAll: () => request('/Ppt', { method: 'GET' }),
    getById: (id: string) => request(`/Ppt/${id}`, { method: 'GET' }),
    buy: async (ids: string[]) => {
      const token = getAuthToken();
      const response = await fetch(`${BASE_URL}/Ppt/buy?${ids.map(id => `ids=${id}`).join('&')}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to buy');
      return response.blob();
    },
    create: (formData: FormData) => request('/Ppt', { method: 'POST', body: formData }),
    update: (id: string, formData: FormData) => request(`/Ppt/${id}`, { method: 'PUT', body: formData }),
    delete: (id: string) => request(`/Ppt/${id}`, { method: 'DELETE' }),
    getList: (ids: string[]) => request(`/ppt/list-by-ids?${ids.map(id => `ids=${id}`).join('&')}`, { method: 'GET' }),
    download: async (id: string) => {
      const token = getAuthToken();
      const response = await fetch(`${BASE_URL}/ppt/download/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Download failed');

      // Получаем файл как Blob (бинарный объект)
      const blob = await response.blob();

      // Извлекаем имя файла из заголовков (опционально) или задаем вручную
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `presentation_${id}.pptx`; // Имя файла
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  },
  payment: {
    create: async (ids: string[]) => {
      return await request('/payment/create', {
        method: 'POST',
        body: JSON.stringify(ids),
      });
    }
  }
};
