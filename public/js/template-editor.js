/**
 * AfroStore Template Editor v2
 * 
 * Full visual customization: every element is editable and removable.
 * Text, images, backgrounds, sidebars, navigation — everything.
 */
(function () {
  "use strict";

  var isEditing = false;
  var hasChanges = false;
  var undoStack = [];
  var toolbar = null;
  var imageModal = null;
  var colorModal = null;
  var tooltipEl = null;

  // ─── STYLES ─────────────────────────────────────────────────

  var EDITOR_CSS = [
    // Toolbar
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
    ".afro-btn-bg{background:#6366f1;color:#fff}.afro-btn-bg:hover{background:#4f46e5}",

    // Remove button (X) on every element
    ".afro-remove-btn{position:absolute;top:-6px;right:-6px;z-index:99999;width:20px;height:20px;border-radius:50%;background:#ef4444;color:#fff;border:2px solid #fff;font-size:10px;font-weight:900;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transition:opacity .15s;box-shadow:0 2px 6px rgba(0,0,0,.3)}",
    ".afro-remove-btn:hover{background:#dc2626;transform:scale(1.1)}",

    // Hover states — show controls
    "[data-afro-el]:hover{outline:2px dashed #3b82f6!important;outline-offset:2px;cursor:pointer}",
    "[data-afro-el]:hover>.afro-remove-btn{opacity:1}",
    "[data-afro-el][contenteditable='true']{outline:2px solid #3b82f6!important;outline-offset:2px;background:rgba(59,130,246,.05)!important}",

    // Image hover
    "[data-afro-img]:hover{outline:2px dashed #8b5cf6!important;outline-offset:2px;cursor:pointer}",
    "[data-afro-img]:hover>.afro-remove-btn{opacity:1}",
    "[data-afro-img]:hover>.afro-img-actions{opacity:1}",

    // Section hover
    "[data-afro-section]{position:relative}",
    "[data-afro-section]:hover{outline:2px dashed #f59e0b!important;outline-offset:-2px}",
    "[data-afro-section]:hover>.afro-remove-btn{opacity:1}",
    "[data-afro-section]:hover>.afro-section-bar{opacity:1}",

    // Image action buttons
    ".afro-img-actions{position:absolute;bottom:4px;left:50%;transform:translateX(-50%);display:flex;gap:4px;opacity:0;transition:opacity .15s;z-index:99998}",
    ".afro-img-action{padding:4px 10px;border:none;border-radius:6px;font-size:10px;font-weight:700;cursor:pointer;background:#8b5cf6;color:#fff;box-shadow:0 2px 8px rgba(0,0,0,.3)}",
    ".afro-img-action:hover{background:#7c3aed}",

    // Section bar
    ".afro-section-bar{position:absolute;top:4px;left:4px;display:flex;gap:4px;opacity:0;transition:opacity .15s;z-index:99998}",
    ".afro-section-btn{padding:4px 10px;border:none;border-radius:6px;font-size:10px;font-weight:700;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.3)}",
    ".afro-section-btn-bg{background:#6366f1;color:#fff}.afro-section-btn-bg:hover{background:#4f46e5}",
    ".afro-section-btn-remove{background:#ef4444;color:#fff}.afro-section-btn-remove:hover{background:#dc2626}",

    // Modal
    ".afro-modal-backdrop{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.6);z-index:9999999;display:flex;align-items:center;justify-content:center}",
    ".afro-modal{background:#fff;border-radius:16px;padding:24px;width:420px;max-width:90vw;box-shadow:0 20px 60px rgba(0,0,0,.3);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}",
    ".afro-modal h3{margin:0 0 16px;font-size:16px;color:#111}",
    ".afro-modal input[type='text'],.afro-modal input[type='url']{width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:10px;font-size:14px;margin-bottom:12px;box-sizing:border-box}",
    ".afro-modal input:focus{outline:none;border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,.15)}",
    ".afro-modal-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:16px}",
    ".afro-modal-actions button{padding:8px 18px;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer}",
    ".afro-modal .afro-modal-apply{background:#8b5cf6;color:#fff}.afro-modal .afro-modal-apply:hover{background:#7c3aed}",
    ".afro-modal .afro-modal-close{background:#f3f4f6;color:#374151}",
    ".afro-modal .afro-modal-upload{background:#3b82f6;color:#fff;width:100%;padding:10px;margin-bottom:8px}.afro-modal .afro-modal-upload:hover{background:#2563eb}",
    ".afro-modal-divider{text-align:center;color:#9ca3af;font-size:12px;margin:8px 0}",
    // Color picker
    ".afro-color-row{display:flex;align-items:center;gap:12px;margin-bottom:12px}",
    ".afro-color-row label{font-size:13px;font-weight:600;color:#374151;min-width:100px}",
    ".afro-color-row input[type='color']{width:48px;height:36px;border:1px solid #d1d5db;border-radius:8px;cursor:pointer;padding:2px}",
    ".afro-color-row input[type='text']{flex:1;margin-bottom:0}",

    // Tooltip
    ".afro-tooltip{position:fixed;z-index:999998;background:#1e293b;color:#fff;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:600;pointer-events:none;white-space:nowrap}",

    // Body offset
    ".afro-editing-active{padding-top:48px!important}",
  ].join("\n");

  // Elements to never touch
  var SKIP_TAGS = new Set(["SCRIPT","STYLE","NOSCRIPT","IFRAME","SVG","PATH","META","LINK","HEAD","BR","HR","CIRCLE","RECT","LINE","POLYGON","POLYLINE","G","DEFS","USE","SYMBOL","CLIPPATH"]);

  function isEditorEl(el) {
    if (!el) return true;
    var c = el.className;
    if (typeof c === "string" && c.indexOf("afro-") !== -1) return true;
    if (el.closest && el.closest("[class*='afro-toolbar'],[class*='afro-modal'],[class*='afro-tooltip']")) return true;
    return false;
  }

  function shouldSkip(el) {
    if (!el || !el.tagName) return true;
    if (SKIP_TAGS.has(el.tagName)) return true;
    if (isEditorEl(el)) return true;
    return false;
  }

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
        el.innerHTML = clone.innerHTML;
      } else if (action === "style") {
        el.setAttribute("style", clone.getAttribute("style") || "");
      } else if (action === "src") {
        el.src = clone.src;
        if (clone.srcset) el.srcset = clone.srcset;
      }
    });
    hasChanges = true;
    notifyParent("change");
  }

  function handleUndo() {
    if (undoStack.length === 0) return;
    undoStack.pop()();
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
        wrapForControls(el);
        addImageActions(el);
      }
      return;
    }

    // Background images on divs/sections
    var bg = getComputedStyle(el).backgroundImage;
    if (bg && bg !== "none" && bg.indexOf("url(") !== -1) {
      el.setAttribute("data-afro-section", "1");
      addSectionBar(el);
    }

    // Sections — large structural containers
    if (["SECTION","HEADER","FOOTER","NAV","ASIDE","MAIN","ARTICLE"].indexOf(tag) !== -1 ||
        (el.className && typeof el.className === "string" && /section|banner|hero|sidebar|widget|block|panel|card|row/i.test(el.className))) {
      if (!el.hasAttribute("data-afro-section")) {
        el.setAttribute("data-afro-section", "1");
        addSectionBar(el);
      }
    }

    // Text elements
    if (["H1","H2","H3","H4","H5","H6","P","SPAN","A","LI","TD","TH","LABEL","FIGCAPTION","BLOCKQUOTE","DT","DD","SMALL","STRONG","EM","B","I","U"].indexOf(tag) !== -1) {
      if (el.textContent.trim().length > 0 && !el.querySelector("img")) {
        el.setAttribute("data-afro-el", "text");
        ensureRelative(el);
        addRemoveBtn(el);
      }
      return;
    }

    // Buttons, links with text
    if (tag === "BUTTON" || (tag === "A" && el.textContent.trim().length > 0 && !el.querySelector("img"))) {
      el.setAttribute("data-afro-el", "text");
      ensureRelative(el);
      addRemoveBtn(el);
      return;
    }

    // Divs that directly contain text (leaf nodes)
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
        ensureRelative(el);
        addRemoveBtn(el);
      }
    }
  }

  function tagAll() {
    // Walk entire DOM
    var all = document.body.querySelectorAll("*");
    for (var i = 0; i < all.length; i++) {
      tagElement(all[i]);
    }
  }

  function ensureRelative(el) {
    var pos = getComputedStyle(el).position;
    if (pos === "static") el.style.position = "relative";
  }

  function wrapForControls(img) {
    // If image parent is already positioned, just ensure relative
    var parent = img.parentElement;
    if (parent && getComputedStyle(parent).position === "static") {
      parent.style.position = "relative";
    }
  }

  // ─── REMOVE BUTTON (X) ─────────────────────────────────────

  function addRemoveBtn(el) {
    if (el.querySelector(".afro-remove-btn")) return;
    var btn = document.createElement("button");
    btn.className = "afro-remove-btn";
    btn.innerHTML = "✕";
    btn.title = "Remove this element";
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      pushUndo(el, "remove");
      el.remove();
    });
    el.appendChild(btn);
  }

  // ─── IMAGE ACTIONS ─────────────────────────────────────────

  function addImageActions(img) {
    var parent = img.parentElement;
    if (!parent || parent.querySelector(".afro-img-actions")) return;

    var wrap = document.createElement("div");
    wrap.className = "afro-img-actions";
    wrap.innerHTML =
      '<button class="afro-img-action afro-img-change">📷 Change</button>' +
      '<button class="afro-img-action" style="background:#ef4444">✕ Remove</button>';

    wrap.querySelector(".afro-img-change").addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation();
      showImageModal(img);
    });
    wrap.children[1].addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation();
      pushUndo(img, "remove");
      img.remove();
      wrap.remove();
    });

    parent.appendChild(wrap);

    // Also make clicking the image itself open the change modal
    img.addEventListener("click", function (e) {
      if (!isEditing) return;
      e.preventDefault(); e.stopPropagation();
      showImageModal(img);
    });
  }

  // ─── SECTION BAR ───────────────────────────────────────────

  function addSectionBar(el) {
    if (el.querySelector(".afro-section-bar")) return;
    ensureRelative(el);

    var bar = document.createElement("div");
    bar.className = "afro-section-bar";
    bar.innerHTML =
      '<button class="afro-section-btn afro-section-btn-bg">🎨 Background</button>' +
      '<button class="afro-section-btn afro-section-btn-remove">✕ Remove Section</button>';

    bar.children[0].addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation();
      showColorModal(el);
    });
    bar.children[1].addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation();
      if (confirm("Remove this entire section?")) {
        pushUndo(el, "remove");
        el.remove();
      }
    });

    el.appendChild(bar);
  }

  // ─── TEXT EDITING ──────────────────────────────────────────

  var activeEditable = null;

  function handleClick(e) {
    if (!isEditing) return;
    var target = e.target;
    if (isEditorEl(target)) return;

    // Image click handled by addImageActions
    if (target.closest("[data-afro-img]")) return;

    // Text element
    var el = target.closest("[data-afro-el]");
    if (el) {
      e.preventDefault(); e.stopPropagation();

      // Deselect previous
      if (activeEditable && activeEditable !== el) {
        activeEditable.removeAttribute("contenteditable");
      }

      pushUndo(el, "text");
      el.setAttribute("contenteditable", "true");
      el.focus();
      activeEditable = el;

      function onBlur() {
        el.removeAttribute("contenteditable");
        el.removeEventListener("blur", onBlur);
        if (activeEditable === el) activeEditable = null;
      }
      el.addEventListener("blur", onBlur);
      return;
    }
  }

  // ─── IMAGE MODAL ───────────────────────────────────────────

  function showImageModal(img) {
    closeModals();
    var oldSrc = img.src;

    var backdrop = document.createElement("div");
    backdrop.className = "afro-modal-backdrop";
    backdrop.innerHTML =
      '<div class="afro-modal">' +
        '<h3>📷 Change Image</h3>' +
        '<button class="afro-modal-upload">📁 Upload from device</button>' +
        '<input type="file" class="afro-modal-file" accept="image/*" style="display:none">' +
        '<div class="afro-modal-divider">— or paste an image URL —</div>' +
        '<input type="url" class="afro-modal-url" placeholder="https://example.com/image.jpg" value="">' +
        '<div class="afro-modal-actions">' +
          '<button class="afro-modal-close">Cancel</button>' +
          '<button class="afro-modal-apply">Apply</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(backdrop);
    imageModal = backdrop;

    var urlInput = backdrop.querySelector(".afro-modal-url");
    var fileInput = backdrop.querySelector(".afro-modal-file");
    var uploadBtn = backdrop.querySelector(".afro-modal-upload");

    uploadBtn.addEventListener("click", function () { fileInput.click(); });

    fileInput.addEventListener("change", function () {
      var file = fileInput.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function (evt) {
        window.parent.postMessage({
          type: "afro-editor-upload-image",
          dataUrl: evt.target.result,
          fileName: file.name,
          mimeType: file.type,
        }, "*");
        uploadBtn.textContent = "⏳ Uploading...";
        uploadBtn.disabled = true;
      };
      reader.readAsDataURL(file);
    });

    function onUploadResult(evt) {
      if (!evt.data || evt.data.type !== "afro-editor-image-uploaded") return;
      window.removeEventListener("message", onUploadResult);
      urlInput.value = evt.data.url;
      uploadBtn.textContent = "✅ Uploaded!";
    }
    window.addEventListener("message", onUploadResult);

    backdrop.querySelector(".afro-modal-apply").addEventListener("click", function () {
      var newSrc = urlInput.value.trim();
      if (newSrc && newSrc !== oldSrc) {
        pushUndo(img, "src");
        img.src = newSrc;
        if (img.srcset) img.srcset = "";
        // Also update any data-src or lazy-load attributes
        if (img.dataset.src) img.dataset.src = newSrc;
        if (img.dataset.lazySrc) img.dataset.lazySrc = newSrc;
      }
      closeModals();
    });

    backdrop.querySelector(".afro-modal-close").addEventListener("click", closeModals);
    backdrop.addEventListener("click", function (e) { if (e.target === backdrop) closeModals(); });

    urlInput.focus();
  }

  // ─── COLOR / BACKGROUND MODAL ─────────────────────────────

  function showColorModal(el) {
    closeModals();

    var currentBg = el.style.backgroundColor || getComputedStyle(el).backgroundColor || "";
    var currentText = el.style.color || getComputedStyle(el).color || "";
    var currentBgImage = el.style.backgroundImage || getComputedStyle(el).backgroundImage || "";

    var backdrop = document.createElement("div");
    backdrop.className = "afro-modal-backdrop";
    backdrop.innerHTML =
      '<div class="afro-modal">' +
        '<h3>🎨 Customize Background & Colors</h3>' +
        '<div class="afro-color-row">' +
          '<label>Background</label>' +
          '<input type="color" class="afro-bg-color" value="' + rgbToHex(currentBg) + '">' +
          '<input type="text" class="afro-bg-color-text" value="' + rgbToHex(currentBg) + '" placeholder="#000000">' +
        '</div>' +
        '<div class="afro-color-row">' +
          '<label>Text Color</label>' +
          '<input type="color" class="afro-text-color" value="' + rgbToHex(currentText) + '">' +
          '<input type="text" class="afro-text-color-text" value="' + rgbToHex(currentText) + '" placeholder="#ffffff">' +
        '</div>' +
        (currentBgImage && currentBgImage !== "none" ?
          '<div style="margin:12px 0">' +
            '<button class="afro-modal-upload" style="background:#8b5cf6">📷 Change Background Image</button>' +
            '<input type="file" class="afro-modal-file" accept="image/*" style="display:none">' +
            '<button class="afro-section-btn afro-section-btn-remove" style="width:100%;margin-top:4px">Remove Background Image</button>' +
          '</div>' : 
          '<div style="margin:12px 0">' +
            '<button class="afro-modal-upload" style="background:#8b5cf6">📷 Add Background Image</button>' +
            '<input type="file" class="afro-modal-file" accept="image/*" style="display:none">' +
          '</div>'
        ) +
        '<div class="afro-modal-actions">' +
          '<button class="afro-modal-close">Cancel</button>' +
          '<button class="afro-modal-apply">Apply</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(backdrop);
    colorModal = backdrop;

    var bgColorInput = backdrop.querySelector(".afro-bg-color");
    var bgTextInput = backdrop.querySelector(".afro-bg-color-text");
    var textColorInput = backdrop.querySelector(".afro-text-color");
    var textColorTextInput = backdrop.querySelector(".afro-text-color-text");
    var fileInput = backdrop.querySelector(".afro-modal-file");
    var uploadBtn = backdrop.querySelector(".afro-modal-upload");
    var removeBgBtn = backdrop.querySelector(".afro-section-btn-remove");

    // Sync color pickers
    bgColorInput.addEventListener("input", function () { bgTextInput.value = bgColorInput.value; });
    bgTextInput.addEventListener("input", function () { bgColorInput.value = bgTextInput.value; });
    textColorInput.addEventListener("input", function () { textColorTextInput.value = textColorInput.value; });
    textColorTextInput.addEventListener("input", function () { textColorInput.value = textColorTextInput.value; });

    // Background image upload
    if (uploadBtn) {
      uploadBtn.addEventListener("click", function () { fileInput.click(); });
      fileInput.addEventListener("change", function () {
        var file = fileInput.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function (evt) {
          window.parent.postMessage({
            type: "afro-editor-upload-image",
            dataUrl: evt.target.result,
            fileName: file.name,
            mimeType: file.type,
          }, "*");
          uploadBtn.textContent = "⏳ Uploading...";
          uploadBtn.disabled = true;
        };
        reader.readAsDataURL(file);
      });
    }

    function onUploadResult(evt) {
      if (!evt.data || evt.data.type !== "afro-editor-image-uploaded") return;
      window.removeEventListener("message", onUploadResult);
      uploadBtn.textContent = "✅ Uploaded!";
      uploadBtn.dataset.newBgUrl = evt.data.url;
    }
    window.addEventListener("message", onUploadResult);

    // Remove background image
    if (removeBgBtn) {
      removeBgBtn.addEventListener("click", function () {
        pushUndo(el, "style");
        el.style.backgroundImage = "none";
        closeModals();
      });
    }

    // Apply
    backdrop.querySelector(".afro-modal-apply").addEventListener("click", function () {
      pushUndo(el, "style");
      el.style.backgroundColor = bgColorInput.value;
      el.style.color = textColorInput.value;

      // Apply text color to all children too
      var children = el.querySelectorAll("h1,h2,h3,h4,h5,h6,p,span,a,li,label,small,strong,em,b,i,u,dt,dd,td,th,figcaption,blockquote");
      children.forEach(function (child) { child.style.color = textColorInput.value; });

      // Apply background image if uploaded
      if (uploadBtn && uploadBtn.dataset.newBgUrl) {
        el.style.backgroundImage = 'url(' + uploadBtn.dataset.newBgUrl + ')';
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = 'center';
      }

      closeModals();
    });

    backdrop.querySelector(".afro-modal-close").addEventListener("click", closeModals);
    backdrop.addEventListener("click", function (e) { if (e.target === backdrop) closeModals(); });
  }

  // ─── PAGE BACKGROUND COLOR ─────────────────────────────────

  function showPageBgModal() {
    closeModals();
    var body = document.body;
    var currentBg = body.style.backgroundColor || getComputedStyle(body).backgroundColor || "#ffffff";

    var backdrop = document.createElement("div");
    backdrop.className = "afro-modal-backdrop";
    backdrop.innerHTML =
      '<div class="afro-modal">' +
        '<h3>🎨 Page Background Color</h3>' +
        '<div class="afro-color-row">' +
          '<label>Background</label>' +
          '<input type="color" class="afro-bg-color" value="' + rgbToHex(currentBg) + '">' +
          '<input type="text" class="afro-bg-color-text" value="' + rgbToHex(currentBg) + '" placeholder="#ffffff">' +
        '</div>' +
        '<div class="afro-modal-actions">' +
          '<button class="afro-modal-close">Cancel</button>' +
          '<button class="afro-modal-apply">Apply</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(backdrop);
    colorModal = backdrop;

    var bgInput = backdrop.querySelector(".afro-bg-color");
    var bgText = backdrop.querySelector(".afro-bg-color-text");
    bgInput.addEventListener("input", function () { bgText.value = bgInput.value; });
    bgText.addEventListener("input", function () { bgInput.value = bgText.value; });

    backdrop.querySelector(".afro-modal-apply").addEventListener("click", function () {
      pushUndo(body, "style");
      body.style.backgroundColor = bgInput.value;
      closeModals();
    });
    backdrop.querySelector(".afro-modal-close").addEventListener("click", closeModals);
    backdrop.addEventListener("click", function (e) { if (e.target === backdrop) closeModals(); });
  }

  // ─── HELPERS ────────────────────────────────────────────────

  function rgbToHex(rgb) {
    if (!rgb || rgb === "transparent" || rgb === "rgba(0, 0, 0, 0)") return "#ffffff";
    if (rgb.charAt(0) === "#") return rgb.length > 7 ? rgb.substring(0, 7) : rgb;
    var parts = rgb.match(/\d+/g);
    if (!parts || parts.length < 3) return "#000000";
    return "#" + ((1 << 24) + (parseInt(parts[0]) << 16) + (parseInt(parts[1]) << 8) + parseInt(parts[2])).toString(16).slice(1);
  }

  function closeModals() {
    if (imageModal) { imageModal.remove(); imageModal = null; }
    if (colorModal) { colorModal.remove(); colorModal = null; }
  }

  function notifyParent(type) {
    window.parent.postMessage({ type: "afro-editor-" + type, hasChanges: hasChanges }, "*");
  }

  // ─── TOOLTIP ────────────────────────────────────────────────

  function showTooltip(e) {
    var target = e.target;
    if (isEditorEl(target)) { hideTooltip(); return; }

    var label = "";
    if (target.closest("[data-afro-img]")) label = "📷 Click to change image";
    else if (target.closest("[data-afro-el]")) label = "✏️ Click to customize text";
    else if (target.closest("[data-afro-section]")) label = "🎨 Hover for section controls";
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

  // ─── TOOLBAR ────────────────────────────────────────────────

  function createToolbar() {
    toolbar = document.createElement("div");
    toolbar.className = "afro-toolbar";
    toolbar.innerHTML =
      '<div class="afro-toolbar-inner">' +
        '<div class="afro-toolbar-left">' +
          '<span class="afro-toolbar-title">✏️ Customize Template</span>' +
        '</div>' +
        '<div class="afro-toolbar-right">' +
          '<button class="afro-toolbar-btn afro-btn-bg" title="Change page background color">🎨 Page Background</button>' +
          '<button class="afro-toolbar-btn afro-btn-undo" title="Undo last change">↶ Undo</button>' +
          '<button class="afro-toolbar-btn afro-btn-reset" title="Reset to original template">Reset</button>' +
          '<button class="afro-toolbar-btn afro-btn-cancel">Cancel</button>' +
          '<button class="afro-toolbar-btn afro-btn-save">💾 Save Changes</button>' +
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
    toolbar.querySelector(".afro-btn-bg").addEventListener("click", function (e) {
      e.stopPropagation();
      showPageBgModal();
    });
  }

  // ─── SAVE / CANCEL / RESET ─────────────────────────────────

  function handleSave() {
    if (activeEditable) {
      activeEditable.removeAttribute("contenteditable");
      activeEditable = null;
    }
    var html = getCleanHtml();
    window.parent.postMessage({ type: "afro-editor-save", html: html }, "*");
  }

  function handleCancel() {
    if (hasChanges && !confirm("You have unsaved changes. Discard them?")) return;
    window.parent.postMessage({ type: "afro-editor-cancel" }, "*");
  }

  function handleReset() {
    if (!confirm("Reset to the original template? All your customizations will be lost.")) return;
    window.parent.postMessage({ type: "afro-editor-reset" }, "*");
  }

  function getCleanHtml() {
    var clone = document.documentElement.cloneNode(true);

    // Remove all editor-injected stuff
    var remove = clone.querySelectorAll(
      ".afro-toolbar,.afro-tooltip,.afro-modal-backdrop,.afro-img-actions,.afro-section-bar,.afro-remove-btn"
    );
    remove.forEach(function (el) { el.remove(); });

    // Remove editor style tag
    var editorStyle = clone.querySelector("#afro-editor-styles");
    if (editorStyle) editorStyle.remove();

    // Remove editor scripts
    var scripts = clone.querySelectorAll("script");
    scripts.forEach(function (s) {
      if ((s.src && s.src.indexOf("template-editor") !== -1) ||
          (s.textContent && (s.textContent.indexOf("afro-editor") !== -1 || s.textContent.indexOf("afrostore-add-to-cart") !== -1 || s.textContent.indexOf("afrostore-template-loaded") !== -1))) {
        s.remove();
      }
    });

    // Remove editor data attributes + contenteditable
    clone.querySelectorAll("[data-afro-el]").forEach(function (el) {
      el.removeAttribute("data-afro-el");
      el.removeAttribute("contenteditable");
    });
    clone.querySelectorAll("[data-afro-img]").forEach(function (el) { el.removeAttribute("data-afro-img"); });
    clone.querySelectorAll("[data-afro-section]").forEach(function (el) { el.removeAttribute("data-afro-section"); });

    // Clean up position:relative we added
    // (leave it — won't hurt and removing might break layout)

    clone.querySelector("body").classList.remove("afro-editing-active");

    return "<!DOCTYPE html>\n" + clone.outerHTML;
  }

  // ─── MESSAGE HANDLER ───────────────────────────────────────

  window.addEventListener("message", function (e) {
    if (!e.data) return;
    if (e.data.type === "afro-editor-start") startEditing();
    if (e.data.type === "afro-editor-stop") stopEditing();
  });

  // ─── START / STOP ──────────────────────────────────────────

  function startEditing() {
    if (isEditing) return;
    isEditing = true;
    hasChanges = false;
    undoStack = [];

    createToolbar();
    tagAll();

    document.addEventListener("click", handleClick, true);
    document.addEventListener("mousemove", showTooltip);
    document.addEventListener("mouseleave", hideTooltip);

    // Prevent links from navigating during edit
    document.addEventListener("click", function preventNav(e) {
      if (!isEditing) { document.removeEventListener("click", preventNav, true); return; }
      var link = e.target.closest("a[href]");
      if (link && !isEditorEl(link)) {
        e.preventDefault();
      }
    }, true);

    notifyParent("started");
  }

  function stopEditing() {
    if (!isEditing) return;
    isEditing = false;

    if (toolbar) { toolbar.remove(); toolbar = null; }
    if (tooltipEl) { tooltipEl.remove(); tooltipEl = null; }
    closeModals();

    var editorStyle = document.querySelector("#afro-editor-styles");
    if (editorStyle) editorStyle.remove();

    document.body.classList.remove("afro-editing-active");

    // Clean up all tags
    document.querySelectorAll("[data-afro-el]").forEach(function (el) {
      el.removeAttribute("data-afro-el");
      el.removeAttribute("contenteditable");
    });
    document.querySelectorAll("[data-afro-img]").forEach(function (el) { el.removeAttribute("data-afro-img"); });
    document.querySelectorAll("[data-afro-section]").forEach(function (el) { el.removeAttribute("data-afro-section"); });
    document.querySelectorAll(".afro-remove-btn,.afro-img-actions,.afro-section-bar").forEach(function (el) { el.remove(); });

    document.removeEventListener("click", handleClick, true);
    document.removeEventListener("mousemove", showTooltip);
    document.removeEventListener("mouseleave", hideTooltip);
  }

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
