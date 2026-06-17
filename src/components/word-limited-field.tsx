"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function countWords(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}

// A labelled input/textarea with a live word counter that turns red past the
// limit. Server actions enforce the same limit as a backstop.
export function WordLimitedField({
  id,
  name,
  label,
  max,
  multiline = false,
  rows = 3,
  required = false,
  placeholder,
  defaultValue = "",
}: {
  id: string;
  name: string;
  label: string;
  max: number;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const n = countWords(value);
  const over = n > max;

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        <span
          className={`text-xs ${over ? "text-destructive" : "text-muted-foreground"}`}
        >
          {n}/{max} words
        </span>
      </div>
      {multiline ? (
        <Textarea
          id={id}
          name={name}
          rows={rows}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-invalid={over}
        />
      ) : (
        <Input
          id={id}
          name={name}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-invalid={over}
        />
      )}
    </div>
  );
}
