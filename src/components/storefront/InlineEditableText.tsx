"use client";

import React, { createElement, useCallback, useEffect, useLayoutEffect, useRef, type CSSProperties } from "react";
import { useEditorStore } from "@/lib/visual-editor/store";
import { useTemplateBlockEditContext } from "@/components/storefront/TemplateBlockRenderer";

type EditableTag = "div" | "p" | "span" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "button";

export interface InlineEditableTextProps {
  nodeId?: string;
  field?: string;
  fieldPath?: string;
  value: string;
  isEditor?: boolean;
  as?: EditableTag;
  className?: string;
  style?: CSSProperties;
  multiline?: boolean;
  title?: string;
  selectNodeOnFocus?: boolean;
}

const isNumericKey = (value: string): boolean => /^\d+$/.test(value);

function setDeepValue(target: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const parts = path.split(".").filter(Boolean);
  if (parts.length === 0) return target;

  const root: Record<string, unknown> = Array.isArray(target) ? [...(target as unknown[])] as unknown as Record<string, unknown> : { ...target };
  let cursor: any = root;

  for (let index = 0; index < parts.length - 1; index += 1) {
    const part = parts[index];
    const nextPart = parts[index + 1];
    const isNextIndex = isNumericKey(nextPart);

    if (isNumericKey(part)) {
      const arrayIndex = Number(part);
      if (!Array.isArray(cursor)) {
        cursor = [];
      }
      if (cursor[arrayIndex] == null || typeof cursor[arrayIndex] !== "object") {
        cursor[arrayIndex] = isNextIndex ? [] : {};
      }
      cursor = cursor[arrayIndex];
      continue;
    }

    if (cursor[part] == null || typeof cursor[part] !== "object") {
      cursor[part] = isNextIndex ? [] : {};
    }
    cursor = cursor[part];
  }

  const lastPart = parts[parts.length - 1];
  if (isNumericKey(lastPart)) {
    const arrayIndex = Number(lastPart);
    if (!Array.isArray(cursor)) {
      cursor = [];
    }
    cursor[arrayIndex] = value;
    return root;
  }

  cursor[lastPart] = value;
  return root;
}

function commitTextUpdate(nodeId: string | undefined, fieldPath: string, nextValue: string) {
  if (!nodeId) return;
  const settings = setDeepValue({}, fieldPath, nextValue);
  useEditorStore.getState().updateElement(nodeId, {
    settings,
  });
}

export function InlineEditableText({
  nodeId,
  field,
  fieldPath,
  value,
  isEditor = false,
  as = "div",
  className,
  style,
  multiline = false,
  title,
  selectNodeOnFocus = true,
}: InlineEditableTextProps) {
  const templateEditContext = useTemplateBlockEditContext();
  const resolvedNodeId = nodeId || templateEditContext.blockId;
  const resolvedIsEditor = isEditor || Boolean(templateEditContext.isEditor);
  const resolvedFieldPath = fieldPath || field || "";
  const ref = useRef<HTMLElement | null>(null);
  const isFocusedRef = useRef(false);
  const focusCommitValueRef = useRef(value ?? "");
  const selectFrameRef = useRef<number | null>(null);
  const normalizedValue = value ?? "";

  useLayoutEffect(() => {
    if (isFocusedRef.current || !ref.current) return;
    const currentText = ref.current.textContent ?? "";
    if (currentText !== normalizedValue) {
      ref.current.textContent = normalizedValue;
    }
  }, [normalizedValue]);

  useEffect(() => {
    return () => {
      if (selectFrameRef.current != null) {
        cancelAnimationFrame(selectFrameRef.current);
      }
    };
  }, []);

  const handleInput = useCallback((_event: React.FormEvent<HTMLElement>) => {
    // Let the browser own the editable DOM while focused.
  }, []);

  const handleBlur = useCallback((event: React.FocusEvent<HTMLElement>) => {
    if (selectFrameRef.current != null) {
      cancelAnimationFrame(selectFrameRef.current);
      selectFrameRef.current = null;
    }
    isFocusedRef.current = false;
    const next = (event.currentTarget.innerText || event.currentTarget.textContent || "").replace(/\u00a0/g, " ");
    const sanitized = multiline ? next : next;
    if (sanitized !== focusCommitValueRef.current) {
      commitTextUpdate(resolvedNodeId, resolvedFieldPath, sanitized);
    }
  }, [multiline, resolvedFieldPath, resolvedNodeId]);

  if (!resolvedIsEditor) {
    return createElement(as, { className, style }, normalizedValue);
  }

  return createElement(
    as,
    {
      ref: ref as any,
      contentEditable: true,
      suppressContentEditableWarning: true,
      spellCheck: false,
      title,
      "data-editor-node-id": resolvedNodeId,
      "data-inline-field": resolvedFieldPath,
      "data-inline-editable": "true",
      className,
      style: { ...style, outline: "none" },
      onPointerDownCapture: (event: React.PointerEvent<HTMLElement>) => {
        event.stopPropagation();
      },
      onKeyDownCapture: (event: React.KeyboardEvent<HTMLElement>) => {
        event.stopPropagation();
      },
      onMouseDown: (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
      },
      onMouseDownCapture: (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
      },
      onClick: (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
      },
      onClickCapture: (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
      },
      onFocus: () => {
        isFocusedRef.current = true;
        const currentValue = value ?? "";
        focusCommitValueRef.current = currentValue;
        if (selectNodeOnFocus && resolvedNodeId) {
          if (selectFrameRef.current != null) {
            cancelAnimationFrame(selectFrameRef.current);
          }
          selectFrameRef.current = requestAnimationFrame(() => {
            useEditorStore.getState().setSelectedElementId(resolvedNodeId);
            selectFrameRef.current = null;
          });
        }
      },
      onBlur: handleBlur,
      onInput: handleInput,
      onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
        if (event.key === "Escape") {
          event.preventDefault();
          (event.currentTarget as HTMLElement).blur();
        }
        if (!multiline && event.key === "Enter") {
          event.preventDefault();
          (event.currentTarget as HTMLElement).blur();
        }
      },
    },
    null
  );
}
