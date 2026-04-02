"use client";

import { useState } from "react";
import {
  Tv,
  Globe,
  Upload,
  User,
  Crown,
  Trash2,
  Check,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

const streamingServices = [
  { id: 8, name: "Netflix", enabled: true },
  { id: 9, name: "Amazon Prime", enabled: true },
  { id: 337, name: "Disney+", enabled: false },
  { id: 15, name: "Hulu", enabled: true },
  { id: 384, name: "HBO Max", enabled: false },
  { id: 350, name: "Apple TV+", enabled: false },
  { id: 531, name: "Paramount+", enabled: false },
  { id: 386, name: "Peacock", enabled: false },
];

const regions = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "IN", name: "India" },
  { code: "BR", name: "Brazil" },
];

export default function SettingsPage() {
  const [services, setServices] = useState(streamingServices);
  const [selectedRegion, setSelectedRegion] = useState("US");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const toggleService = (id: number) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your preferences and account
        </p>
      </div>

      {/* Streaming Services */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
          <Tv className="h-5 w-5 text-primary" />
          Streaming Services
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Select your active subscriptions to filter recommendations
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {services.map((service) => (
            <button
              key={service.id}
              onClick={() => toggleService(service.id)}
              className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                service.enabled
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{service.name}</span>
              {service.enabled && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Region */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
          <Globe className="h-5 w-5 text-primary" />
          Country / Region
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Set your region for accurate streaming availability
        </p>
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {regions.map((region) => (
            <option key={region.code} value={region.code}>
              {region.name}
            </option>
          ))}
        </select>
      </section>

      {/* Import */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
          <Upload className="h-5 w-5 text-primary" />
          Import Ratings
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Import your ratings from other platforms to get better recommendations
        </p>
        <Link
          href="/import"
          className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80"
        >
          <Upload className="h-4 w-4" />
          Go to Import
        </Link>
      </section>

      {/* Account */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
          <User className="h-5 w-5 text-primary" />
          Account
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Email</p>
              <p className="text-sm text-muted-foreground">user@example.com</p>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">
                Member since
              </p>
              <p className="text-sm text-muted-foreground">January 2025</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pro Plan */}
      <section className="rounded-xl border border-primary/30 bg-primary/5 p-6">
        <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-foreground">
          <Crown className="h-5 w-5 text-primary" />
          CineMatch Pro
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Unlock unlimited recommendations, group mode, and advanced taste
          analytics.
        </p>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
            Current: Free Plan
          </span>
          <button className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Upgrade to Pro
          </button>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-foreground">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Danger Zone
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </p>
        {showDeleteConfirm ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                // In production: API call to delete account
                alert("Account deletion would be processed");
              }}
              className="rounded-lg bg-destructive px-5 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
            >
              Yes, Delete My Account
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="rounded-lg border border-border bg-card px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-destructive/50 px-5 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="h-4 w-4" />
            Delete Account
          </button>
        )}
      </section>
    </div>
  );
}
