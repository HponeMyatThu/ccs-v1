export interface Agent {
  id: number;
  agent_number: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: number;
  page_name: string;
  section_name: string;
  lang: string;
  content_type: string;
  visible: boolean;
  display_order: number;
  attributes?: string;
  created_at: string;
  updated_at: string;
}

export interface Content {
  id: number;
  ref_id: number;
  short_desc?: string;
  long_desc?: string;
  image_path?: string;
  title?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  agent_number: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  agent: Agent;
}

export interface CreatePageRequest {
  page_name: string;
  section_name: string;
  lang: string;
  content_type: string;
  visible: boolean;
  display_order: number;
  attributes?: string;
}

export interface CreateContentRequest {
  ref_id: number;
  short_desc?: string;
  long_desc?: string;
  image_path?: string;
  title?: string;
}
