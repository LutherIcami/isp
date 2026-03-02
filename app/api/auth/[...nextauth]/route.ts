import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import pool from "@/lib/db";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "AirLink ISP",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "admin@airlink.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null;
                }

                try {
                    // 1. Check Admin Table first
                    const adminRes = await pool.query(
                        "SELECT id, username, password, full_name, role FROM admins WHERE username = $1",
                        [credentials.username]
                    );

                    if (adminRes.rows.length > 0) {
                        const admin = adminRes.rows[0];
                        if (credentials.password === admin.password) {
                            return {
                                id: admin.id.toString(),
                                name: admin.full_name,
                                email: admin.username,
                                role: admin.role || "admin"
                            };
                        }
                    }

                    // 2. Check Subscribers Table
                    const subRes = await pool.query(
                        "SELECT id, email, password, full_name FROM subscribers WHERE email = $1 OR phone = $1",
                        [credentials.username]
                    );

                    if (subRes.rows.length > 0) {
                        const subscriber = subRes.rows[0];
                        if (credentials.password === subscriber.password) {
                            return {
                                id: subscriber.id.toString(),
                                name: subscriber.full_name,
                                email: subscriber.email,
                                role: "subscriber"
                            };
                        }
                    }

                    // 3. Development Fallback
                    if (credentials.username === "admin@airlink.com" && credentials.password === "Admin@1234") {
                        return { id: "0", name: "Super Admin", email: "admin@airlink.com", role: "admin" };
                    }

                    return null;
                } catch (error) {
                    console.error("Auth error:", error);
                    if (credentials.username === "admin@airlink.com" && credentials.password === "Admin@1234") {
                        return { id: "0", name: "Super Admin", email: "admin@airlink.com", role: "admin" };
                    }
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
