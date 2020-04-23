import Functions from './func.js';
import DiscordAPI from 'discord.js';
import * as fs from 'fs';

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
	
	"perm": {
		mode: 3,
		command: "perm",
		usage: "!perm <@user> <criador,eval>",
		uso: "**Modo de uso:**\n!perm <@user> <criador,eval>\n\n**Boa Sorte!**",
		description: 'Setar permissões de criador,eval para algum usuário',
		process: function(bot,msg,suffix) {

			var motivo = suffix;
			motivo = suffix.split(' ')[1].toString( ).trim( );
			var usuario = msg.guild.member( msg.mentions.users.first( ) );

			if ( !new Functions( ).checkPermissions( msg.author, 'criador' ) ) {
				msg.reply( 'Você não tem permissões para executar este comando.' );
				return;
			}

			if( motivo === 'criador' || motivo === 'eval') {

				let permFile = new Functions( ).loadJSON( new Functions( ).resolvePath( '/dependences/permissions.json' ) );
				
				if( !permFile.users[usuario.user.id] ){
					const permExists = {
						"criador": false,
						"eval": false
					};
					permExists[motivo] = true;
					permFile.users[usuario.user.id] = permExists;
				} else {
					const permExists = {
						"criador": permFile.users[usuario.user.id].criador,
						"eval": permFile.users[usuario.user.id].eval
					};
					permExists[motivo] = true;
					permFile.users[usuario.user.id] = permExists;
				}

				fs.writeFile( new Functions( ).resolvePath( '/dependences/permissions.json' ), JSON.stringify(permFile), (err) => {
					if(err) console.log(err)
				});

				msg.reply('Permissão setada!');
				
			}else {
				msg.reply( 'Desconheço essa permissão.' );
				return;
			}
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
	
	"xp": {
		modo: 1,
		command: "xp",
		description: "Consultar experiência no servidor",
		process: function(bot,msg,suffix) {
			let XP = new Functions( ).checkExp( );
			let curxp = XP[msg.author.id].xp;
			let curlvl = XP[msg.author.id].level;
			let nxtLvlXp = curlvl * 300;
			let difference = nxtLvlXp - curxp;
		
			var embed = new DiscordAPI.MessageEmbed()
			.setAuthor(msg.author.username, msg.author.avatarURL)
			.setColor(`#9400D3`)
			.addField("Level",curlvl,true)
			.addField("XP",curxp,true)
			.setThumbnail(msg.author.avatarURL)
			.setTimestamp(new Date())
			.setFooter(`CodeHub! © 2020`, new Functions( ).getConfig( ).botAvatar)
			msg.channel.send({embed});
		}
	},

	"limpar": {
		modo: 2,
		command: "limpar",
		description: 'Limpar o chat do canal',
		process: function(bot,msg,suffix) {
			if( new Functions( ).checkPermissions( msg.author,"criador" ) ){

				if ( msg.member.hasPermission( "ADMINISTRATOR" ) ) {
					msg.channel.messages.fetch( ).then(function( list ){
						msg.channel.bulkDelete( list );
						var embed = new DiscordAPI.MessageEmbed( );
						embed.setColor(0x00ff70);
						embed.setTitle('Limpeza solicitada');
						embed.setAuthor(msg.author.username, msg.author.avatarURL);
						embed.setTimestamp();
						embed.setDescription(`Limpeza realizada com êxito!`);
						embed.setFooter(`CodeHub! © 2020`, new Functions( ).getConfig( ).botAvatar);
						msg.channel.send({embed})
					}, function( err ){msg.reply("Falha ao limpar o chat.")}) 
				}
			} else {
				msg.reply( 'Você não tem permissão para usar o limpar.' );
				new Functions( ).setLog( `O Usuário ${msg.author.username} tentou executar o comando limpar porém não tem permissão.`, '');
				return;
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