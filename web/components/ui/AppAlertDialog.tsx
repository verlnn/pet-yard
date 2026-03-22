"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface AppAlertAction {
  label: string;
  onClick: () => void | Promise<void>;
  tone?: "default" | "danger" | "accent";
}

interface AppAlertDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  actionsClassName?: string;
  actions?: AppAlertAction[];
  onConfirm?: () => void | Promise<void>;
  onClose: () => void;
}

export function AppAlertDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "취소",
  actionsClassName = "app-alert-dialog-actions-vertical",
  actions,
  onConfirm,
  onClose
}: AppAlertDialogProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const actionsClassNames = `app-alert-dialog-actions ${actionsClassName}`.trim();
  const resolvedActions = actions ?? [
    { label: cancelLabel, onClick: onClose },
    { label: confirmLabel ?? "확인", onClick: onConfirm ?? onClose, tone: "danger" as const }
  ];

  return createPortal(
    <div className="app-alert-dialog-overlay" role="presentation" onClick={onClose}>
      <div
        className="app-alert-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="app-alert-dialog-title"
        aria-describedby={description ? "app-alert-dialog-description" : undefined}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="app-alert-dialog-copy">
          <h2 id="app-alert-dialog-title" className="app-alert-dialog-title">
            {title}
          </h2>
          {description ? (
            <p id="app-alert-dialog-description" className="app-alert-dialog-description">
              {description}
            </p>
          ) : null}
        </div>

        <div className="app-sidebar-more-divider" />

        <div className={actionsClassNames}>
          {resolvedActions.map((action, index) => (
            <div key={`${action.label}-${index}`} className="app-alert-dialog-action-slot">
              {index > 0 ? <div className="app-alert-dialog-actions-divider" /> : null}
              <button
                type="button"
                className={`app-alert-dialog-action ${action.tone === "danger" ? "app-alert-dialog-action-danger" : ""} ${action.tone === "accent" ? "app-alert-dialog-action-accent" : ""}`}
                onClick={action.onClick}
              >
                {action.label}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
