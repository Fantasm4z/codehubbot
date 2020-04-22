var commands = {};

export default commands = {
    "ping": {
		mode: 1,
        description: "Check ping of BOT.",
        process: function(bot, msg, suffix) {
            msg.channel.send( '*Ping...*' ).then( function( oldMsg ) {
                oldMsg.edit( `Pong! **${oldMsg.createdAt - msg.createdAt}ms**` );
            })
        }
	},
}