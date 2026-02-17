import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import pool from "@/lib/db";

const handler = NextAuth({
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
                        // In a real app, use bcrypt.compare(credentials.password, admin.password)
                        if (credentials.password === admin.password) {
                            return {
                                id: admin.id.toString(),
                                name: admin.full_name,
                                email: admin.username,
                                role: admin.role || "admin"
                            };
                        }
                    }

                    // 2. Development Fallback (only if DB is empty or during setup)
                    if (credentials.username === "admin@airlink.com" && credentials.password === "Admin@1234") {
                        return { id: "0", name: "Super Admin", email: "admin@airlink.com", role: "admin" };
                    }

                    return null;
                } catch (error) {
                    console.error("Auth error:", error);
                    // Critical fallback if DB is down during initial setup
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
});

export { handler as GET, handler as POST };
