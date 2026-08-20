"use client";

// Placeholder — auth login/logout API flow will be implemented later
export function useAuth() {
  return {
    login: async (_email: string, _password: string): Promise<void> => {
      void _email;
      void _password;
    },
    logout: async (): Promise<void> => {
      // API call will be added with the login feature
    },
  };
}
