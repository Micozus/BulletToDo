const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ENTRYTYPE = ["task", "note", "event"];
const TASKSTATE = ["incomplete", "complete", "migrated", "scheduled", "irrelevant", ""];
const SIGNIFIED = ["none", "priority", "inspiration"];

const entrySchema = new Schema({
    entryType: {type: String, enum: ENTRYTYPE, required: true},
    taskState: {type: String, enum: TASKSTATE},
    significationType: {type: String, enum: SIGNIFIED, required: true},
    _entryId: {type: Schema.Types.ObjectId, required: true},
    _authorId: {type: Schema.Types.ObjectId, required: true},
    date: {type: Date, required: true},
    body: {type: String, required: true}

    // Jak stwierdzimy, że dodajemy
    // nestedEntries: [entrySchema]
});

module.exports = mongoose.model("Entry", entrySchema);
