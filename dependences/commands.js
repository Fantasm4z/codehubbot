export var commands = {
    "ping": {
		mode: 1,
        description: "Check ping of BOT.",
        process: function(bot, msg, suffix) {
            let oldMSG = msg.channel.send('*Ping...*');
            
            oldMSG.edit(`Pong! **${oldMSG.createdAt - Message.createdAt}ms**`);
        }
	},
}