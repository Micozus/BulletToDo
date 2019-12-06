const express = require('express');

const entryController = require('../controllers/entry');

const router = express.Router();

router.get('/entries', entryController.getEntries);

router.get('/entries/:date', entryController.getEntriesByDate);

router.get('/entry/:entryId', entryController.getEntryById);

router.post('/add', entryController.postAddEntry);

router.put('/edit/:entryId', entryController.putEditEntry);

router.get('/delete/:entryId', entryController.postDeleteProduct);

module.exports = router;
