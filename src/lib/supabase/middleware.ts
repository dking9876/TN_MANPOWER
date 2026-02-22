import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    // Add security headers
    const securityHeaders = {
        "X-Frame-Options": "DENY",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    };

    Object.entries(securityHeaders).forEach(([key, value]) => {
        supabaseResponse.headers.set(key, value);
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh the session
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const isLoginRoute = request.nextUrl.pathname.startsWith("/login");
    const isRootRoute = request.nextUrl.pathname === "/";

    // Unauthenticated users
    if (!user) {
        if (!isLoginRoute && !isRootRoute) {
            const url = request.nextUrl.clone();
            url.pathname = "/login";
            return NextResponse.redirect(url);
        }
        return supabaseResponse;
    }

    // Authenticated users
    // Fast path: if not a protected route directly (like /api/auth/callback), just proceed
    if (request.nextUrl.pathname.startsWith("/auth/")) {
        return supabaseResponse;
    }

    // Fetch role from DB
    const { data: userData } = await supabase
        .from("users")
        .select("role, is_active")
        .eq("id", user.id)
        .single();

    if (!userData || !userData.is_active) {
        if (!isLoginRoute) {
            const url = request.nextUrl.clone();
            url.pathname = "/login";
            return NextResponse.redirect(url);
        }
        return supabaseResponse;
    }

    const { role } = userData;
    const landingPage = role === "REFERRER" ? "/candidates/new" : "/dashboard";

    // Redirect from login or root to their specific landing page
    if (isLoginRoute || isRootRoute) {
        const url = request.nextUrl.clone();
        url.pathname = landingPage;
        return NextResponse.redirect(url);
    }

    const currentPath = request.nextUrl.pathname;

    // REFERRER protection
    if (role === "REFERRER") {
        const allowedReferrerRoutes = ["/candidates/new"];
        const isAllowed = allowedReferrerRoutes.some(r => currentPath === r || currentPath.startsWith(`${r}/`));
        if (!isAllowed && !currentPath.startsWith("/api/")) {
            const url = request.nextUrl.clone();
            url.pathname = landingPage;
            return NextResponse.redirect(url);
        }
    }

    // ADMIN protection
    const isAdminRoute = currentPath.startsWith("/admin");
    if (isAdminRoute && role !== "ADMIN") {
        const url = request.nextUrl.clone();
        url.pathname = landingPage;
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}
