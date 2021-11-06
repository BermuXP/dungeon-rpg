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


discordClient.on('ready', () => {
    console.log(`Logged in as ${discordClient.user.tag}!`);
});

var rarityTypes = {
    0: ['Common', '#8A8887'],
    1: ['Uncommon', '#2BB126'],
    2: ['Rare', '#3997D1'],
    3: ['', '']
}

discordClient.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const commands = [];

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
    discordClient.commands.set(command.data.name, command);
}

rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, '904771032571871242'), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);


discordClient.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        const command = discordClient.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }

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
    if (commandName.startsWith(prefix)) {
        dbHandler.userExists(interaction.author.id, function (user) {
            if (typeof (user) != 'undefined') {
                if (commandName.startsWith(prefix + 'help')) {

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
                } else if (commandName.startsWith(prefix + 'myitems')) {
                    dbHandler.getUserItems(interaction.author.id, function (returnItems) {
                        console.log(returnItems);
                        if (typeof returnItems != 'undefined' && returnItems !== false && returnItems.length > 0) {
                            console.log(returnItems);
                            discEmbed = new Discord.MessageEmbed()
                                .setTitle(interaction.author.username + "'s items")
                                .setThumbnail(interaction.author.avatarURL())
                                .setColor('#0x1254d9');
                            if (returnItems.length == 1 && element[0].name === null) {
                                interaction.channel.send("You have no items.");
                            }
                            returnItems.forEach(function (element) {
                                if (element.name != null) {
                                    discEmbed.addField(element.name, rarityTypes[element.rarity][0]);
                                }
                            });
                            interaction.channel.send({ embeds: [discEmbed] });
                        } else {
                            interaction.channel.send("You have no items.");
                        }
                    });
                } else if (commandName.startsWith(prefix + 'item')) {
                    var splitted = commandName.split(' ');
                    dbHandler.getItem(splitted[1], function (result) {
                        console.log(result)
                        if (typeof result != 'undefined') {
                            interaction.channel.send(result.name + " | rarity: " + rarityTypes[result.rarity][0] + " | " + result.description);
                        }
                    });
                } else if (commandName.startsWith(prefix + 'party')) {
                    var splitted = commandName.split(' ');
                    if (splitted[1] == 'invite') {

                    } else if (splitted[1] == 'create') {
                        interaction.channel.send("Successfully created a party.");
                        var id = makeId(50);
                    }
                } else if (commandName.startsWith(prefix + 'classes')) {
                    dbHandler.getAllClasses(function (classes) {
                        if (typeof classes != 'undefined') {
                            var options = classesToOptions(classes);
                            console.log(options);
                            const row = new Discord.MessageActionRow()
                                .addComponents(
                                    new Discord.MessageSelectMenu()
                                        .setCustomId('classes')
                                        .setPlaceholder('Nothing selected')
                                        .addOptions(options),
                                );
                            interaction.channel.send({ components: [row] });
                        } else {
                            interaction.channel.send('There is currently no classes available');
                        }
                    });
                } else if (commandName.startsWith(prefix + 'dungeon')) {
                    var discEmbed = new Discord.MessageEmbed()
                        .setColor('#35AB30')
                        .setTitle('Dungeon')
                        .setDescription('A random dungeon appeared')
                        .setThumbnail('https://cdn-icons-png.flaticon.com/512/2014/2014191.png')
                        .addField("Joined", "0/5");
                    const row = new Discord.MessageActionRow()
                        .addComponents(
                            new Discord.MessageButton()
                                .setCustomId('join-dungeon')
                                .setLabel('Join')
                                .setStyle('SUCCESS')
                        );
                    interaction.channel.send({ components: [row], embeds: [discEmbed] });
                }
            } else if (commandName.startsWith(prefix + 'register')) {
                console.log("test");
                dbHandler.addNewUser(interaction.author.id, function (data) {
                    console.log(data);
                    if (data !== false) {
                        const row = new Discord.MessageActionRow()
                            .addComponents(
                                new Discord.MessageButton()
                                    .setCustomId('create-character')
                                    .setLabel('Create character')
                                    .setStyle('SUCCESS')
                            );
                        interaction.channel.send({ content: "Successfully registered, would you like to create a character?", components: [row] });
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

function createParty() {

}


function joinParty() {

}


function createDungeon() {

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