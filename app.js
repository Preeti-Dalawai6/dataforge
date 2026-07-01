/* =========================================
   DATAFORGE — CRUD APP JAVASCRIPT
   =========================================
   MODE A (default):  Uses JSONPlaceholder mock API.
                      Writes are simulated — stored in localStorage.

   MODE B (real backend): Start the backend (see /backend/),
                      then change USE_REAL_BACKEND to true below.
   ========================================= */

"use strict";

// ─────────────────────────────────────────
// CONFIG — ⚙️ EDIT HERE TO SWITCH BACKENDS
// ─────────────────────────────────────────
const USE_REAL_BACKEND = false;   // ← set true when your backend is running

const CONFIG = {
  API_BASE:  USE_REAL_BACKEND
               ? "http://localhost:3000/api"           // your Express server
               : "https://jsonplaceholder.typicode.com",
  ENDPOINT:  "/users",
  PAGE_SIZE: 8,
  CACHE_KEY: "dataforge_records",
  OPS_KEY:   "dataforge_ops",
};

// ─────────────────────────────────────────
// STATE
// ─────────────────────────────────────────
const state = {
  records: [],           // all fetched records (+ locally created)
  filtered: [],          // after search/filter
  currentPage: 1,
  editingId: null,
  deletingId: null,
  operationCount: parseInt(localStorage.getItem(CONFIG.OPS_KEY) || "0"),
  localRecords: [],      // user-created records stored in localStorage
  colors: [
    "#00e5c8","#4d9fff","#f5a623","#a78bfa",
    "#ff5572","#22d3a4","#f97316","#06b6d4",
  ],
};

// ─────────────────────────────────────────
// API LAYER
// ─────────────────────────────────────────
const API = {
  async request(method, path, body = null) {
    const opts = {
      method,
      headers: { "Content-Type": "application/json; charset=UTF-8" },
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(CONFIG.API_BASE + path, opts);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return res.json();
  },
  getAll()        { return API.request("GET",    CONFIG.ENDPOINT); },
  create(data)    { return API.request("POST",   CONFIG.ENDPOINT, data); },
  update(id, data){ return API.request("PUT",    `${CONFIG.ENDPOINT}/${id}`, data); },
  delete(id)      { return API.request("DELETE", `${CONFIG.ENDPOINT}/${id}`); },
};

function bumpOps() {
  state.operationCount++;
  localStorage.setItem(CONFIG.OPS_KEY, state.operationCount);
  const el = document.getElementById("statOps");
  if (el) el.textContent = state.operationCount;
}

// ─────────────────────────────────────────
// LOCAL STORAGE CACHE
// ─────────────────────────────────────────
function saveLocalRecords() {
  localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify(state.localRecords));
}
function loadLocalRecords() {
  try {
    state.localRecords = JSON.parse(localStorage.getItem(CONFIG.CACHE_KEY) || "[]");
  } catch { state.localRecords = []; }
}

// ─────────────────────────────────────────
// FETCH + DISPLAY
// ─────────────────────────────────────────
async function fetchRecords() {
  setTableLoading(true);
  setApiStatus("connecting");
  try {
    const apiData = await API.getAll();
    loadLocalRecords();
    // Merge: API records first, then local (with negative IDs)
    state.records = [...apiData, ...state.localRecords];
    state.filtered = [...state.records];
    setApiStatus("online");
    populateCompanyFilter();
    renderTable();
    renderDashboardPreview();
    updateStats();
    bumpOps();
  } catch (err) {
    setApiStatus("offline");
    setTableError(err.message);
    showToast("error", "Fetch Failed", err.message);
  }
}

