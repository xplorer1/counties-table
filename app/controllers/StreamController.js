
const {successResponse, responseCode, errorResponse} = require("../utils/helpers");
const {startStreaming, endStreaming, joinStreaming, generateStreamerToken} = require("../Services/TwilioStreamerService");

module.exports = {
    syncWebHook: async function(req, res) {
        console.log("request: " + req.body);

        return res.send(200);
    },

    startLiveStreaming: async function (req, res) {
        if(!req.body.restaurantId) return errorResponse(res, responseCode.NOT_FOUND, "Restaurant ID is required.");
        if(!req.body.restaurantName) return errorResponse(res, responseCode.NOT_FOUND,"Restaurant Name is required.");

        try {
            const data = await startStreaming(req.body.restaurantId, req.body.restaurantName);
            if(!data.status) return errorResponse(res, responseCode.INTERNAL_SERVER_ERROR, 'Server Error', data.message);

            return successResponse(res, responseCode.SUCCESS, "Restaurant Streaming Details!", data);
        } catch (error) {
            return errorResponse(res, responseCode.INTERNAL_SERVER_ERROR, 'Server Error', error.message);
        }
    },

    endLiveStreaming: async function (req, res) {

        if(!req.body.streamName) return errorResponse(res, responseCode.NOT_FOUND,"streamName is required.");

        // if(!req.body.streamId) return errorResponse(res, responseCode.NOT_FOUND, "streamId is required.");
        // if(!req.body.roomId) return errorResponse(res, responseCode.NOT_FOUND,"Room ID is required.");
        // if(!req.body.playerStreamerId) return errorResponse(res, responseCode.NOT_FOUND,"Player Streamer ID is required.");
        // if(!req.body.mediaProcessorId) return errorResponse(res, responseCode.NOT_FOUND,"Media Processor ID is required.");

        try {
            let result = await endStreaming(req.body.streamName, req.body.roomId, req.body.streamId, req.body.playerStreamerId, req.body.mediaProcessorId);

            return successResponse(res, responseCode.SUCCESS, `Restaurant ${result.data} Live Streaming has ended`);
        } catch (error) {
            return errorResponse(res, responseCode.INTERNAL_SERVER_ERROR, 'Server Error', error.message);
        }
    },

    getAudienceToken: async function(req, res) {

        try {
            let result = await joinStreaming();
            if(!result.status) return errorResponse(res, responseCode.INTERNAL_SERVER_ERROR, 'Server Error', result.message);

            return res.status(200).json({message: "Customer identity token.", data: result.token});

        } catch (error) {
            return res.status(500).json({message: error.message, status: 500});
        }
    },

    getStreamerToken: async function(req, res) {
        if(!req.body.identity) return res.status(400).send({ message: `Missing identity.` });
        if(!req.body.room) return res.status(400).send({ message: `Missing stream name` });

        try {

            let result = await generateStreamerToken(req.body.room, req.body.identity);
            if(!result.status) return errorResponse(res, responseCode.INTERNAL_SERVER_ERROR, 'Server Error', result.message);

            return res.status(200).json({message: "Streamer identity token.", data: result.data});

        } catch (error) {
            return res.status(500).json({message: error.message, status: 500});
        }
    }
}