"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const supabase = createClient();

    function handleLogin() {
        setError(null);

        startTransition(async () => {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                if (authError.message.includes("Invalid login credentials")) {
                    setError("Invalid email or password. Please try again.");
                } else if (authError.message.includes("Email not confirmed")) {
                    setError("Your email has not been confirmed.");
                } else {
                    setError(authError.message);
                }
                return;
            }

            // Update last_login timestamp
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase
                    .from("users")
                    .update({ last_login: new Date().toISOString(), failed_login_attempts: 0 })
                    .eq("id", user.id);
            }

            router.push("/dashboard");
            router.refresh();
        });
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            {/* Background geometric decoration */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand/[0.03] -translate-y-1/2 translate-x-1/3" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%)" }} />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand/[0.04] translate-y-1/3 -translate-x-1/4" style={{ clipPath: "polygon(0 0, 100% 100%, 0 100%)" }} />
            </div>

            <div className="w-full max-w-[420px] px-6 relative z-10">
                {/* Brand header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-primary text-primary-foreground rounded-md mb-4">
                        <ShieldCheck className="w-7 h-7" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        T.N Manpower
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Recruitment Management System
                    </p>
                </div>

                <Card className="border shadow-sm">
                    <CardHeader className="pb-4 pt-6 px-6">
                        <h2 className="text-lg font-semibold text-foreground">Sign in</h2>
                        <p className="text-sm text-muted-foreground">
                            Enter your credentials to access the system
                        </p>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleLogin();
                            }}
                            className="space-y-4"
                        >
                            {error && (
                                <Alert variant="destructive" className="py-3">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="text-sm">{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                    autoFocus
                                    className="h-10"
                                    disabled={isPending}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                    className="h-10"
                                    disabled={isPending}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-10 font-medium"
                                disabled={isPending || !email || !password}
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Signing in…
                                    </>
                                ) : (
                                    "Sign in"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-xs text-muted-foreground text-center mt-6">
                    Access is restricted to authorized personnel only
                </p>
            </div>
        </div>

    );
}
