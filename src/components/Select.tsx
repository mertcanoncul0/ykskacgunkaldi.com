import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Icon } from "../lib/icons";

export type SelectOption = {
  value: string;
  label: string;
  hint?: string;
  disabled?: boolean;
};

type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  ariaLabel?: string;
  icon?: string; // material symbol name
  fullWidth?: boolean;
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
};

export function Select({
  value,
  onChange,
  options,
  placeholder = "Seçiniz",
  label,
  ariaLabel,
  icon,
  fullWidth,
  size = "md",
  disabled,
  className,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number>(-1);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selected = useMemo(
    () => options.find((o) => o.value === value),
    [options, value],
  );

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  useLayoutEffect(() => {
    if (open) {
      const idx = options.findIndex((o) => o.value === value);
      setActiveIdx(idx >= 0 ? idx : 0);
      requestAnimationFrame(() => {
        const el = listRef.current?.querySelector<HTMLLIElement>(
          `[data-idx="${idx >= 0 ? idx : 0}"]`,
        );
        el?.scrollIntoView({ block: "nearest" });
      });
    }
  }, [open, options, value]);

  const handleKey = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      setActiveIdx((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      const opt = options[activeIdx];
      if (opt && !opt.disabled) {
        onChange(opt.value);
        close();
      }
    } else if (e.key === "Home") {
      setActiveIdx(0);
    } else if (e.key === "End") {
      setActiveIdx(options.length - 1);
    }
  };

  const sizeClasses = size === "sm" ? "px-3 py-2" : "px-4 py-3";

  return (
    <div
      ref={wrapRef}
      className={[
        "relative",
        fullWidth ? "w-full" : "w-fit",
        disabled ? "opacity-50 pointer-events-none" : "",
        className || "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {label ? (
        <label className="block font-label-sm text-label-sm uppercase text-text-muted mb-2">
          {label}
        </label>
      ) : null}
      <button
        ref={buttonRef}
        type="button"
        className={`flex items-center gap-2 w-full border ${open ? "border-black-pure" : "border-border-subtle"} bg-white-pure ${sizeClasses} font-body-md text-body-md text-on-surface hover:border-black-pure transition-colors`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel || label}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={handleKey}
      >
        {icon ? <Icon name={icon} size={20} className="text-text-muted" /> : null}
        <span
          className={`flex-1 text-left truncate${selected ? "" : " text-text-muted"}`}
        >
          {selected ? selected.label : placeholder}
        </span>
        <Icon
          name="expand_more"
          size={20}
          className={`text-text-muted transition-transform${open ? " rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 w-full border border-black-pure bg-white-pure max-h-64 overflow-auto"
          tabIndex={-1}
        >
          {options.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isActive = idx === activeIdx;
            return (
              <li
                key={opt.value + idx}
                data-idx={idx}
                role="option"
                aria-selected={isSelected}
                aria-disabled={opt.disabled || undefined}
                className={[
                  "flex items-center justify-between gap-2 px-4 py-3 font-body-md text-body-md cursor-pointer border-b border-border-subtle last:border-0",
                  isSelected ? "bg-surface-container-high" : "",
                  isActive ? "bg-surface-container" : "",
                  opt.disabled ? "opacity-50 pointer-events-none" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onMouseEnter={() => setActiveIdx(idx)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (opt.disabled) return;
                  onChange(opt.value);
                  close();
                  buttonRef.current?.focus();
                }}
              >
                <span className="truncate">{opt.label}</span>
                {opt.hint ? (
                  <span className="font-label-sm text-label-sm text-text-muted">{opt.hint}</span>
                ) : null}
                {isSelected ? <Icon name="check" size={18} /> : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export default Select;
