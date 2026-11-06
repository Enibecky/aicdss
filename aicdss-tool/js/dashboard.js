// Dashboard: list of the user's assessments
(async function () {
  "use strict";
  const { api, requireUser, demoNotice, escapeHtml, formatDate, icon, toast } = window.App;

  const user = await requireUser("dashboard");
  if (!user) return;
  document.getElementById("demo-slot").innerHTML = demoNotice();

  const list = document.getElementById("list");

  async function render() {
    let rows;
    try {
      rows = await api.listAssessments();
    } catch (err) {
      list.innerHTML = '<p class="empty">Could not load assessments: ' + escapeHtml(err.message) + "</p>";
      return;
    }
    const done = rows.filter(function (r) { return r.status === "completed"; }).length;
    document.getElementById("s-total").textContent = rows.length;
    document.getElementById("s-done").textContent = done;
    document.getElementById("s-progress").textContent = rows.length - done;

    if (!rows.length) {
      list.innerHTML = '<div class="empty"><span class="stat-icon">' + icon("clipboard") + "</span>" +
        '<h3>No assessments yet</h3><p>Start your first assessment of an AI-CDSS.</p>' +
        '<a class="btn btn-primary" href="new-assessment.html">' + icon("plus") + "New assessment</a></div>";
      return;
    }

    list.innerHTML = '<div class="table-wrap"><table>' +
      "<caption class=\"sr-only\">Your saved assessments</caption>" +
      "<thead><tr><th scope=\"col\">AI-CDSS</th><th scope=\"col\">Institution</th><th scope=\"col\">Stage</th>" +
      "<th scope=\"col\">Status</th><th scope=\"col\">Gaps</th><th scope=\"col\">Date</th><th scope=\"col\"><span class=\"sr-only\">Actions</span></th></tr></thead><tbody>" +
      rows.map(function (r) {
        const completed = r.status === "completed";
        return "<tr>" +
          "<td><strong>" + escapeHtml(r.ai_cdss_name) + "</strong>" + (r.vendor ? "<br><span style=\"color:var(--color-muted);font-size:.88rem\">" + escapeHtml(r.vendor) + "</span>" : "") + "</td>" +
          "<td>" + escapeHtml(r.institution_name) + "</td>" +
          '<td><span class="badge badge-stage">' + (r.stage === "in-use" ? "In use" : "Pre-adoption") + "</span></td>" +
          '<td><span class="badge ' + (completed ? "badge-done" : "badge-progress") + '">' + (completed ? "Completed" : "In progress") + "</span></td>" +
          "<td>" + (completed ? (r.gaps_identified > 0 ? '<span class="badge badge-gap">' + r.gaps_identified + "</span>" : '<span class="badge badge-done">0</span>') : "—") + "</td>" +
          "<td>" + formatDate(completed ? r.completed_at : r.created_at) + "</td>" +
          '<td><div class="row-actions">' +
          (completed
            ? '<a class="btn btn-secondary btn-sm" href="report.html?id=' + encodeURIComponent(r.assessment_id) + '">View report</a>'
            : '<a class="btn btn-primary btn-sm" href="assessment.html?id=' + encodeURIComponent(r.assessment_id) + '">Continue</a>') +
          '<button class="btn btn-ghost btn-sm" type="button" data-delete="' + escapeHtml(r.assessment_id) + '" aria-label="Delete assessment of ' + escapeHtml(r.ai_cdss_name) + '">' + icon("trash") + "</button>" +
          "</div></td></tr>";
      }).join("") + "</tbody></table></div>";

    list.querySelectorAll("[data-delete]").forEach(function (btn) {
      btn.addEventListener("click", async function () {
        if (!confirm("Delete this assessment and its answers? This cannot be undone.")) return;
        try {
          await api.deleteAssessment(btn.getAttribute("data-delete"));
          toast("Assessment deleted.");
          render();
        } catch (err) { toast(err.message); }
      });
    });
  }

  render();
})();
