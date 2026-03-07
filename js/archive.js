// archive.js — Simulated Gotham MongoDB Dataset + Restoration Tracker

const GothamArchive = (() => {
  let criminal_records = [
    { case_id: "C-101", name: "Oswald Cobblepot", alias: "Penguin",      status: "active"  },
    { case_id: "C-102", name: "Harleen Quinzel",  alias: "Harley Quinn", status: "active"  },
    { case_id: "C-103", name: "Edward Nygma",     alias: "Riddler",      status: "active"  },
    { case_id: "C-104", name: "Unknown",           alias: "Unknown",      status: "missing" },
    { case_id: "C-105", name: "Jonathan Crane",   alias: "Scarecrow",    status: null      },
    { case_id: "C-106", name: "Jonathan Crane",   alias: "Scarecrow",    status: "active"  },
  ];

  const incidents = [
    { case_id: 1042, suspect: "Joker",   location: "Gotham Bank",    status: "open"   },
    { case_id: 1043, suspect: "Penguin", location: "Iceberg Lounge", status: "closed" },
    { case_id: 1044, suspect: "Unknown", location: "East End",       status: "open"   },
  ];

  const databases   = ["admin", "gotham_archive", "local"];
  const collections = { gotham_archive: ["criminal_records", "incidents"] };
  let currentDb     = null;

  const restoration = { terminal: 0, repair: 0, quiz: 0 };

  function setRestoration(bucket, value) {
    if (restoration.hasOwnProperty(bucket))
      restoration[bucket] = Math.max(0, Math.min(100, value));
  }

  function getRestorationPercent() {
    return Math.round(
      restoration.terminal * 0.30 +
      restoration.repair   * 0.40 +
      restoration.quiz     * 0.30
    );
  }

  return {
    getDatabases    : () => [...databases],
    useDatabase     : (name) => {
      if (databases.includes(name)) { currentDb = name; return { success: true }; }
      return { success: false };
    },
    getCurrentDb    : () => currentDb,
    getCollections  : () => (currentDb && collections[currentDb]) ? [...collections[currentDb]] : [],

    find : (collection, filter) => {
      const src = collection === "criminal_records" ? criminal_records
                : collection === "incidents"        ? incidents : [];
      if (!filter) return src.map(d => ({ ...d }));
      return src.filter(doc =>
        Object.entries(filter).every(([k, v]) => doc[k] === v)
      ).map(d => ({ ...d }));
    },

    findOne : (collection, filter) => {
      const src = collection === "criminal_records" ? criminal_records
                : collection === "incidents"        ? incidents : [];
      const hit = src.find(doc => Object.entries(filter).every(([k, v]) => doc[k] === v));
      return hit ? { ...hit } : null;
    },

    updateOne : (collection, filter, update) => {
      if (collection !== "criminal_records") return { acknowledged: true, matchedCount: 0, modifiedCount: 0 };
      const idx = criminal_records.findIndex(doc =>
        Object.entries(filter).every(([k, v]) => doc[k] === v)
      );
      if (idx === -1) return { acknowledged: true, matchedCount: 0, modifiedCount: 0 };
      criminal_records[idx] = { ...criminal_records[idx], ...(update.$set || {}) };
      return { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
    },

    insertOne : (collection, doc) => {
      if (collection !== "criminal_records") return { acknowledged: false };
      criminal_records = criminal_records.filter(d => d.case_id !== doc.case_id);
      criminal_records.push({ ...doc });
      return { acknowledged: true, insertedId: doc.case_id };
    },

    deleteOne : (collection, filter) => {
      if (collection !== "criminal_records") return { acknowledged: true, deletedCount: 0 };
      const idx = criminal_records.findIndex(doc =>
        Object.entries(filter).every(([k, v]) => doc[k] === v)
      );
      if (idx === -1) return { acknowledged: true, deletedCount: 0 };
      criminal_records.splice(idx, 1);
      return { acknowledged: true, deletedCount: 1 };
    },

    isFullyRepaired : () =>
      criminal_records.every(d => d.status !== null && d.name !== "Unknown") &&
      criminal_records.filter(d => d.alias === "Scarecrow").length === 1,

    setRestoration,
    getRestorationPercent,
    getRestorationBuckets : () => ({ ...restoration }),
  };
})();
