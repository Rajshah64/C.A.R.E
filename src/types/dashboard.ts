export interface Emergency {
  id: string;
  title: string;
  description?: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  type: string;
  severity: string;
  status: string;
  assignedResponder?: string | null;
  createdAt: string;
  updatedAt: string;
  assignee?: {
    fullName: string | null;
    email: string;
  };
  assignedResponderProfile?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
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
  latitude?: number | null;
  longitude?: number | null;
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
