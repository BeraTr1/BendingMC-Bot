function checkTimer(){

}

function setTimer(){

}

exports.setReminder = (client, msg) => {
    // check if message was sent by the bot
    if (msg.author.id === client.user.id) return;
    
    let prefix = "?reminder"

    if (msg.startsWith(prefix)){
        msg.reply("setting reminder");
    }
}