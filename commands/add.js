const config = require('../config.json');
const utils = require('../utils.js');
const Discord = require('discord.js');
const { askWhatToCorrectPrompt } = require('../prompts/askWhatToCorrect.js');
const { PromptNode, DiscordPromptRunner } = require('discord.js-prompts');

async function checkIfOk(channel, embed, author) {
    channel.send(embed);

    const filter = m => m.author.id === author.id;

    let responseColl = await utils.askPromptAndAwait(channel, "Does this look correct? (y/n)", filter);

    if(responseColl == null) return null;

    let response = responseColl.first();
    if(response.content.toLowerCase() === "y") {

        let affiliatesChannel = await channel.guild.channels.resolve(config.affiliateChannelID);
        affiliatesChannel.send(embed);
        channel.send("Done!");
        return;

    } else if(response.content.toLowerCase() === "n") {

        const askWhatToCorrect = new PromptNode(askWhatToCorrectPrompt);
        const runner = new DiscordPromptRunner(author, {});

        const ret = await runner.run(askWhatToCorrect, channel);
        switch(ret) {
            case 1: {
                let newTitle = await utils.askPromptAndAwait(channel, "Enter a new title.", filter);
                if(newTitle == null) return;
                else {
                    embed.setTitle(newTitle.first().content);
                    return checkIfOk(channel, embed, author);
                }
            }
            case 2: {
                let newDesc = await utils.askPromptAndAwait(channel, "Enter a new description.", filter);
                if(newDesc == null) return;
                else {
                    embed.setDescription(newDesc.first().content);
                    return checkIfOk(channel, embed, author);
                }
            }
            case 3: {
                let newID = await utils.askPromptAndAwait(channel, "Enter a new server owner ID.", filter);
                if(newID == null) return;
                else {
                    let newEmbed = new Discord.MessageEmbed()
                    .setTitle(embed.title)
                    .setDescription(embed.description)
                    .addField("Server Affiliate", `<@${newID.first().content}>`, true)
                    .addField("Invite Link", embed.fields[1].value, true)
                    .setImage(embed.image.url);
                    return checkIfOk(channel, newEmbed, author);
                }
            }
            case 4: {
                let newInviteLink = await utils.askPromptAndAwait(channel, "Enter a new invite link.", filter);
                if(newInviteLink == null) return;
                else {
                    let newEmbed = new Discord.MessageEmbed()
                    .setTitle(embed.title)
                    .setDescription(embed.description)
                    .addField("Server Affiliate", embed.fields[0].value, true)
                    .addField("Invite Link", newInviteLink.first().content, true)
                    .setImage(embed.image.url);
                    return checkIfOk(channel, newEmbed, author);
                }
            }
            case 5: {
                const attachmentsFilter = m => m.attachments.size > 0;
                let newImage = await utils.askPromptAndAwait(channel, "Attach a new image.", attachmentsFilter);
                if(newImage == null) return;
                else {
                    embed.setImage(newImage.first().attachments.first().url);
                    return checkIfOk(channel, embed, author);
                }
            }
        }

    }
    else {
        channel.send("Invalid response.");
        return checkIfOk(channel, embed);
    }
}

module.exports.run = async (client, message, args) => {
    if(message.member.roles.cache.has(message.guild.roles.fetch(config.allowedRoleID))) {
        message.channel.send("You don't have permission to do that.");
        return;
    }

    const filter = m => m.author.id === message.author.id;

    let nameColl = await utils.askPromptAndAwait(message.channel, "What is the name of the affiliated server? (type `cancel` to cancel)", filter);
    if(nameColl == null) return;
    let name = nameColl.first();
    if(name.content === "cancel") {
        message.channel.send("Cancelled.");
        return;
    }

    let descColl = await utils.askPromptAndAwait(message.channel, "What is the description? (type `cancel` to cancel)", filter);
    if(descColl == null) return;
    let desc = descColl.first();
    if(desc.content === "cancel") {
        message.channel.send("Cancelled.");
        return;
    }

    let ownerIDColl = await utils.askPromptAndAwait(message.channel, "What is the server owner's user ID?", filter);
    if(ownerIDColl == null) return;
    let ownerID = ownerIDColl.first();
    if(ownerID.content === "cancel") {
        message.channel.send("Cancelled.");
        return;
    }

    let inviteLinkColl = await utils.askPromptAndAwait(message.channel, "What is the invite link? (type `cancel` to cancel)", filter);
    if(inviteLinkColl == null) return;
    let inviteLink = inviteLinkColl.first();
    if(inviteLink.content === "cancel") {
        message.channel.send("Cancelled.");
        return;
    }

    const attachmentsFilter = m => m.attachments.size > 0;
    let imageColl = await utils.askPromptAndAwait(message.channel, "What is the server image ? (send as an attachment. type `cancel` to cancel)", attachmentsFilter);
    if(imageColl == null) return;
    let image = imageColl.first();
    if(image.content === "cancel") {
        message.channel.send("Cancelled.");
        return;
    }

    let messageEmbed = new Discord.MessageEmbed()
    .setTitle(name.content)
    .setDescription(desc.content)
    .addField("Server Affiliate", `<@${ownerID.content}>`, true)
    .addField("Invite Link", inviteLink.content, true)
    .setImage(image.attachments.first().url);

    let ok = await checkIfOk(message.channel, messageEmbed, message.author);
    
};

module.exports.help = {
    name: "add"
}