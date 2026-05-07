import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const authConfig = {
  providers: [
    // We add an empty array here because the actual Credentials authorize 
    // needs Prisma, but the middleware just needs to know the providers exist.
    // Actually, for middleware, we can just leave it as an empty array or 
    // define the provider without the heavy logic.
    Credentials({
      async authorize() {
        return null
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthRoute = nextUrl.pathname === "/login" || nextUrl.pathname === "/register";
      
      if (isAuthRoute) {
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
        return true;
      }

      if (!isLoggedIn) {
        return false; // Redirect to login
      }

      return true;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      return session
    }
  },
} satisfies NextAuthConfig
