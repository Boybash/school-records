"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettings, updateSettings } from "@/lib/settings";
import { auth } from "@/lib/firebase";
import {
  getAuth,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [schoolName, setSchoolName] = useState("");
  const [schoolAddress, setSchoolAddress] = useState("");
  const [schoolPhone, setSchoolPhone] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword)
      return setPasswordError("Please fill in all fields");
    if (newPassword.length < 6)
      return setPasswordError("New password must be at least 6 characters");
    if (newPassword !== confirmPassword)
      return setPasswordError("New passwords do not match");

    setPasswordLoading(true);

    try {
      const user = auth.currentUser;

      // Re-authenticate first for security
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      if (err.code === "auth/wrong-password") {
        setPasswordError("Current password is incorrect");
      } else if (err.code === "auth/weak-password") {
        setPasswordError("New password is too weak");
      } else {
        setPasswordError("Failed to change password. Please try again.");
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const { data: settings = {} } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

  useEffect(() => {
    if (settings) {
      setSchoolName(settings.schoolName || "");
      setSchoolAddress(settings.schoolAddress || "");
      setSchoolPhone(settings.schoolPhone || "");
      setLogoUrl(settings.logoUrl || "");
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      alert("Settings saved successfully!");
    },
  });

  const handleSave = () => {
    if (!schoolName) return alert("Please enter a school name");
    mutation.mutate({ schoolName, schoolAddress, schoolPhone, logoUrl });
  };

  return (
    <div>
      <h2 className="text-md font-bold mb-6 uppercase">School Settings</h2>

      <div className="bg-primary rounded-md shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-white">
          School Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500 mb-1 block">
              School Name
            </label>
            <input
              type="text"
              placeholder="e.g Greenfield Secondary School"
              className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary-50 bg-white"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="e.g +234 800 000 0000"
              className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary-50 bg-white"
              value={schoolPhone}
              onChange={(e) => setSchoolPhone(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm text-gray-500 mb-1 block">
              School Address
            </label>
            <input
              type="text"
              placeholder="e.g 12 School Road, Lagos"
              className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary-50 bg-white"
              value={schoolAddress}
              onChange={(e) => setSchoolAddress(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm text-gray-500 mb-1 block">
              School Logo URL
            </label>
            <input
              type="text"
              placeholder="Paste image URL e.g https://..."
              className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary-50 bg-white"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
            />
            {logoUrl && (
              <img
                src={logoUrl}
                alt="School Logo Preview"
                className="mt-3 h-20 object-contain rounded border p-1"
              />
            )}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={mutation.isPending}
          className="mt-6 bg-gray-100 text-primary px-6 py-3 rounded-lg hover:bg-blue-700 transition cursor-pointer font-semibold"
        >
          {mutation.isPending ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {/* Preview */}
      {settings.schoolName && (
        <div className="bg-white rounded-md shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Result Sheet Preview</h3>
          <div className="border rounded-lg p-6 text-center">
            {settings.logoUrl && (
              <img
                src={settings.logoUrl}
                alt="Logo"
                className="h-16 object-contain mx-auto mb-3"
              />
            )}
            <h1 className="text-md font-bold uppercase">
              {settings.schoolName}
            </h1>
            {settings.schoolAddress && (
              <p className="text-gray-500 text-sm mt-1">
                {settings.schoolAddress}
              </p>
            )}
            {settings.schoolPhone && (
              <p className="text-gray-500 text-sm">{settings.schoolPhone}</p>
            )}
          </div>
        </div>
      )}

      {/* Change Password */}
      <div className="bg-primary rounded-md shadow p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4 text-white">
          Change Password
        </h3>

        {passwordError && (
          <p className="text-red-500 text-sm mb-4">{passwordError}</p>
        )}

        {passwordSuccess && (
          <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg mb-4">
            ✅ Password changed successfully!
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-500 mb-1 block">
              Current Password
            </label>
            <input
              type="password"
              placeholder="Enter current password"
              className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary-50 bg-white"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">
              New Password
            </label>
            <input
              type="password"
              placeholder="Enter new password"
              className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary-50 bg-white"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="Confirm new password"
              className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary-50 bg-white"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={handleChangePassword}
          disabled={passwordLoading}
          className="mt-4 bg-gray-100 text-primary font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          {passwordLoading ? "Changing..." : "Change Password"}
        </button>
      </div>
    </div>
  );
}
