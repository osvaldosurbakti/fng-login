// components/LoginForm.jsx
"use client";
import { signIn, getSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // Tunggu sebentar untuk memastikan session ter-update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get session to verify role
      const session = await getSession();
      console.log("Session data:", session); // Debug log
      
      if (session?.user?.role) {
        // Redirect based on role
        switch (session.user.role) {
          case "superadmin":
            router.push("/dashboard");
            break;
          case "admin":
            // Redirect ke website external untuk admin
            window.location.href = "https://fng-app.vercel.app";
            break;
          case "user":
            router.push("/dashboard/user");
            break;
          default:
            setError("Role not recognized");
        }
      } else {
        setError("No role assigned to user");
        console.log("Session user:", session?.user);
      }
    } catch (error) {
      setError("An error occurred during login");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-96">
      <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}