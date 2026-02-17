import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const isAuth = !!token;
        const isAdminPage = req.nextUrl.pathname.startsWith("/admin");
        const isSubscriberPage = req.nextUrl.pathname.startsWith("/subscriber-portal");

        if (isAdminPage && token?.role !== "admin") {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        if (isSubscriberPage && !isAuth) {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: ["/admin/:path*", "/subscriber-portal/:path*"],
};
