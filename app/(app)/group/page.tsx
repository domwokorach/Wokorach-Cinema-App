"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Plus, LogIn, ArrowRight } from "lucide-react";
import Link from "next/link";

// Mock groups data
const mockGroups = [
  {
    id: "grp-1",
    name: "Friday Night Crew",
    memberCount: 4,
    lastActive: "2 hours ago",
  },
  {
    id: "grp-2",
    name: "Film Club",
    memberCount: 8,
    lastActive: "1 day ago",
  },
];

export default function GroupPage() {
  const [inviteCode, setInviteCode] = useState("");
  const [groups] = useState(mockGroups);

  const handleCreateGroup = () => {
    // In production: API call to create group
    alert("Create group flow would open here");
  };

  const handleJoinGroup = () => {
    if (!inviteCode.trim()) return;
    // In production: API call to join group
    alert(`Joining group with code: ${inviteCode}`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Group Mode</h1>
        <p className="mt-1 text-muted-foreground">
          Find movies everyone in your group will enjoy
        </p>
      </div>

      {/* Actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Create Group */}
        <button
          onClick={handleCreateGroup}
          className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border bg-card p-8 text-center transition-colors hover:border-primary hover:bg-primary/5"
        >
          <div className="rounded-full bg-primary/10 p-4">
            <Plus className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Create a Group</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Start a new group and invite your friends
            </p>
          </div>
        </button>

        {/* Join Group */}
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-8 text-center">
          <div className="rounded-full bg-secondary p-4">
            <LogIn className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Join a Group</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter an invite code to join
            </p>
          </div>
          <div className="flex w-full max-w-xs gap-2 mt-2">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Enter invite code"
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={handleJoinGroup}
              disabled={!inviteCode.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              Join
            </button>
          </div>
        </div>
      </div>

      {/* Existing Groups */}
      {groups.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Your Groups
          </h2>
          <div className="space-y-3">
            {groups.map((group) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Link
                  href={`/group/${group.id}`}
                  className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-surface-hover"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {group.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {group.memberCount} members - Active {group.lastActive}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
