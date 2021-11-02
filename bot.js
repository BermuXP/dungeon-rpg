// var mysql = require('mysql');
var dbHandler = require('./dbhandler.js');
require('dotenv').config(); //initialize dotenv

const Discord = require('discord.js'); //import discord.js

var prefix = "!";
var currencyPrefix = "credits";

const discordClient = new Discord.Client({
    intents: [Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.DIRECT_MESSAGES,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS]
}); //create new client

discordClient.on('ready', () => {
    // console.log(`Logged in as ${discordClient.user.tag}!`);
});

var rarityTypes = {
    0: 'common',
    1: 'uncommon'
}

discordClient.on('messageCreate', interaction => {
    if (interaction.author.bot) return;
    var commandName = interaction.content;
    if (commandName.includes(prefix)) {
        dbHandler.userExists(interaction.author.id, function (user) {
            if (typeof (user) != 'undefined') {
                if(commandName.startsWith(prefix + 'help')) {

                } else if (commandName.startsWith(prefix + 'profile')) {
                    discEmbed = new Discord.MessageEmbed()
                        .setTitle(interaction.author.username)
                        .setThumbnail(interaction.author.avatarURL())
                        .setColor('#0x1254d9');
                    interaction.channel.send({ embeds: [discEmbed] });
                } else if (commandName.startsWith(prefix + 'balance')) {
                    dbHandler.getUserBalance(interaction.author.id, function (balance) {
                        interaction.channel.send('Your balance is: ' + balance + " " + currencyPrefix);
                    });
                } else if (commandName.startsWith(prefix + 'register')) {
                    interaction.channel.send("You're already registered.");
                } else if (commandName.startsWith(prefix + 'items')) {

                    dbHandler.getUserItems(interaction.author.id, function (returnItems) {
                        console.log(returnItems);
                        if (typeof returnItems != 'undefined' && returnItems !== false && returnItems.length > 0) {
                            console.log(returnItems);
                            discEmbed = new Discord.MessageEmbed()
                                .setTitle(interaction.author.username)
                                .setThumbnail(interaction.author.avatarURL())
                                .setColor('#0x1254d9');
                            if(returnItems.length == 1 && element[0].name === null) {
                                interaction.channel.send("You have no items.");
                            }
                            returnItems.forEach(function(element) {
                                if(element.name != null) {
                                    discEmbed.addField(element.name, rarityTypes[element.rarity]);
                                }
                            });
                            interaction.channel.send({ embeds: [discEmbed] });
                        } else {
                            interaction.channel.send("You have no items.");
                        }

                    });

                }
            } else if (commandName.startsWith(prefix + 'register')) {
                console.log("test");
                dbHandler.addNewUser(interaction.author.id, function (data) {
                    console.log(data);
                    if (data !== false) {
                        interaction.channel.send("Successfully registered, welcome to the dungeons bot.");
                    } else {
                        interaction.channel.send("Something went wrong while adding you to our system, please try again later or contact one of the develoeprs.");
                    }

                });
            } else {
                interaction.channel.send("You don't have a user yet, to use this bots commands use /register to register yourself!");
            }
        });
    }
});

function profile() {

}

/**
 * 
 * @param {*} data 
 */
function embedMessage(data) {
    const json = JSON.parse(data)

    var discEmbed = new Discord.MessageEmbed()
        .setColor(json.color)
        .setTitle(json.title)
        .setDescription(json.description)
        .setURL(json.url)
        .setAuthor(json.author)
        .setFooter(json.setFooter)
        .setImage(json.image)
        .setThumbnail(json.thumbnail)


    json.fields.forEach(element => {
        discEmbed.addField(element.name, element.value, element.inline);
    });

    if (json.timestamp) {
        discEmbed.setTimestamp()
    }
    return discEmbed;
}


//make sure this line is the last line
discordClient.login(process.env.DISCORD_TOKEN); //login bot using token


// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
}