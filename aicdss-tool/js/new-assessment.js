// New assessment: AI-CDSS details and stage
(async function () {
  "use strict";
  const { api, requireUser, demoNotice } = window.App;

  const user = await requireUser("new");
  if (!user) return;
  document.getElementById("demo-slot").innerHTML = demoNotice();

  const form = document.getElementById("new-form");
  const btn = document.getElementById("start-btn");
  const msg = document.getElementById("new-message");

  function check(fieldId, ok, input) {
    document.getElementById(fieldId).classList.toggle("invalid", !ok);
    if (input) input.setAttribute("aria-invalid", ok ? "false" : "true");
    return ok;
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    msg.textContent = "";
    const inst = form.institution_name, sys = form.ai_cdss_name;
    const stage = form.querySelector('input[name="stage"]:checked');
    const ok = [
      check("f-institution", inst.value.trim() !== "", inst),
      check("f-system", sys.value.trim() !== "", sys),
      check("f-stage", !!stage)
    ].every(Boolean);
    if (!ok) {
      const first = form.querySelector(".invalid input");
      if (first) first.focus();
      return;
    }
    btn.disabled = true;
    try {
      const row = await api.createAssessment({
        institution_name: inst.value.trim(),
        ai_cdss_name: sys.value.trim(),
        vendor: form.vendor.value.trim() || null,
        intended_use: form.intended_use.value.trim() || null,
        stage: stage.value
      });
      window.location.href = "assessment.html?id=" + encodeURIComponent(row.assessment_id);
    } catch (err) {
      msg.textContent = err.message;
      btn.disabled = false;
    }
  });
})();
