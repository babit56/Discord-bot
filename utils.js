/**
 * Check if the string is an URL
 * @param {string} input input
 * @returns {boolean}
 */
export function isURL(input) {
    if (typeof input !== "string" || input.includes(" ")) return false;
    try {
        const url = new URL(input);
        if (!["https:", "http:"].includes(url.protocol) || !url.host) return false;
    } catch {
        return false;
    }
    return true;
}

/**
 * Gets user from mention in string
 * @param {string} mention A mentioned user
 * @param {Client} client The bot
 * @returns {User|undefined} Returns the user or undefined if no user is found
 */
export function getUserFromMention(mention, client) {
    // The id is the first and only match found by the RegEx.
    const matches = mention.match(/^<@!?(\d+)>$/);

    // If supplied variable was not a mention, matches will be null instead of an array.
    if (!matches) return;

    // However, the first element in the matches array will be the entire mention, not just the ID,
    // so use index 1.
    const id = matches[1];

    return client.users.cache.get(id);
}
