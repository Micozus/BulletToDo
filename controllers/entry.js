const Entry = require('../models/entry');
const mongoose = require('mongoose');

const convertStringToObjectID = (req) => {
    const idFromRequest = req.params.id;
    return mongoose.Types.ObjectId(`${idFromRequest}`);
};


exports.getEntries = (req, res) => {
    if (req.query.ondate) {
        const dateFromQuery = new Date(req.query.ondate);
        const tempDate = new Date(req.query.ondate);
        const nextDateFromQuery = new Date(tempDate.setDate(tempDate.getDate() + 1));
        console.log(dateFromQuery, nextDateFromQuery);
        Entry.find({date: {$gte: dateFromQuery, $lt: nextDateFromQuery}}, (err, entries) => {
            if (err) return res.status(500)
                .json({
                    "message": "There was an error while getting entries",
                    "error": err
                });

            return res.status(200)
                .json({entries});
        });
    } else if (req.query.fromdate && req.query.todate) {

    } else {
        Entry.find((err, entries) => {
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
    entry.save()
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

exports.putEditEntry = (req, res) => {
    Entry.findByIdAndUpdate(
        req.params.id,
        req.body, {new: true},
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
