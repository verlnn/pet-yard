"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface AppConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export function AppConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "취소",
  onConfirm,
  onClose
}: AppConfirmDialogProps) {
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

  return createPortal(
    <div className="app-confirm-dialog-overlay" role="presentation" onClick={onClose}>
      <div
        className="app-confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="app-confirm-dialog-title"
        aria-describedby="app-confirm-dialog-description"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="app-confirm-dialog-copy">
          <h2 id="app-confirm-dialog-title" className="app-confirm-dialog-title">
            {title}
          </h2>
          <p id="app-confirm-dialog-description" className="app-confirm-dialog-description">
            {description}
          </p>
        </div>

        <div className="app-confirm-dialog-actions">
          <button type="button" className="app-confirm-dialog-button" onClick={onClose}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className="app-confirm-dialog-button app-confirm-dialog-button-danger"
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
