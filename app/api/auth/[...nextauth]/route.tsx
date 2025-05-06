import dbConnect from "@/lib/db";
import User from "@/models/User";
import { FindOrCreateUser } from "@/utils/userHelper";
import NextAuth, { Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      const isUmakEmail = user.email?.endsWith('@umak.edu.ph');

      if (!isUmakEmail) {
        return '/api/auth/error?reason=invalid-domain';
      }

      try {
        await dbConnect();
        console.log("User model collection name:", User.collection.name);
        console.log("User model schema:", Object.keys(User.schema.paths).join(', '));
        console.log("Looking for email:", user.email);
        
        const dbUser = await User.findOne({ email: user.email });

        if (!dbUser) {
          console.log("User not found in database:", user.email);
          console.log("dbUser: ", dbUser);
          return '/api/auth/error?reason=user-not-found'; // Custom error
        }

        user.id = dbUser._id.toString();

        console.log("User found:", user.email);
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return '/api/auth/error?reason=database-error'; // Custom error
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
        token.role = user.role;
        }
      return token;
    },
    async session({ session, token }) {
      try {
        await dbConnect();

        const dbUser = await User.findById(token.id);

        if (dbUser) {
          (session as any).user = {
            id: dbUser._id.toString(),
            name: dbUser.name,
            email: dbUser.email,
            image: dbUser.image,
            role: dbUser.role,
          };
        } else {
          (session as any).user = {
            id: token.id,
            name: token.name,
            email: token.email,
            image: token.image,
            role: token.role,
          };
        }
      } catch (error) {
        console.error("Error in session callback: ", error);

        (session as any).user = {
          id: token.id,
          name: token.name,
          email: token.email,
          image: token.image,
          role: token.role,
        };
      }

      return session;
    },
  }
})


export { handler as GET, handler as POST };
