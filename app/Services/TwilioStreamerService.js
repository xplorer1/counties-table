const twilio = require('twilio');
const config = require('../../config');

const accountSid = config.twilio.ACCOUNT_SID;
const apiKey = config.twilio.API_KEY;
const apiKeySecret = config.twilio.API_SECRET;
const crypto = require("crypto");

const twilioClient = twilio(apiKey, apiKeySecret, { accountSid: accountSid });

const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const PlaybackGrant = AccessToken.PlaybackGrant;
const ChatGrant = AccessToken.ChatGrant;
const SyncGrant = AccessToken.SyncGrant;
const SYNC_SERVICE_NAME_PREFIX = "REST_";
const SPEAKER_MAP_NAME = "SPEAKER_MAP_NAME"; //TO BE EDITED TO REFLECT SOMETHING UNIQUE.
const RAISED_HAND_MAP_NAME = "RAISED_HAND_MAP_NAME";
const VIEWERS_MAP_NAME = "VIEWERS_MAP_NAME";
const CONVERSATIONS_SERVICE_SID = "CONVERSATIONS_SERVICE_SID"; // to be edited to something more unique and classy.
const LIVE_BACKEND_STORAGE_SYNC_SERVICE = "LIVE_BACKEND_STORAGE_SYNC_SERVICE";
const MAX_ALLOWED_SESSION_DURATION = 14400;

/**
 *
 * @returns {Promise<*>}
*/

exports.getStreamMapItem = async(room_sid) => {
    const backendStorageSyncClient = await twilioClient.sync.services(LIVE_BACKEND_STORAGE_SYNC_SERVICE);
    const mapItem = await backendStorageSyncClient.syncMaps('streams').syncMapItems(room_sid).fetch();
    return mapItem;
};

exports.removeSpeaker = async(user_identity, stream_name) => {
    try {
        await client.video.rooms(stream_name).participants(user_identity).update({ status: 'disconnected' });

        return {status: true, message: "Successful."};

    } catch (error) {
        return {status: false, message: error.message};
    }
};

exports.viewerConnected = async(user_identity, stream_name) => {
    try {
        let room = await client.video.rooms(stream_name).fetch();
        if(!room) return {status: false, message: "Invalid stream name."};

        let streamMapItem = await getStreamMapItem(room.sid);
        if(!streamMapItem) return {status: false, message: "Unable to get viewer stream map item."};
        streamSyncClient = await client.sync.services(streamMapItem.data.sync_service_sid);

        await streamSyncClient.syncMaps('viewers').syncMapItems.create({ key: user_identity, data: {} });

        return {status: true, message: "Successful."};

    } catch (error) {
        return {status: false, message: error.message};
    }
}

exports.sendSpeakerInvite = async(stream_name) => {
    try {
        let room = await client.video.rooms(stream_name).fetch();
        if(!room) return {status: false, message: "Invalid stream name."};

        let streamMapItem = await getStreamMapItem(room.sid);
        if(!streamMapItem) return {status: false, message: "Unable to get viewer stream map item."};

        let streamSyncClient = await client.sync.services(streamMapItem.data.sync_service_sid);
        let doc = await streamSyncClient.documents(`user-${user_identity}`).fetch();
        await streamSyncClient.documents(doc.sid).update({ data: { ...doc.data, speaker_invite: true } });

        return {status: true, message: "Successful."};

    } catch (error) {
        return {status: false, message: error.message};
    }
}

exports.raiseHand = async(user_identity, stream_name, hand_raised) => {

    try {

        let room = await client.video.rooms(stream_name).fetch();
        if(!room) return {status: false, message: "Invalid stream name."};

        let streamMapItem = await getStreamMapItem(room.sid);
        if(!streamMapItem) return {status: false, message: "Unable to get viewer stream map item."};

        let streamSyncClient = await client.sync.services(streamMapItem.data.sync_service_sid);
        if(!streamSyncClient) return {status: false, message: "Unable to get stream sync client."};

        hand_raised 
        ? 
        await streamSyncClient.syncMaps(RAISED_HAND_MAP_NAME).syncMapItems.create({ key: user_identity, data: { } }) 
        :
        await streamSyncClient.syncMaps(RAISED_HAND_MAP_NAME).syncMapItems(user_identity).remove();

        return {status: true, message: "Successful."};

    } catch (error) {
        return {status: false, message: error.message};
    }
}

