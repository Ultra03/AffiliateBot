const { MessageEmbed } = require('discord.js');
const { MenuEmbed, MenuVisual, DiscordPromptFunction, DiscordPrompt } = require('discord.js-prompts');

const embed = new MessageEmbed().setTitle("What do you want to correct?");
const correctMenu = new MenuEmbed(embed)
.addOption("Name")
.addOption("Description")
.addOption("Owner ID")
.addOption("Invite Link")
.addOption("Image");
const correctVisual = new MenuVisual(correctMenu);

const correctFn = async (message, data) => {
    const { content } = message;
    if(content === '1') {
        return 1;
    } else if(content === '2') {
        return 2;
    } else if(content === '3') {
        return 3;
    } else if(content === '4') {
        return 4;
    } else {
        return 5;
    }
}

module.exports.askWhatToCorrectPrompt = new DiscordPrompt(correctVisual, correctFn);