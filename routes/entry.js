const express = require('express');

const entryController = require('../controllers/entry');

const router = express.Router();

router.get('/entries', entryController.getEntries);

router.post('/entries', entryController.postAddEntry);

router.post('/entries/:id', entryController.postAddNestedEntry);

router.get('/entries/:id', entryController.getEntryById);

router.put('/entries/:id', entryController.putEditEntry);

router.delete('/entries/:id', entryController.deleteEntryById);

module.exports = router;

