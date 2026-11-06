// Shared helpers: icons, header, toast, data layer (Supabase or demo mode).

(function () {
  "use strict";

  // ------------------------------------------------------------------
  // Icons (inline SVG, Lucide-style strokes)
  // ------------------------------------------------------------------
  const PATHS = {
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
    compass: '<circle cx="12" cy="12" r="10"/><path d="m16 8-2 6-6 2 2-6z"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/><path d="M3.5 12h4l2-3 3 6 2-3h6"/>',
    stethoscope: '<path d="M6 3v6a4 4 0 0 0 8 0V3"/><path d="M10 13v2a5 5 0 0 0 10 0v-3"/><circle cx="20" cy="10" r="2"/>',
    building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowLeft: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    printer: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"/><path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14"/>'
  };

  function icon(name, extra) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"' +
      (extra ? " " + extra : "") + ">" + (PATHS[name] || "") + "</svg>";
  }

  function hydrateIcons(root) {
    (root || document).querySelectorAll("[data-icon]").forEach(function (el) {
      el.innerHTML = icon(el.getAttribute("data-icon"));
    });
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function formatDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  function param(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  let toastTimer;
  function toast(message) {
    let el = document.querySelector(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, 3200);
  }

  // ------------------------------------------------------------------
  // Question bank
  // ------------------------------------------------------------------
  let questionCache = null;
  async function loadQuestions() {
    if (questionCache) return questionCache;
    if (window.location.protocol === "file:") {
      throw new Error("The questions cannot load because this page was opened directly from a folder. " +
        "Open the tool through Live Server in VS Code (right-click index.html > Open with Live Server), or use the online Vercel address.");
    }
    const res = await fetch(window.APP_CONFIG.QUESTION_BANK_URL, { cache: "no-cache" });
    if (!res.ok) throw new Error("Could not load the question bank.");
    const data = await res.json();
    questionCache = data.questions;
    return questionCache;
  }

  function isGap(response) {
    return response === "No" || response === "I do not know";
  }

  // ------------------------------------------------------------------
  // Data layer
  // ------------------------------------------------------------------
  const cfg = window.APP_CONFIG || {};
  const configured = cfg.SUPABASE_URL && cfg.SUPABASE_URL.indexOf("http") === 0 &&
    cfg.SUPABASE_ANON_KEY && cfg.SUPABASE_ANON_KEY.indexOf("PASTE_") !== 0;
  const DEMO = !configured;

  let sb = null;
  if (!DEMO) {
    if (!window.supabase || !window.supabase.createClient) {
      console.error("Supabase library failed to load.");
    } else {
      sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
    }
  }

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "id-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  }

  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
      catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
    }
  };

  function friendlyError(error) {
    const msg = (error && error.message) || String(error || "Something went wrong.");
    if (/Invalid login credentials/i.test(msg)) return "The email or password is incorrect.";
    if (/already registered/i.test(msg)) return "An account with this email already exists. Please log in.";
    if (/Email not confirmed/i.test(msg)) return "Please confirm your email address first, using the link sent to your inbox.";
    if (/Password should be/i.test(msg)) return "Your password must be at least 6 characters.";
    return msg;
  }

  const api = {
    demo: DEMO,

    async getUser() {
      if (DEMO) {
        const email = store.get("demo_session", null);
        return email ? { id: email, email: email } : null;
      }
      const { data } = await sb.auth.getSession();
      return data.session ? data.session.user : null;
    },

    async signUp(email, password) {
      if (DEMO) {
        const users = store.get("demo_users", {});
        if (users[email]) throw new Error("An account with this email already exists. Please log in.");
        users[email] = password;
        store.set("demo_users", users);
        store.set("demo_session", email);
        return { needsConfirmation: false };
      }
      const { data, error } = await sb.auth.signUp({ email: email, password: password });
      if (error) throw new Error(friendlyError(error));
      return { needsConfirmation: !data.session };
    },

    async signIn(email, password) {
      if (DEMO) {
        const users = store.get("demo_users", {});
        if (users[email] !== password) throw new Error("The email or password is incorrect.");
        store.set("demo_session", email);
        return;
      }
      const { error } = await sb.auth.signInWithPassword({ email: email, password: password });
      if (error) throw new Error(friendlyError(error));
    },

    async signOut() {
      if (DEMO) { localStorage.removeItem("demo_session"); return; }
      await sb.auth.signOut();
    },

    async createAssessment(details) {
      if (DEMO) {
        const user = await api.getUser();
        const row = Object.assign({
          assessment_id: uuid(), user_id: user.id, status: "in progress",
          gaps_identified: null, created_at: new Date().toISOString(), completed_at: null
        }, details);
        const all = store.get("demo_assessments", []);
        all.push(row);
        store.set("demo_assessments", all);
        return row;
      }
      const { data, error } = await sb.from("assessments").insert(details).select().single();
      if (error) throw new Error(friendlyError(error));
      return data;
    },

    async listAssessments() {
      if (DEMO) {
        const user = await api.getUser();
        return store.get("demo_assessments", [])
          .filter(function (a) { return a.user_id === user.id; })
          .sort(function (a, b) { return b.created_at.localeCompare(a.created_at); });
      }
      const { data, error } = await sb.from("assessments").select("*").order("created_at", { ascending: false });
      if (error) throw new Error(friendlyError(error));
      return data;
    },

    async getAssessment(id) {
      if (DEMO) {
        const user = await api.getUser();
        return store.get("demo_assessments", []).find(function (a) {
          return a.assessment_id === id && a.user_id === user.id;
        }) || null;
      }
      const { data, error } = await sb.from("assessments").select("*").eq("assessment_id", id).maybeSingle();
      if (error) throw new Error(friendlyError(error));
      return data;
    },

    async updateAssessment(id, fields) {
      if (DEMO) {
        const all = store.get("demo_assessments", []);
        const row = all.find(function (a) { return a.assessment_id === id; });
        if (row) Object.assign(row, fields);
        store.set("demo_assessments", all);
        return row;
      }
      const { data, error } = await sb.from("assessments").update(fields).eq("assessment_id", id).select().single();
      if (error) throw new Error(friendlyError(error));
      return data;
    },

    async deleteAssessment(id) {
      if (DEMO) {
        store.set("demo_assessments", store.get("demo_assessments", []).filter(function (a) { return a.assessment_id !== id; }));
        store.set("demo_answers", store.get("demo_answers", []).filter(function (a) { return a.assessment_id !== id; }));
        return;
      }
      const { error } = await sb.from("assessments").delete().eq("assessment_id", id);
      if (error) throw new Error(friendlyError(error));
    },

    async getAnswers(assessmentId) {
      if (DEMO) {
        return store.get("demo_answers", []).filter(function (a) { return a.assessment_id === assessmentId; });
      }
      const { data, error } = await sb.from("answers").select("*").eq("assessment_id", assessmentId);
      if (error) throw new Error(friendlyError(error));
      return data;
    },

    async saveAnswer(assessmentId, questionId, response) {
      const row = { assessment_id: assessmentId, question_id: questionId, response: response, is_gap: isGap(response) };
      if (DEMO) {
        const all = store.get("demo_answers", []);
        const existing = all.find(function (a) { return a.assessment_id === assessmentId && a.question_id === questionId; });
        if (existing) Object.assign(existing, row); else all.push(Object.assign({ answer_id: uuid() }, row));
        store.set("demo_answers", all);
        return;
      }
      const { error } = await sb.from("answers").upsert(row, { onConflict: "assessment_id,question_id" });
      if (error) throw new Error(friendlyError(error));
    }
  };

  // ------------------------------------------------------------------
  // Header for app pages
  // ------------------------------------------------------------------
  function brandHtml() {
    return '<a class="brand" href="index.html" aria-label="AI-CDSS Transparency Assessment Tool, home">' +
      '<span class="brand-mark">' + icon("shield") + "</span>" +
      '<span class="brand-text"><span class="brand-name">AI-CDSS <span>Transparency</span></span>' +
      '<span class="brand-sub">Assessment Tool</span></span></a>';
  }

  async function renderAppHeader(active) {
    const user = await api.getUser();
    const header = document.querySelector("[data-app-header]");
    if (!header) return user;
    header.innerHTML =
      '<div class="container nav">' + brandHtml() +
      '<ul class="nav-links" id="nav-links">' +
      '<li><a href="dashboard.html"' + (active === "dashboard" ? ' aria-current="page"' : "") + ">My assessments</a></li>" +
      '<li><a href="new-assessment.html"' + (active === "new" ? ' aria-current="page"' : "") + ">New assessment</a></li>" +
      "</ul>" +
      '<div class="nav-actions">' +
      (user ? '<span class="user-chip" title="' + escapeHtml(user.email) + '">' + escapeHtml(user.email) + "</span>" +
        '<button class="btn btn-secondary btn-sm" type="button" data-logout>' + icon("logout") + '<span class="btn-label">Log out</span></button>' : "") +
      '<button class="menu-btn" type="button" aria-controls="nav-links" aria-expanded="false" aria-label="Open menu">' + icon("menu") + "</button>" +
      "</div></div>";
    wireMenu(header);
    const logout = header.querySelector("[data-logout]");
    if (logout) logout.addEventListener("click", async function () {
      await api.signOut();
      window.location.href = "login.html";
    });
    return user;
  }

  function wireMenu(root) {
    const btn = (root || document).querySelector(".menu-btn");
    const links = (root || document).querySelector(".nav-links");
    if (!btn || !links) return;
    btn.addEventListener("click", function () {
      const open = links.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
  }

  async function requireUser(active) {
    const user = await renderAppHeader(active);
    if (!user) {
      window.location.href = "login.html?next=" + encodeURIComponent(location.pathname.split("/").pop() + location.search);
      return null;
    }
    return user;
  }

  function demoNotice() {
    if (!DEMO) return "";
    return '<div class="notice" role="note">' + icon("info") +
      "<div><strong>Demo mode.</strong> Supabase is not connected yet, so assessments are saved only in this browser. " +
      "Add your Supabase keys in <code>js/config.js</code> to save them online.</div></div>";
  }

  window.App = {
    icon: icon, hydrateIcons: hydrateIcons, escapeHtml: escapeHtml, formatDate: formatDate,
    param: param, toast: toast, loadQuestions: loadQuestions, isGap: isGap, api: api,
    renderAppHeader: renderAppHeader, requireUser: requireUser, wireMenu: wireMenu, demoNotice: demoNotice
  };

  document.addEventListener("DOMContentLoaded", function () {
    hydrateIcons();
    wireMenu(document.querySelector(".site-header"));
    const y = document.querySelector("[data-year]");
    if (y) y.textContent = new Date().getFullYear();
  });
})();
