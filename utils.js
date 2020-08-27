module.exports.askPromptAndAwait = async (channel, prompt, filter) => {
    let ourMsg = await channel.send(prompt);

    let ret = null;

    try {
        let provided = await channel.awaitMessages(filter, { max: 1, time: 10000, errors: ['time'] });
        ret = provided;
    } catch(err) {
        await ourMsg.delete();
        channel.send("Timed out.");
    }

    return ret;
}