const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ENTRYTYPE = ["task", "note", "event"];
const TASKSTATE = ["incomplete", "complete", "migrated", "scheduled", "irrelevant", ""];
const SIGNIFIED = ["none", "priority", "inspiration"];

const entrySchema = new Schema({
    entryType: {type: String, enum: ENTRYTYPE, required: true, default: "task"},
    taskState: {type: String, enum: TASKSTATE, default: "incomplete"},
    significationType: {type: String, enum: SIGNIFIED, required: true, default: "none"},
    _id: {type: Schema.Types.ObjectId, required: true},
    _authorId: {type: Schema.Types.ObjectId, required: false},
    date: {type: Date, required: false},
    body: {type: String, required: true},
    nestedEntries: [Schema.Types.ObjectId]

});

module.exports = mongoose.model("Entry", entrySchema);
