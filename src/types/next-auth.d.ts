import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      nivel: string;
    };
  }

  interface User {
    nivel: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    nivel: string;
  }
}
