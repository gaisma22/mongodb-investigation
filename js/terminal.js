/*
====================================================
MongoDB Investigation Terminal Engine
File: terminal.js
Role: Controls terminal commands, story flow, and UI
====================================================
*/


/* ==========================================
   DOM ELEMENTS
========================================== */

const output = document.getElementById("output");
const input = document.getElementById("terminal-input");
const choices = document.getElementById("choices");


/* ==========================================
   GAME STATE
========================================== */

let stage = 0;


/* ==========================================
   TERMINAL OUTPUT FUNCTION
   Prints text into the terminal window
========================================== */

function print(text, className = "") {
    const line = document.createElement("div");
    line.textContent = text;

    if (className) line.classList.add(className);

    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
}


/* ==========================================
   CHOICE BUTTON SYSTEM
   Used for investigation decisions
========================================== */

function showChoices(options) {

    choices.innerHTML = "";

    options.forEach(option => {

        const btn = document.createElement("button");

        btn.className = "choice-btn";
        btn.textContent = option.text;
        btn.onclick = () => option.action();

        choices.appendChild(btn);
    });
}

function clearChoices() {
    choices.innerHTML = "";
}


/* ==========================================
   GAME INTRO
========================================== */

function startGame() {

    print("ALFRED: Welcome Detective.", "alfred");
    print("ALFRED: Gotham Financial Bank has suffered a data breach.");
    print("ALFRED: We have recovered a compromised MongoDB server.");
    print("ALFRED: Your task is to investigate it.");
    print("");
    print("Type: connect mongodb");
}


/* ==========================================
   COMMAND PROCESSOR
   Simulates MongoDB terminal commands
========================================== */

function handleCommand(cmd) {

    if (stage === 0 && cmd === "connect mongodb") {

        print("Connected to MongoDB server.");
        print("Type: show dbs");

        stage = 1;
        return;
    }

    if (stage === 1 && cmd === "show dbs") {

        print("admin");
        print("employees");
        print("financial_records");
        print("logs");

        print("");
        print("Which database should we investigate?");

        showChoices([
            { text: "employees", action: () => selectDB("employees") },
            { text: "financial_records", action: () => selectDB("financial_records") },
            { text: "logs", action: () => selectDB("logs") }
        ]);

        stage = 2;
        return;
    }

    if (stage === 3 && cmd === "show collections") {

        print("users");
        print("transactions");
        print("audit");

        print("");
        print("Investigate which collection?");

        showChoices([
            { text: "users", action: () => investigateUsers() },
            { text: "transactions", action: () => wrongPath() },
            { text: "audit", action: () => wrongPath() }
        ]);

        return;
    }

    print("Unknown command.");
}


/* ==========================================
   DATABASE SELECTION
========================================== */

function selectDB(name) {

    clearChoices();

    print(`Using database: ${name}`);
    print("Type: show collections");

    stage = 3;
}


/* ==========================================
   CORRECT INVESTIGATION PATH
========================================== */

function investigateUsers() {

    clearChoices();

    print("Searching user records...");
    print("Suspicious login detected.");
    print("User: root_admin");
    print("IP: 185.223.89.12");

    print("");
    print("ALFRED: This IP belongs to a known criminal network.", "alfred");
    print("ALFRED: Excellent work detective.");

    print("");
    print("CASE SOLVED");
}


/* ==========================================
   WRONG PATH HANDLER
========================================== */

function wrongPath() {

    clearChoices();

    print("No useful information found.");
    print("ALFRED: We may be looking in the wrong place.", "alfred");
}


/* ==========================================
   TERMINAL INPUT LISTENER
========================================== */

input.addEventListener("keydown", function(e) {

    if (e.key === "Enter") {

        const cmd = input.value.trim();

        if (!cmd) return;

        print("> " + cmd);

        handleCommand(cmd);

        input.value = "";
    }

});


/* ==========================================
   GAME START
========================================== */

startGame();
