import {
    createAudioPlayer, 
    entersState, 
    joinVoiceChannel, 
    NoSubscriberBehavior, 
    VoiceConnectionStatus
} from "@discordjs/voice";

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
        //TODO: search and remove?
    }

    next() {
        const prevSong = this.songs.shift();
        this.prevSongs.push(prevSong);
    }
}

export class Voice {
    constructor(voiceManager, voice, queue=undefined) {
        this.voices = voiceManager;
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
    }

    play(song) {
        if (!this.connection) {
            this.join()
        }
        //TODO: this.queue.play(song);
    }

    // TODO: Improve connection maybe (add try catch for errors)
    join(voice=undefined) {
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
        this.connection.destroy();
    }

    destroy() {
        this.leave();
        this.player.stop();
        //TODO: this.queue.clear()
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
    add(id, voice) {
        const existing = this.get(id);
        if (existing) {
            return existing;
        }
        this.collection.set(id, voice);
        return voice;
    }

    // TODO: destroy voice connection and queue in here?
    delete(id) {
        this.collection.delete(id);
    }

    get(id) {
        return this.collection.get(id);
    }

    has(id) {
        return this.collection.has(id);
    }
}
