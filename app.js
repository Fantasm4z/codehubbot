import DiscordAPI from 'discord.js';
import Functions from './dependences/func.js';
import Commands from './dependences/commands.js';

const Func = new Functions( );

Func.checkDependencies( );
Func.setLog( 'Starting funcs...', 'purple' );
Func.checkConfiguration( );
