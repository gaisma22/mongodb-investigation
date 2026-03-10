// game.js — Stage Manager + All UI Controllers

// ─── Typewriter utility ───────────────────────────────────────────────────────
function typewriter(el, text, speed = 28, onDone) {
  el.textContent = "";
  let i = 0;
  const tick = () => {
    if (i < text.length) {
      el.textContent += text[i++];
      setTimeout(tick, speed);
    } else if (onDone) onDone();
  };
  tick();
}

// ─── Alfred Panel controller (shared between Stage 1 + 2) ────────────────────
const AlfredPanel = (() => {
  let dialogueEl, instructionEl, currentDialogueTimer = null;

  function init(dialogueId, instructionId) {
    dialogueEl    = document.getElementById(dialogueId);
    instructionEl = document.getElementById(instructionId);
  }

  function setDialogue(lines, onDone) {
    if (currentDialogueTimer) clearTimeout(currentDialogueTimer);
    dialogueEl.innerHTML = "";

    let delay = 0;
    lines.forEach((line, idx) => {
      const p = document.createElement("p");
      if (line === "") {
        p.className = "alfred-spacer";
      } else {
        p.className = "alfred-line";
        p.textContent = line;
      }
      dialogueEl.appendChild(p);

      setTimeout(() => {
        p.classList.add("visible");
        dialogueEl.scrollTop = dialogueEl.scrollHeight;
        if (idx === lines.length - 1 && onDone)
          currentDialogueTimer = setTimeout(onDone, 600);
      }, delay);

      // Vary fade delay: short lines faster, longer lines slower
      delay += Math.max(320, line.length * 18);
    });
  }

  function setInstruction(text) {
    if (!instructionEl) return;
    instructionEl.innerHTML = "";
    const lines = text.split("\n");
    lines.forEach((line, i) => {
      const p = document.createElement("p");
      p.className = "alfred-line instruction-line";
      p.textContent = line;
      instructionEl.appendChild(p);
      setTimeout(() => p.classList.add("visible"), i * 180 + 300);
    });
  }

  function clear() {
    if (dialogueEl)    dialogueEl.innerHTML    = "";
    if (instructionEl) instructionEl.innerHTML = "";
  }

  return { init, setDialogue, setInstruction, clear };
})();

// ─── Game Stage Manager ───────────────────────────────────────────────────────
const Game = (() => {
  let investigatorName = "";

  function showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    const el = document.getElementById(id);
    if (el) { el.classList.add("active"); }
  }

  function startGame(name) {
    investigatorName = name || "Investigator";
    Terminal.reset();
    Repair.reset();
    Quiz.reset();
    showScreen("terminal-screen");
    TerminalUI.init();
  }

  function goToRepair() {
    showScreen("repair-screen");
    RepairUI.init();
  }

  function goToQuiz() {
    showScreen("quiz-screen");
    QuizUI.init();
  }

  function goToResults() {
    showScreen("results-screen");
    ResultsUI.init();
  }

  function goToResources() {
    showScreen("resources-screen");
    ResourcesUI.init();
  }

  function goToCertificate() {
    showScreen("certificate-screen");
    CertificateUI.init(investigatorName);
  }

  function restart() {
    Terminal.reset();
    Repair.reset();
    Quiz.reset();
    showScreen("intro-screen");
    IntroUI.init();
  }

  function getName() { return investigatorName; }

  return { showScreen, startGame, goToRepair, goToQuiz, goToResults, goToResources, goToCertificate, restart, getName };
})();

