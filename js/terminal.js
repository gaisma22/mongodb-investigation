// terminal.js — Stage 1: Terminal Investigation Engine

const Terminal = (() => {
  let stepIndex = 0;

  const steps = [
    {
      command: "help",
      alfredDialogue: [
        "Good. You read the manual first.",
        "Batman never does.",
        "He simply punches things until they work.",
        "",
        "The help command lists every operation",
        "available in this archive system.",
        "Study them. You will need most of them today.",
        "And try not to delete anything important.",
        "Batman gets rather cross about that.",
      ],
      alfredInstruction: "Start by listing the available databases.\n\nTry: show dbs",
      execute: () =>
`Available commands for Gotham Archive System:
  show dbs               — list all databases
  use <database>         — connect to a database
  show collections       — list collections in current db
  db.<collection>.find() — retrieve all documents
  db.<collection>.findOne({filter})
  db.<collection>.updateOne({filter},{$set:{...}})
  db.<collection>.insertOne({...})
  db.<collection>.deleteOne({filter})

Type a command to begin your investigation.`,
    },

    {
      command: "show dbs",
      alfredDialogue: [
        "Good. show dbs lists every database",
        "currently running on this system.",
        "Think of databases as separate filing rooms.",
        "Each one stores a different category of information.",
        "",
        "Gotham has three.",
        "admin — system administration. Do not touch.",
        "local — internal logs. Also best left alone.",
        "gotham_archive — this is what we need.",
        "Gotham's entire criminal record history lives there.",
        "Well. Most of it.",
        "We shall see about the rest.",
      ],
      alfredInstruction: "Connect to the Gotham archive.\n\nTry: use gotham_archive",
      execute: () =>
`admin          0.000GB
gotham_archive 0.004GB
local          0.000GB`,
    },

    {
      command: "use gotham_archive",
      alfredDialogue: [
        "use — simple, direct, effective.",
        "Rather like Batman himself.",
        "This command switches your active connection",
        "to the specified database.",
        "",
        "You are now inside gotham_archive.",
        "From here, all your commands will operate",
        "on Gotham's criminal records.",
        "A word of caution.",
        "Batman's entire case history is stored here.",
        "Decades of detective work.",
        "Please do not accidentally delete the Joker's file.",
        "We would never hear the end of it.",
      ],
      alfredInstruction: "Now see what collections exist inside.\n\nTry: show collections",
      execute: () => {
        GothamArchive.useDatabase("gotham_archive");
        return "switched to db gotham_archive";
      },
    },

    {
      command: "show collections",
      alfredDialogue: [
        "Collections are the folders inside a database.",
        "Each collection holds a specific type of document.",
        "",
        "You can see two here.",
        "criminal_records — every tracked suspect in Gotham.",
        "incidents — reported crimes and case files.",
        "If Batman wants to find the Riddler,",
        "he queries criminal_records.",
        "If he wants to know which bank the Joker robbed last Tuesday,",
        "he checks incidents.",
        "Organised. Efficient. Entirely unlike the criminals inside it.",
      ],
      alfredInstruction: "Let us inspect the criminal records.\n\nTry: db.criminal_records.find()",
      execute: () =>
`criminal_records
incidents`,
    },

    {
      command: "db.criminal_records.find()",
      alfredDialogue: [
        "find() retrieves every document in a collection.",
        "Think of it as opening a filing cabinet",
        "and reading every single folder inside.",
        "No filter. No limit. Everything.",
        "You can see the records loading now.",
        "Penguin. Harley Quinn. Riddler.",
        "All present and accounted for.",
        "",
        "However...",
        "Do you notice something unusual?",
        "Look carefully at near the bottom of the list.",
        "Case C-104. Name: Unknown. Status: missing.",
        "Case C-105. Status: null.",
        "That is not how a properly maintained archive looks.",
        "Something is wrong here.",
      ],
      alfredInstruction: "Filter for only the missing records.\n\nTry: db.criminal_records.find({status:\"missing\"})",
      execute: () => {
        const docs = GothamArchive.find("criminal_records");
        return formatDocs(docs);
      },
    },

    {
      command: 'db.criminal_records.find({status:"missing"})',
      alfredDialogue: [
        "Excellent. Now you are filtering.",
        "By passing a condition inside find(),",
        "you told the system: only show me records",
        "where the status field equals 'missing'.",
        "Rather like telling a librarian:",
        "I only want the books that are overdue.",
        "And missing.",
        "And possibly stolen by the Joker.",
        "",
        "Case C-104 appears.",
        "Name unknown. Alias unknown. Status: missing.",
        "This record should not exist in this state.",
        "A criminal with no identity in Gotham's archive",
        "means Batman cannot track them.",
        "This is a problem.",
      ],
      alfredInstruction: "Inspect that specific record in detail.\n\nTry: db.criminal_records.findOne({case_id:\"C-104\"})",
      execute: () => {
        const docs = GothamArchive.find("criminal_records", { status: "missing" });
        return formatDocs(docs);
      },
    },

    {
      command: 'db.criminal_records.findOne({case_id:"C-104"})',
      alfredDialogue: [
        "findOne() is find() with a purpose.",
        "Instead of retrieving everything,",
        "it stops at the first match and returns that single document.",
        "Useful when you know exactly what you are looking for.",
        "Detectives call this targeted investigation.",
        "I call it not wasting Batman's time.",
        "",
        "There it is. Case C-104.",
        "Completely empty.",
        "No name. No alias. Status: missing.",
        "This is not a minor formatting error.",
        "This is a corrupted record.",
        "And I suspect it is not the only one.",
        "We have found the problem.",
        "Now we must fix it.",
        "Proceed to the repair stage.",
        "Gotham is counting on you.",
        "No pressure.",
        "Well. Some pressure.",
      ],
      alfredInstruction: "Investigation complete. Proceeding to archive repair...",
      execute: () => {
        const doc = GothamArchive.findOne("criminal_records", { case_id: "C-104" });
        return doc ? formatDocs([doc]) : "No record found.";
      },
      isLast: true,
    },
  ];

  function formatDocs(docs) {
    return docs.map(doc => {
      const lines = Object.entries(doc)
        .map(([k, v]) => `  ${k}: ${v === null ? "null" : `"${v}"`}`);
      return `{\n${lines.join(",\n")}\n}`;
    }).join("\n\n");
  }

  function getCurrentStep() { return steps[stepIndex] || null; }

  function processCommand(raw) {
    const input = raw.trim();
    const step  = getCurrentStep();
    if (!step) return null;

    if (input === step.command) {
      const output = step.execute();
      const progress = stepIndex + 1;
      stepIndex++;
      // Update terminal restoration bucket
      GothamArchive.setRestoration("terminal", Math.round((stepIndex / steps.length) * 100));
      return {
        success     : true,
        output,
        dialogue    : step.alfredDialogue,
        instruction : step.alfredInstruction,
        complete    : !!step.isLast,
        progress,
        total       : steps.length,
      };
    }

    return {
      success : false,
      error   : `That command is not recognised by the Gotham archive system.\n\nALFRED:\nPerhaps try the hint button.\nEven Batman occasionally reads the instructions.\n\nExpected: ${step.command}`,
    };
  }

  function getIntroDialogue()    {
    return [
      "Ah. You've arrived.",
      "I am Alfred. Archive Administrator.",
      "Reluctant babysitter.",
      "",
      "The Gotham Archive requires your attention.",
      "Type commands into the terminal.",
      "I will explain what each one does.",
    ];
  }
  function getIntroInstruction() { return "Begin by listing available commands.\n\nTry: help"; }
  function getCurrentHint()      { return getCurrentStep()?.command || null; }
  function getProgress()         { return { current: stepIndex, total: steps.length }; }
  function reset()               { stepIndex = 0; }

  return { processCommand, getCurrentStep, getIntroDialogue, getIntroInstruction, getCurrentHint, getProgress, reset };
})();
