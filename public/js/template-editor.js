/**
 * AfroStore Template Editor v3
 *
 * Click-to-select editing: clicking elements sends selection info to the
 * parent React app via postMessage. The parent sidebar handles all editing
 * controls. This script handles: tagging, selection highlight, applying
 * updates from parent, undo, save/cancel/reset, and the slim toolbar.
 */
(function () {
  "use strict";

  var isEditing = false;
  var hasChanges = false;
  var undoStack = [];
  var toolbar = null;
  var tooltipEl = null;
  var selectedEl = null;
  var idCounter = 0;

  // ─── SKIP LIST ──────────────────────────────────────────────

  var SKIP_TAGS = new Set([
    "SCRIPT","STYLE","NOSCRIPT","IFRAME","SVG","PATH","META","LINK",
    "HEAD","BR","HR","CIRCLE","RECT","LINE","POLYGON","POLYLINE",
    "G","DEFS","USE","SYMBOL","CLIPPATH",
  ]);

  function isEditorEl(el) {
    if (!el) return true;
    var c = el.className;
    if (typeof c === "string" && c.indexOf("afro-") !== -1) return true;
    if (el.closest && el.closest("[class*='afro-toolbar'],[class*='afro-tooltip']")) return true;
    return false;
  }

  function shouldSkip(el) {
    if (!el || !el.tagName) return true;
    if (SKIP_TAGS.has(el.tagName)) return true;
    if (isEditorEl(el)) return true;
    return false;
  }

  // ─── STYLES ─────────────────────────────────────────────────

  var EDITOR_CSS = [
    // Toolbar (slim)
    ".afro-toolbar{position:fixed;top:0;left:0;right:0;z-index:999999;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}",
    ".afro-toolbar-inner{display:flex;align-items:center;justify-content:space-between;background:#1a1a2e;color:#fff;padding:8px 16px;box-shadow:0 2px 12px rgba(0,0,0,.3)}",
    ".afro-toolbar-left{display:flex;align-items:center;gap:12px}",
    ".afro-toolbar-right{display:flex;align-items:center;gap:8px}",
    ".afro-toolbar-title{font-size:13px;font-weight:700;letter-spacing:.5px}",
    ".afro-toolbar-btn{padding:6px 14px;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;transition:all .15s}",
    ".afro-btn-save{background:#10b981;color:#fff}.afro-btn-save:hover{background:#059669}",
    ".afro-btn-cancel{background:#374151;color:#d1d5db}.afro-btn-cancel:hover{background:#4b5563}",
    ".afro-btn-undo{background:#374151;color:#d1d5db}.afro-btn-undo:hover{background:#4b5563}",
    ".afro-btn-reset{background:#dc2626;color:#fff}.afro-btn-reset:hover{background:#b91c1c}",

    // Hover states
    "[data-afro-el]:hover{outline:2px dashed #3b82f6!important;outline-offset:2px;cursor:pointer}",
    "[data-afro-img]:hover{outline:2px dashed #8b5cf6!important;outline-offset:2px;cursor:pointer}",
    "[data-afro-section]:hover{outline:2px dashed #f59e0b!important;outline-offset:-2px;cursor:pointer}",

    // Selected state (solid outline)
    ".afro-selected{outline:3px solid #3b82f6!important;outline-offset:2px}",
    "[data-afro-img].afro-selected{outline-color:#8b5cf6!important}",
    "[data-afro-section].afro-selected{outline-color:#f59e0b!important}",

    // Tooltip
    ".afro-tooltip{position:fixed;z-index:999998;background:#1e293b;color:#fff;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:600;pointer-events:none;white-space:nowrap}",

    // Body offset for toolbar
    ".afro-editing-active{padding-top:48px!important}",
  ].join("\n");

  // ─── UNDO ───────────────────────────────────────────────────

  function pushUndo(el, action) {
    var clone = el.cloneNode(true);
    var parent = el.parentNode;
    var next = el.nextSibling;
    undoStack.push(function () {
      if (action === "remove") {
        parent.insertBefore(clone, next);
        tagElement(clone);
      } else if (action === "text") {
        el.textContent = clone.textContent;
      } else if (action === "html") {
        el.innerHTML = clone.innerHTML;
      } else if (action === "style") {
        el.setAttribute("style", clone.getAttribute("style") || "");
      } else if (action === "src") {
        el.src = clone.src;
        if (clone.srcset) el.srcset = clone.srcset;
        if (clone.alt) el.alt = clone.alt;
      } else if (action === "attr") {
        // restore href, target
        if (clone.href) el.href = clone.href; else el.removeAttribute("href");
        if (clone.target) el.target = clone.target; else el.removeAttribute("target");
      }
    });
    hasChanges = true;
    notifyParent("change");
  }

  function handleUndo() {
    if (undoStack.length === 0) return;
    undoStack.pop()();
    sendSectionsList();
  }

  // ─── UNIQUE IDS ─────────────────────────────────────────────

  function nextId() {
    return "afro-" + (++idCounter);
  }

  function assignId(el) {
    if (!el.getAttribute("data-afro-id")) {
      el.setAttribute("data-afro-id", nextId());
    }
    return el.getAttribute("data-afro-id");
  }

  // ─── TAG ELEMENTS ──────────────────────────────────────────

  function tagElement(el) {
    if (shouldSkip(el)) return;
    var tag = el.tagName;

    // Images
    if (tag === "IMG") {
      var rect = el.getBoundingClientRect();
      if (rect.width >= 15 && rect.height >= 15) {
        el.setAttribute("data-afro-img", "1");
        assignId(el);
      }
      return;
    }

    // Background images → section
    var bg = getComputedStyle(el).backgroundImage;
    if (bg && bg !== "none" && bg.indexOf("url(") !== -1) {
      el.setAttribute("data-afro-section", "1");
      assignId(el);
    }

    // Structural sections
    if (
      ["SECTION","HEADER","FOOTER","NAV","ASIDE","MAIN","ARTICLE"].indexOf(tag) !== -1 ||
      (el.className && typeof el.className === "string" &&
        /section|banner|hero|sidebar|widget|block|panel|card|row/i.test(el.className))
    ) {
      if (!el.hasAttribute("data-afro-section")) {
        el.setAttribute("data-afro-section", "1");
        assignId(el);
      }
    }

    // Text elements
    if (
      ["H1","H2","H3","H4","H5","H6","P","SPAN","A","LI","TD","TH","LABEL",
       "FIGCAPTION","BLOCKQUOTE","DT","DD","SMALL","STRONG","EM","B","I","U"
      ].indexOf(tag) !== -1
    ) {
      if (el.textContent.trim().length > 0 && !el.querySelector("img")) {
        el.setAttribute("data-afro-el", "text");
        assignId(el);
      }
      return;
    }

    // Buttons, links with text
    if (
      tag === "BUTTON" ||
      (tag === "A" && el.textContent.trim().length > 0 && !el.querySelector("img"))
    ) {
      el.setAttribute("data-afro-el", "text");
      assignId(el);
      return;
    }

    // Divs with direct text
    if (tag === "DIV" || tag === "FIGURE") {
      var hasDirectText = false;
      for (var i = 0; i < el.childNodes.length; i++) {
        if (el.childNodes[i].nodeType === 3 && el.childNodes[i].textContent.trim().length > 2) {
          hasDirectText = true;
          break;
        }
      }
      if (hasDirectText && el.children.length <= 2) {
        el.setAttribute("data-afro-el", "text");
        assignId(el);
      }
    }
  }

  function tagAll() {
    var all = document.body.querySelectorAll("*");
    for (var i = 0; i < all.length; i++) {
      tagElement(all[i]);
    }
  }

  // ─── ELEMENT INFO → PARENT ─────────────────────────────────

  function getElementInfo(el) {
    var tag = el.tagName;
    var kind = "text";

    if (el.hasAttribute("data-afro-img")) {
      kind = "image";
    } else if (el.hasAttribute("data-afro-section")) {
      kind = "section";
    } else if (tag === "A") {
      kind = "link";
    } else if (tag === "BUTTON") {
      kind = "button";
    }

    var cs = getComputedStyle(el);
    var info = {
      id: el.getAttribute("data-afro-id"),
      kind: kind,
      text: el.textContent ? el.textContent.trim().substring(0, 500) : "",
      html: el.innerHTML ? el.innerHTML.substring(0, 2000) : "",
      tag: tag,
      href: el.href || el.getAttribute("href") || "",
      src: el.src || "",
      alt: el.alt || "",
      styles: {
        backgroundColor: cs.backgroundColor || "",
        color: cs.color || "",
        fontSize: cs.fontSize || "",
        fontWeight: cs.fontWeight || "",
        backgroundImage: cs.backgroundImage || "",
      },
    };

    // Section index
    if (kind === "section") {
      var sections = document.querySelectorAll("[data-afro-section]");
      for (var i = 0; i < sections.length; i++) {
        if (sections[i] === el) { info.sectionIndex = i; break; }
      }
    }

    return info;
  }

  // ─── SELECTION ──────────────────────────────────────────────

  function selectElement(el) {
    // Deselect previous
    if (selectedEl) {
      selectedEl.classList.remove("afro-selected");
    }

    if (!el) {
      selectedEl = null;
      notifyParentDeselect();
      return;
    }

    selectedEl = el;
    el.classList.add("afro-selected");

    // Scroll into view
    el.scrollIntoView({ behavior: "smooth", block: "center" });

    // Send info to parent
    var info = getElementInfo(el);
    window.parent.postMessage({
      type: "afro-editor-element-selected",
      element: info,
    }, "*");
  }

  function notifyParentDeselect() {
    window.parent.postMessage({ type: "afro-editor-element-deselected" }, "*");
  }

  // ─── SECTIONS LIST → PARENT ────────────────────────────────

  function sendSectionsList() {
    var sectionEls = document.querySelectorAll("[data-afro-section]");
    var sections = [];
    for (var i = 0; i < sectionEls.length; i++) {
      var el = sectionEls[i];
      // Derive label from first heading or tag
      var heading = el.querySelector("h1,h2,h3,h4,h5,h6");
      var label = heading
        ? heading.textContent.trim().substring(0, 40)
        : el.tagName.charAt(0) + el.tagName.slice(1).toLowerCase();

      sections.push({
        id: el.getAttribute("data-afro-id"),
        tag: el.tagName,
        label: label,
        index: i,
      });
    }
    window.parent.postMessage({
      type: "afro-editor-sections-list",
      sections: sections,
    }, "*");
  }

  // ─── CLICK HANDLER ─────────────────────────────────────────

  function handleClick(e) {
    if (!isEditing) return;
    var target = e.target;
    if (isEditorEl(target)) return;

    e.preventDefault();
    e.stopPropagation();

    // Find the nearest tagged element
    var el =
      target.closest("[data-afro-img]") ||
      target.closest("[data-afro-el]") ||
      target.closest("[data-afro-section]");

    if (el) {
      selectElement(el);
    } else {
      selectElement(null);
    }
  }

  // ─── APPLY UPDATES FROM PARENT ─────────────────────────────

  function findById(id) {
    return document.querySelector('[data-afro-id="' + id + '"]');
  }

  function handleParentMessage(e) {
    if (!e.data || !e.data.type) return;
    var d = e.data;
    var el;

    switch (d.type) {
      case "afro-editor-start":
        startEditing();
        break;

      case "afro-editor-stop":
        stopEditing();
        break;

      case "afro-editor-update-text":
        el = findById(d.id);
        if (el) {
          pushUndo(el, "text");
          el.textContent = d.text;
        }
        break;

      case "afro-editor-update-link":
        el = findById(d.id);
        if (el) {
          pushUndo(el, "attr");
          if (d.href) el.setAttribute("href", d.href);
          if (d.target) el.setAttribute("target", d.target);
        }
        break;

      case "afro-editor-update-image":
        el = findById(d.id);
        if (el) {
          pushUndo(el, "src");
          if (d.src) { el.src = d.src; if (el.srcset) el.srcset = ""; }
          if (d.alt !== undefined) el.alt = d.alt;
        }
        break;

      case "afro-editor-update-styles":
        el = findById(d.id);
        if (el) {
          pushUndo(el, "style");
          var styles = d.styles || {};
          for (var prop in styles) {
            if (styles.hasOwnProperty(prop)) {
              el.style[prop] = styles[prop];
              // For section text color, apply to children too
              if (prop === "color" && el.hasAttribute("data-afro-section")) {
                var children = el.querySelectorAll("h1,h2,h3,h4,h5,h6,p,span,a,li,label,small,strong,em,b,i,u,dt,dd,td,th,figcaption,blockquote");
                for (var ci = 0; ci < children.length; ci++) {
                  children[ci].style.color = styles[prop];
                }
              }
            }
          }
        }
        break;

      case "afro-editor-remove-element":
        el = findById(d.id);
        if (el) {
          pushUndo(el, "remove");
          el.remove();
          if (selectedEl === el) {
            selectedEl = null;
            notifyParentDeselect();
          }
          sendSectionsList();
        }
        break;

      case "afro-editor-deselect":
        selectElement(null);
        break;

      case "afro-editor-select-element":
        el = findById(d.id);
        if (el) selectElement(el);
        break;

      case "afro-editor-image-uploaded":
        // Image upload result — used by parent panel
        // The parent will send an update-image message after this
        break;
    }
  }

  // ─── TOOLTIP ────────────────────────────────────────────────

  function showTooltip(e) {
    var target = e.target;
    if (isEditorEl(target)) { hideTooltip(); return; }

    var label = "";
    if (target.closest("[data-afro-img]")) label = "📷 Click to edit image";
    else if (target.closest("[data-afro-el]")) label = "✏️ Click to edit";
    else if (target.closest("[data-afro-section]")) label = "🎨 Click to edit section";
    else { hideTooltip(); return; }

    if (!tooltipEl) {
      tooltipEl = document.createElement("div");
      tooltipEl.className = "afro-tooltip";
      document.body.appendChild(tooltipEl);
    }
    tooltipEl.textContent = label;
    tooltipEl.style.display = "block";
    tooltipEl.style.left = Math.min(e.clientX + 12, window.innerWidth - 200) + "px";
    tooltipEl.style.top = (e.clientY - 30) + "px";
  }

  function hideTooltip() {
    if (tooltipEl) tooltipEl.style.display = "none";
  }

  // ─── TOOLBAR (slim) ────────────────────────────────────────

  function createToolbar() {
    toolbar = document.createElement("div");
    toolbar.className = "afro-toolbar";
    toolbar.innerHTML =
      '<div class="afro-toolbar-inner">' +
        '<div class="afro-toolbar-left">' +
          '<span class="afro-toolbar-title">✏️ Editing Template</span>' +
        '</div>' +
        '<div class="afro-toolbar-right">' +
          '<button class="afro-toolbar-btn afro-btn-undo" title="Undo last change">↶ Undo</button>' +
          '<button class="afro-toolbar-btn afro-btn-reset" title="Reset to original">Reset</button>' +
          '<button class="afro-toolbar-btn afro-btn-cancel">Cancel</button>' +
          '<button class="afro-toolbar-btn afro-btn-save">💾 Save</button>' +
        '</div>' +
      '</div>';

    var style = document.createElement("style");
    style.id = "afro-editor-styles";
    style.textContent = EDITOR_CSS;
    document.head.appendChild(style);
    document.body.appendChild(toolbar);
    document.body.classList.add("afro-editing-active");

    toolbar.querySelector(".afro-btn-save").addEventListener("click", handleSave);
    toolbar.querySelector(".afro-btn-cancel").addEventListener("click", handleCancel);
    toolbar.querySelector(".afro-btn-undo").addEventListener("click", handleUndo);
    toolbar.querySelector(".afro-btn-reset").addEventListener("click", handleReset);
  }

  // ─── SAVE / CANCEL / RESET ─────────────────────────────────

  function handleSave() {
    var html = getCleanHtml();
    window.parent.postMessage({ type: "afro-editor-save", html: html }, "*");
  }

  function handleCancel() {
    if (hasChanges && !confirm("You have unsaved changes. Discard them?")) return;
    window.parent.postMessage({ type: "afro-editor-cancel" }, "*");
  }

  function handleReset() {
    if (!confirm("Reset to the original template? All customizations will be lost.")) return;
    window.parent.postMessage({ type: "afro-editor-reset" }, "*");
  }

  function getCleanHtml() {
    var clone = document.documentElement.cloneNode(true);

    // Remove editor UI
    var remove = clone.querySelectorAll(".afro-toolbar,.afro-tooltip");
    remove.forEach(function (el) { el.remove(); });

    // Remove editor style
    var editorStyle = clone.querySelector("#afro-editor-styles");
    if (editorStyle) editorStyle.remove();

    // Remove editor scripts
    var scripts = clone.querySelectorAll("script");
    scripts.forEach(function (s) {
      if (
        (s.src && s.src.indexOf("template-editor") !== -1) ||
        (s.textContent &&
          (s.textContent.indexOf("afro-editor") !== -1 ||
            s.textContent.indexOf("afrostore-add-to-cart") !== -1 ||
            s.textContent.indexOf("afrostore-template-loaded") !== -1))
      ) {
        s.remove();
      }
    });

    // Clean data attributes
    clone.querySelectorAll("[data-afro-el]").forEach(function (el) {
      el.removeAttribute("data-afro-el");
      el.removeAttribute("data-afro-id");
      el.removeAttribute("contenteditable");
      el.classList.remove("afro-selected");
    });
    clone.querySelectorAll("[data-afro-img]").forEach(function (el) {
      el.removeAttribute("data-afro-img");
      el.removeAttribute("data-afro-id");
      el.classList.remove("afro-selected");
    });
    clone.querySelectorAll("[data-afro-section]").forEach(function (el) {
      el.removeAttribute("data-afro-section");
      el.removeAttribute("data-afro-id");
      el.classList.remove("afro-selected");
    });

    clone.querySelector("body").classList.remove("afro-editing-active");

    return "<!DOCTYPE html>\n" + clone.outerHTML;
  }

  // ─── HELPERS ────────────────────────────────────────────────

  function notifyParent(type) {
    window.parent.postMessage({ type: "afro-editor-" + type, hasChanges: hasChanges }, "*");
  }

  // ─── START / STOP ──────────────────────────────────────────

  function startEditing() {
    if (isEditing) return;
    isEditing = true;
    hasChanges = false;
    undoStack = [];
    selectedEl = null;

    createToolbar();
    tagAll();

    document.addEventListener("click", handleClick, true);
    document.addEventListener("mousemove", showTooltip);
    document.addEventListener("mouseleave", hideTooltip);

    // Prevent links from navigating
    document.addEventListener("click", function preventNav(e) {
      if (!isEditing) {
        document.removeEventListener("click", preventNav, true);
        return;
      }
      var link = e.target.closest("a[href]");
      if (link && !isEditorEl(link)) {
        e.preventDefault();
      }
    }, true);

    notifyParent("started");
    sendSectionsList();
  }

  function stopEditing() {
    if (!isEditing) return;
    isEditing = false;

    if (selectedEl) {
      selectedEl.classList.remove("afro-selected");
      selectedEl = null;
    }

    if (toolbar) { toolbar.remove(); toolbar = null; }
    if (tooltipEl) { tooltipEl.remove(); tooltipEl = null; }

    var editorStyle = document.querySelector("#afro-editor-styles");
    if (editorStyle) editorStyle.remove();

    document.body.classList.remove("afro-editing-active");

    // Clean up tags
    document.querySelectorAll("[data-afro-el]").forEach(function (el) {
      el.removeAttribute("data-afro-el");
      el.removeAttribute("data-afro-id");
      el.classList.remove("afro-selected");
    });
    document.querySelectorAll("[data-afro-img]").forEach(function (el) {
      el.removeAttribute("data-afro-img");
      el.removeAttribute("data-afro-id");
      el.classList.remove("afro-selected");
    });
    document.querySelectorAll("[data-afro-section]").forEach(function (el) {
      el.removeAttribute("data-afro-section");
      el.removeAttribute("data-afro-id");
      el.classList.remove("afro-selected");
    });

    document.removeEventListener("click", handleClick, true);
    document.removeEventListener("mousemove", showTooltip);
    document.removeEventListener("mouseleave", hideTooltip);
  }

  // ─── MESSAGE LISTENER ──────────────────────────────────────

  window.addEventListener("message", handleParentMessage);

  // Auto-start if loaded with edit param
  if (window.location.search.indexOf("afro_edit=1") !== -1) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", startEditing);
    } else {
      startEditing();
    }
  }

  window.parent.postMessage({ type: "afro-editor-ready" }, "*");
})();
