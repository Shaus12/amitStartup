import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    const pathname = request.nextUrl.pathname;
    if (
      pathname.startsWith("/dashboard") ||
      pathname === "/loading" ||
      pathname.startsWith("/tasks") ||
      pathname.startsWith("/opportunities") ||
      pathname.startsWith("/roadmap")
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // Create SSR supabase client (reads/writes cookies to maintain session)
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          request.cookies.set({ name, value, ...options })
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: always call getUser() to keep the session fresh
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isDashboard = pathname.startsWith("/dashboard");
  const isLogin = pathname === "/login";
  const isLoadingAnalysis = pathname === "/loading";
  const isTasks = pathname.startsWith("/tasks");
  const isOpportunities = pathname.startsWith("/opportunities");
  const isRoadmap = pathname.startsWith("/roadmap");

  // Protect /dashboard, /loading, /tasks, /opportunities, /roadmap — must be signed in
  if (
    (isDashboard || isLoadingAnalysis || isTasks || isOpportunities || isRoadmap) &&
    !user
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect /login → /dashboard when already signed in
  if (isLogin && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/loading",
    "/tasks/:path*",
    "/opportunities/:path*",
    "/roadmap/:path*",
  ],
};
