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
            {/* Premium Background geometric decoration */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-[-10%] w-[800px] h-[800px] bg-primary/[0.04] dark:bg-primary/[0.02] rounded-full blur-3xl -translate-y-1/2" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-accent/[0.04] dark:bg-accent/[0.02] rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-[440px] px-6 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Brand header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary via-accent to-blue-900 text-primary-foreground rounded-2xl mb-6 shadow-lg shadow-primary/20">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">
                        T.N Manpower
                    </h1>
                    <p className="text-base text-muted-foreground mt-2 font-medium">
                        Professional Recruitment Management
                    </p>
                </div>

                <Card className="rounded-2xl border border-border/40 bg-card/80 backdrop-blur-xl shadow-2xl shadow-black/5 dark:shadow-black/40 overflow-hidden">
                    <CardHeader className="pb-6 pt-8 px-8 text-center border-b border-border/30 bg-muted/10">
                        <h2 className="text-xl font-semibold text-foreground tracking-tight">Secure Sign In</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Enter your credentials to access the portal
                        </p>
                    </CardHeader>
                    <CardContent className="px-8 py-8">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleLogin();
                            }}
                            className="space-y-5"
                        >
                            {error && (
                                <Alert variant="destructive" className="py-3 bg-destructive/10 text-destructive border-destructive/20">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="text-sm font-medium">{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2.5">
                                <Label htmlFor="email" className="text-sm font-semibold text-foreground/80">
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@tn-manpower.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                    autoFocus
                                    className="h-11 px-4 bg-background/50 border-border/60 focus:bg-background transition-colors rounded-xl"
                                    disabled={isPending}
                                />
                            </div>

                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-sm font-semibold text-foreground/80">
                                        Password
                                    </Label>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                    className="h-11 px-4 bg-background/50 border-border/60 focus:bg-background transition-colors rounded-xl"
                                    disabled={isPending}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 text-sm font-semibold mt-4 rounded-xl shadow-md transition-all active:scale-[0.98]"
                                disabled={isPending || !email || !password}
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary-foreground/70" />
                                        Authenticating...
                                    </>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-xs text-muted-foreground text-center mt-8 font-medium">
                    &copy; {new Date().getFullYear()} T.N Manpower. Authorized personnel only.
                </p>
            </div>
        </div>
    );
}
