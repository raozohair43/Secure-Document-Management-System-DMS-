export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
}