exports.joinStreamAsViewer = async(user_identity, streamName) => {

    try {
        let room = await twilioClient.video.rooms(streamName).fetch();
        if(!room) return {status: false, message: "Invalid stream name."};

        let streamMapItem = await getStreamMapItem(room.sid);
        if(!streamMapItem) return {status: false, message: "Unable to get viewer stream map item."};

        let streamSyncClient = client.sync.services(streamMapItem.data.sync_service_sid);
        if(!streamSyncClient) return {status: false, message: "Unable to get viewer stream sync client."};

        let userDocumentName = `user-${user_identity}`;
        userDocument = await streamSyncClient.documents.create({ uniqueName: userDocumentName });

        // Update user document to set speaker_invite to false.
        // This is done outside of the user document creation to account
        // for users that may already have a user document

        await streamSyncClient.documents(userDocumentName).update({ data: { speaker_invite: false } });
        await streamSyncClient.documents(userDocumentName)
        .documentPermissions(user_identity)
        .update({ read: true, write: false, manage: false });

        await streamSyncClient.syncMaps(SPEAKER_MAP_NAME)
        .syncMapPermissions(user_identity)
        .update({ read: true, write: false, manage: false });

        await streamSyncClient.syncMaps(RAISED_HAND_MAP_NAME)
        .syncMapPermissions(user_identity)
        .update({ read: true, write: false, manage: false });

        await streamSyncClient.syncMaps(VIEWERS_MAP_NAME)
        .syncMapPermissions(user_identity)
        .update({ read: true, write: false, manage: false });

        let playbackGrant = await getPlaybackGrant(streamMapItem.data.player_streamer_sid);
        const token = new AccessToken(accountSid, apiKey, apiKeySecret, {
            ttl: MAX_ALLOWED_SESSION_DURATION,
        });
        
        // Add chat grant to token
        const chatGrant = new ChatGrant({ serviceSid: CONVERSATIONS_SERVICE_SID });

        token.addGrant(chatGrant);

        // Add participant's identity to token
        token.identity = user_identity;
        
        // Add player grant to token
        token.addGrant({
            key: 'player',
            player: playbackGrant,
            toPayload: () => playbackGrant,
        });
        
        // Add sync grant to token
        const syncGrant = new SyncGrant({ serviceSid: streamMapItem.data.sync_service_sid });
        token.addGrant(syncGrant);

        return {
            token: token.toJwt(),
            sync_object_names: {
                speakers_map: SPEAKER_MAP_NAME,
                viewers_map: VIEWERS_MAP_NAME,
                raised_hands_map: RAISED_HAND_MAP_NAME,
                user_document: `user-${user_identity}`
            },
            room_sid: room.sid,
            status: true
        };

    } catch (error) {
        return {status: false, message: error.message};
    }
}

