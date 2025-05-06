import NextAuth from "next-auth";

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string | null;
    }
  }
  
  // Extend the built-in user type
  interface User {
    id?: string;
    role?: string;
  }
}

// Extend the JWT token type
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}