function renderTable() {
  const shell = document.getElementById("recordsTableShell");
  if (!shell) return;
  if (state.filtered.length === 0) {
    shell.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">◈</div>
        <div class="empty-title">No records found</div>
        <p>Try adjusting your search or create a new record.</p>
        <button class="btn btn--primary" style="margin-top:0.5rem" onclick="openCreateModal()">+ New Record</button>
      </div>`;
    document.getElementById("pagination").innerHTML = "";
    return;
  }

  const totalPages = Math.ceil(state.filtered.length / CONFIG.PAGE_SIZE);
  if (state.currentPage > totalPages) state.currentPage = 1;
  const start = (state.currentPage - 1) * CONFIG.PAGE_SIZE;
  const page  = state.filtered.slice(start, start + CONFIG.PAGE_SIZE);

  const rows = page.map(r => buildRow(r)).join("");

  shell.innerHTML = `
    <table class="records-table">
      <thead>
        <tr>
          <th>#</th>
          <th>User</th>
          <th>Email</th>
          <th>Company</th>
          <th>Phone</th>
          <th style="text-align:right">Actions</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;

  renderPagination(totalPages);
}

function buildRow(r) {
  const initials = (r.name || "?").split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
  const color = getColor(r.id);
  const isNew = r._local ? `<span class="badge-new">local</span>` : "";
  const company = r.company?.name || r.company || "—";
  return `
    <tr data-id="${r.id}">
      <td class="cell-id">${String(r.id).padStart(2,"0")}</td>
      <td>
        <div class="cell-name-wrap">
          <div class="cell-avatar" style="background:${color}22;color:${color}">${initials}</div>
          <div>
            <div class="cell-name">${escHtml(r.name)} ${isNew}</div>
            <div class="cell-username">@${escHtml(r.username || "")}</div>
          </div>
        </div>
      </td>
      <td class="cell-email">${escHtml(r.email)}</td>
      <td><span class="cell-company-tag">${escHtml(company)}</span></td>
      <td class="cell-email">${escHtml(r.phone || "—")}</td>
      <td>
        <div class="cell-actions">
          <button class="act-btn act-btn--view" title="View" onclick="openDetailModal(${r.id})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button class="act-btn act-btn--edit" title="Edit" onclick="openEditModal(${r.id})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="act-btn act-btn--delete" title="Delete" onclick="openDeleteModal(${r.id})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      </td>
    </tr>`;
}

function renderDashboardPreview() {
  const shell = document.getElementById("dashboardPreview");
  if (!shell) return;
  const preview = state.records.slice(0, 5);
  if (!preview.length) { shell.innerHTML = `<div class="empty-state"><div class="empty-icon">◈</div><p>No records yet.</p></div>`; return; }
  const rows = preview.map(r => buildRow(r)).join("");
  shell.innerHTML = `
    <table class="records-table">
      <thead><tr><th>#</th><th>User</th><th>Email</th><th>Company</th><th>Phone</th><th style="text-align:right">Actions</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function updateStats() {
  const el = id => document.getElementById(id);
  if (el("statTotal")) el("statTotal").textContent = state.records.length;
  if (el("statActive")) el("statActive").textContent = state.localRecords.length || state.records.filter(r => r.id <= 5).length;
  if (el("statOps")) el("statOps").textContent = state.operationCount;
}

function renderPagination(totalPages) {
  const pg = document.getElementById("pagination");
  if (!pg || totalPages <= 1) { if(pg) pg.innerHTML = ""; return; }
  let html = `<button class="page-btn" onclick="goPage(${state.currentPage-1})" ${state.currentPage===1?"disabled":""}>‹</button>`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${i===state.currentPage?"page-btn--active":""}" onclick="goPage(${i})">${i}</button>`;
  }
  html += `<button class="page-btn" onclick="goPage(${state.currentPage+1})" ${state.currentPage===totalPages?"disabled":""}>›</button>`;
  pg.innerHTML = html;
}

