/* a simple MUC connection plugin
 * can only handle a single MUC room
 */

/* global $, Strophe */

import {getLogger} from "jitsi-meet-logger";
const logger = getLogger(__filename);
import ChatRoom from "./ChatRoom";
import {ConnectionPluginListenable} from "./ConnectionPlugin";
import XMPPEvents from "../../service/xmpp/XMPPEvents";

class MucConnectionPlugin extends ConnectionPluginListenable {
    constructor(xmpp) {
        super();
        this.xmpp = xmpp;
        this.rooms = {};
    }

    init (connection) {
        super.init(connection);
        // add handlers (just once)
        this.connection.addHandler(this.onPresence.bind(this), null,
            'presence', null, null, null, null);
        this.connection.addHandler(this.onPresenceUnavailable.bind(this),
            null, 'presence', 'unavailable', null);
        this.connection.addHandler(this.onPresenceError.bind(this), null,
            'presence', 'error', null);
        this.connection.addHandler(this.onMessage.bind(this), null,
            'message', null, null);
        this.connection.addHandler(this.onMute.bind(this),
            'http://jitsi.org/jitmeet/audio', 'iq', 'set',null,null);
    }

    createRoom (jid, password, options) {
        const roomJid = Strophe.getBareJidFromJid(jid);
        if (this.rooms[roomJid]) {
            const errmsg = "You are already in the room!";
            logger.error(errmsg);
            throw new Error(errmsg);
        }
        this.rooms[roomJid] = new ChatRoom(this.connection, jid,
            password, this.xmpp, options);
        this.eventEmitter.emit(
            XMPPEvents.EMUC_ROOM_ADDED, this.rooms[roomJid]);
        return this.rooms[roomJid];
    }

    doLeave (jid) {
        this.eventEmitter.emit(
            XMPPEvents.EMUC_ROOM_REMOVED, this.rooms[jid]);
        delete this.rooms[jid];
    }

    onPresence (pres) {
        const from = pres.getAttribute('from');

        // What is this for? A workaround for something?
        if (pres.getAttribute('type')) {
            return true;
        }

        const room = this.rooms[Strophe.getBareJidFromJid(from)];
        if(!room)
            return;

        // Parse status.
        if ($(pres).find('>x[xmlns="http://jabber.org/protocol/muc#user"]' +
            '>status[code="201"]').length) {
            room.createNonAnonymousRoom();
        }

        room.onPresence(pres);

        return true;
    }

    onPresenceUnavailable (pres) {
        const from = pres.getAttribute('from');
        const room = this.rooms[Strophe.getBareJidFromJid(from)];
        if(!room)
            return;

        room.onPresenceUnavailable(pres, from);
        return true;
    }

    onPresenceError (pres) {
        const from = pres.getAttribute('from');
        const room = this.rooms[Strophe.getBareJidFromJid(from)];
        if(!room)
            return;

        room.onPresenceError(pres, from);
        return true;
    }

    onMessage (msg) {
        // FIXME: this is a hack. but jingle on muc makes nickchanges hard
        const from = msg.getAttribute('from');
        const room = this.rooms[Strophe.getBareJidFromJid(from)];
        if(!room)
            return;

        room.onMessage(msg, from);
        return true;
    }

    onMute(iq) {
        const from = iq.getAttribute('from');
        const room = this.rooms[Strophe.getBareJidFromJid(from)];
        if(!room)
            return;

        room.onMute(iq);
        return true;
    }
}

export default function(XMPP) {
    Strophe.addConnectionPlugin('emuc', new MucConnectionPlugin(XMPP));
}