// ─── Intro UI — cinematic typewriter cutscene ─────────────────────────────────
const IntroUI = (() => {
  let skipTimers = [];
  const lines = [
    { text: "Connection established…",                         pause: 900  },
    { text: "Accessing Gotham City Archive System…",           pause: 1100 },
    { text: "",                                                pause: 400  },
    { text: "Several records appear incomplete.",              pause: 800  },
    { text: "   Criminal case files.",                         pause: 500  },
    { text: "   Incident reports.",                            pause: 500  },
    { text: "   Evidence logs.",                               pause: 700  },
    { text: "",                                                pause: 400  },
    { text: "Some of them are… missing.",                      pause: 1400 },
    { text: "",                                                pause: 500  },
    { text: "Batman is currently occupied dealing with",       pause: 700  },
    { text: "villains in another dimension.",                  pause: 1200 },
    { text: "",                                                pause: 400  },
    { text: "Until he returns, the archive appears to be",     pause: 700  },
    { text: "your responsibility.",                            pause: 1400 },
    { text: "",                                                pause: 500  },
    { text: "Explore the archive.",                            pause: 600  },
    { text: "Understand how it stores information.",           pause: 600  },
    { text: "Find the problem.",                               pause: 1000 },
    { text: "",                                                pause: 500  },
    { text: "Gotham needs those records restored.",            pause: 1500 },
    { text: "Gotham needs you.",                               pause: 1800 }
  ];

  function init() {
    const container = document.getElementById("cutscene-text");
    const form      = document.getElementById("intro-form");
    container.innerHTML = "";
    form.style.opacity  = "0";
    form.style.display  = "none";
    runLine(0, container, form);
  }

  function runLine(idx, container, form) {
    if (idx >= lines.length) {
      // All lines done — reveal form
      form.style.display = "flex";
      setTimeout(() => { form.style.opacity = "1"; }, 80);
      return;
    }

    const { text, pause } = lines[idx];

    if (text === "") {
      // Empty line spacer
      const br = document.createElement("br");
      container.appendChild(br);
      skipTimers.push(setTimeout(() => runLine(idx + 1, container, form), pause));
      return;
    }

    const p = document.createElement("p");
    p.className = "cutscene-line";
    container.appendChild(p);

    typewriter(p, text, 30, () => {
      skipTimers.push(setTimeout(() => runLine(idx + 1, container, form), pause));
    });
  }

  function skip() {
    skipTimers.forEach(t => clearTimeout(t));
    skipTimers = [];
    const form = document.getElementById("intro-form");
    form.style.display = "flex";
    setTimeout(() => { form.style.opacity = "1"; }, 80);
  }

  return { init, skip };
})();

// ─── Terminal UI — Stage 1 ────────────────────────────────────────────────────
const TerminalUI = (() => {
  let outputEl, inputEl, progressEl;
  let locked = false;

  function init() {
    outputEl   = document.getElementById("terminal-output");
    inputEl    = document.getElementById("terminal-input");
    progressEl = document.getElementById("terminal-progress");

    outputEl.innerHTML = "";
    inputEl.value      = "";
    locked             = false;

    document.querySelector("#terminal-screen .input-prompt").textContent = "gotham >";
    AlfredPanel.setDialogue(Terminal.getIntroDialogue(), () => {
      AlfredPanel.setInstruction(Terminal.getIntroInstruction());
    });

    updateProgress();

    inputEl.removeEventListener("keydown", handleKey);
    inputEl.addEventListener("keydown", handleKey);
    const hintBtn = document.getElementById("terminal-hint-btn");
    hintBtn.replaceWith(hintBtn.cloneNode(true));
    document.getElementById("terminal-hint-btn").addEventListener("click", showHint);
    inputEl.focus();
  }

  function handleKey(e) {
    if (e.key === "Enter" && !locked) {
      const val = inputEl.value.trim();
      if (!val) return;
      submit(val);
      inputEl.value = "";
    }
  }

  function submit(cmd) {
    printPrompt(cmd);
    const result = Terminal.processCommand(cmd);
    if (!result) return;

    if (result.success) {
      locked = true;
      printOutput(result.output);
      updateProgress();

      if (Terminal.getProgress().current >= 3) {
        document.querySelector("#terminal-screen .input-prompt").textContent = "gotham_archive >";
      }

      if (result.complete) {
        printSystem("— Investigation complete. Proceeding to archive repair… —");
        AlfredPanel.setDialogue(result.dialogue, () => {
          AlfredPanel.setInstruction(result.instruction);
          setTimeout(() => Game.goToRepair(), 2800);
        });
      } else {
        AlfredPanel.setDialogue(result.dialogue, () => {
          AlfredPanel.setInstruction(result.instruction);
          locked = false;
          inputEl.focus();
        });
      }
    } else {
      printError(result.error);
    }
  }

  function showHint() {
    const hint = Terminal.getCurrentHint();
    if (hint) AlfredPanel.setInstruction("Hint:\n\n" + hint);
  }

  function updateProgress() {
    const p = Terminal.getProgress();
    if (progressEl) progressEl.textContent = `Stage 1 — Command ${p.current} / ${p.total}`;
  }

  return { init };
})();