function goPage(n) {
  state.currentPage = n;
  renderTable();
  document.getElementById("recordsTableShell")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ─────────────────────────────────────────
// SEARCH & FILTER
// ─────────────────────────────────────────
function filterRecords() {
  const q = document.getElementById("searchInput")?.value.toLowerCase().trim() || "";
  const company = document.getElementById("filterCompany")?.value || "";
  const clearBtn = document.getElementById("searchClear");
  if (clearBtn) clearBtn.style.display = q ? "block" : "none";

  state.filtered = state.records.filter(r => {
    const name    = (r.name || "").toLowerCase();
    const email   = (r.email || "").toLowerCase();
    const uname   = (r.username || "").toLowerCase();
    const comp    = (r.company?.name || r.company || "").toLowerCase();
    const matchQ  = !q || name.includes(q) || email.includes(q) || uname.includes(q) || comp.includes(q);
    const matchC  = !company || comp === company.toLowerCase();
    return matchQ && matchC;
  });
  state.currentPage = 1;
  renderTable();
}

function clearSearch() {
  const inp = document.getElementById("searchInput");
  if (inp) inp.value = "";
  filterRecords();
}

function populateCompanyFilter() {
  const sel = document.getElementById("filterCompany");
  if (!sel) return;
  const companies = [...new Set(
    state.records.map(r => r.company?.name || r.company).filter(Boolean)
  )].sort();
  const prev = sel.value;
  sel.innerHTML = `<option value="">All Companies</option>` +
    companies.map(c => `<option value="${escHtml(c)}" ${prev===c?"selected":""}>${escHtml(c)}</option>`).join("");
}

// ─────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────
function openCreateModal() {
  state.editingId = null;
  clearForm();
  setEl("formModalTitle", "Create Record");
  setEl("formModalSubtitle", "POST /users → JSONPlaceholder");
  setEl("formSubmitText", "Create Record");
  openModal("formModal");
}

async function handleFormSubmit(e) {
  e.preventDefault();
  if (!validateForm()) return;

  const data = getFormData();
  const isEdit = state.editingId !== null;
  setFormLoading(true);

  try {
    if (isEdit) {
      // API call (JSONPlaceholder echoes back)
      await API.update(state.editingId, data);
      bumpOps();

      // Update in state
      const idx = state.records.findIndex(r => r.id === state.editingId);
      if (idx !== -1) {
        state.records[idx] = { ...state.records[idx], ...data };
        // If it was a local record, save
        if (state.records[idx]._local) {
          const li = state.localRecords.findIndex(r => r.id === state.editingId);
          if (li !== -1) { state.localRecords[li] = state.records[idx]; saveLocalRecords(); }
        }
      }
      showToast("success", "Record Updated", `"${data.name}" has been updated via PUT /users/${state.editingId}.`);
    } else {
      // API call
      const created = await API.create(data);
      bumpOps();

      // JSONPlaceholder returns id:11 for everyone — make a unique local id
      const localId = -(Date.now());
      const newRecord = { ...data, id: localId, _local: true };
      state.localRecords.unshift(newRecord);
      saveLocalRecords();
      state.records.unshift(newRecord);
      showToast("success", "Record Created", `"${data.name}" was created (ID: ${created.id} from API, stored locally).`);
    }

    state.filtered = [...state.records];
    populateCompanyFilter();
    filterRecords();
    renderDashboardPreview();
    updateStats();
    closeModal("formModal");
  } catch (err) {
    showToast("error", isEdit ? "Update Failed" : "Create Failed", err.message);
  } finally {
    setFormLoading(false);
  }
}

// ─────────────────────────────────────────
// EDIT
// ─────────────────────────────────────────
function openEditModal(id) {
  const rec = state.records.find(r => r.id === id);
  if (!rec) return;
  state.editingId = id;
  setEl("formModalTitle", "Edit Record");
  setEl("formModalSubtitle", `PUT /users/${id} → JSONPlaceholder`);
  setEl("formSubmitText", "Save Changes");
  clearForm();
  setField("fieldName",     rec.name || "");
  setField("fieldUsername", rec.username || "");
  setField("fieldEmail",    rec.email || "");
  setField("fieldPhone",    rec.phone || "");
  setField("fieldCompany",  rec.company?.name || rec.company || "");
  setField("fieldWebsite",  rec.website || "");
  setField("fieldCity",     rec.address?.city || rec.city || "");
  closeModal("detailModal");
  openModal("formModal");
}

// ─────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────
function openDeleteModal(id) {
  state.deletingId = id;
  const rec = state.records.find(r => r.id === id);
  setEl("deleteModalText",
    `You're about to permanently delete <strong>${escHtml(rec?.name || "this record")}</strong>. This cannot be undone — the record will be removed via <code>DELETE /users/${id}</code>.`
  );
  document.getElementById("deleteModalText").innerHTML =
    `You're about to permanently delete <strong>${escHtml(rec?.name || "this record")}</strong>. This cannot be undone. The request is sent via <code>DELETE /users/${id}</code>.`;
  openModal("deleteModal");
}

async function confirmDelete() {
  if (state.deletingId === null) return;
  setDeleteLoading(true);
  try {
    await API.delete(Math.abs(state.deletingId));
    bumpOps();

    const rec = state.records.find(r => r.id === state.deletingId);
    // Remove from arrays
    state.records = state.records.filter(r => r.id !== state.deletingId);
    state.localRecords = state.localRecords.filter(r => r.id !== state.deletingId);
    saveLocalRecords();
    state.filtered = state.filtered.filter(r => r.id !== state.deletingId);

    populateCompanyFilter();
    renderTable();
    renderDashboardPreview();
    updateStats();
    closeModal("deleteModal");
    showToast("success", "Record Deleted", `"${rec?.name || "Record"}" has been removed.`);
  } catch (err) {
    showToast("error", "Delete Failed", err.message);
  } finally {
    setDeleteLoading(false);
    state.deletingId = null;
  }
}

// ─────────────────────────────────────────
// DETAIL VIEW
// ─────────────────────────────────────────
function openDetailModal(id) {
  const r = state.records.find(r => r.id === id);
  if (!r) return;
  const initials = (r.name || "?").split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
  const color = getColor(r.id);
  const company = r.company?.name || r.company || "—";
  const city = r.address?.city || r.city || "—";
  const street = r.address ? `${r.address.street || ""}, ${r.address.suite || ""}`.replace(/^,\s*|,\s*$/g,"") : "—";
  const lat = r.address?.geo?.lat || "—";
  const lng = r.address?.geo?.lng || "—";

  setEl("detailName", r.name);
  setEl("detailSubtitle", `@${r.username || "unknown"} · ID: ${r.id}`);

  document.getElementById("detailBody").innerHTML = `
    <div class="detail-avatar" style="background:${color}22;color:${color}">${initials}</div>
    <div class="detail-grid">
      <div class="detail-field">
        <span class="detail-label">Full Name</span>
        <span class="detail-value">${escHtml(r.name)}</span>
      </div>
      <div class="detail-field">
        <span class="detail-label">Username</span>
        <span class="detail-value" style="font-family:var(--font-mono);font-size:0.85rem">@${escHtml(r.username || "—")}</span>
      </div>
      <div class="detail-field">
        <span class="detail-label">Email</span>
        <span class="detail-value">${escHtml(r.email)}</span>
      </div>
      <div class="detail-field">
        <span class="detail-label">Phone</span>
        <span class="detail-value">${escHtml(r.phone || "—")}</span>
      </div>
      <div class="detail-divider"></div>
      <div class="detail-field">
        <span class="detail-label">Company</span>
        <span class="detail-value">${escHtml(company)}</span>
      </div>
      <div class="detail-field">
        <span class="detail-label">Website</span>
        <span class="detail-value" style="font-family:var(--font-mono);font-size:0.83rem">${escHtml(r.website || "—")}</span>
      </div>
      <div class="detail-divider"></div>
      <div class="detail-field">
        <span class="detail-label">City</span>
        <span class="detail-value">${escHtml(city)}</span>
      </div>
      <div class="detail-field">
        <span class="detail-label">Street</span>
        <span class="detail-value">${escHtml(street)}</span>
      </div>
      <div class="detail-field">
        <span class="detail-label">Latitude</span>
        <span class="detail-value" style="font-family:var(--font-mono);font-size:0.83rem">${lat}</span>
      </div>
      <div class="detail-field">
        <span class="detail-label">Longitude</span>
        <span class="detail-value" style="font-family:var(--font-mono);font-size:0.83rem">${lng}</span>
      </div>
      ${r._local ? `<div class="detail-field detail-field--full"><span class="detail-label">Storage</span><span class="detail-value"><span class="badge-new">Stored Locally</span></span></div>` : ""}
    </div>`;

  document.getElementById("detailEditBtn").onclick = () => openEditModal(id);
  openModal("detailModal");
}

// ─────────────────────────────────────────
// FORM HELPERS
// ─────────────────────────────────────────
function validateForm() {
  clearErrors();
  let valid = true;
  const rules = [
    { id: "fieldName",     msg: "Full name is required.",              test: v => v.length >= 2 },
    { id: "fieldUsername", msg: "Username is required (min 2 chars).", test: v => v.length >= 2 },
    { id: "fieldEmail",    msg: "A valid email address is required.",  test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
    { id: "fieldCompany",  msg: "Company name is required.",           test: v => v.length >= 1 },
  ];
  for (const r of rules) {
    const val = document.getElementById(r.id)?.value.trim() || "";
    if (!r.test(val)) {
      showFieldError(r.id, r.msg);
      valid = false;
    }
  }
  return valid;
}

function showFieldError(fieldId, msg) {
  const input = document.getElementById(fieldId);
  const err   = document.getElementById("err-" + fieldId);
  if (input) input.classList.add("error");
  if (err)   err.textContent = msg;
  input?.addEventListener("input", () => {
    input.classList.remove("error");
    if (err) err.textContent = "";
  }, { once: true });
}

function clearErrors() {
  document.querySelectorAll(".form-input.error").forEach(el => el.classList.remove("error"));
  document.querySelectorAll(".form-error").forEach(el => el.textContent = "");
}

function clearForm() {
  ["fieldName","fieldUsername","fieldEmail","fieldPhone","fieldCompany","fieldWebsite","fieldCity"]
    .forEach(id => setField(id, ""));
  document.getElementById("recordId").value = "";
  clearErrors();
}

function getFormData() {
  return {
    name:     getField("fieldName"),
    username: getField("fieldUsername"),
    email:    getField("fieldEmail"),
    phone:    getField("fieldPhone"),
    company:  getField("fieldCompany"),
    website:  getField("fieldWebsite"),
    city:     getField("fieldCity"),
  };
}

function setFormLoading(on) {
  const btn  = document.getElementById("formSubmitBtn");
  const txt  = document.getElementById("formSubmitText");
  const spin = document.getElementById("formSpinner");
  if (!btn) return;
  btn.disabled = on;
  if (txt)  txt.style.display = on ? "none" : "";
  if (spin) spin.classList.toggle("hidden", !on);
}

function setDeleteLoading(on) {
  const btn  = document.getElementById("confirmDeleteBtn");
  const txt  = document.getElementById("deleteText");
  const spin = document.getElementById("deleteSpinner");
  if (!btn) return;
  btn.disabled = on;
  if (txt)  txt.style.display = on ? "none" : "";
  if (spin) spin.classList.toggle("hidden", !on);
}

// ─────────────────────────────────────────
// MODAL HELPERS
// ─────────────────────────────────────────
function openModal(id) {
  document.getElementById(id)?.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeModal(id) {
  document.getElementById(id)?.classList.remove("open");
  document.body.style.overflow = "";
}
function handleBackdropClick(e, id) {
  if (e.target.id === id) closeModal(id);
}
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    ["formModal","deleteModal","detailModal"].forEach(id => closeModal(id));
  }
});

