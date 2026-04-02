"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  Film,
  CheckCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ImportSource = "letterboxd" | "imdb" | "csv" | null;
type ImportStep = "select" | "upload" | "preview" | "processing";

const sources = [
  {
    id: "letterboxd" as const,
    name: "Letterboxd",
    description: "Import your ratings from Letterboxd export",
    icon: Film,
    fileType: ".csv",
  },
  {
    id: "imdb" as const,
    name: "IMDb",
    description: "Import your IMDb ratings list CSV export",
    icon: FileText,
    fileType: ".csv",
  },
  {
    id: "csv" as const,
    name: "Custom CSV",
    description: "Upload a CSV with title, year, and rating columns",
    icon: Upload,
    fileType: ".csv",
  },
];

export default function ImportPage() {
  const [selectedSource, setSelectedSource] = useState<ImportSource>(null);
  const [step, setStep] = useState<ImportStep>("select");
  const [isDragOver, setIsDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setFile(files[0]);
    setStep("preview");
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFileSelect(e.dataTransfer.files);
    },
    []
  );

  const handleProcess = () => {
    setStep("processing");
    // In production: API call to process the file
    setTimeout(() => {
      // Processing would complete and redirect
    }, 3000);
  };

  const resetImport = () => {
    setSelectedSource(null);
    setStep("select");
    setFile(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Import Ratings</h1>
        <p className="mt-1 text-muted-foreground">
          Bring your existing movie ratings to improve recommendations
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Source Selection */}
        {step === "select" && (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid gap-4 sm:grid-cols-3"
          >
            {sources.map((source) => (
              <button
                key={source.id}
                onClick={() => {
                  setSelectedSource(source.id);
                  setStep("upload");
                }}
                className="flex flex-col items-center gap-4 rounded-xl border-2 border-border bg-card p-8 text-center transition-all hover:border-primary hover:bg-primary/5"
              >
                <div className="rounded-full bg-secondary p-4">
                  <source.icon className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {source.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {source.description}
                  </p>
                </div>
              </button>
            ))}
          </motion.div>
        )}

        {/* Step 2: Upload */}
        {step === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <button
              onClick={resetImport}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Choose a different source
            </button>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={cn(
                "flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-16 text-center transition-colors",
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card"
              )}
            >
              <div className="rounded-full bg-secondary p-4">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Drop your {selectedSource} export file here
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  or click to browse (.csv files only)
                </p>
              </div>
              <label className="cursor-pointer rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                Browse Files
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
              </label>
            </div>
          </motion.div>
        )}

        {/* Step 3: Preview */}
        {step === "preview" && file && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <button
              onClick={() => setStep("upload")}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Upload a different file
            </button>

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-secondary p-3">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {file.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-lg border border-border bg-background p-4">
                <p className="text-sm text-muted-foreground">
                  Preview will appear here after file parsing. Movies will be
                  matched with TMDB entries.
                </p>
                <div className="mt-4 space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-lg bg-secondary/50 px-3 py-2"
                    >
                      <div className="h-8 w-6 rounded bg-secondary" />
                      <div className="flex-1">
                        <div className="h-3 w-2/3 rounded bg-secondary" />
                        <div className="mt-1 h-2 w-1/3 rounded bg-secondary" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleProcess}
                  className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Import Ratings
                </button>
                <button
                  onClick={resetImport}
                  className="rounded-lg border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Processing */}
        {step === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="h-12 w-12 text-primary" />
            </motion.div>
            <h3 className="mt-6 text-lg font-semibold text-foreground">
              Processing your ratings...
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Matching your movies with our database. This may take a moment.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
