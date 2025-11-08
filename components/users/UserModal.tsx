// components/users/UserModal.tsx
"use client";

import { useState, useEffect } from "react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "superadmin" | "admin" | "user";
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  action: "create" | "edit";
}

export default function UserModal({ isOpen, onClose, user, action }: UserModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user" as "superadmin" | "admin" | "user",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (user && action === "edit") {
      setFormData({
        name: user.name,
        email: user.email,
        password: "", // Don't pre-fill password
        role: user.role,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "user",
      });
    }
    setMessage({ type: "", text: "" });
  }, [user, action, isOpen]);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setMessage({ type: "", text: "" });

  try {
    const url = action === "create" 
      ? "/api/admin/users" 
      : `/api/admin/users/${user?._id}`; // Pastikan user._id ada
    
    const method = action === "create" ? "POST" : "PUT";

    console.log("Sending request to:", url); // Debug log

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (response.ok) {
      setMessage({ 
        type: "success", 
        text: action === "create" 
          ? "User created successfully!" 
          : "User updated successfully!" 
      });
      
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1500);
    } else {
      setMessage({ type: "error", text: data.error || "Operation failed" });
    }
  } catch (error) {
    console.error("API Error:", error); // Debug log
    setMessage({ type: "error", text: "An error occurred" });
  } finally {
    setLoading(false);
  }
};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {action === "create" ? "Add New User" : "Edit User"}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password {action === "create" ? "*" : "(leave empty to keep current)"}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={action === "create"}
              minLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={action === "create" ? "Enter password (min 6 characters)" : "Enter new password"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {message.text && (
            <div
              className={`p-3 rounded ${
                message.type === "success"
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-red-100 text-red-700 border border-red-300"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Processing..." : action === "create" ? "Create User" : "Update User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}