import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      // SECURITY CHECK: Optional white-listing
      // If you only want YOUR email to be able to access this admin panel, uncomment below:
      // if (user.email !== "your-admin-email@gmail.com") return false;
      return true;
    },
  },
});

export { handler as GET, handler as POST };