"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Key, ArrowRight } from "lucide-react";
import { Button } from "@x-workflow/ui/components/button";
import { Input } from "@x-workflow/ui/components/input";
import { Label } from "@x-workflow/ui/components/label";
import { trpc } from "@/utils/trpc";

export default function ResetPasswordView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const resetPasswordMutation = trpc.auth.resetPassword.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Missing or invalid reset link.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    try {
      await resetPasswordMutation.mutateAsync({ token, password });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#F9FAFB] dark:bg-[#0B0F19]">
      <div className="relative z-10 max-w-md w-full rounded-2xl overflow-hidden bg-background/95 dark:bg-[#111827]/80 backdrop-blur-xl border border-border shadow-xl p-8 md:p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center border border-primary/35">
            <Key className="w-4 h-4 text-primary" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Reset Password</h1>
        </div>

        {!token ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This reset link is invalid or has expired. Please request a new one.
            </p>
            <Button className="w-full" onClick={() => router.push("/login")}>
              Back to Login
            </Button>
          </div>
        ) : success ? (
          <div className="space-y-4">
            <p className="text-sm text-foreground">
              Password updated. Redirecting to login...
            </p>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <p className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-2">
                {error}
              </p>
            )}

            <div>
              <Label htmlFor="new-password" className="text-[10px] font-mono font-bold uppercase tracking-wider">
                New Password
              </Label>
              <Input
                type="password"
                id="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <Label htmlFor="confirm-password" className="text-[10px] font-mono font-bold uppercase tracking-wider">
                Confirm Password
              </Label>
              <Input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1.5"
                placeholder="••••••••"
                required
              />
            </div>

            <Button type="submit" className="w-full py-3" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⟳</span>
                  Updating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Update Password
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
