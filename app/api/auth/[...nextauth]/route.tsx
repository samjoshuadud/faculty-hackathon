import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
    providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }),
  ],
  callbacks: {
    async signIn({user}) {
      const isUmakEmail = user.email?.endsWith('@umak.edu.ph');

      if (!isUmakEmail) {
        throw new Error("Invalid Domain");
      }

      return true;
    }
  }
})


export {handler as GET, handler as POST};
