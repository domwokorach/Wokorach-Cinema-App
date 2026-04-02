"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { GenrePicker } from "@/components/onboarding/genre-picker";
import { SwipeCard } from "@/components/onboarding/swipe-card";
import { StreamingPicker } from "@/components/onboarding/streaming-picker";

// Mock movies for the swipe step
const swipeMovies = [
  { id: 550, title: "Fight Club", year: 1999, posterPath: "/pB8BM7pdSp6B6Ih7QI4S2t0PODy.jpg" },
  { id: 680, title: "Pulp Fiction", year: 1994, posterPath: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg" },
  { id: 13, title: "Forrest Gump", year: 1994, posterPath: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg" },
  { id: 155, title: "The Dark Knight", year: 2008, posterPath: "/qJ2tW6WMUDux911BTUgMe4gkFID.jpg" },
  { id: 27205, title: "Inception", year: 2010, posterPath: "/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg" },
  { id: 157336, title: "Interstellar", year: 2014, posterPath: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg" },
  { id: 238, title: "The Godfather", year: 1972, posterPath: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg" },
  { id: 11, title: "Star Wars", year: 1977, posterPath: "/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg" },
  { id: 120, title: "The Lord of the Rings", year: 2001, posterPath: "/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg" },
  { id: 603, title: "The Matrix", year: 1999, posterPath: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg" },
];

const steps = [
  { number: 1, label: "Genres" },
  { number: 2, label: "Rate Movies" },
  { number: 3, label: "Streaming" },
  { number: 4, label: "Profile" },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

function ProfileGeneration() {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);
  const router = useRouter();

  const phases = [
    "Analyzing your genre preferences...",
    "Processing your movie ratings...",
    "Mapping streaming availability...",
    "Building your taste profile...",
    "Generating personalized recommendations...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => router.push("/discover"), 500);
          return 100;
        }
        return prev + 1;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    const phaseInterval = setInterval(() => {
      setPhase((prev) => (prev < phases.length - 1 ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(phaseInterval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {/* Animated circle */}
      <div className="relative mb-8">
        <motion.div
          className="h-32 w-32 rounded-full border-4 border-primary/20"
          style={{ position: "relative" }}
        >
          <svg
            className="absolute inset-0 -rotate-90"
            width="128"
            height="128"
            viewBox="0 0 128 128"
          >
            <circle
              cx="64"
              cy="64"
              r="60"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 60}`}
              strokeDashoffset={`${2 * Math.PI * 60 * (1 - progress / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-100"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            {progress < 100 ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <Sparkles className="h-10 w-10 text-primary" />
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
              >
                <Check className="h-10 w-10 text-success" />
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      <h2 className="text-2xl font-bold text-foreground">
        {progress < 100
          ? "Building Your Profile"
          : "Profile Ready!"}
      </h2>

      <AnimatePresence mode="wait">
        <motion.p
          key={phase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mt-3 text-muted-foreground"
        >
          {progress < 100 ? phases[phase] : "Redirecting to your recommendations..."}
        </motion.p>
      </AnimatePresence>

      <div className="mt-6 h-2 w-64 overflow-hidden rounded-full bg-secondary">
        <motion.div
          className="h-full rounded-full bg-primary"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{progress}%</p>
    </div>
  );
}

function SwipeStep() {
  const { ratings, addRating } = useOnboardingStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  const remainingMovies = swipeMovies.filter(
    (m) => !(m.id in ratings)
  );
  const ratedCount = Object.keys(ratings).length;

  const handleSwipe = (movieId: number, reaction: "loved" | "liked" | "skip") => {
    addRating(movieId, reaction);
    setCurrentIndex((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">Rate some movies</h2>
        <p className="mt-2 text-muted-foreground">
          Swipe right if you liked it, left to skip, up if you loved it
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {ratedCount}/{swipeMovies.length} rated
        </p>
      </div>

      <div className="flex justify-center">
        <div className="relative h-[420px] w-[280px]">
          <AnimatePresence>
            {remainingMovies.length > 0 ? (
              remainingMovies
                .slice(0, 2)
                .reverse()
                .map((movie, index) => (
                  <SwipeCard
                    key={movie.id}
                    movie={movie}
                    onSwipe={handleSwipe}
                    isTop={index === remainingMovies.slice(0, 2).length - 1}
                  />
                ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex h-full w-full flex-col items-center justify-center rounded-2xl border border-border bg-card text-center"
              >
                <Check className="h-12 w-12 text-success" />
                <p className="mt-4 text-lg font-semibold text-foreground">
                  All done!
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  You rated {ratedCount} movies
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Button hints */}
      <div className="flex justify-center gap-8 text-xs text-muted-foreground">
        <span>← Skip</span>
        <span>↑ Loved</span>
        <span>Liked →</span>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const { currentStep, selectedGenres, ratings, nextStep, prevStep } =
    useOnboardingStore();
  const [direction, setDirection] = useState(0);

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedGenres.length >= 3;
      case 2:
        return Object.keys(ratings).length >= 5;
      case 3:
        return true; // Streaming services are optional
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed()) {
      setDirection(1);
      nextStep();
    }
  };

  const handlePrev = () => {
    setDirection(-1);
    prevStep();
  };

  return (
    <div className="mx-auto max-w-2xl py-8">
      {/* Step Indicator */}
      {currentStep < 4 && (
        <div className="mb-10">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                      step.number < currentStep
                        ? "bg-primary text-primary-foreground"
                        : step.number === currentStep
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {step.number < currentStep ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      step.number <= currentStep
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`mx-2 h-0.5 w-12 sm:w-20 ${
                      step.number < currentStep
                        ? "bg-primary"
                        : "bg-secondary"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step Content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentStep}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {currentStep === 1 && <GenrePicker />}
          {currentStep === 2 && <SwipeStep />}
          {currentStep === 3 && <StreamingPicker />}
          {currentStep === 4 && <ProfileGeneration />}
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      {currentStep < 4 && (
        <div className="mt-10 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover disabled:opacity-30"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {currentStep === 3 ? "Build Profile" : "Next"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
