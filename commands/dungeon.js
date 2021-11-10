module.exports = {
    data: {
        name: 'dungeon',
        command: function(interaction, user) {
            interaction.channel.send({ content: "test1" }); 
        }
    }
};
