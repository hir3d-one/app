"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function UsageSection() {
  return (
    <Card className="border-zinc-200 dark:border-zinc-800 dark:bg-transparent">
      <CardHeader>
        <CardTitle className="text-zinc-900 dark:text-zinc-100">Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Usage tracking information will appear here.
        </p>
      </CardContent>
    </Card>
  );
} 