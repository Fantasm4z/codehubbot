import DiscordAPI from 'discord.js';
import color from 'colors';
import * as fs from 'fs';
import path from 'path';

export default class Functions {

    checkDependencies( ) {
        try {
            DiscordAPI.version < `12.2.0` ? false : true;
        } catch (e){
            console.log( e.stack );
            console.log( process.version );
            console.error( 'cannot load modules... try npm install' );
            process.exit( );
        }
    }

    setLog( arg, method ) {
        const log_path = path.resolve( path.resolve( ) + '/LOG/LOG_' + ("0" + new Date().getDate()).slice(-2) + '.' + ("0" + (new Date().getMonth() + 1)).slice(-2) + '.' + new Date().getFullYear() + '.csv' );

        let date_log = ("0" + new Date().getDate()).slice(-2) + '/' + ("0" + (new Date().getMonth() + 1)).slice(-2) + '/' + new Date().getFullYear();
        let hour_log = ("0" + new Date().getHours()).slice(-2) + ':' + ("0" + new Date().getMinutes()).slice(-2) + ':' + ("0" + new Date().getSeconds()).slice(-2);
        const preset = color.gray('[LOG '+date_log+' - '+hour_log+'] ');
        const preset2 = '[LOG '+date_log+' - '+hour_log+'] ';

        switch(method){
            case 'success':
                console.log( color.green( preset + arg ) );
                fs.appendFileSync( log_path, preset2 + arg + "\n" );
                return true;
            case 'error':
                console.log( color.red( preset + arg ) );
                fs.appendFileSync( log_path, preset2 + arg + "\n" );
                return true;
            case 'warning':
                console.log( color.yellow( preset + arg ) );
                fs.appendFileSync( log_path, preset2 + arg + "\n" );
                return true;
            case 'purple':
                console.log( color.magenta( preset + arg ) );
                fs.appendFileSync( log_path, preset2 + arg + "\n" );
                return true;
            default:
                console.log( color.cyan( preset + arg ) );
                fs.appendFileSync( log_path, preset2 + arg + "\n" );
                return true;
        }
        return false;
    }

    loadJSON( dir ) {
        return JSON.parse(fs.readFileSync(dir, 'utf8'));
    }

    checkConfiguration( ) {
        try{
            let cfg = this.loadJSON( path.resolve( path.resolve( ) + '/dependences/config.json' ) );
            if( !cfg.adminID || !cfg.commandID || cfg.ratelimit == undefined ) {
                this.setLog( 'Failed to get BOT cfg.. please edit config.json and try later.','error' );
                process.exit( );
            }
            return true;
        }catch( e ){
            this.setLog( 'config.json not found.','error' );
            process.exit( );
        }
    }

    checkPermissions( user, permission ) {
        var Permissions = {};
        try{
            Permissions = this.loadJSON( path.resolve( path.resolve( ) + '/dependences/permissions.json' ) );
            try {
                var allowed = true;
                try{
                    if(Permissions.global.hasOwnProperty(permission)){
                        allowed = Permissions.global[permission] === true;
                    }
                } catch(e){}
                try{
                    if(Permissions.users[user.id].hasOwnProperty(permission)){
                        allowed = Permissions.users[user.id][permission] === true;
                    }
                } catch(e){}
                return allowed;
            } catch(e){}
            return false;
        }catch( e ){
            this.setLog( 'permissions.json not found.','error' );
            process.exit( );
        }
    }

    getConfig() {
        if ( this.checkConfiguration() ){
            return this.loadJSON( path.resolve( path.resolve( ) + '/dependences/config.json' ) );
        }
    }
}