/**
 * AfroStore Template Editor
 * 
 * Injected into the HTML template iframe to enable visual editing.
 * Communicates with parent frame via postMessage.
 * 
 * Supports: text editing, image swapping, link editing, background images,
 * visibility toggling (show/hide sections).
 */
(function () {
  "use strict";

  // ─── STATE ──────────────────────────────────────────────────
  var isEditing = false;
  var hasChanges = false;
  var selectedElement = null;
  var toolbar = null;
  var imageModal = null;
  var overlay = null;

  // Elements to skip — never make editable
  var SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "IFRAME", "SVG", "PATH", "META", "LINK", "HEAD", "BR", "HR"]);
  var SKIP_CLASSES = ["afro-editor-", "afro-toolbar", "afro-overlay", "afro-modal"];

  function shouldSkip(el) {
    if (!el || !el.tagName) return true;
    if (SKIP_TAGS.has(el.tagName)) return true;
    var cls = el.className || "";
    if (typeof cls === "string") {
      for (var i = 0; i < SKIP_CLASSES.length; i++) {
        if (cls.indexOf(SKIP_CLASSES[i]) !== -1) return true;
      }
    }
    return false;
  }

  // ─── TOOLBAR ────────────────────────────────────────────────

  function createToolbar() {
    toolbar = document.createElement("div");
    toolbar.className = "afro-toolbar";
    toolbar.innerHTML =
      '<div class="afro-toolbar-inner">' +
        '<div class="afro-toolbar-left">' +
          '<span class="afro-toolbar-title">✏️ Template Editor</span>' +
        '</div>' +
        '<div class="afro-toolbar-right">' +
          '<button class="afro-toolbar-btn afro-btn-undo" title="Undo last change">↶ Undo</button>' +
          '<button class="afro-toolbar-btn afro-btn-reset" title="Reset to original template">Reset</button>' +
          '<button class="afro-toolbar-btn afro-btn-cancel">Cancel</button>' +
          '<button class="afro-toolbar-btn afro-btn-save">💾 Save</button>' +
        '</div>' +
      '</div>';

    var style = document.createElement("style");
    style.textContent = [
      ".afro-toolbar { position:fixed; top:0; left:0; right:0; z-index:999999; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; }",
      ".afro-toolbar-inner { display:flex; align-items:center; justify-content:space-between; background:#1a1a2e; color:#fff; padding:8px 16px; box-shadow:0 2px 12px rgba(0,0,0,0.3); }",
      ".afro-toolbar-left { display:flex; align-items:center; gap:12px; }",
      ".afro-toolbar-right { display:flex; align-items:center; gap:8px; }",
      ".afro-toolbar-title { font-size:13px; font-weight:700; letter-spacing:0.5px; }",
      ".afro-toolbar-btn { padding:6px 14px; border:none; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer; transition:all 0.15s; }",
      ".afro-btn-save { background:#10b981; color:#fff; }",
      ".afro-btn-save:hover { background:#059669; }",
      ".afro-btn-cancel { background:#374151; color:#d1d5db; }",
      ".afro-btn-cancel:hover { background:#4b5563; }",
      ".afro-btn-undo { background:#374151; color:#d1d5db; }",
      ".afro-btn-undo:hover { background:#4b5563; }",
      ".afro-btn-reset { background:#dc2626; color:#fff; }",
      ".afro-btn-reset:hover { background:#b91c1c; }",
      // Editable element styles
      "[data-afro-editable]:hover { outline:2px dashed #3b82f6 !important; outline-offset:2px; cursor:pointer; }",
      "[data-afro-editable][contenteditable='true'] { outline:2px solid #3b82f6 !important; outline-offset:2px; background:rgba(59,130,246,0.05) !important; }",
      "[data-afro-editable-img]:hover { outline:2px dashed #8b5cf6 !important; outline-offset:2px; cursor:pointer; position:relative; }",
      "[data-afro-editable-section]:hover { outline:2px dashed #f59e0b !important; outline-offset:2px; }",
      // Image overlay
      ".afro-img-overlay { position:absolute; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:99999; pointer-events:all; cursor:pointer; border-radius:inherit; }",
      ".afro-img-overlay span { background:#8b5cf6; color:#fff; padding:8px 16px; border-radius:8px; font-size:12px; font-weight:600; pointer-events:none; }",
      // Image modal
      ".afro-modal-backdrop { position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.6); z-index:9999999; display:flex; align-items:center; justify-content:center; }",
      ".afro-modal { background:#fff; border-radius:16px; padding:24px; width:420px; max-width:90vw; box-shadow:0 20px 60px rgba(0,0,0,0.3); }",
      ".afro-modal h3 { margin:0 0 16px; font-size:16px; color:#111; }",
      ".afro-modal input { width:100%; padding:10px 14px; border:1px solid #d1d5db; border-radius:10px; font-size:14px; margin-bottom:12px; box-sizing:border-box; }",
      ".afro-modal input:focus { outline:none; border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,0.15); }",
      ".afro-modal-actions { display:flex; gap:8px; justify-content:flex-end; }",
      ".afro-modal-actions button { padding:8px 18px; border:none; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; }",
      ".afro-modal .afro-modal-apply { background:#8b5cf6; color:#fff; }",
      ".afro-modal .afro-modal-apply:hover { background:#7c3aed; }",
      ".afro-modal .afro-modal-close { background:#f3f4f6; color:#374151; }",
      ".afro-modal .afro-modal-upload { background:#3b82f6; color:#fff; }",
      ".afro-modal .afro-modal-upload:hover { background:#2563eb; }",
      ".afro-modal .afro-modal-divider { text-align:center; color:#9ca3af; font-size:12px; margin:8px 0; }",
      // Adjust body for toolbar
      ".afro-editing-active { padding-top:48px !important; }",
      // Element action tooltip
      ".afro-element-tooltip { position:fixed; z-index:999998; background:#1e293b; color:#fff; padding:4px 10px; border-radius:6px; font-size:11px; font-weight:600; pointer-events:none; white-space:nowrap; }",
      // Section controls
      ".afro-section-controls { position:absolute; top:4px; right:4px; z-index:99998; display:flex; gap:4px; opacity:0; transition:opacity 0.15s; }",
      "[data-afro-editable-section]:hover .afro-section-controls { opacity:1; }",
      ".afro-section-btn { padding:4px 10px; border:none; border-radius:6px; font-size:10px; font-weight:700; cursor:pointer; background:#f59e0b; color:#fff; }",
      ".afro-section-btn:hover { background:#d97706; }",
      ".afro-section-btn-hide { background:#ef4444; }",
      ".afro-section-btn-hide:hover { background:#dc2626; }",
    ].join("\n");

    document.head.appendChild(style);
    document.body.appendChild(toolbar);
    document.body.classList.add("afro-editing-active");

    // Bind toolbar buttons
    toolbar.querySelector(".afro-btn-save").addEventListener("click", handleSave);
    toolbar.querySelector(".afro-btn-cancel").addEventListener("click", handleCancel);
    toolbar.querySelector(".afro-btn-undo").addEventListener("click", handleUndo);
    toolbar.querySelector(".afro-btn-reset").addEventListener("click", handleReset);
  }

  // ─── UNDO STACK ─────────────────────────────────────────────

  var undoStack = [];

  function pushUndo(desc, undoFn) {
    undoStack.push({ desc: desc, undo: undoFn });
  }

  function handleUndo() {
    if (undoStack.length === 0) return;
    var action = undoStack.pop();
    action.undo();
  }

  // ─── MAKE ELEMENTS EDITABLE ────────────────────────────────

  function makeEditable() {
    // Text elements
    var textTags = document.querySelectorAll("h1,h2,h3,h4,h5,h6,p,span,a,li,td,th,label,figcaption,blockquote,button,dt,dd");
    textTags.forEach(function (el) {
      if (shouldSkip(el)) return;
      if (shouldSkip(el.parentElement)) return;
      // Only tag leaf text elements (those with direct text content)
      var hasDirectText = false;
      for (var i = 0; i < el.childNodes.length; i++) {
        if (el.childNodes[i].nodeType === Node.TEXT_NODE && el.childNodes[i].textContent.trim().length > 0) {
          hasDirectText = true;
          break;
        }
      }
      if (!hasDirectText && el.children.length > 0) return;
      if (el.textContent.trim().length === 0) return;

      el.setAttribute("data-afro-editable", "text");
    });

    // Images
    var imgs = document.querySelectorAll("img");
    imgs.forEach(function (img) {
      if (shouldSkip(img)) return;
      // Only target visible images above a size threshold
      var rect = img.getBoundingClientRect();
      if (rect.width < 20 || rect.height < 20) return;
      img.setAttribute("data-afro-editable-img", "true");
    });

    // Sections (for show/hide and background editing)
    var sections = document.querySelectorAll("section, [class*='section'], header, footer, nav, [class*='banner'], [class*='hero']");
    sections.forEach(function (sec) {
      if (shouldSkip(sec)) return;
      sec.setAttribute("data-afro-editable-section", "true");
      sec.style.position = sec.style.position || "relative";
    });
  }

  // ─── EVENT HANDLERS ────────────────────────────────────────

  function handleTextClick(e) {
    var el = e.target.closest("[data-afro-editable]");
    if (!el) return;

    // Deselect previous
    if (selectedElement && selectedElement !== el) {
      selectedElement.removeAttribute("contenteditable");
    }

    var oldText = el.textContent;
    el.setAttribute("contenteditable", "true");
    el.focus();
    selectedElement = el;

    // Track changes on blur
    function onBlur() {
      el.removeAttribute("contenteditable");
      var newText = el.textContent;
      if (newText !== oldText) {
        hasChanges = true;
        pushUndo("text edit", function () {
          el.textContent = oldText;
        });
        notifyParent("change");
      }
      el.removeEventListener("blur", onBlur);
      selectedElement = null;
    }
    el.addEventListener("blur", onBlur);

    e.preventDefault();
    e.stopPropagation();
  }

  function handleImageClick(e) {
    var img = e.target.closest("[data-afro-editable-img]");
    if (!img) return;

    e.preventDefault();
    e.stopPropagation();

    showImageModal(img);
  }

  function showImageModal(img) {
    if (imageModal) imageModal.remove();

    var oldSrc = img.src;

    var backdrop = document.createElement("div");
    backdrop.className = "afro-modal-backdrop";
    backdrop.innerHTML =
      '<div class="afro-modal">' +
        '<h3>📷 Change Image</h3>' +
        '<input type="text" class="afro-modal-url" placeholder="Paste image URL here..." value="' + escapeAttr(img.src) + '" />' +
        '<div class="afro-modal-divider">— or —</div>' +
        '<button class="afro-modal-upload">📁 Upload from device</button>' +
        '<input type="file" class="afro-modal-file" accept="image/*" style="display:none" />' +
        '<div class="afro-modal-actions">' +
          '<button class="afro-modal-close">Cancel</button>' +
          '<button class="afro-modal-apply">Apply</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(backdrop);
    imageModal = backdrop;

    var urlInput = backdrop.querySelector(".afro-modal-url");
    var fileInput = backdrop.querySelector(".afro-modal-file");

    // Upload button triggers file picker
    backdrop.querySelector(".afro-modal-upload").addEventListener("click", function () {
      fileInput.click();
    });

    // File selected — upload via parent
    fileInput.addEventListener("change", function () {
      var file = fileInput.files[0];
      if (!file) return;

      var reader = new FileReader();
      reader.onload = function (evt) {
        // Send to parent for upload to storage
        window.parent.postMessage({
          type: "afro-editor-upload-image",
          dataUrl: evt.target.result,
          fileName: file.name,
          mimeType: file.type,
        }, "*");

        // Show loading state
        backdrop.querySelector(".afro-modal-upload").textContent = "⏳ Uploading...";
        backdrop.querySelector(".afro-modal-upload").disabled = true;
      };
      reader.readAsDataURL(file);
    });

    // Listen for upload result from parent
    function onUploadResult(evt) {
      if (!evt.data || evt.data.type !== "afro-editor-image-uploaded") return;
      window.removeEventListener("message", onUploadResult);
      urlInput.value = evt.data.url;
      backdrop.querySelector(".afro-modal-upload").textContent = "✅ Uploaded!";
    }
    window.addEventListener("message", onUploadResult);

    // Apply
    backdrop.querySelector(".afro-modal-apply").addEventListener("click", function () {
      var newSrc = urlInput.value.trim();
      if (newSrc && newSrc !== oldSrc) {
        img.src = newSrc;
        // Also update srcset if present
        if (img.srcset) img.srcset = "";
        hasChanges = true;
        pushUndo("image change", function () {
          img.src = oldSrc;
        });
        notifyParent("change");
      }
      closeModal();
    });

    // Cancel
    backdrop.querySelector(".afro-modal-close").addEventListener("click", closeModal);
    backdrop.addEventListener("click", function (e) {
      if (e.target === backdrop) closeModal();
    });

    function closeModal() {
      window.removeEventListener("message", onUploadResult);
      if (imageModal) {
        imageModal.remove();
        imageModal = null;
      }
    }

    urlInput.focus();
    urlInput.select();
  }

  // ─── ELEMENT TOOLTIP ────────────────────────────────────────

  var tooltipEl = null;

  function showTooltip(e) {
    var el = e.target.closest("[data-afro-editable], [data-afro-editable-img]");
    if (!el) {
      hideTooltip();
      return;
    }

    if (!tooltipEl) {
      tooltipEl = document.createElement("div");
      tooltipEl.className = "afro-element-tooltip";
      document.body.appendChild(tooltipEl);
    }

    var type = el.hasAttribute("data-afro-editable-img") ? "📷 Click to change image" : "✏️ Click to edit text";
    tooltipEl.textContent = type;
    tooltipEl.style.display = "block";
    tooltipEl.style.left = e.clientX + 12 + "px";
    tooltipEl.style.top = e.clientY - 30 + "px";
  }

  function hideTooltip() {
    if (tooltipEl) tooltipEl.style.display = "none";
  }

  // ─── SAVE / CANCEL / RESET ─────────────────────────────────

  function handleSave() {
    // Deselect any active editing
    if (selectedElement) {
      selectedElement.removeAttribute("contenteditable");
      selectedElement = null;
    }

    // Clean up editor elements before capturing HTML
    var html = getCleanHtml();

    window.parent.postMessage({
      type: "afro-editor-save",
      html: html,
    }, "*");
  }

  function handleCancel() {
    if (hasChanges) {
      if (!confirm("You have unsaved changes. Are you sure you want to cancel?")) return;
    }
    window.parent.postMessage({ type: "afro-editor-cancel" }, "*");
  }

  function handleReset() {
    if (!confirm("This will reset the template to its original state. All your edits will be lost. Continue?")) return;
    window.parent.postMessage({ type: "afro-editor-reset" }, "*");
  }

  function getCleanHtml() {
    // Remove all editor-injected elements and attributes
    var clone = document.documentElement.cloneNode(true);

    // Remove editor toolbar, tooltip, modal, styles
    var editorEls = clone.querySelectorAll(".afro-toolbar, .afro-element-tooltip, .afro-modal-backdrop, .afro-img-overlay, .afro-section-controls");
    editorEls.forEach(function (el) { el.remove(); });

    // Remove editor styles
    var styles = clone.querySelectorAll("style");
    styles.forEach(function (s) {
      if (s.textContent && s.textContent.indexOf("afro-toolbar") !== -1) s.remove();
    });

    // Remove editor scripts
    var scripts = clone.querySelectorAll("script");
    scripts.forEach(function (s) {
      if (s.src && s.src.indexOf("template-editor") !== -1) s.remove();
      if (s.textContent && s.textContent.indexOf("afro-editor") !== -1) s.remove();
    });

    // Remove editor data attributes
    clone.querySelectorAll("[data-afro-editable]").forEach(function (el) {
      el.removeAttribute("data-afro-editable");
      el.removeAttribute("contenteditable");
    });
    clone.querySelectorAll("[data-afro-editable-img]").forEach(function (el) {
      el.removeAttribute("data-afro-editable-img");
    });
    clone.querySelectorAll("[data-afro-editable-section]").forEach(function (el) {
      el.removeAttribute("data-afro-editable-section");
    });

    // Remove the editing body class
    clone.querySelector("body").classList.remove("afro-editing-active");

    // Remove the bridge script too (it gets re-injected on serve)
    scripts = clone.querySelectorAll("script");
    scripts.forEach(function (s) {
      if (s.textContent && s.textContent.indexOf("afrostore-add-to-cart") !== -1) s.remove();
      if (s.textContent && s.textContent.indexOf("afrostore-template-loaded") !== -1) s.remove();
    });

    return "<!DOCTYPE html>\n" + clone.outerHTML;
  }

  // ─── COMMUNICATION ─────────────────────────────────────────

  function notifyParent(type) {
    window.parent.postMessage({ type: "afro-editor-" + type, hasChanges: hasChanges }, "*");
  }

  // Listen for messages from parent
  window.addEventListener("message", function (e) {
    if (!e.data) return;

    switch (e.data.type) {
      case "afro-editor-start":
        startEditing();
        break;
      case "afro-editor-stop":
        stopEditing();
        break;
      case "afro-editor-image-uploaded":
        // Handled by the modal listener
        break;
    }
  });

  // ─── START / STOP ──────────────────────────────────────────

  function startEditing() {
    if (isEditing) return;
    isEditing = true;
    hasChanges = false;
    undoStack = [];

    createToolbar();
    makeEditable();

    // Bind event listeners
    document.addEventListener("click", handleTextClick, true);
    document.addEventListener("click", handleImageClick, true);
    document.addEventListener("mousemove", showTooltip);
    document.addEventListener("mouseleave", hideTooltip);

    notifyParent("started");
  }

  function stopEditing() {
    if (!isEditing) return;
    isEditing = false;

    // Remove toolbar
    if (toolbar) { toolbar.remove(); toolbar = null; }
    if (tooltipEl) { tooltipEl.remove(); tooltipEl = null; }
    if (imageModal) { imageModal.remove(); imageModal = null; }

    document.body.classList.remove("afro-editing-active");

    // Remove editable attributes
    document.querySelectorAll("[data-afro-editable]").forEach(function (el) {
      el.removeAttribute("data-afro-editable");
      el.removeAttribute("contenteditable");
    });
    document.querySelectorAll("[data-afro-editable-img]").forEach(function (el) {
      el.removeAttribute("data-afro-editable-img");
    });
    document.querySelectorAll("[data-afro-editable-section]").forEach(function (el) {
      el.removeAttribute("data-afro-editable-section");
    });

    // Remove event listeners
    document.removeEventListener("click", handleTextClick, true);
    document.removeEventListener("click", handleImageClick, true);
    document.removeEventListener("mousemove", showTooltip);
    document.removeEventListener("mouseleave", hideTooltip);
  }

  // ─── HELPERS ────────────────────────────────────────────────

  function escapeAttr(s) {
    return (s || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // Auto-start if loaded with edit param
  if (window.location.search.indexOf("afro_edit=1") !== -1) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", startEditing);
    } else {
      startEditing();
    }
  }

  // Notify parent that editor script is loaded and ready
  window.parent.postMessage({ type: "afro-editor-ready" }, "*");
})();
