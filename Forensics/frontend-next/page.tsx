"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
  import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
  roleId: z.string().min(3, "Role ID is required"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", roleId: "" },
  });

  const onSubmit = async (data: FormValues) => {
    setError(null);
    try {
      const res = await api.post("/auth/login", data);
      localStorage.setItem("token", res.data.token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-4xl grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 bg-gradient-to-br from-indigo-600 to-sky-700 border-indigo-500/50 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Welcome back</CardTitle>
            <CardDescription className="text-indigo-50/80 space-y-1">
              <div>Use your Role ID + credentials</div>
              <div>Analysts see assigned analyses</div>
              <div>Investigators handle evidence</div>
              <div>Admins manage datasets & logs</div>
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="lg:col-span-2 bg-slate-900/80 border-slate-800 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-3xl">Sign in</CardTitle>
            <p className="text-sm text-slate-400">
              Enter your email, password, and Role ID (ADM/INV/ANL-xxxxx).
            </p>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-1.5">
                <Label className="text-slate-200">Email</Label>
                <Input
                  type="email"
                  {...form.register("email")}
                  placeholder="you@example.com"
                  required
                  className="bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-200">Role ID</Label>
                <Input
                  {...form.register("roleId")}
                  placeholder="INV-12345 or ADM-12345"
                  required
                  className="bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500"
                />
                <p className="text-xs text-slate-400">Copied from signup popup.</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-200">Password</Label>
                <Input
                  type="password"
                  {...form.register("password")}
                  placeholder="Your password"
                  required
                  className="bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="submit"
                  className="bg-indigo-500 hover:bg-indigo-600 text-slate-50 px-6"
                >
                  Login
                </Button>
                <button
                  type="button"
                  className="text-sm underline text-slate-200"
                  onClick={() => router.push("/signup")}
                >
                  Create account
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
