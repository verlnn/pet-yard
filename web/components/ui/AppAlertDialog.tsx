"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface AppAlertDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  actionsClassName?: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export function AppAlertDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "취소",
  actionsClassName = "app-alert-dialog-actions-vertical",
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

  return createPortal(
    <div className="app-alert-dialog-overlay" role="presentation" onClick={onClose}>
      <div
        className="app-alert-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="app-alert-dialog-title"
        aria-describedby="app-alert-dialog-description"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="app-alert-dialog-copy">
          <h2 id="app-alert-dialog-title" className="app-alert-dialog-title">
            {title}
          </h2>
          <p id="app-alert-dialog-description" className="app-alert-dialog-description">
            {description}
          </p>
        </div>

        <div className="app-sidebar-more-divider" />

        <div className={actionsClassNames}>
          <button type="button" className="app-alert-dialog-action" onClick={onClose}>
            {cancelLabel}
          </button>
          <div className="app-alert-dialog-actions-divider" />
          <button
            type="button"
            className="app-alert-dialog-action app-alert-dialog-action-danger"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