// ─── Repair UI — Stage 2 ──────────────────────────────────────────────────────
const RepairUI = (() => {
  let outputEl, inputEl, progressEl;
  let locked = false;

  function init() {
    outputEl   = document.getElementById("repair-output");
    inputEl    = document.getElementById("repair-input");
    progressEl = document.getElementById("repair-progress");

    outputEl.innerHTML = "";
    inputEl.value      = "";
    locked             = false;

    AlfredPanel.init("repair-alfred-dialogue", "repair-alfred-instruction");
    AlfredPanel.setDialogue(Repair.getIntroDialogue(), () => {
      AlfredPanel.setInstruction(Repair.getIntroInstruction());
    });

    updateProgress();
    inputEl.removeEventListener("keydown", handleKey);
    inputEl.addEventListener("keydown", handleKey);
    const hintBtn = document.getElementById("repair-hint-btn");
    hintBtn.replaceWith(hintBtn.cloneNode(true));
    document.getElementById("repair-hint-btn").addEventListener("click", showHint);
    document.querySelector("#repair-screen .input-prompt").textContent = "gotham_archive >";
    inputEl.focus();
  }

  function handleKey(e) {
    if (e.key === "Enter" && !locked) {
      const val = inputEl.value.trim();
      if (!val) return;
      submit(val);
      inputEl.value = "";
    }
  }

  function submit(cmd) {
    printPrompt(cmd);
    const result = Repair.processCommand(cmd);
    if (!result) return;

    if (result.success) {
      locked = true;
      printOutput(result.output);
      updateProgress();

      if (result.complete) {
        printSystem("— Archive repair complete. Proceeding to certification challenge… —");
        AlfredPanel.setDialogue(result.dialogue, () => {
          AlfredPanel.setInstruction(result.instruction);
          setTimeout(() => Game.goToQuiz(), 2800);
        });
      } else {
        AlfredPanel.setDialogue(result.dialogue, () => {
          AlfredPanel.setInstruction(result.instruction);
          locked = false;
          inputEl.focus();
        });
      }
    } else {
      printError(result.error);
    }
  }

  function showHint() {
    const hint = Repair.getCurrentHint();
    if (hint) AlfredPanel.setInstruction("Hint:\n\n" + hint);
  }

  function updateProgress() {
    const p = Repair.getProgress();
    if (progressEl) progressEl.textContent = `Stage 2 — Repair ${p.current} / ${p.total}`;
  }

  // Shared print helpers — defined on window so both UIs can use them
  return { init };
})();

// ─── Shared print functions ───────────────────────────────────────────────────
function getActiveOutput() {
  const ts = document.getElementById("terminal-screen");
  return ts && ts.classList.contains("active")
    ? document.getElementById("terminal-output")
    : document.getElementById("repair-output");
}

function printPrompt(cmd) {
  const el   = getActiveOutput();
  const line = document.createElement("div");
  line.className = "t-line t-prompt";
  const activePrompt = document.querySelector(".screen.active .input-prompt");
  line.innerHTML = `<span class="prompt-sym">${activePrompt ? activePrompt.textContent : "gotham >"}</span> <span>${esc(cmd)}</span>`;
  el.appendChild(line);
  el.scrollTop = el.scrollHeight;
}

function printOutput(text) {
  const el    = getActiveOutput();
  const block = document.createElement("div");
  block.className = "t-line t-output";
  block.innerHTML = esc(text).replace(/\n/g, "<br>");
  el.appendChild(block);
  el.scrollTop = el.scrollHeight;
}

function printError(text) {
  const el    = getActiveOutput();
  const block = document.createElement("div");
  block.className = "t-line t-error";
  block.innerHTML = esc(text).replace(/\n/g, "<br>");
  el.appendChild(block);
  el.scrollTop = el.scrollHeight;
}

