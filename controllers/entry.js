const Entry = require('../models/entry');
const mongoose = require('mongoose');

const convertStringToObjectID = (req) => {
    const idFromRequest = req.params.id;
    return mongoose.Types.ObjectId(`${idFromRequest}`);
};

const applyFilterToResponseObject = (res, dateFrom, dateTo) => {
    if (dateFrom === undefined || dateTo === undefined) {
        Entry.find((err, entries) => {
            if (err) return res.status(500)
                .json({
                    "message": "There was an error while getting entries",
                    "error": err
                });
            return res.status(200)
                .json({entries});
        });
    } else {
        Entry.find({date: {$gte: dateFrom, $lt: dateTo}}, (err, entries) => {
            if (err) return res.status(500)
                .json({
                    "message": "There was an error while getting entries",
                    "error": err
                });

            return res.status(200)
                .json({entries});
        });
    }
};

const createNewEntry = (req) => {
    const entryType = req.body.entryType;
    const taskState = req.body.taskState;
    const significationType = req.body.significationType;
    const _authorId = req.body._authorId;
    const date = req.body.date;
    const body = req.body.body;

    const entry = new Entry({
        _id: new mongoose.Types.ObjectId(),
        entryType: entryType,
        taskState: taskState,
        significationType: significationType,
        _authorId: _authorId,
        date: date,
        body: body
    });
    return entry;
};

const editEntry = (req, res, parentId, updateBody) => {
    Entry.findByIdAndUpdate(
        (parentId === undefined) ? req.params.id : parentId,
        (updateBody === undefined) ? req.body : updateBody, {new: true},
        (err, modifiedEntry) => {
            if (err) return res.status(404)
                .json({
                    "message": "Entry to edit was not found in database",
                    "error": err
                });
            return res.status(200)
                .json(modifiedEntry);
        })
};


exports.getEntries = (req, res) => {
    if (req.query.ondate) {
        const dateOn = new Date(req.query.ondate);
        const tempDate = new Date(req.query.ondate);
        const nextDate = new Date(tempDate.setDate(tempDate.getDate() + 1));
        applyFilterToResponseObject(res, dateOn, nextDate);
    } else if (req.query.fromdate && req.query.todate) {
        const dateFrom = new Date(req.query.fromdate);
        const dateTo = new Date(req.query.todate);
        applyFilterToResponseObject(res, dateFrom, dateTo);
    } else if (req.query.month) {
        const monthFromQuery = req.query.month.split("-");
        const startMonthDate = new Date().setFullYear(+monthFromQuery[0], +monthFromQuery[1] - 1, 1);
        const endMonthDate = new Date().setFullYear(+monthFromQuery[0], +monthFromQuery[1], 1);
        applyFilterToResponseObject(res, startMonthDate, endMonthDate);
    } else {
        applyFilterToResponseObject(res);
    }

};

exports.getEntryById = (req, res) => {
    const _idToSearch = convertStringToObjectID(req);
    Entry.findOne({_id: _idToSearch}, (err, entry) => {
        if (err) return res.status(500)
            .json({
                "message": "There was an error while getting entries",
                "error": err
            });
        return res.status(200)
            .json({entry});
    })
};

exports.postAddEntry = (req, res) => {
    const newEntry = createNewEntry(req);
    newEntry.save()
        .then(resp => {
            res.status(201)
                .json({"message": "Entry added successfully!"})
        })
        .catch(err => {
            console.log(err);
            res.status(400)
                .json({
                    "message": "There was an error while adding entry",
                    "error": err
                })
        })
};

exports.postAddNestedEntry = (req, res) => {
    const newEntry = createNewEntry(req);

    newEntry.save()
        .then(resp => {
            const newEntryId = newEntry._id;
            const parentId = req.params.id;

            Entry.findById(parentId, (err, entry) => {
                if (err) {
                    Entry.findByIdAndRemove(newEntryId, (err) => {
                        if (err) {
                            res.status(500).json({"message": "Parent object failed to update and there was trouble cleaning up new object"});
                        }
                        res.status(500).json({"message": "Parent object failed to update, new object was cleaned up"});
                    })
                } else {
                    let updatedBody;
                    if (entry.nestedEntries) {
                        const updatedNestedEntries = [...entry.nestedEntries];
                        updatedBody = {nestedEntries: [...updatedNestedEntries, newEntryId]};
                    } else {
                        updatedBody = {nestedEntries: [newEntryId]}
                    }
                    editEntry(req, res, parentId, updatedBody);
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(400)
                .json({
                    "message": "There was an error while adding entry",
                    "error": err
                })
        })
};

exports.putEditEntry = (req, res) => {
    editEntry(req, res);
};

exports.deleteEntryById = (req, res) => {
    const _idToSearch = convertStringToObjectID(req);
    Entry.findOneAndDelete({_id: _idToSearch}, (err, entry) => {
        if (err) return res.status(404)
            .json({
                "message": "Entry to delete was not found in database",
                "error": err
            });
        return res.status(200)
            .json({"message": "Entry was deleted from database"});
    })
};
