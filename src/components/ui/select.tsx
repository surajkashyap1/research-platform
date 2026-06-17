"use client";

import * as React from "react";
import { Select as BaseSelect } from "@base-ui/react/select";

import { cn } from "@/lib/utils";

export type SelectOption = { value: string; label: string; disabled?: boolean };

function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4 shrink-0"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

// Styled select backed by base-ui (Radix-style) so the open list is a popover
// we fully control — paper surface, hairline border, claret selection — not the
// unstyleable OS dropdown. Renders a hidden input from `name`, so it still
// submits inside the server-action GET forms (see DESIGN.md).
export function Select({
  name,
  defaultValue,
  options,
  placeholder,
  id,
  required,
  className,
  onValueChange,
}: {
  name?: string;
  defaultValue?: string;
  options: SelectOption[];
  placeholder?: string;
  id?: string;
  required?: boolean;
  className?: string;
  onValueChange?: (value: unknown) => void;
}) {
  const items = React.useMemo(
    () => Object.fromEntries(options.map((o) => [o.value, o.label])),
    [options]
  );

  return (
    <BaseSelect.Root
      name={name}
      defaultValue={defaultValue ?? null}
      required={required}
      items={items}
      onValueChange={onValueChange}
    >
      <BaseSelect.Trigger
        id={id}
        className={cn(
          "flex h-8 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-input bg-transparent py-1 pl-2.5 pr-2.5 text-base text-foreground transition-colors outline-none select-none hover:border-ring/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-[popup-open]:border-ring disabled:pointer-events-none disabled:opacity-50 md:text-sm dark:bg-input/30",
          className
        )}
      >
        <BaseSelect.Value
          placeholder={placeholder}
          className="truncate data-[placeholder]:text-muted-foreground"
        />
        <BaseSelect.Icon className="text-muted-foreground transition-colors data-[popup-open]:text-foreground">
          <ChevronIcon />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>

      <BaseSelect.Portal>
        <BaseSelect.Positioner
          sideOffset={6}
          alignItemWithTrigger={false}
          className="z-50 outline-none"
        >
          <BaseSelect.Popup
            className={cn(
              "max-h-[min(22rem,var(--available-height))] min-w-[var(--anchor-width)] overflow-y-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg",
              "origin-[var(--transform-origin)] transition-[transform,opacity] duration-150 ease-out",
              "data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0",
              "data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0",
              "motion-reduce:transition-none motion-reduce:data-[starting-style]:scale-100"
            )}
          >
            {options.map((o) => (
              <BaseSelect.Item
                key={o.value}
                value={o.value}
                disabled={o.disabled}
                className="relative flex cursor-pointer items-center rounded-md py-1.5 pl-2.5 pr-8 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[selected]:font-medium data-[selected]:text-primary"
              >
                <BaseSelect.ItemText>{o.label}</BaseSelect.ItemText>
                <BaseSelect.ItemIndicator className="absolute right-2.5 inline-flex text-primary">
                  <CheckIcon />
                </BaseSelect.ItemIndicator>
              </BaseSelect.Item>
            ))}
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}
