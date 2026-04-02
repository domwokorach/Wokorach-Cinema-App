"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/stores/onboarding-store";
import {
  Tv,
  Play,
  Sparkles,
  Clapperboard,
  Crown,
  Apple,
  Mountain,
  Eye,
} from "lucide-react";

const providers = [
  { id: 8, name: "Netflix", icon: Tv, color: "#E50914" },
  { id: 9, name: "Amazon Prime", icon: Play, color: "#00A8E1" },
  { id: 337, name: "Disney+", icon: Sparkles, color: "#113CCF" },
  { id: 15, name: "Hulu", icon: Clapperboard, color: "#1CE783" },
  { id: 384, name: "HBO Max", icon: Crown, color: "#B535F6" },
  { id: 350, name: "Apple TV+", icon: Apple, color: "#A2AAAD" },
  { id: 531, name: "Paramount+", icon: Mountain, color: "#0064FF" },
  { id: 386, name: "Peacock", icon: Eye, color: "#FFC800" },
];

export function StreamingPicker() {
  const { selectedProviders, setProviders } = useOnboardingStore();

  const toggleProvider = (providerId: number) => {
    if (selectedProviders.includes(providerId)) {
      setProviders(selectedProviders.filter((id) => id !== providerId));
    } else {
      setProviders([...selectedProviders, providerId]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">
          Where do you watch?
        </h2>
        <p className="mt-2 text-muted-foreground">
          Select your streaming services so we can show you what is available
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {providers.map((provider) => {
          const isSelected = selectedProviders.includes(provider.id);

          return (
            <motion.button
              key={provider.id}
              whileTap={{ scale: 0.95 }}
              animate={isSelected ? { scale: 1.05 } : { scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              onClick={() => toggleProvider(provider.id)}
              className={cn(
                "flex flex-col items-center gap-3 rounded-xl border-2 p-5 transition-all",
                isSelected
                  ? "border-primary bg-primary/10 shadow-lg"
                  : "border-border bg-card hover:border-muted-foreground"
              )}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: isSelected
                    ? `${provider.color}20`
                    : "var(--secondary)",
                }}
              >
                <provider.icon
                  className="h-6 w-6"
                  style={{
                    color: isSelected ? provider.color : "var(--muted-foreground)",
                  }}
                />
              </div>
              <span
                className={cn(
                  "text-sm font-medium",
                  isSelected ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {provider.name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
