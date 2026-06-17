"use client";

import { useState } from "react";
import { submitApplication } from "@/app/applications/actions";
import { WORD_LIMITS, countWords } from "@/lib/application-meta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function WordCounter({ value, max }: { value: string; max: number }) {
  const n = countWords(value);
  const over = n > max;
  return (
    <span className={`text-xs ${over ? "text-destructive" : "text-muted-foreground"}`}>
      {n}/{max} words
    </span>
  );
}

export function ApplicationForm({
  projectId,
  remaining,
  limit,
}: {
  projectId: string;
  remaining: number;
  limit: number;
}) {
  const [motivation, setMotivation] = useState("");
  const [suitability, setSuitability] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("");
  const [skills, setSkills] = useState("");

  const overLimit =
    countWords(motivation) > WORD_LIMITS.motivation ||
    countWords(suitability) > WORD_LIMITS.suitability ||
    countWords(skills) > WORD_LIMITS.skillsSummary;
  const empty = !motivation.trim() || !suitability.trim() || !hoursPerWeek.trim();

  return (
    <form action={submitApplication} className="flex flex-col gap-5">
      <input type="hidden" name="projectId" value={projectId} />

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="motivation">Why are you interested in this role?</Label>
          <WordCounter value={motivation} max={WORD_LIMITS.motivation} />
        </div>
        <Textarea
          id="motivation"
          name="motivation"
          rows={4}
          required
          value={motivation}
          onChange={(e) => setMotivation(e.target.value)}
          placeholder="What draws you to this project and how it fits your goals."
        />
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="suitability">Why are you suitable for the role?</Label>
          <WordCounter value={suitability} max={WORD_LIMITS.suitability} />
        </div>
        <Textarea
          id="suitability"
          name="suitability"
          rows={4}
          required
          value={suitability}
          onChange={(e) => setSuitability(e.target.value)}
          placeholder="Relevant experience, reliability, and what you'd bring to the team."
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="hoursPerWeek">How many hours can you dedicate to the role per week?</Label>
        <Input
          id="hoursPerWeek"
          name="hoursPerWeek"
          type="number"
          min="1"
          max="80"
          step="1"
          required
          value={hoursPerWeek}
          onChange={(e) => setHoursPerWeek(e.target.value)}
          placeholder="e.g. 5"
        />
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="skillsSummary">Skills (optional)</Label>
          <WordCounter value={skills} max={WORD_LIMITS.skillsSummary} />
        </div>
        <Textarea
          id="skillsSummary"
          name="skillsSummary"
          rows={2}
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="e.g. data extraction, literature screening, statistics, writing."
        />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={overLimit || empty}>
          Submit application
        </Button>
        <span className="text-xs text-muted-foreground">
          {remaining} of {limit} applications left this week
        </span>
      </div>
    </form>
  );
}
