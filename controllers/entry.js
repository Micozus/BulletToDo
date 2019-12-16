const Entry = require('../models/entry');
const mongoose = require('mongoose');

const convertStringToObjectID = (req) => {
    const idFromRequest = req.params.id;
    return mongoose.Types.ObjectId(`${idFromRequest}`);
};

const getUserIdFromRequestToken = (req) => {
    return req.decoded.userId;
};

const applyFilterToResponseObject = (res, userId, dateFrom, dateTo) => {
    if (dateFrom === undefined || dateTo === undefined) {
        Entry.find({_authorId: userId}, (err, entries) => {
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
    const userId = getUserIdFromRequestToken(req);
    const entryType = req.body.entryType;
    const taskState = req.body.taskState;
    const significationType = req.body.significationType;
    const _authorId = userId;
    const date = req.body.date;
    const body = req.body.body;

    return new Entry({
        _id: new mongoose.Types.ObjectId(),
        entryType: entryType,
        taskState: taskState,
        significationType: significationType,
        _authorId: _authorId,
        date: date,
        body: body
    });
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
    const userId = getUserIdFromRequestToken(req);
    if (req.query.ondate) {
        const dateOn = new Date(req.query.ondate);
        const tempDate = new Date(req.query.ondate);
        const nextDate = new Date(tempDate.setDate(tempDate.getDate() + 1));
        applyFilterToResponseObject(res, userId, dateOn, nextDate);
    } else if (req.query.fromdate && req.query.todate) {
        const dateFrom = new Date(req.query.fromdate);
        const dateTo = new Date(req.query.todate);
        applyFilterToResponseObject(res, userId, dateFrom, dateTo);
    } else if (req.query.month) {
        const monthFromQuery = req.query.month.split("-");
        const startMonthDate = new Date(+monthFromQuery[0], +monthFromQuery[1] - 1, 1, 0,0,0 );
        const endMonthDate = new Date(+monthFromQuery[0], +monthFromQuery[1] , 1, 0,0,0 );
        applyFilterToResponseObject(res, userId, startMonthDate, endMonthDate);
    } else {
        applyFilterToResponseObject(res, userId);
    }

};

exports.getEntryById = (req, res) => {
    const userId = getUserIdFromRequestToken(req);
    const _idToSearch = convertStringToObjectID(req);
    Entry.findOne({_id: _idToSearch, _authorId: userId}, (err, entry) => {
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
    const userId = getUserIdFromRequestToken(req);
    Entry.findOneAndDelete({_id: _idToSearch, _authorId: userId}, (err, entry) => {
        if (err) return res.status(404)
            .json({
                "message": "Entry to delete was not found in database",
                "error": err
            });
        return res.status(200)
            .json({"message": "Entry was deleted from database"});
    })
};
