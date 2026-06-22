"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettings, updateSettings } from "@/lib/settings";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [schoolName, setSchoolName] = useState("");
  const [schoolAddress, setSchoolAddress] = useState("");
  const [schoolPhone, setSchoolPhone] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

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
      <h2 className="text-xl font-bold mb-6 uppercase">School Settings</h2>

      <div className="bg-primary rounded-xl shadow p-6 mb-6">
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
              className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 bg-white"
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
              className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 bg-white"
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
              className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 bg-white"
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
              className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 bg-white"
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
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Result Sheet Preview</h3>
          <div className="border rounded-lg p-6 text-center">
            {settings.logoUrl && (
              <img
                src={settings.logoUrl}
                alt="Logo"
                className="h-16 object-contain mx-auto mb-3"
              />
            )}
            <h1 className="text-xl font-bold uppercase">
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
    </div>
  );
}
