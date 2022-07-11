let express = require('express');
let router = express.Router();
var StreamController = require('../controllers/StreamController');

/**
 * Live Streaming
 */
router.post('/start_stream', StreamController.startLiveStreaming);
router.post('/end_stream', StreamController.endLiveStreaming);
router.post('/audience_token', StreamController.getAudienceToken);
router.post('/streamer_token', StreamController.getStreamerToken);
router.post('/sync_web_hook', StreamController.syncWebHook);
 
router.use(function(req, res) {
    return res.status(404).send({ message: 'The url you visited does not exist' });
});

module.exports = router;