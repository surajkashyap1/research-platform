"use client";

import { useState } from "react";
import { CAREER_STAGES } from "@/lib/profile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

// Career-stage picker that reveals a free-text box when "Other" is selected,
// so members in stages we don't list can describe their own.
export function CareerStageField({
  defaultValue,
  defaultOther,
}: {
  defaultValue: string;
  defaultOther: string;
}) {
  const [stage, setStage] = useState(defaultValue);

  return (
    <div className="grid gap-2">
      <Label htmlFor="careerStage">Career stage</Label>
      <Select
        id="careerStage"
        name="careerStage"
        defaultValue={defaultValue}
        options={CAREER_STAGES}
        onValueChange={(v) => setStage(String(v))}
      />
      {stage === "other" && (
        <Input
          name="careerStageOther"
          placeholder="Tell us your career stage"
          defaultValue={defaultOther}
          aria-label="Your career stage"
        />
      )}
    </div>
  );
}
