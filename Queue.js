import { createAudioPlayer, entersState, joinVoiceChannel, NoSubscriberBehavior, VoiceConnectionStatus } from "@discordjs/voice";

const { Collection } = require("discord.js");

export class Voice {
    constructor(voiceManager, voice, queue) {
        this.voices = voiceManager;
        this.queue = queue;
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
        this.leave()
        this.player.stop()
        //TODO: this.queue.clear()
    }
}

/**
 * Manages both voices and queues, by assuming one queue exists for every voice
 */
export class VoiceManager {
    constructor() {
        this.voiceCollection = new Collection;
    }

    /**
     * Adds a new voice connection to collection
     * @param {string} id Guild id of the voice
     * @param {Voice} voice Voice (class) for this guild
     * @param {Queue} queue Queue (class) for this guild
     * @returns 
     */
    add(id, voice, queue) {
        const existing = this.get(id);
        if (existing) {
            return existing;
        }
        this.collection.set(id, [voice, queue]);
        return [voice, queue];
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