// ─────────────────────────────────────────
// TOAST SYSTEM
// ─────────────────────────────────────────
const TOAST_ICONS = {
  success: `<svg class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
  error:   `<svg class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  info:    `<svg class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
};

function showToast(type, title, message, duration = 4000) {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    ${TOAST_ICONS[type] || TOAST_ICONS.info}
    <div class="toast__body">
      <div class="toast__title">${escHtml(title)}</div>
      <div class="toast__message">${escHtml(message)}</div>
    </div>
    <button class="toast__close" onclick="dismissToast(this.parentElement)">✕</button>`;
  container.appendChild(toast);
  setTimeout(() => dismissToast(toast), duration);
}

function dismissToast(el) {
  if (!el || el.classList.contains("removing")) return;
  el.classList.add("removing");
  setTimeout(() => el.remove(), 300);
}

// ─────────────────────────────────────────
// VIEW SWITCHER
// ─────────────────────────────────────────
function switchView(view) {
  document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));
  document.getElementById(`view-${view}`)?.classList.remove("hidden");
  document.querySelectorAll(".nav-btn[data-view]").forEach(b => b.classList.remove("nav-btn--active"));
  document.querySelector(`.nav-btn[data-view="${view}"]`)?.classList.add("nav-btn--active");
  if (view === "records") {
    if (!state.records.length) fetchRecords();
    else renderTable();
  }
}

