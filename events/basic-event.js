module.exports = {
    name: 'base-event',
    once: true,
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
    }
};
