import { LoginRequest, LoginResponse, Page, Content, CreatePageRequest, CreateContentRequest } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

class ApiService {
  private getHeaders(includeAuth = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    return response.json();
  }

async getPages(sectionName?: string): Promise<Page[]> {
  const url = new URL(`${API_BASE_URL}/pages`);
  if (sectionName) {
    url.searchParams.append('section_name', sectionName);
  }

  const response = await fetch(url.toString(), {
    headers: this.getHeaders(true),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch pages');
  }

  return response.json();
}

  async getPage(id: number): Promise<Page> {
    const response = await fetch(`${API_BASE_URL}/pages/${id}`, {
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch page');
    }

    return response.json();
  }

  async createPage(data: CreatePageRequest): Promise<Page> {
    const response = await fetch(`${API_BASE_URL}/pages`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create page');
    }

    return response.json();
  }

  async updatePage(id: number, data: Partial<CreatePageRequest>): Promise<Page> {
    const response = await fetch(`${API_BASE_URL}/pages/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update page');
    }

    return response.json();
  }

  async deletePage(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/pages/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to delete page');
    }
  }

  async getContentsByRef(refId: number): Promise<Content[]> {
    const response = await fetch(`${API_BASE_URL}/contents/ref/${refId}`, {
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch contents');
    }

    return response.json();
  }

  async createContent(data: CreateContentRequest): Promise<Content> {
    const response = await fetch(`${API_BASE_URL}/contents`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create content');
    }

    return response.json();
  }

  async updateContent(id: number, data: Partial<CreateContentRequest>): Promise<Content> {
    const response = await fetch(`${API_BASE_URL}/contents/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update content');
    }

    return response.json();
  }

  async deleteContent(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/contents/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to delete content');
    }
  }

  async uploadImage(file: File): Promise<{ path: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/images/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    return response.json();
  }

  getImageUrl(filename: string): string {
    return `${API_BASE_URL}/pre-view/images/${filename}`;
  }
}

export const apiService = new ApiService();
