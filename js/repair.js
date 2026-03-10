// repair.js — Stage 2: Fix Gotham Archive

const Repair = (() => {
  let stepIndex   = 0;
  let repairsDone = 0;

  const steps = [
    {
      command : 'db.criminal_records.updateOne({case_id:"C-105"},{$set:{status:"active"}})',
      alfredDialogue: [
        "Three corruptions. Three repairs.",
        "We begin with updateOne().",
        "This command locates a specific document",
        "and modifies only the fields you specify.",
        "The first argument is the filter — find the record.",
        "The second argument is the update — change these fields.",
        "$set is the operator that says: assign this new value.",
        "",
        "Case C-105. Jonathan Crane. Scarecrow.",
        "His status field is null.",
        "That means the archive cannot classify him.",
        "Active? Captured? Escaped? Unknown.",
        "Batman finds this deeply inconvenient.",
        "Set his status to active.",
        "He was seen near the Gotham docks last Tuesday.",
        "Allegedly.",
      ],
      alfredInstruction: 'Repair Case C-105.\n\nTry: db.criminal_records.updateOne({case_id:"C-105"},{$set:{status:"active"}})',
      execute: () => {
        const result = GothamArchive.updateOne(
          "criminal_records",
          { case_id: "C-105" },
          { $set: { status: "active" } }
        );
        return `{ acknowledged: true, matchedCount: ${result.matchedCount}, modifiedCount: ${result.modifiedCount} }`;
      },
    },

    {
      command : 'db.criminal_records.insertOne({case_id:"C-104",name:"Jeremiah Valeska",alias:"Joker",status:"wanted"})',
      alfredDialogue: [
        "Repair one complete. Well done.",
        "Scarecrow is now properly classified.",
        "Batman can sleep slightly easier.",
        "Next — insertOne().",
        "When a record does not exist or is too corrupted to save,",
        "you replace it entirely by inserting a new document.",
        "",
        "Case C-104 is beyond updating.",
        "Name unknown. Alias unknown. Status missing.",
        "This record is useless to Batman.",
        "We know who this case belongs to.",
        "Jeremiah Valeska. The Joker.",
        "Status: wanted.",
        "Extremely wanted.",
        "Batman has been wanting him for quite some time.",
        "Insert a proper record for Case C-104.",
      ],
      alfredInstruction: 'Restore Case C-104.\n\nTry: db.criminal_records.insertOne({case_id:"C-104",name:"Jeremiah Valeska",alias:"Joker",status:"wanted"})',
      execute: () => {
        const result = GothamArchive.insertOne("criminal_records", {
          case_id : "C-104",
          name    : "Jeremiah Valeska",
          alias   : "Joker",
          status  : "wanted",
        });
        return `{ acknowledged: true, insertedId: "${result.insertedId}" }`;
      },
    },

    {
      command : 'db.criminal_records.deleteOne({case_id:"C-106"})',
      alfredDialogue: [
        "Excellent. The Joker is now properly documented.",
        "Batman will be simultaneously relieved and irritated.",
        "That is his natural state.",
        "Final repair. deleteOne().",
        "This command removes the first document matching your filter.",
        "Use it with precision.",
        "Unlike Batman, it does not ask questions first.",
        "",
        "Case C-106 is a duplicate.",
        "Scarecrow appears twice in the archive.",
        "Two entries for one criminal causes search conflicts.",
        "The system cannot determine which record is authoritative.",
        "Batman despises ambiguity.",
        "Remove the duplicate entry.",
        "One Scarecrow in the archive is more than enough.",
        "One Scarecrow in Gotham is also more than enough.",
        "But that is a separate problem.",
      ],
      alfredInstruction: 'Remove the duplicate.\n\nTry: db.criminal_records.deleteOne({case_id:"C-106"})',
      execute: () => {
        const result = GothamArchive.deleteOne("criminal_records", { case_id: "C-106" });
        return `{ acknowledged: true, deletedCount: ${result.deletedCount} }`;
      },
      isLast: true,
    },
  ];

  function getCurrentStep() { return steps[stepIndex] || null; }

  function processCommand(raw) {
    const input = raw.trim();
    const step  = getCurrentStep();
    if (!step) return null;

    if (input === step.command) {
      const output = step.execute();
      stepIndex++;
      repairsDone++;
      GothamArchive.setRestoration("repair", Math.round((repairsDone / steps.length) * 100));
      const nextStep = getCurrentStep();
      return {
        success     : true,
        output,
        dialogue    : step.alfredDialogue,
        instruction : nextStep ? nextStep.alfredInstruction : step.alfredInstruction,
        complete    : !!step.isLast,
      };
    }

    return {
      success : false,
      error   : `That command is not recognised.\n\nALFRED:\nThe archive will not fix itself.\nNeither will Batman, apparently.\n\nExpected: ${step.command}`,
    };
  }

  function getIntroDialogue() {
    return [
      "The investigation is complete.",
      "You have found three corruptions in the archive.",
      "Case C-105 — Scarecrow's status is null.",
      "Case C-104 — entirely empty. Unknown name, unknown alias.",
      "Case C-106 — a duplicate of Scarecrow's record.",
      "Three problems. Three commands to fix them.",
      "",
      "updateOne, insertOne, deleteOne.",
      "Each one modifies the database in a different way.",
      "",
      "Pay attention.",
      "Batman will want a full report when he returns from that dimension.",
      "Assuming he returns.",
      "I am sure he will.",
      "He always does.",
    ];
  }

  function getIntroInstruction() { return steps[0].alfredInstruction; }
  function getCurrentHint()      { return getCurrentStep()?.command || null; }
  function getProgress()         { return { current: stepIndex, total: steps.length }; }
  function reset()               { stepIndex = 0; repairsDone = 0; }

  return { processCommand, getCurrentStep, getIntroDialogue, getIntroInstruction, getCurrentHint, getProgress, reset };
})();
