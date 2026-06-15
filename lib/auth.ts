import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import clientPromise from "./mongodb-client";
import { User, UserRole } from "@/models/schemas/user.schema";
import dbConnect from "./db";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise) as NextAuthOptions["adapter"],
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
        await dbConnect();

        // Use native MongoDB to ensure password field is retrieved
        const db = mongoose.connection.db;
        if (!db) {
          throw new Error("Database connection not available");
        }

        const usersCollection = db.collection("users");
        const user = await usersCollection.findOne({ email: credentials.email });

        if (!user) {
          throw new Error("Invalid email or password");
        }

        if (!user.password) {
          throw new Error("This account uses Google sign-in");
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValidPassword) {
          throw new Error("Invalid email or password");
        }

        if (!user.isActive) {
          throw new Error("Account is disabled");
        }

        // Check if user is admin or super_admin
        if (user.role !== "admin" && user.role !== "super_admin") {
          throw new Error("Admin access only");
        }

        // Update last login
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { lastLogin: new Date() } }
        );

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Skip for credentials provider - already handled in authorize
      if (account?.provider === "credentials") {
        return true;
      }

      if (!user.email) return false;

      try {
        await dbConnect();

        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            googleId: account?.providerAccountId,
            role: "user",
            lastLogin: new Date(),
          });
        } else {
          await User.updateOne(
            { email: user.email },
            {
              $set: {
                lastLogin: new Date(),
                image: user.image,
                name: user.name,
              },
            }
          );
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return true;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        // User is available during sign-in
        if ("role" in user) {
          token.role = user.role as UserRole;
          token.userId = user.id;
        } else if (user.email) {
          try {
            await dbConnect();
            const dbUser = await User.findOne({ email: user.email });
            if (dbUser) {
              token.role = dbUser.role;
              token.userId = dbUser._id.toString();
            }
          } catch (error) {
            console.error("Error in jwt callback:", error);
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as UserRole) || "user";
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
};
