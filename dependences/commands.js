import Functions from './func.js';
import DiscordAPI from 'discord.js';

var commands = { };
var votacao = false;

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

    "eval": {
		modo: 3,
		command: "eval",
		usage: "!eval 1+1",
		uso: "**Modo de uso:**\n!eval 1 + 1\n\n**Boa Sorte!**",
		description: 'Executar códigos JavaScript no momento que o bot está online',
		process: function(bot,msg,suffix) {
			if(new Functions( ).checkPermissions(msg.author,"eval")){
				try {
					msg.reply(eval(suffix,bot));
				} catch (e) {
					msg.channel.send('`'+e+'`');
				}
			} else {
				msg.reply("Você não tem permissão para usar o eval.");
			}
		}
    },
    
    "voteban": {
		modo: 1,
		command: "voteban",
		usage: "!voteban <@USER_ID> <Motivo>",
		uso: "**Modo de uso:**\n!voteban <@USER_ID> <Motivo>\n\n**NÃO USE O COMANDO CASO FOR INJUSTO, OU VOCÊ SERÁ PUNIDO**\n\n**Boa Sorte!**",
		description: "Iniciar votação para banir usuário com péssima condulta.",
		process: function(bot,msg,suffix) {
            if( votacao ) {
                msg.reply('Já se encontra uma votação em andamento...');
                return;
            }

			var vote_sim = 0;
			var vote_nao = 0;
			var motivo = suffix;
            motivo = suffix.substring(23);
            var usuario = msg.guild.member(msg.mentions.users.first());


			if(new Functions( ).checkPermissions(usuario,"criador")){
				msg.reply('Não há possibilidade de um usuário acima do meu nível.');
				new Functions( ).setLog( `O usuário ${msg.author.username} tentou iniciar uma votação em algum administrador.`, 'warning' );
				return;
            }
            
			if(motivo.length < 5){
				msg.reply('Não é possível iniciar uma votação sem motivo de banimento.');
				new Functions( ).setLog( `O Usuário ${msg.author.username} tentou executar uma votação contra ${usuario.user.username} sem motivo de banimento.`, '' );
				return;
			}
			
			let mencionado = msg.guild.member(msg.mentions.users.first() || msg.guild.members.get(suffix));
            
			if(!mencionado || mencionado == bot.user.id){
				msg.reply('Não é possível iniciar uma votação sem marcar o usuário.');
				new Functions( ).setLog( `O Usuário ${msg.author.username} tentou executar uma votação sem mencionar o usuário.`, '' );
				return;
			}
			/*
			if(check_experience(msg.author.id) == false){
				msg.reply('Você não tem level para criar uma votação.');
				//loggar(bot,msg,'O Usuário '+msg.author.username+' tentou executar uma votação contra '+usuario+', porém não tem level o suficiente.')
				return;
            }*/
			
			bot.on('messageReactionAdd', (reaction, user) => {
				if(reaction.emoji.name === "👍") {
					vote_sim++;
				}
				if(reaction.emoji.name === "👎") {
					vote_nao++;
				}
			});
			if(!votacao){
                votacao = true;

                new Functions( ).setLog( `O Usuário ${msg.author.username} iniciou uma votação contra ${usuario.user.username}, motivo: ${motivo}`, 'warning' );
                var usuario = msg.guild.member(msg.mentions.users.first());
                var embed = new DiscordAPI.MessageEmbed();
                
                embed.setColor(0x3742fa);
                embed.setTitle('Votação para banimento');
                embed.setAuthor(msg.author.username, msg.author.avatarURL);
                embed.setTimestamp();
                embed.setDescription("Iniciou-se uma votação contra: " + usuario.user.username);
                embed.setFooter(`CodeHub! © 2020`, new Functions( ).getConfig( ).botAvatar);
                msg.channel.send({embed}).then(function (message) {
                    message.react("👎");
                    message.react("👍");
                });
                setTimeout(function () {
					msg.channel.send("Faltam 15 segundos para encerrar a votação.");
					setTimeout(function () {
                        if ((vote_nao + vote_sim) > 2) {
                            var porcent_ban = (vote_sim * 100) / (vote_nao + vote_sim);
							if (porcent_ban > 70) {
							    var embed = new DiscordAPI.MessageEmbed();
								embed.setColor(0x009688);
								embed.setAuthor(msg.author.username, msg.author.avatarURL);
								embed.setTitle('Votação Finalizada! Status: APROVADA!');
								embed.setTimestamp(new Date());
								embed.setImage('http://novaholandachecker.space/tenor.gif');
								embed.setFooter(`CodeHub! © 2020`, new Functions( ).getConfig( ).botAvatar);
								new Functions( ).setLog( `O usuário ${usuario.user.username} foi banido. Por ${vote_sim}/${vote_nao} Votos. Motivo: ${motivo}`, 'error' );
								msg.channel.send({embed});
								msg.guild.member(usuario).ban();
								vote_sim = 0;
                                vote_nao = 0;
                                votacao = false;
							} else {
								var embed = new DiscordAPI.MessageEmbed();
								embed.setColor(0xF44336);
								embed.setAuthor(msg.author.username, msg.author.avatarURL);
								embed.setTitle('Votação Finalizada! Status: REPROVADA!');
								embed.setTimestamp(new Date());
								embed.setDescription('O Público negou o banimento do usuário. será enviado encaminhado para os moderadores analisar.')
								embed.setFooter(`CodeHub! © 2020`, new Functions( ).getConfig( ).botAvatar);
                                msg.channel.send({embed});
                                new Functions( ).setLog( `Votação contra ${usuario.user.username} foi negada. Por ${vote_sim}/${vote_nao} Votos.`, 'warning' );
								vote_sim = 0;
                                vote_nao = 0;
                                votacao = false;
							}
						} else {
							msg.channel.send("Votação encerrada por falta de votos!");
							vote_sim = 0;
                            vote_nao = 0;
                            votacao = false;
						}
					}, 1000 * 15);
				}, 1000 * 15);
			} else {
				msg.reply("Já tem uma votação em andamento!");
			}
		}
	},
}