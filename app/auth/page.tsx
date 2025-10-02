"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AuthPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerPasswordConfirmation, setRegisterPasswordConfirmation] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(loginEmail, loginPassword);
      router.push("/home");
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(registerName, registerEmail, registerPassword, registerPasswordConfirmation);
      router.push("/home");
    } catch (err: any) {
      setError(err.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 relative overflow-hidden">
      {/* Background gradient with mountain effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-200 via-purple-200 to-blue-400 -z-10"></div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2 sm:mb-3 text-gray-900">Social</h1>
          <p className="text-gray-700 text-sm sm:text-base px-4">Connect with friends and share your moments</p>
        </div>

        <Card className="backdrop-blur-xl bg-white/30 shadow-2xl border border-white/40">
          <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/40 backdrop-blur-sm rounded-full">
                <TabsTrigger value="login" className="data-[state=active]:bg-white/90 data-[state=active]:backdrop-blur-md rounded-full">Login</TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-white/90 data-[state=active]:backdrop-blur-md rounded-full">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
                  <div className="space-y-1 sm:space-y-2">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Welcome back</h2>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Enter your credentials to access your account
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-gray-900 font-semibold">Email or Username</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email or username"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="bg-white/60 backdrop-blur-sm border-white/50 focus:bg-white/80"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-gray-900 font-semibold">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="bg-white/60 backdrop-blur-sm border-white/50 focus:bg-white/80"
                    />
                  </div>

                  {error && <p className="text-sm text-red-500">{error}</p>}

                  <Button type="submit" className="w-full bg-black hover:bg-gray-800 text-white" disabled={loading}>
                    {loading ? "Signing in..." : "Sign in"}
                  </Button>

                  <div className="mt-6 p-4 bg-purple-200/60 backdrop-blur-sm rounded-lg text-center border border-purple-300/30">
                    <p className="text-sm font-medium text-purple-900">Demo account for testing:</p>
                    <p className="text-sm text-purple-800">Email: demo@gmail.com, Password: 12345678</p>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-3 sm:space-y-4">
                  <div className="space-y-1 sm:space-y-2">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Create account</h2>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Join our community and start sharing
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-name" className="text-gray-900 font-semibold">Username</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Choose a username"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required
                      maxLength={255}
                      className="bg-white/60 backdrop-blur-sm border-white/50 focus:bg-white/80"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-gray-900 font-semibold">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="Enter your email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                      className="bg-white/60 backdrop-blur-sm border-white/50 focus:bg-white/80"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-gray-900 font-semibold">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Create a password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                      minLength={8}
                      className="bg-white/60 backdrop-blur-sm border-white/50 focus:bg-white/80"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password-confirmation" className="text-gray-900 font-semibold">Confirm Password</Label>
                    <Input
                      id="register-password-confirmation"
                      type="password"
                      placeholder="Confirm your password"
                      value={registerPasswordConfirmation}
                      onChange={(e) => setRegisterPasswordConfirmation(e.target.value)}
                      required
                      minLength={8}
                      className="bg-white/60 backdrop-blur-sm border-white/50 focus:bg-white/80"
                    />
                  </div>

                  {error && <p className="text-sm text-red-500">{error}</p>}

                  <Button type="submit" className="w-full bg-black hover:bg-gray-800 text-white" disabled={loading}>
                    {loading ? "Creating account..." : "Create account"}
                  </Button>

                  <div className="mt-6 p-4 bg-purple-200/60 backdrop-blur-sm rounded-lg text-center border border-purple-300/30">
                    <p className="text-sm font-medium text-purple-900">Demo account for testing:</p>
                    <p className="text-sm text-purple-800">Email: demo@gmail.com, Password: 12345678</p>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
