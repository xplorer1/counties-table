const twilio = require('twilio');
const config = require('../../config');
const {successResponse, responseCode, errorResponse} = require("../utils/helpers");

const accountSid = config.twilio.ACCOUNT_SID;
const apiKey = config.twilio.API_KEY;
const apiKeySecret = config.twilio.API_SECRET;

const twilioClient = twilio(apiKey, apiKeySecret, { accountSid: accountSid })
/**
 *
 * @returns {Promise<*>}
 */
exports.startStreaming = async (streamID, streamName) => {
    try {
        // Create the WebRTC Go video room, PlayerStreamer, and MediaProcessors
        const room = await twilioClient.video.rooms.create({
            uniqueName: streamName,
            uniqueID: streamID,
            type: 'go'
        });

        const playerStreamer = await twilioClient.media.playerStreamer.create();

        const mediaProcessor = await twilioClient.media.mediaProcessor.create({
            extension: 'video-composer-v1',
            extensionContext: JSON.stringify({
                identity: 'video-composer-v1',
                room: {
                    name: room.sid,
                },
                outputs: [
                    playerStreamer.sid
                ],
            })
        })

        return {
            roomId: room.sid,
            streamId: streamID,
            streamName: streamName,
            playerStreamerId: playerStreamer.sid,
            mediaProcessorId: mediaProcessor.sid
        };


    } catch(error) {
        console.error(error);
    }
};

exports.endStreaming = async (roomId, streamID, streamName, playerStreamerId, mediaProcessorId) => {
    try {
        await twilioClient.media.mediaProcessor(mediaProcessorId).update({status: 'ended'});
        await twilioClient.media.playerStreamer(playerStreamerId).update({status: 'ended'});
        await twilioClient.video.rooms(roomId).update({status: 'completed'});

        return streamName;

    } catch (error) {
        console.error(error);
    }
};