exports.ping = (client, Events) =>{
    // Debug message event listener
    client.on(Events.MessageCreate, msg => {
        if (msg.content === "bot") {
            msg.reply("yes?");
        }
    })
}

exports.pingCommand = (SlashCommandBuilder) => {
    command = {
        data: new SlashCommandBuilder().setName("ping").setDescription("New ping command"),
        async execute(interaction) {
            await interaction.reply("pong!");
        }
    }
}