"use client";

import React, { createElement, useCallback, useEffect, useLayoutEffect, useRef, type CSSProperties } from "react";
import { useEditorStore, findElementByIdInTree } from "@/lib/visual-editor/store";
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
      // Clone whatever's already at this index (instead of just checking
      // "is it non-null" and reusing the same reference) — otherwise the
      // write at the end of this loop mutates the ORIGINAL nested
      // array/object in place, corrupting whatever state (e.g. undo
      // history) still holds a reference to it.
      const existing = cursor[arrayIndex];
      if (existing == null || typeof existing !== "object") {
        cursor[arrayIndex] = isNextIndex ? [] : {};
      } else {
        cursor[arrayIndex] = Array.isArray(existing) ? [...existing] : { ...existing };
      }
      cursor = cursor[arrayIndex];
      continue;
    }

    const existing = cursor[part];
    if (existing == null || typeof existing !== "object") {
      cursor[part] = isNextIndex ? [] : {};
    } else {
      cursor[part] = Array.isArray(existing) ? [...existing] : { ...existing };
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
  // BUG THIS FIXES: this used to call setDeepValue({}, fieldPath, nextValue)
  // — building the update from a *blank* object every time. Editing item 0
  // of a 4-item array (e.g. "quotes.0") produced settings = { quotes: [x] },
  // a real but 1-element array. The store's updateElement does a shallow
  // merge on array-typed fields (replaces, doesn't merge), so that
  // 1-element array *wholesale replaced* the real 4-item array, silently
  // destroying items 1-3 on every single edit — and edits made in the
  // middle of an array (e.g. "quotes.2") produced a sparse array, which is
  // what eventually surfaces downstream as "x.map is not a function" once
  // that hole propagates through JSON (de)serialization.
  // Fix: start from the node's CURRENT full settings, not {}, so the
  // update always carries the complete, unmodified array with just the
  // one edited value changed.
  const state = useEditorStore.getState();
  const currentElement = findElementByIdInTree(state.pageStructure.elements, nodeId);
  const currentSettings = (currentElement as any)?.settings || {};
  const settings = setDeepValue({ ...currentSettings }, fieldPath, nextValue);

  // Second bug, same root cause class as the one above (and as
  // AdvancedPanel.tsx, fixed separately in 38b33003): editorNodeToBlock
  // merges an element's settings then content, with content winning on a
  // key collision. This function only ever wrote to settings — so even
  // with the array-truncation bug above fixed, a fresh edit here could
  // still be invisible on the live page if content[topLevelKey] held any
  // value at all (which it does for most elements from the moment
  // they're created — see createElementFromWidget). Mirror the same
  // top-level key into content so the two can't drift apart.
  const currentContent = (currentElement as any)?.content || {};
  const topLevelKey = fieldPath.split(".")[0];
  const content = topLevelKey && settings[topLevelKey] !== undefined
    ? { ...currentContent, [topLevelKey]: settings[topLevelKey] }
    : currentContent;

  state.updateElement(nodeId, {
    settings,
    content,
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
