const fs = require('fs');
var dbHandler = require('./dbhandler.js');
require('dotenv').config(); //initialize dotenv
const Discord = require('discord.js'); //import discord.js
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

const discordClient = new Discord.Client({
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.DIRECT_MESSAGES,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
        Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ]
});

var prefix = "!";
var currencyPrefix = "credits";

var rarityTypes = {
    0: ['Common', '#9d9d9d'],
    1: ['Uncommon', '#1eff00'],
    2: ['Rare', '#0070dd'],
    3: ['Epic', '#a335ee'],
    4: ['Legendary', '#ff8000'],
    5: ['Mythical', '#e6cc80'] 
}

exports.prefix = prefix;
exports.rarityTypes = rarityTypes;



const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const commands = [];

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    console.log(command.data);
    commands[command.data.name] = command.data;
}

discordClient.on('ready', () => {
    commands.forEach(function (element) {
        console.log(element);
    });

    console.log(`Logged in as ${discordClient.user.tag}!`);
});



var classTypes = {
    1: ['Ranged dps'],
    2: ['Close combat dps'],
    3: ['Healer'],
    4: ['Tank']
}

// discordClient.commands = new Discord.Collection();


//todo add commands.


discordClient.on('interactionCreate', async interaction => {
    if (interaction.isSelectMenu()) {
        if (interaction.customId === 'classes') {
            dbHandler.getClassById(interaction.values[0], function (item) {
                if (typeof item != 'undefined') {
                    var discEmbed = new Discord.MessageEmbed()
                        .setTitle(item.name)
                        .setDescription(item.description)
                        .setColor('#0x1254d9');
                    interaction.update({ embeds: [discEmbed] });
                }
            });
        }
    }

    if (interaction.customId === 'join-dungeon') {
        var embed = interaction.message.embeds[0];
        var fields = embed.fields[0];
        var value = fields.value.substring(0, fields.value.lastIndexOf("/"));
        var max = fields.value.substring(fields.value.lastIndexOf("/") + 1, fields.value.length);
        var component = interaction.message.components[0];
        var newValue = parseInt(value) + 1;
        var valueToDisplay = String(newValue + "/" + max);

        if (newValue == max) {
            component.components[0].setDisabled(true);
            valueToDisplay = "this dungeon is full.";
        } else if (newValue == 1) {
            dbHandler.createDungeonParty();
            var rolename = "dungeon-party-" +
                interaction.member.guild.roles.create({
                    name: rolename,
                    color: '#307CAB',
                    reason: 'creating new dungeon role'
                }).then(newRole => {
                    //todo add role id to party and dungeon text id to dungeon
                    interaction.guild.members.cache.get(interaction.user.id).roles.add(newRole);
                    interaction.member.guild.channels.create("test", {
                        type: 'GUILD_TEXT',
                        permissionOverwrites: [
                            {
                                id: newRole.id,
                                allow: ['SEND_MESSAGES', 'VIEW_CHANNEL']
                            },
                            {
                                id: interaction.member.guild.id,
                                deny: ['VIEW_CHANNEL']
                            },
                            {
                                id: interaction.message.author.id,
                                allow: ['SEND_MESSAGES', 'VIEW_CHANNEL']
                            },
                        ]
                    }).then(newTextChannel => {
                        newTextChannel.send(interaction.user.toString() + " has joined the dungeon.");
                    });
                });
        }

        embed.fields[0] = { 'name': fields.name, value: valueToDisplay };
        interaction.update({ embeds: [embed], components: [component] });
    } else if (interaction.customId === 'create-character') {
        dbHandler.getAllClasses(function (classes) {
            if (typeof classes != 'undefined') {
                var options = classesToOptions(classes);
                const row = new Discord.MessageActionRow()
                    .addComponents(
                        new Discord.MessageButton()
                            .setCustomId('submit-character')
                            .setLabel('Submit')
                            .setStyle('SUCCESS'),
                        new Discord.MessageButton()
                            .setCustomId('submit-character1')
                            .setLabel('Submit')
                            .setStyle('SUCCESS')
                    );
                console.log(row);
                interaction.channel.send({ content: "Select a class", components: [row] });
            }
        });
    } else if (interaction.customId === 'submit-character') {
        console.log(interaction.message);
    }
});


discordClient.on('messageCreate', async interaction => {
    if (interaction.author.bot) return;
    var commandName = interaction.content;
    var firstCommand = commandName.split(' ')[0];

    if (commandName.startsWith(prefix)) {
        dbHandler.userExists(interaction.author.id, function (user) {
            console.log(firstCommand);
            var firstCommandWihtoutPrefix = firstCommand.replace(prefix, "");
            if (typeof commands[firstCommandWihtoutPrefix] != 'undefined') {
                if (typeof (user) == 'undefined') {
                    user = false;
                }
                var commandData = commands[firstCommandWihtoutPrefix];
                commandData.command(interaction, user); 
            }
        });
    }
});

function classesToOptions(classes) {
    var returnItem = [];
    classes.forEach(function (element) {
        returnItem.push({
            label: element.name,
            value: String(element.id)
        });
    });
    return returnItem;
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