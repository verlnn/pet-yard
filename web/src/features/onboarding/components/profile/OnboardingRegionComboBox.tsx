"use client";

import { useEffect, useState } from "react";

export type RegionOption = {
  code: string;
  name: string;
};

type OnboardingRegionComboBoxProps = {
  label: string;
  placeholder: string;
  value: string;
  options: RegionOption[];
  disabled?: boolean;
  onChange: (nextCode: string) => void;
};

export default function OnboardingRegionComboBox({
  label,
  placeholder,
  value,
  options,
  disabled,
  onChange
}: OnboardingRegionComboBoxProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const selected = options.find((opt) => opt.code === value);
  const visible = query ? options.filter((opt) => opt.name.includes(query.trim())) : options;

  useEffect(() => {
    if (!value) return;
    setQuery("");
  }, [value]);

  const displayValue = selected ? selected.name : query;

  return (
    <div className="onboarding-profile-combobox">
      <label className="onboarding-profile-combobox-label">{label}</label>
      <div className="onboarding-profile-combobox-shell">
        <input
          className="onboarding-profile-input"
          value={displayValue}
          placeholder={placeholder}
          onFocus={() => !disabled && setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            if (selected) onChange("");
            if (!open) setOpen(true);
          }}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          disabled={disabled}
        />
        {open && !disabled && (
          <div className="onboarding-profile-combobox-menu">
            {visible.length === 0 && (
              <div className="onboarding-profile-combobox-empty">결과가 없습니다.</div>
            )}
            {visible.map((opt) => (
              <button
                type="button"
                key={opt.code}
                className="onboarding-profile-combobox-option"
                onMouseDown={() => {
                  onChange(opt.code);
                  setQuery("");
                  setOpen(false);
                }}
              >
                <span>{opt.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
