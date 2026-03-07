// quiz.js — Stage 3: Card Challenge

const Quiz = (() => {
  const questions = [
    {
      question    : "Which command lists all available databases in MongoDB?",
      options     : ["show dbs", "list databases", "db.show()", "show collections"],
      correct     : 0,
      explanation : "show dbs displays every database on the system. Batman uses it to confirm gotham_archive exists before every investigation.",
    },
    {
      question    : "Which command connects you to a specific database?",
      options     : ["connect gotham_archive", "db.select()", "use gotham_archive", "open gotham_archive"],
      correct     : 2,
      explanation : "use [name] switches your active session to that database. All subsequent commands operate inside it.",
    },
    {
      question    : "Which command shows all collections inside the current database?",
      options     : ["db.list()", "show collections", "show dbs", "db.collections()"],
      correct     : 1,
      explanation : "show collections lists every collection in the active database — like opening a filing cabinet and reading the tab labels.",
    },
    {
      question    : "Which command retrieves ALL documents from a collection?",
      options     : ["db.criminal_records.findOne()", "db.criminal_records.get()", "db.criminal_records.list()", "db.criminal_records.find()"],
      correct     : 3,
      explanation : "find() with no arguments returns every document. Like telling Alfred: bring me every file in that cabinet. Every single one.",
    },
    {
      question    : "Which command adds a brand new document to a collection?",
      options     : ["db.criminal_records.insertOne()", "db.criminal_records.addOne()", "db.criminal_records.push()", "db.criminal_records.create()"],
      correct     : 0,
      explanation : "insertOne() adds a new document. Used in Stage 2 to restore the Joker's missing case file. Batman was quite relieved.",
    },
    {
      question    : "Which command modifies fields in an existing document?",
      options     : ["db.criminal_records.editOne()", "db.criminal_records.patchOne()", "db.criminal_records.updateOne()", "db.criminal_records.changeOne()"],
      correct     : 2,
      explanation : "updateOne() finds a matching document and applies $set changes. Used to fix Scarecrow's null status. He is now officially active.",
    },
  ];

  let currentIndex = 0;
  let score        = 0;

  function getQuestion(i)           { return questions[i] || null; }
  function getTotalQuestions()       { return questions.length; }
  function getCurrentIndex()         { return currentIndex; }

  function answerQuestion(qIndex, selected) {
    const q       = questions[qIndex];
    const correct = selected === q.correct;
    if (correct) score++;
    currentIndex++;
    GothamArchive.setRestoration("quiz", Math.round((score / questions.length) * 100));
    return { correct, correctAnswer: q.correct, explanation: q.explanation };
  }

  function getScore() {
    return {
      score,
      total      : questions.length,
      percentage : Math.round((score / questions.length) * 100),
    };
  }

  function getMemeData() {
    const pct = GothamArchive.getRestorationPercent();

    if (pct <= 25) return {
      image  : "assets/memes/batman_concerned.gif",
      label  : "confused",
      alfred : [
        "This is… concerning.",
        "The archive is still severely damaged.",
        "Batman may return to a very confused city.",
        "More confused than usual.",
        "That is saying something.",
      ],
    };
    if (pct <= 50) return {
      image  : "assets/memes/joker_disappointment.gif",
      label  : "facepalm",
      alfred : [
        "Progress has been made.",
        "But Gotham's records are still unreliable.",
        "Criminals may slip through the cracks.",
        "Batman will be displeased.",
        "He has a particular expression for displeased.",
        "I have seen it many times.",
      ],
    };
    if (pct <= 75) return {
      image  : "assets/memes/batman_thinking.gif",
      label  : "thinking",
      alfred : [
        "The archive is stabilizing.",
        "With a little more effort,",
        "Gotham's records will be fully operational.",
        "You are closer than you think.",
        "Batman would describe this as… acceptable.",
        "He rarely says more than that.",
      ],
    };
    if (pct < 100) return {
      image  : "assets/memes/batman_approves.gif",
      label  : "approving",
      alfred : [
        "Excellent progress.",
        "Most of Gotham's criminal records are restored.",
        "Batman would certainly approve.",
        "He may even nod.",
        "Do not expect a smile.",
        "That is not in his repertoire.",
      ],
    };
    return {
      image  : "assets/memes/batman_heroic.webp",
      label  : "heroic",
      alfred : [
        "Outstanding work.",
        "The Gotham Archive is fully restored.",
        "Every record. Every case. Every criminal.",
        "Even Batman himself would trust these records.",
        "And Batman trusts very few things.",
        "You have done Gotham a genuine service.",
        "I shall inform Batman upon his return.",
        "From whichever dimension he is currently saving.",
      ],
    };
  }

  function reset() { currentIndex = 0; score = 0; }

  return { getQuestion, getTotalQuestions, getCurrentIndex, answerQuestion, getScore, getMemeData, reset };
})();
