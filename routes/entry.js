const express = require('express');

const entryController = require('../controllers/entry');

const router = express.Router();

router.get('/entries', entryController.getEntries);

router.get('/entries/:date', entryController.getEntriesByDate);

router.get('/entry/:entryId', entryController.getEntryById);

router.post('/entry/add', entryController.postAddEntry);

router.put('/entry/edit/:entryId', entryController.putEditEntry);

router.get('/entry/delete/:entryId', entryController.postDeleteProduct);

module.exports = router;
