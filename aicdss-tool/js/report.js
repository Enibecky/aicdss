// Report generator: answers, governance gaps and guidance.
(async function () {
  "use strict";
  const { api, requireUser, demoNotice, escapeHtml, icon, param, loadQuestions, isGap, formatDate } = window.App;

  const user = await requireUser();
  if (!user) return;
  document.getElementById("demo-slot").innerHTML = demoNotice();

  const box = document.getElementById("report");
  const id = param("id");
  let a, questions, answers = {};
  try {
    a = id ? await api.getAssessment(id) : null;
    if (!a) { box.innerHTML = '<p class="empty">This report could not be found. <a href="dashboard.html">Back to my assessments</a></p>'; return; }
    if (a.status !== "completed") { window.location.replace("assessment.html?id=" + encodeURIComponent(id)); return; }
    questions = await loadQuestions();
    (await api.getAnswers(id)).forEach(function (x) { answers[x.question_id] = x.response; });
  } catch (err) {
    box.innerHTML = '<p class="empty">' + escapeHtml(err.message) + "</p>";
    return;
  }

  const yes = questions.filter(function (q) { return answers[q.id] === "Yes"; });
  const no = questions.filter(function (q) { return answers[q.id] === "No"; });
  const unknown = questions.filter(function (q) { return answers[q.id] === "I do not know"; });
  const gaps = questions.filter(function (q) { return isGap(answers[q.id]); });
  const stage = a.stage === "in-use" ? "While in use" : "Before adoption";

  function badge(resp) {
    if (resp === "Yes") return '<span class="badge badge-yes">Yes</span>';
    if (resp === "No") return '<span class="badge badge-no">No</span>';
    if (resp === "I do not know") return '<span class="badge badge-unknown">I do not know</span>';
    return '<span class="badge">Not answered</span>';
  }

  document.title = "Report: " + a.ai_cdss_name + " | AI-CDSS Transparency Assessment Tool";

  box.innerHTML =
    '<p class="print-only" style="color:var(--teal-700);font-weight:700;margin-bottom:4px">AI-CDSS Transparency Assessment Tool</p>' +
    '<div class="report-head">' +
    '<div><p class="eyebrow" style="margin-bottom:6px">Transparency assessment report</p>' +
    '<h1 style="font-size:1.9rem;margin-bottom:0">' + escapeHtml(a.ai_cdss_name) + "</h1></div>" +
    '<div class="report-actions">' +
    '<a class="btn btn-secondary btn-sm" href="dashboard.html">' + icon("arrowLeft") + "My assessments</a>" +
    '<button class="btn btn-primary btn-sm" type="button" id="print-btn">' + icon("printer") + "Print or save as PDF</button>" +
    "</div></div>" +

    '<div class="report-meta">' +
    "<div><span>Institution</span><strong>" + escapeHtml(a.institution_name) + "</strong></div>" +
    "<div><span>Vendor</span><strong>" + escapeHtml(a.vendor || "Not stated") + "</strong></div>" +
    "<div><span>Stage</span><strong>" + stage + "</strong></div>" +
    '<div style="grid-column:1/-1"><span>Intended use</span><strong>' + escapeHtml(a.intended_use || "Not stated") + "</strong></div>" +
    "<div><span>Started</span><strong>" + formatDate(a.created_at) + "</strong></div>" +
    "<div><span>Completed</span><strong>" + formatDate(a.completed_at) + "</strong></div>" +
    "<div><span>Assessed by</span><strong>" + escapeHtml(user.email) + "</strong></div>" +
    "</div>" +

    '<div class="score-row">' +
    '<div class="score score-yes"><strong>' + yes.length + "</strong><span>Yes</span></div>" +
    '<div class="score score-no"><strong>' + no.length + "</strong><span>No</span></div>" +
    '<div class="score score-unknown"><strong>' + unknown.length + "</strong><span>I do not know</span></div>" +
    '<div class="score score-gaps"><strong>' + gaps.length + "</strong><span>Governance gaps</span></div>" +
    "</div>" +

    '<section class="report-section" aria-labelledby="gaps-h">' +
    '<h2 id="gaps-h" style="font-size:1.35rem">Governance gaps and guidance</h2>' +
    (gaps.length
      ? '<p style="color:var(--color-muted)">Each question answered <strong>No</strong> or <strong>I do not know</strong> is a governance gap. The guidance below explains how the institution can address it.</p>' +
        '<div class="gap-list">' + gaps.map(function (q) {
          const resp = answers[q.id];
          return '<article class="gap-item' + (resp === "I do not know" ? " unknown" : "") + '">' +
            '<div class="gap-top"><h3>' + q.id + ". " + escapeHtml(q.question) + "</h3>" + badge(resp) + "</div>" +
            '<div class="gap-guidance"><strong>Guidance:</strong> ' + escapeHtml(q.guidance) + "</div></article>";
        }).join("") + "</div>"
      : '<div class="notice" style="background:var(--color-ok-bg);color:var(--color-ok)">' + icon("check") +
        "<div>No governance gaps were identified. Repeat this assessment while the system is in use, especially after updates.</div></div>") +
    "</section>" +

    '<section class="report-section" aria-labelledby="all-h">' +
    '<h2 id="all-h" style="font-size:1.35rem">All answers</h2>' +
    '<div class="table-wrap"><table><caption class="sr-only">All assessment questions and answers</caption>' +
    '<thead><tr><th scope="col">No.</th><th scope="col">Question</th><th scope="col">Answer</th></tr></thead><tbody>' +
    questions.map(function (q) {
      return "<tr><td>" + q.id + "</td><td>" + escapeHtml(q.question) + "</td><td>" + badge(answers[q.id]) + "</td></tr>";
    }).join("") + "</tbody></table></div></section>" +
    '<p class="gap-source" style="margin-top:24px">This report records the institution\'s own answers. It identifies transparency gaps and does not certify the safety of the AI-CDSS.</p>';

  document.getElementById("print-btn").addEventListener("click", function () { window.print(); });
})();
