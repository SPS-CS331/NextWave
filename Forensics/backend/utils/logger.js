const Log = require("../models/Log");

async function addLog({ actor, action, entityType, entityId, details }) {
  try {
    await Log.create({ actor, action, entityType, entityId, details });
  } catch (err) {
    console.error("Failed to write log", err.message);
  }
}

module.exports = { addLog };