exports.joinStreamAsSpeaker = async(streamID, streamName) => {

    try {
        let room = await twilioClient.video.rooms(streamName).fetch();
        if(!room) return {status: false, message: "Invalid stream name."};

        let streamMapItem = await getStreamMapItem(room.sid);
        if(!streamMapItem) return {status: false, message: "Unable to get stream map item."};

        let streamSyncClient = twilioClient.sync.services(streamMapItem.data.sync_service_sid);
        if(!streamSyncClient) return {status: false, message: "Unable to get stream sync client."};
        
        let userDocumentName = `user-${streamID}`;

        await streamSyncClient.documents.create({ uniqueName: userDocumentName });

        // Give user read access to user document
        await streamSyncClient.documents(userDocumentName).documentPermissions(streamID).update({ read: true, write: false, manage: false });

        await streamSyncClient.syncMaps(SPEAKER_MAP_NAME)
        .syncMapPermissions(streamID)
        .update({ read: true, write: false, manage: false });

        await streamSyncClient.syncMaps(RAISED_HAND_MAP_NAME)
        .syncMapPermissions(streamID)
        .update({ read: true, write: false, manage: false });

        await streamSyncClient.syncMaps(VIEWERS_MAP_NAME)
        .syncMapPermissions(streamID)
        .update({ read: true, write: false, manage: false });

        let conversationsClient = twilioClient.conversations.services(CONVERSATIONS_SERVICE_SID);
        if(!conversationsClient) return {status: false, message: "Unable to create conversation client."};

        await conversationsClient.conversations(room.sid).fetch();
        await conversationsClient.conversations(room.sid).participants.create({ identity: streamID });

        let token = new AccessToken(accountSid, apiKey, apiKeySecret, {
            ttl: MAX_ALLOWED_SESSION_DURATION,
        });
        
        // Add participant's identity to token
        token.identity = streamID;

        // Add video grant to token
        let videoGrant = new VideoGrant({ room: streamName });
        token.addGrant(videoGrant);

        // Add chat grant to token
        let chatGrant = new ChatGrant({ serviceSid: CONVERSATIONS_SERVICE_SID });
        token.addGrant(chatGrant);

        // Add sync grant to token
        let syncGrant = new SyncGrant({ serviceSid: streamMapItem.data.sync_service_sid });
        token.addGrant(syncGrant);

        return {
            token: token.toJwt(),
            sync_object_names: {
                speakers_map: SPEAKER_MAP_NAME,
                viewers_map: VIEWERS_MAP_NAME,
                raised_hands_map: RAISED_HAND_MAP_NAME,
                user_document: `user-${streamID}`
            },
            status: true
        };

    } catch (error) {
        return {status: false, message: error.message};
    }
}

