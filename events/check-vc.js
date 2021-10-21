module.exports = {
    name: "voiceStateUpdate",
    once: false,
    execute(voiceManager, oldState, newState) {
        const me = newState.guild.me;
        if (!me.voice.channelId) return;

        // start afk if no members are in voice
        if (oldState.channelId === me.voice.channelId && newState.channelId !== me.voice.channelId) {
            if (oldState.channel.members.size === 1) {
                voiceManager.get(oldState.guild.id)
                    .startAFK(15 * 60);
            }
        }
    }
}
