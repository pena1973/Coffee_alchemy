"use client";

import { CSSProperties, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

type SelectOption = {
  value: string;
  label: string;
};

type CustomSelectProps = {
  className?: string;
  name?: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

export function CustomSelect({ className = "", name, options, value, defaultValue, onValueChange }: CustomSelectProps) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const isControlled = value !== undefined;
  const [open, setOpen] = useState(false);
  const [listStyle, setListStyle] = useState<CSSProperties | null>(null);
  const [internalValue, setInternalValue] = useState(defaultValue ?? options[0]?.value ?? "");
  const selectedValue = isControlled ? value : internalValue;
  const selected = options.find((option) => option.value === selectedValue) ?? options[0];

  useEffect(() => {
    function close(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || listRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;
      const bottomSpace = window.innerHeight - rect.bottom - 12;
      setListStyle({
        left: rect.left,
        top: rect.bottom + 5,
        width: rect.width,
        maxHeight: Math.max(160, Math.min(260, bottomSpace)),
      });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  function choose(nextValue: string) {
    if (!isControlled) setInternalValue(nextValue);
    onValueChange?.(nextValue);
    setOpen(false);
  }

  const list =
    open && listStyle && typeof document !== "undefined"
      ? createPortal(
          <div className="custom-select-list custom-select-portal" id={`${id}-list`} ref={listRef} role="listbox" style={listStyle}>
            {options.map((option) => (
              <button
                aria-selected={option.value === selected?.value}
                className="custom-select-option"
                key={option.value}
                onClick={() => choose(option.value)}
                role="option"
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>,
          document.body,
        )
      : null;

  return (
    <div className={`custom-select ${className}`} ref={rootRef}>
      {name ? <input name={name} type="hidden" value={selected?.value ?? ""} /> : null}
      <button
        aria-controls={`${id}-list`}
        aria-expanded={open}
        className="custom-select-trigger"
        onClick={() => setOpen((state) => !state)}
        type="button"
      >
        <span>{selected?.label}</span>
        <span className="custom-select-arrow" aria-hidden="true" />
      </button>
      {list}
    </div>
  );
}
