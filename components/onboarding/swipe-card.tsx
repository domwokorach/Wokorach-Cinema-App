"use client";

import { useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { Heart, ThumbsUp, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeCardProps {
  movie: {
    id: number;
    title: string;
    year: number;
    posterPath: string | null;
  };
  onSwipe: (movieId: number, reaction: "loved" | "liked" | "skip") => void;
  isTop: boolean;
}

export function SwipeCard({ movie, onSwipe, isTop }: SwipeCardProps) {
  const [exitX, setExitX] = useState(0);
  const [exitY, setExitY] = useState(0);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateZ = useTransform(x, [-200, 200], [-15, 15]);
  const opacitySkip = useTransform(x, [-150, -50], [1, 0]);
  const opacityLiked = useTransform(x, [50, 150], [0, 1]);
  const opacityLoved = useTransform(y, [-120, -40], [1, 0]);

  const bgSkip = useTransform(
    x,
    [-200, 0],
    ["rgba(239,68,68,0.3)", "rgba(239,68,68,0)"]
  );
  const bgLiked = useTransform(
    x,
    [0, 200],
    ["rgba(34,197,94,0)", "rgba(34,197,94,0.3)"]
  );
  const bgLoved = useTransform(
    y,
    [-160, 0],
    ["rgba(234,179,8,0.3)", "rgba(234,179,8,0)"]
  );

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const xOffset = info.offset.x;
    const yOffset = info.offset.y;

    if (yOffset < -80 && Math.abs(xOffset) < 100) {
      setExitY(-600);
      onSwipe(movie.id, "loved");
    } else if (xOffset > 100) {
      setExitX(500);
      onSwipe(movie.id, "liked");
    } else if (xOffset < -100) {
      setExitX(-500);
      onSwipe(movie.id, "skip");
    }
  };

  const posterUrl = movie.posterPath
    ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
    : null;

  return (
    <motion.div
      className={cn(
        "absolute h-[420px] w-[280px] cursor-grab select-none overflow-hidden rounded-2xl shadow-2xl active:cursor-grabbing",
        !isTop && "pointer-events-none"
      )}
      style={{
        x,
        y,
        rotateZ,
        zIndex: isTop ? 10 : 0,
      }}
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      exit={{
        x: exitX,
        y: exitY,
        opacity: 0,
        transition: { duration: 0.3 },
      }}
      whileDrag={{ scale: 1.02 }}
    >
      {/* Card background */}
      <div className="relative h-full w-full bg-card">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={movie.title}
            className="h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground">
            No Poster
          </div>
        )}

        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-20">
          <h3 className="text-lg font-bold text-white">{movie.title}</h3>
          <p className="text-sm text-white/70">{movie.year}</p>
        </div>

        {/* Glow overlays */}
        <motion.div
          className="absolute inset-0 bg-red-500/0"
          style={{ backgroundColor: bgSkip }}
        />
        <motion.div
          className="absolute inset-0 bg-green-500/0"
          style={{ backgroundColor: bgLiked }}
        />
        <motion.div
          className="absolute inset-0 bg-yellow-500/0"
          style={{ backgroundColor: bgLoved }}
        />

        {/* Direction indicators */}
        <motion.div
          className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-red-500 px-3 py-1.5 text-sm font-bold text-white"
          style={{ opacity: opacitySkip }}
        >
          <X className="h-4 w-4" /> SKIP
        </motion.div>
        <motion.div
          className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-green-500 px-3 py-1.5 text-sm font-bold text-white"
          style={{ opacity: opacityLiked }}
        >
          <ThumbsUp className="h-4 w-4" /> LIKED
        </motion.div>
        <motion.div
          className="absolute left-1/2 top-4 -translate-x-1/2 flex items-center gap-1 rounded-full bg-yellow-500 px-3 py-1.5 text-sm font-bold text-white"
          style={{ opacity: opacityLoved }}
        >
          <Heart className="h-4 w-4" /> LOVED
        </motion.div>
      </div>
    </motion.div>
  );
}
