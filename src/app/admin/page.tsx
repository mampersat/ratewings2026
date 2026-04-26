"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export default function AdminLoginPage() {
  const [error, action, pending] = useActionState(loginAction, null);

  return (
    <div className="max-w-sm mx-auto mt-20">
      <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-6">Admin Login</h1>
      <form action={action} className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-4">
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full border border-gray-600 bg-gray-900 text-gray-100 rounded-lg p-2 text-sm"
          autoFocus
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50"
        >
          {pending ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