function printSystem(text) {
  const el    = getActiveOutput();
  const block = document.createElement("div");
  block.className = "t-line t-system";
  block.textContent = text;
  el.appendChild(block);
  el.scrollTop = el.scrollHeight;
}

function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ─── Quiz UI ──────────────────────────────────────────────────────────────────
const QuizUI = (() => {
  function init() { renderQuestion(0); }

  function renderQuestion(index) {
    const q           = Quiz.getQuestion(index);
    const containerEl = document.getElementById("quiz-container");
    const progressEl  = document.getElementById("quiz-progress");

    if (!q) { Game.goToResults(); return; }

    progressEl.textContent = `Question ${index + 1} of ${Quiz.getTotalQuestions()}`;
    containerEl.innerHTML  = "";

    const card = document.createElement("div");
    card.className = "quiz-card";

    const qText = document.createElement("div");
    qText.className   = "quiz-question";
    qText.textContent = q.question;
    card.appendChild(qText);

    const opts = document.createElement("div");
    opts.className = "quiz-options";

    q.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "quiz-option";
      btn.innerHTML = `<span class="opt-letter">${String.fromCharCode(65 + i)}</span>${opt}`;
      btn.addEventListener("click", () => handleAnswer(index, i, card));
      opts.appendChild(btn);
    });

    card.appendChild(opts);
    containerEl.appendChild(card);
    void card.offsetWidth;
    card.classList.add("visible");
  }

  function handleAnswer(qIndex, selected, card) {
    const allBtns = card.querySelectorAll(".quiz-option");
    allBtns.forEach(b => b.disabled = true);

    const result = Quiz.answerQuestion(qIndex, selected);
    allBtns.forEach((b, i) => {
      if (i === result.correctAnswer) b.classList.add("correct");
      else if (i === selected && !result.correct) b.classList.add("incorrect");
    });

    const exp = document.createElement("div");
    exp.className   = "quiz-explanation";
    exp.textContent = result.explanation;
    card.appendChild(exp);

    setTimeout(() => {
      card.classList.add("exit");
      setTimeout(() => renderQuestion(qIndex + 1), 450);
    }, 2000);
  }

  return { init };
})();

// ─── Results UI ───────────────────────────────────────────────────────────────
const ResultsUI = (() => {
  function init() {
    const { score, total, percentage } = Quiz.getScore();
    const restPct  = GothamArchive.getRestorationPercent();
    const meme     = Quiz.getMemeData();

    document.getElementById("restoration-pct").textContent = `${restPct}%`;
    document.getElementById("quiz-score-display").textContent = `${score} / ${total}`;

    // Alfred report
    const reportEl = document.getElementById("alfred-results-report");
    reportEl.innerHTML = "";
    meme.alfred.forEach((line, i) => {
      const p = document.createElement("p");
      p.className   = "alfred-line";
      p.textContent = line;
      reportEl.appendChild(p);
      setTimeout(() => p.classList.add("visible"), i * 280 + 200);
    });

    // Meme image
    const memeEl = document.getElementById("results-meme");
    memeEl.src = meme.image;
    memeEl.alt = `Batman ${meme.label}`;
    memeEl.style.display = "block";

    const resBtn = document.getElementById("proceed-resources-btn");
    resBtn.replaceWith(resBtn.cloneNode(true));
    document.getElementById("proceed-resources-btn").addEventListener("click", () => Game.goToResources());
  }

  return { init };
})();

