export interface Emergency {
  id: string;
  title: string;
  description?: string;
  location: string;
  severity: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  assignee?: {
    fullName: string | null;
    email: string;
  };
  responders?: Array<{
    responder: {
      id: string;
      name: string;
    };
  }>;
}

export interface Responder {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  location?: string;
  skills: string[];
}

export interface UserProfile {
  id: string;
  userId: string;
  email: string;
  fullName: string | null;
  isDispatcher: boolean;
  createdAt: string;
  updatedAt: string;
}