exports.startStreaming = async (streamID, streamName) => {

    try {
        // Create the WebRTC Go video room, PlayerStreamer, and MediaProcessors
        const room = await twilioClient.video.rooms.create({
            uniqueName: streamName,
            uniqueID: streamID,
            type: 'group'
        });

        const playerStreamer = await twilioClient.media.playerStreamer.create();
        if(!playerStreamer) return {status: false, message: "Unable to create player streamer."};

        const mediaProcessor = await twilioClient.media.mediaProcessor.create({
            extension: 'video-composer-v1',
            maxDuration: 60 * 30,
            extensionContext: JSON.stringify({
                identity: 'video-composer-v1',
                resolution: '1920x1080',
                room: {
                    name: room.sid,
                },
                outputs: [
                    playerStreamer.sid
                ],
            })
        });

        if(!mediaProcessor) return {status: false, message: "Unable to instantiate media processor."};

        const streamSyncService = await twilioClient.sync.services.create({
            friendlyName: SYNC_SERVICE_NAME_PREFIX + 'Stream ' + room.sid,
            aclEnabled: true,
            //webhookUrl: 'https://' + DOMAIN_NAME + '/sync-webhook',
            reachabilityWebhooksEnabled: true,
            reachabilityDebouncingEnabled: true, // To prevent disconnect event when connections are rebalanced
        });
        if(!streamSyncService) return {status: false, message: "Unable to instantiate stream sync service."};

        const streamSyncClient = await twilioClient.sync.services(streamSyncService.sid);
        if(!streamSyncClient) return {status: false, message: "Unable to create stream sync client."};

        const backendStorageSyncService = twilioClient.sync.services(LIVE_BACKEND_STORAGE_SYNC_SERVICE);
        if(!backendStorageSyncService) return {status: false, message: "Unable to create backend storage sync service."};

        await backendStorageSyncService.syncMaps('streams').syncMapItems.create({
            key: room.sid,
            data: {
                sync_service_sid: streamSyncService.sid,
                player_streamer_sid: playerStreamer.data.sid,
                media_processor_sid: mediaProcessor.data.sid,
            },
        });

        await streamSyncClient.syncMaps.create({ uniqueName: SPEAKER_MAP_NAME });

        // Add the host to the speakers map when the stream is created so that:
        //
        //   1. The speakers map is gauranteed to contain the host before any user connects to the stream.
        //   2. We don't need a separate way to keep track of who the host is.
        //
        // There is only one host and it is the user that creates the stream. Other users are added to
        // the speakers map in rooms-webhook when they connect to the video room.

        await streamSyncClient.syncMaps('speakers').syncMapItems.create({ key: streamID, data: { host: true } });

        // Give user read access to speakers map.
        await streamSyncClient
            .syncMaps(SPEAKER_MAP_NAME)
            .syncMapPermissions(streamID)
            .update({ read: true, write: false, manage: false });

        // Create raised hands map
        await streamSyncClient.syncMaps.create({ uniqueName: RAISED_HAND_MAP_NAME });

        // Give user read access to raised hands map.
        await streamSyncClient
            .syncMaps(RAISED_HAND_MAP_NAME)
            .syncMapPermissions(streamID)
            .update({ read: true, write: false, manage: false });

        // Create viewers map
        await streamSyncClient.syncMaps.create({ uniqueName: VIEWERS_MAP_NAME });

        // Give user read access to viewers map
        await streamSyncClient
            .syncMaps(VIEWERS_MAP_NAME)
            .syncMapPermissions(user_identity)
            .update({ read: true, write: false, manage: false });

        const conversationsClient = twilioClient.conversations.services(CONVERSATIONS_SERVICE_SID);
        if(!conversationsClient) return {status: false, message: "Unable to create conversation client."};
        // Here we add a timer to close the conversation after the maximum length of a room (24 hours).
        // This helps to clean up old conversations since there is a limit that a single participant
        // can not be added to more than 1,000 open conversations.
        await conversationsClient.conversations.create({ uniqueName: room.sid, 'timers.closed': 'P1D' });

        // Add participant to conversation
        await conversationsClient.conversations(room.sid).participants.create({ identity: streamID });

        const token = new AccessToken(accountSid, apiKey, apiKeySecret, {
            ttl: MAX_ALLOWED_SESSION_DURATION,
          });
        
          // Add participant's identity to token
          token.identity = streamID;
        
          // Add video grant to token
          const videoGrant = new VideoGrant({ room: streamName });
          token.addGrant(videoGrant);
        
          // Add chat grant to token
          const chatGrant = new ChatGrant({ serviceSid: CONVERSATIONS_SERVICE_SID });
          token.addGrant(chatGrant);
        
          // Add sync grant to token
          const syncGrant = new SyncGrant({ serviceSid: streamSyncService.sid });
          token.addGrant(syncGrant);

        return {
            token: token.toJwt(),
            sync_object_names: {
                speakers_map: SPEAKER_MAP_NAME,
                viewers_map: VIEWERS_MAP_NAME,
                raised_hands_map: RAISED_HAND_MAP_NAME,
            },
            roomId: room.sid,
            streamId: streamID,
            streamName: streamName,
            playerStreamerId: playerStreamer.sid,
            mediaProcessorId: mediaProcessor.sid,
            streamSyncClient: streamSyncClient,
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
        await twilioClient.video.rooms(streamName).update({ status: 'completed' });

        return streamName;

    } catch (error) {
        console.error(error);
        return {status: false, message: error.message};
    }
};

exports.joinStreaming = async () => {

    let identity = crypto.randomBytes(20).toString('hex');

    try {

        let playerStreamerList = await twilioClient.media.playerStreamer.list({status: 'started'});
        let playerStreamer = playerStreamerList.length ? playerStreamerList[0] : null;

        // If no one is streaming, return a message
        if (!playerStreamer) return {status: false, message: "No one is streaming right now."};

        // Otherwise create an access token with a PlaybackGrant for the livestream
        let token = new AccessToken(accountSid, apiKey, apiKeySecret);

        // Create a playback grant and attach it to the access token
        let playbackGrant = await twilioClient.media.playerStreamer(playerStreamer.sid).playbackGrant().create({ttl: 60});

        let wrappedPlaybackGrant = new PlaybackGrant({
            grant: playbackGrant.grant
        });

        token.addGrant(wrappedPlaybackGrant);
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