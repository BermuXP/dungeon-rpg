module.exports = {
    data: {
        name: 'dungeon',
        command: function(interaction, user) {
            var commandName = interaction.content; 
            var splitted = commandName.split(' ');
            if(splitted[1] == "create") {
                splitted[2];
            }

            
            
            interaction.channel.send({ content: "Help command comming soon." }); 
        }
    }
};
