import {
    createAudioPlayer, 
    entersState, 
    joinVoiceChannel, 
    NoSubscriberBehavior, 
    VoiceConnectionStatus
} from "@discordjs/voice";
import { setTimeout } from 'timers/promises';

const { Collection } = require("discord.js");

export class Queue {
    constructor(voice) {
        this.voice = voice;
        this.songs = [];
        this.prevSongs = [];
    }

    add(song, position=undefined) {
        if (position >= 1) {
            position = Math.floor(position)
            //const queueLen = this.songs.length + this.prevSongs.length;
            if (position <= this.prevSongs.length) {
                this.prevSongs.splice(position - 1, 0, song);
                return song;
            }
            position -= this.prevSongs.length;
            this.songs.splice(position - 1, 0, song);
            return song;
        }
        this.songs.push(song);
        return song;
    }

    remove(song) {
        //TODO: remove song from queue
    }

    next() {
        const prevSong = this.songs.shift();
        this.prevSongs.push(prevSong);
    }

    clear() {
        this.songs = [];
        this.prevSongs = [];
    }
}

export class Voice {
    constructor(voiceManager, voice, queue=undefined) {
        this.voiceManager = voiceManager;
        this.queue = queue ?? new Queue(this)
        this.id = voice.id;
        this.guildId = voice.guildId;
        this.adapterCreator = voice.guild.voiceAdapterCreator;
        this.player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause
            }
        });
        this.connection = this.join();
        this._volume = 0.5;
        this.ac = new AbortController();
    }

    play(song) {
        if (!this.connection) {
            this.join()
        }
        // TODO: play first song in queue
        // this.queue.next(song);
    }

    // TODO: Add error handling for joining vc
    join(voice=undefined) {
        this.ac.abort();
        this.id = voice?.id ?? this.id;
        this.connection = joinVoiceChannel({
            channelId: this.id,
            guildId: this.guildId,
            adapterCreator: this.voiceAdapterCreator
        });
        this.connection
            .on(VoiceConnectionStatus.Ready, () => {
                this.connection.subscribe(this.player)
            })
            .on(VoiceConnectionStatus.Disconnected, async () => {
                try {
                    await Promise.race([
                        entersState(this.connection, VoiceConnectionStatus.Signalling, 5_000),
                        entersState(this.connection, VoiceConnectionStatus.Connecting, 5_000)
                    ]);
                    // Seems to be reconnecting to a new channel - ignore disconnect
                } catch (error) {
                    // Seems to be a real disconnect which shouldn't be recovered from
                    this.connection.destroy();
                }
            })
        return this.connection;
    }

    leave() {
        if (!this.connection) return;
        this.connection.destroy();
        this.startAFK(15 * 60);
    }

    destroy() {
        this.queue.clear()
        this.leave();
    }

    startAFK(seconds) {
        const signal = this.ac.signal;
        setTimeout(seconds * 1000, null, {signal})
            .then(() => {
                this.voiceManager.delete(this.id);
            })
            .catch((err) => {
                if (err.name === "AbortError") {
                    console.log("Scheduled disconnect aborted");
                } else console.error(err);
            });
    }

    get volume() {
        return this._volume * 100;
    }

    set volume(volume) {
        if (typeof volume !== "number" || isNaN(volume)) {
            //throw error?
        }
        volume < 0 ? volume : 0;

        this._volume = volume / 100;
        // set volume for stream
    }
}

/**
 * Manages both voices and queues, by assuming one queue exists for every voice
 */
export class VoiceManager {
    constructor() {
        this.collection = new Collection;
    }

    /**
     * Adds a new voice connection to collection
     * @param {string} id Guild id of the voice
     * @param {Voice} voice Voice (class) for this guild
     * @param {Queue} queue Queue (class) for this guild
     * @returns 
     */
    add(voice, queue=undefined) {
        const existing = this.get(voice.id);
        if (existing) return existing;

        // TODO: Get saved queue here

        const voiceInstance = new Voice(this, voice, queue);
        this.collection.set(voice.id, voiceInstance);
        return voice;
    }

    delete(id) {
        const voice = this.get(id);
        this.collection.delete(id);
        voice.destroy()
    }

    get(id) {
        return this.collection.get(id);
    }

    has(id) {
        return this.collection.has(id);
    }
}
