import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "Het" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (
          credentials.username === "admin" &&
          credentials.password === "123"
        ) {
          return { id: 1, name: "Admin User", email: "admin@example.com" };
        }
        // If login fails, return null
        
        return null;
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/auth/signin"
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };