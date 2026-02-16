import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
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

    // Unauthenticated users trying to access app routes
    if (
        !user &&
        !request.nextUrl.pathname.startsWith("/login") &&
        request.nextUrl.pathname !== "/"
    ) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    // Authenticated users on login page → redirect to dashboard
    if (user && request.nextUrl.pathname === "/login") {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
    }

    // Root path → redirect appropriately
    if (request.nextUrl.pathname === "/") {
        const url = request.nextUrl.clone();
        url.pathname = user ? "/dashboard" : "/login";
        return NextResponse.redirect(url);
    }

    // Admin-only routes protection
    const adminOnlyRoutes = ["/admin"];
    const isAdminRoute = adminOnlyRoutes.some((route) =>
        request.nextUrl.pathname.startsWith(route)
    );

    if (user && isAdminRoute) {
        // Check role from user metadata or DB
        const { data: userData } = await supabase
            .from("users")
            .select("role, is_active")
            .eq("id", user.id)
            .single();

        if (!userData || !userData.is_active) {
            const url = request.nextUrl.clone();
            url.pathname = "/login";
            return NextResponse.redirect(url);
        }

        if (userData.role !== "ADMIN") {
            const url = request.nextUrl.clone();
            url.pathname = "/dashboard";
            return NextResponse.redirect(url);
        }
    }

    return supabaseResponse;
}