// ─────────────────────────────────────────
// API STATUS INDICATOR
// ─────────────────────────────────────────
function setApiStatus(status) {
  const dot  = document.getElementById("statusDot");
  const text = document.getElementById("apiStatusText");
  const map  = { online: ["status-dot--online","Online"], offline: ["status-dot--offline","Offline"], connecting: [null,"Connecting…"] };
  if (!dot || !text) return;
  dot.className = "status-dot";
  if (map[status][0]) dot.classList.add(map[status][0]);
  text.textContent = map[status][1];
}

// ─────────────────────────────────────────
// TABLE STATE HELPERS
// ─────────────────────────────────────────
function setTableLoading(on) {
  const shell = document.getElementById("recordsTableShell");
  if (on && shell) shell.innerHTML = `<div class="loading-state"><div class="spinner"></div><span>Fetching from API…</span></div>`;
}
function setTableError(msg) {
  const shell = document.getElementById("recordsTableShell");
  if (shell) shell.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">⚠</div>
      <div class="empty-title">API Error</div>
      <p>${escHtml(msg)}</p>
      <button class="btn btn--ghost btn--sm" style="margin-top:0.75rem" onclick="fetchRecords()">↻ Retry</button>
    </div>`;
}

// ─────────────────────────────────────────
// MOBILE MENU
// ─────────────────────────────────────────
function toggleMobileMenu() {
  document.getElementById("mobileMenu")?.classList.toggle("open");
}

// ─────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────
function escHtml(str) {
  return String(str ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
function setEl(id, text) { const el = document.getElementById(id); if (el) el.textContent = text; }
function setField(id, val) { const el = document.getElementById(id); if (el) el.value = val; }
function getField(id) { return (document.getElementById(id)?.value || "").trim(); }
function getColor(id) {
  return state.colors[Math.abs(id) % state.colors.length];
}

// ─────────────────────────────────────────
// INIT
// ─────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  setApiStatus("connecting");
  fetchRecords();
});
