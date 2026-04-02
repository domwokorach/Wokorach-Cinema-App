"use client";

import { motion } from "framer-motion";
import {
  Swords,
  Laugh,
  Heart,
  Ghost,
  Rocket,
  Drama,
  Search,
  Music,
  Globe,
  Baby,
  Clapperboard,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/stores/onboarding-store";

const genres = [
  { id: 28, name: "Action", icon: Swords },
  { id: 35, name: "Comedy", icon: Laugh },
  { id: 10749, name: "Romance", icon: Heart },
  { id: 27, name: "Horror", icon: Ghost },
  { id: 878, name: "Sci-Fi", icon: Rocket },
  { id: 18, name: "Drama", icon: Drama },
  { id: 9648, name: "Mystery", icon: Search },
  { id: 10402, name: "Musical", icon: Music },
  { id: 99, name: "Documentary", icon: Globe },
  { id: 16, name: "Animation", icon: Baby },
  { id: 53, name: "Thriller", icon: Clapperboard },
  { id: 10752, name: "War", icon: Flame },
];

export function GenrePicker() {
  const { selectedGenres, setGenres } = useOnboardingStore();

  const toggleGenre = (genreId: number) => {
    if (selectedGenres.includes(genreId)) {
      setGenres(selectedGenres.filter((id) => id !== genreId));
    } else if (selectedGenres.length < 5) {
      setGenres([...selectedGenres, genreId]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">
          What genres do you love?
        </h2>
        <p className="mt-2 text-muted-foreground">
          Pick 3 to 5 genres to help us understand your taste
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {selectedGenres.length}/5 selected
          {selectedGenres.length < 3 && (
            <span className="text-warning"> (minimum 3)</span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {genres.map((genre) => {
          const isSelected = selectedGenres.includes(genre.id);
          const isDisabled = !isSelected && selectedGenres.length >= 5;

          return (
            <motion.button
              key={genre.id}
              whileTap={{ scale: 0.95 }}
              animate={isSelected ? { scale: 1.05 } : { scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              onClick={() => toggleGenre(genre.id)}
              disabled={isDisabled}
              className={cn(
                "flex flex-col items-center gap-3 rounded-xl border-2 p-5 transition-all",
                isSelected
                  ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/10"
                  : "border-border bg-card text-muted-foreground hover:border-muted-foreground hover:text-foreground",
                isDisabled && "cursor-not-allowed opacity-40"
              )}
            >
              <genre.icon className="h-8 w-8" />
              <span className="text-sm font-medium">{genre.name}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
