// Assessment engine: shows each question, records answers, identifies governance gaps.
(async function () {
  "use strict";
  const { api, requireUser, demoNotice, escapeHtml, icon, param, loadQuestions, isGap, toast } = window.App;

  const user = await requireUser();
  if (!user) return;
  document.getElementById("demo-slot").innerHTML = demoNotice();

  const area = document.getElementById("q-area");
  const id = param("id");
  const OPTIONS = ["Yes", "No", "I do not know"];

  let assessment, questions, answers = {}, current = 0;

  try {
    assessment = id ? await api.getAssessment(id) : null;
    if (!assessment) {
      area.innerHTML = '<p class="empty">This assessment could not be found. <a href="dashboard.html">Back to my assessments</a></p>';
      return;
    }
    if (assessment.status === "completed") {
      window.location.replace("report.html?id=" + encodeURIComponent(id));
      return;
    }
    questions = await loadQuestions();
    (await api.getAnswers(id)).forEach(function (a) { answers[a.question_id] = a.response; });
  } catch (err) {
    area.innerHTML = '<p class="empty">' + escapeHtml(err.message) + "</p>";
    return;
  }

  // Side panel
  document.getElementById("side-system").textContent = assessment.ai_cdss_name;
  document.getElementById("side-meta").innerHTML =
    "<li><span>Institution</span>" + escapeHtml(assessment.institution_name) + "</li>" +
    (assessment.vendor ? "<li><span>Vendor</span>" + escapeHtml(assessment.vendor) + "</li>" : "") +
    "<li><span>Stage</span>" + (assessment.stage === "in-use" ? "While in use" : "Before adoption") + "</li>";
  document.getElementById("progress").setAttribute("aria-valuemax", String(questions.length));

  const firstUnanswered = questions.findIndex(function (q) { return !answers[q.id]; });
  current = firstUnanswered === -1 ? questions.length - 1 : firstUnanswered;

  function answeredCount() {
    return questions.filter(function (q) { return answers[q.id]; }).length;
  }

  function renderProgress() {
    const n = answeredCount();
    document.getElementById("progress-bar").style.width = (n / questions.length * 100) + "%";
    document.getElementById("progress").setAttribute("aria-valuenow", String(n));
    document.getElementById("progress-text").textContent = n + " of " + questions.length + " answered";
    document.getElementById("q-dots").innerHTML = questions.map(function (q, i) {
      const cls = "q-dot" + (answers[q.id] ? " answered" : "") + (i === current ? " current" : "");
      return '<button type="button" class="' + cls + '" data-jump="' + i + '" aria-label="Question ' + (i + 1) +
        (answers[q.id] ? ", answered " + answers[q.id] : ", not answered") + '"' +
        (i === current ? ' aria-current="step"' : "") + ">" + (i + 1) + "</button>";
    }).join("");
    document.querySelectorAll("[data-jump]").forEach(function (b) {
      b.addEventListener("click", function () { current = Number(b.getAttribute("data-jump")); render(true); });
    });
  }

  function render(focusHeading) {
    const q = questions[current];
    const last = current === questions.length - 1;
    const chosen = answers[q.id];
    area.innerHTML =
      '<span class="q-number">' + icon("clipboard", 'style="width:16px;height:16px"') + "Question " + (current + 1) + " of " + questions.length + "</span>" +
      '<h1 class="q-text" id="q-heading" tabindex="-1">' + escapeHtml(q.question) + "</h1>" +
      '<fieldset><legend class="sr-only">Your answer</legend><div class="answer-options">' +
      OPTIONS.map(function (opt, i) {
        return '<label class="answer-option"><input type="radio" name="answer" value="' + opt + '"' +
          (chosen === opt ? " checked" : "") + (i === 0 ? ' id="first-option"' : "") + '><span class="radio"></span>' + opt + "</label>";
      }).join("") + "</div></fieldset>" +
      '<p class="save-status" id="save-status" aria-live="polite"></p>' +
      '<div class="q-nav">' +
      '<button class="btn btn-secondary" type="button" id="prev"' + (current === 0 ? " disabled" : "") + ">" + icon("arrowLeft") + "Previous</button>" +
      (last
        ? '<button class="btn btn-primary" type="button" id="submit">Submit assessment ' + icon("check") + "</button>"
        : '<button class="btn btn-primary" type="button" id="next">Next ' + icon("arrowRight") + "</button>") +
      "</div>";

    area.querySelectorAll('input[name="answer"]').forEach(function (input) {
      input.addEventListener("change", async function () {
        answers[q.id] = input.value;
        renderProgress();
        const status = document.getElementById("save-status");
        status.textContent = "Saving…";
        try {
          await api.saveAnswer(assessment.assessment_id, q.id, input.value);
          status.textContent = "Answer saved.";
        } catch (err) {
          status.textContent = "Could not save: " + err.message;
        }
      });
    });

    document.getElementById("prev").addEventListener("click", function () {
      if (current > 0) { current--; render(true); }
    });
    const nextBtn = document.getElementById("next");
    if (nextBtn) nextBtn.addEventListener("click", function () {
      if (!answers[q.id]) { toast("Please choose an answer before continuing."); document.getElementById("first-option").focus(); return; }
      current++; render(true);
    });
    const submitBtn = document.getElementById("submit");
    if (submitBtn) submitBtn.addEventListener("click", submit);

    renderProgress();
    if (focusHeading) document.getElementById("q-heading").focus();
  }

  async function submit() {
    const missing = questions.findIndex(function (q) { return !answers[q.id]; });
    if (missing !== -1) {
      toast("Please answer question " + (missing + 1) + " before submitting.");
      current = missing; render(true);
      return;
    }
    const btn = document.getElementById("submit");
    btn.disabled = true;
    btn.textContent = "Generating report…";
    const gaps = questions.filter(function (q) { return isGap(answers[q.id]); }).length;
    try {
      await api.updateAssessment(assessment.assessment_id, {
        status: "completed", gaps_identified: gaps, completed_at: new Date().toISOString()
      });
      window.location.href = "report.html?id=" + encodeURIComponent(assessment.assessment_id);
    } catch (err) {
      toast("Could not submit: " + err.message);
      btn.disabled = false;
      btn.textContent = "Submit assessment";
    }
  }

  render(false);
})();
