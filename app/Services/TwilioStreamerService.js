const twilio = require('twilio');
const config = require('../../config');
const {successResponse, responseCode, errorResponse} = require("../utils/helpers");

const accountSid = config.twilio.ACCOUNT_SID;
const apiKey = config.twilio.API_KEY;
const apiKeySecret = config.twilio.API_SECRET;

const twilioClient = twilio(apiKey, apiKeySecret, { accountSid: accountSid });

const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const PlaybackGrant = AccessToken.PlaybackGrant;

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

        if(!playerStreamer) return {status: false, message: "Unable to create player streamer."};

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
        });

        if(!mediaProcessor) return {status: false, message: "Unable to instantiate media processor."};

        return {
            roomId: room.sid,
            streamId: streamID,
            streamName: streamName,
            playerStreamerId: playerStreamer.sid,
            mediaProcessorId: mediaProcessor.sid,
            status: true
        };

    } catch(error) {
        console.error(error);

        return {status: false, message: error.message};
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

exports.joinStreaming = async (roomName, identity) => {

    try {

        let videoGrant = new VideoGrant({
            room: roomName,
        });

        console.log("videoGrant: ", videoGrant);

        if(!videoGrant) return {status: false, message: "Unable to instantiate video grant."};
    
        // Create an access token
        let token = new AccessToken(accountSid, apiKey, apiKeySecret);
        if(!token) return {status: false, message: "Unable to generate video token."};
    
        // Add the video grant and the user's identity to the token
        token.addGrant(videoGrant);
        token.identity = identity;
    
        // Serialize the token to a JWT and return it to the client side
        return { token: token.toJwt(), status: true };
        
    } catch (error) {
        return {status: false, message: error.message};
    }
};