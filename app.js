import DiscordAPI from 'discord.js';
import Functions from './dependences/func.js';
import Commands from './dependences/commands.js';

const Func = new Functions( );

Func.checkDependencies( );
Func.setLog( 'Starting funcs...', 'purple' );
Func.checkConfiguration( );
Func.checkExp( );

function checkIfMessageHasCommand(msg, isEdit) {
    if( msg.author.id != bot.user.id && ( msg.content.startsWith( Func.getConfig( ).prefix ) || msg.content.startsWith( Func.getConfig( ).prefix2 ) ) ) {
        if( msg.content.startsWith( Func.getConfig( ).prefix ) ){
			var prefixo_definido = Func.getConfig( ).prefix;
		}else if( msg.content.startsWith( Func.getConfig( ).prefix2 ) ){
			var prefixo_definido = Func.getConfig( ).prefix2;
		}
        
        var cmdTxt = msg.content.split( ' ' )[0].substring( prefixo_definido.length );
        var suffix = msg.content.substring( cmdTxt.length+prefixo_definido.length+1 );
        
        if( msg.channel.type == 'dm' && !Func.getConfig().allowDMMessage ) {
			msg.channel.send( 'Modo DM Desabilitado!' )
			Func.setLog( `O Usuário ${msg.author.username} tentou enviar o comando ${cmdTxt} no DM.`, 'warning' );
			return;
		}
		
		if( msg.mentions.has( bot.user.id ) ) {
			msg.reply( "Q se ta me marcano ae mermão?" );
			return;
        }
        
        if( msg.channel.id != Func.getConfig( ).commandID && msg.author.username !== bot.user.username && !Func.checkPermissions(msg.author, 'criador') ){
			msg.delete();
			Func.setLog( `O Usuário ${msg.author.username} tentou enviar o comando ${cmdTxt} em canal não permitido.`, 'warning' );
			return;
		}
        
        var cmd = Commands[cmdTxt];

        if ( cmd ) {
            if(Func.checkPermissions(msg.author,cmdTxt)){
				try{
					if(cmd.uso){
					    if(!suffix){
							var embed = new DiscordAPI.MessageEmbed()
                            .setAuthor(msg.author.username, msg.author.avatarURL)
                            .setTitle('Syntaxe Incorreta!')
                            .addField("Modo de Uso", cmd.usage)
                            .addField("Nivel de Permissão", Func.convPermissions( cmd.mode ), true)
                            .addField("Descrição", cmd.description, true)
                            .setColor(`#ffff00`)
                            .setTimestamp(new Date())
                            .setFooter(`${Func.getConfig( ).botName} © 2020`, Func.getConfig( ).botAvatar)
							msg.channel.send({embed})
                            return;
					    }
				    }
					cmd.process(bot,msg,suffix,isEdit);
				} catch(e){
					if( Func.getConfig( ).debug ) Func.setLog( e, 'error' );
				}
			} else {
				msg.channel.send("Você não tem permissão para usar " + cmdTxt + "!");
			}
        }

    } else if( msg.author.id != bot.user.id ){

		if ( Func.getConfig( ).xpEvent ) {
			Func.expFunction( msg );
		}

		if (msg.content.includes('discord.gg/') || msg.content.includes('discordapp.com/invite/')) {
			msg.delete();
		}
	}
}

var bot = new DiscordAPI.Client( );

bot.on( 'ready', function ( ) {
	Func.setLog( 'Ready!','success' );
	bot.user.setActivity("Kernel Code", { type: "STREAMING", url: "https://www.twitch.tv/something" })
	//bot.user.setActivity( 'NtQueryInformationThread', { type: "WATCHING"});
} );

bot.on( 'presence', function( user,status,gameId ) {

} );

bot.on( 'disconnected', function ( ) {
	Func.setLog( '[-] BOT Is Disconnected!', 'error' );
	process.exit( );
} );

bot.on( 'message', msg => {
	if( Func.getConfig( ).ratelimit ){
        //Create a function for anti spam.
    }
} );

bot.on( 'message', ( msg ) => checkIfMessageHasCommand( msg, false ) );
bot.on( 'messageUpdate', ( oldMessage, newMessage ) => {
	checkIfMessageHasCommand( newMessage,true );
} );

bot.on('guildMemberAdd', member => {
	try {
		var embed = new DiscordAPI.MessageEmbed()
        .setAuthor(bot.user.username, bot.user.avatarURL())
        .setTitle('Olá! Seja Bem Vindo ao CodeHub!')
        .setDescription('Obrigado por fazer parte da nossa comunidade! Agora basta se verificar no servidor. :)')
        .setColor(`#ffffff`)
        .setTimestamp(new Date())
        .setFooter(`${Func.getConfig( ).botName} © 2020`, Func.getConfig( ).botAvatar)
		member.send({embed});
	} catch( e ) {
		Func.setLog( 'Fail to send Welcome PM Message..', 'error' );
		return;
	}
 });

if( Func.getConfig( ).TOKEN ){
	Func.setLog( 'Attempt to log-in bot credentials...', 'purple' );
	bot.login( Func.getConfig( ).TOKEN );
} else {
	Func.setLog( "\nLogging in with user credentials is no longer supported!\nYou can use token based log in with a user account, see\nhttps://discord.js.org/#/docs/main/master/general/updating", 'error');
    process.exit( );
}

process.on('unhandledRejection', (reason) => {
	Func.setLog( reason, 'error' );
	process.exit(1);
});