// ─── Certificate UI ───────────────────────────────────────────────────────────
const CertificateUI = (() => {
  function init(name) {
    const { score, total, percentage } = Quiz.getScore();
    const restPct = GothamArchive.getRestorationPercent();
    const certId  = "GDT-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const date    = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

    document.getElementById("cert-name").textContent       = name;
    document.getElementById("cert-score").textContent      = `${percentage}% — ${score}/${total}`;
    document.getElementById("cert-restoration").textContent= `Archive Restored: ${restPct}%`;
    document.getElementById("cert-id").textContent         = certId;
    document.getElementById("cert-date").textContent       = date;

    const dlBtn = document.getElementById("download-cert-btn");
    dlBtn.replaceWith(dlBtn.cloneNode(true));
    document.getElementById("download-cert-btn").addEventListener("click", () => downloadCert(name, certId, date, percentage, restPct));
    const rstBtn = document.getElementById("restart-btn");
    rstBtn.replaceWith(rstBtn.cloneNode(true));
    document.getElementById("restart-btn").addEventListener("click", () => Game.restart());
  }

  function downloadCert(name, certId, date, quizPct, restPct) {
    const canvas = document.createElement("canvas");
    canvas.width  = 960;
    canvas.height = 640;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#0b0f14";
    ctx.fillRect(0, 0, 960, 640);

    ctx.strokeStyle = "#33ff88";
    ctx.lineWidth   = 4;
    ctx.strokeRect(20, 20, 920, 600);
    ctx.strokeStyle = "#1a3a2a";
    ctx.lineWidth   = 1;
    ctx.strokeRect(32, 32, 896, 576);

    ctx.textAlign = "center";

    ctx.fillStyle = "#33ff88";
    ctx.font      = "bold 13px monospace";
    ctx.fillText("GOTHAM CITY ARCHIVE SYSTEM", 480, 85);

    ctx.fillStyle = "#ffffff";
    ctx.font      = "bold 38px monospace";
    ctx.fillText("Certificate of Investigation", 480, 150);

    ctx.fillStyle = "#33ff88";
    ctx.font      = "15px monospace";
    ctx.fillText("This certifies that", 480, 205);

    ctx.fillStyle = "#ffffff";
    ctx.font      = "bold 32px monospace";
    ctx.fillText(name, 480, 260);

    ctx.fillStyle = "#ffd700";
    ctx.font      = "bold 16px monospace";
    ctx.fillText("GOTHAM DATABASE TECHNICIAN", 480, 310);

    ctx.fillStyle = "#888";
    ctx.font      = "13px monospace";
    ctx.fillText(`Quiz Score: ${quizPct}%   |   Archive Restored: ${restPct}%`, 480, 370);
    ctx.fillText(`Certificate ID: ${certId}   |   Issued: ${date}`, 480, 395);

    ctx.fillStyle = "#33ff88";
    ctx.font      = "13px monospace";
    ctx.fillText("— Alfred Pennyworth, Gotham Archive Administrator —", 480, 460);

    const link      = document.createElement("a");
    link.download   = `gotham-certificate-${name.replace(/\s+/g, "-")}.png`;
    link.href       = canvas.toDataURL("image/png");
    link.click();
  }

  return { init };
})();

// ─── Boot ─────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  IntroUI.init();

  document.getElementById("skip-intro-btn").addEventListener("click", () => {
    IntroUI.skip();
  });

  document.getElementById("start-btn").addEventListener("click", () => {
    const name = document.getElementById("investigator-name").value.trim();
    Game.startGame(name);
  });

  document.getElementById("investigator-name").addEventListener("keydown", e => {
    if (e.key === "Enter") Game.startGame(e.target.value.trim());
  });
});

// ─── Resources UI ─────────────────────────────────────────────────────────────
const ResourcesUI = (() => {
  function init() {
    // Cards animate in staggered
    const cards = document.querySelectorAll(".resource-card");
    cards.forEach((card, i) => {
      card.style.opacity   = "0";
      card.style.transform = "translateY(14px)";
      setTimeout(() => {
        card.style.transition = "opacity .4s ease, transform .4s ease";
        card.style.opacity    = "1";
        card.style.transform  = "translateY(0)";
      }, i * 120 + 200);
    });

    // GitHub card
    const gh = document.querySelector(".github-card");
    if (gh) {
      gh.style.opacity   = "0";
      gh.style.transform = "translateY(10px)";
      setTimeout(() => {
        gh.style.transition = "opacity .4s ease, transform .4s ease";
        gh.style.opacity    = "1";
        gh.style.transform  = "translateY(0)";
      }, 700);
    }

    const certBtn = document.getElementById("proceed-cert-btn");
    certBtn.replaceWith(certBtn.cloneNode(true));
    document.getElementById("proceed-cert-btn").addEventListener("click", () => Game.goToCertificate());
  }

  return { init };
})();
