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
        return {status: false, message: error.message};
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

exports.generateStreamerToken = async (roomName, identity) => {

    try {
        
        // Create Video Grant
        const videoGrant = new VideoGrant({room: roomName});

        // Create an access token which we will sign and return to the client,
        // containing the grant we just created
        let token = new AccessToken(
            accountSid,
            apiKey,
            apiKeySecret,
        );

        token.identity = identity;

        token.addGrant(videoGrant);

        // Serialize the token to a JWT string

        token = token.toJwt();

        return {status: true, data: token};

    } catch (error) {
        return {status: false, message: error.message};
    }
};

const onMultipleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
        const uploads = event.target.files;
        console.log(uploads);
        for (let index = 0; index < uploads.length; index++) {
            setImages((images) => [
                ...images,
                { image: this.getImageUrl(uploads[index]) },
            ]);
        }
    }
};

const getImageUrl = (image) => {
    if (image) {
        const uploads = async () => {
            const formData = new FormData();

            formData.append("file", image);
            formData.append("upload_preset", "midecodes");

            const res = await fetch(
                "https://api.cloudinary.com/v1_1/mideveloper/upload",
                {
                    method: "POST",
                    body: formData,
                }
            );
            const result = await res.json();
            setImageUrl(result.secure_url);
            console.log(result);
        };
        uploads();
    }
}

// exports.getAudienceToken = async () => {
//     let identity = crypto.randomBytes(20).toString('hex');

//     try {

//         let playerStreamerList = await twilioClient.media.playerStreamer.list({status: 'started'});
//         let playerStreamer = playerStreamerList.length ? playerStreamerList[0] : null;

//         // If no one is streaming, return a message
//         if (!playerStreamer) return { message: `No one is streaming right now`, status: false}

//         // Otherwise create an access token with a PlaybackGrant for the livestream
//         let token = new AccessToken(accountSid, apiKey, apiKeySecret);

//         // Create a playback grant and attach it to the access token
//         let playbackGrant = await twilioClient.media.playerStreamer(playerStreamer.sid).playbackGrant().create({ttl: 60});
//         if(!playbackGrant) return {message: "Unable to generate playback.", status: false};

//         let wrappedPlaybackGrant = new PlaybackGrant({
//             grant: playbackGrant.grant
//         });

//         token.addGrant(wrappedPlaybackGrant);
//         token.identity = identity;

//         // Serialize the token to a JWT and return it to the client side
//         return {status: true, token: token.toJwt() };
        
//     } catch (error) {
//         return {status: false, message: error.message};
//     }
// };