import { UtilClasses } from './util';
import axios, { AxiosRequestConfig } from 'axios';
import * as FormData from 'form-data';

export module Pastebin {

    export class Reference {

        private link: string;

        constructor(link: string) {
            this.link = link;
        }

        public getLink() : string {
            return this.link;
        }

        public getId() : string {
            var s = this.link.split('/').pop();
            if (s !== undefined) {
                return s;
            }
            throw new Error("Reference is initialized with wrong link.");
        }

    }

    export enum Privacy {
        public = 0,
        unlisted = 1,
        private = 2
    }

    export enum ExpireDate {
        never = "N",
        tenMinutes = "10M",
        oneHour = "1H",
        oneDay = "1D",
        oneWeek = "1W",
        twoWeeks = "2W",
        oneMonth = "1M",
        sixMonths = "6M",
        oneYear = "1Y"
    }

    export class Client {
    
        private apiToken: string;
        private userToken: string | null;

        private static api = axios.create({baseURL: 'https://pastebin.com/api/'});

        constructor(apiToken : string, userToken : string | null = null) {
            this.apiToken = apiToken;
            this.userToken = userToken;
        }

        public static retrieveUserToken(apiToken : string, login : string, password : string) : Promise<string> {
            
            var data = {
                api_dev_key: apiToken,
                api_user_name: login,
                api_user_password: password
            };

            return this.callPostMethod('api_login.php', data);

        }


        public upload(snippet : UtilClasses.Snippet, privacy : Pastebin.Privacy, expireDate : ExpireDate) : Promise<Reference> {

            var data: any = {
                api_dev_key: this.apiToken,
                api_option: 'paste',
                api_paste_private: privacy,
                api_paste_expire_date: expireDate,
                api_paste_name: snippet.getName(),
                api_paste_code: snippet.getData()
            };
            
            if (this.formats.includes(snippet.getFormat())) {
                data['api_paste_format'] = snippet.getFormat();
            }
            if (this.userToken !== null) {
                data['api_user_key'] = this.userToken;
            }

            return new Promise<Reference>((resolve, reject) => {
                Client.callPostMethod('api_post.php', data).then(
                    body => {
                        resolve(new Reference(body));
                    }
                ).catch(e => reject(e));
            });

        }

        private static callPostMethod(methodSuffix : string, data : any) : Promise<string> {
            let formData = new FormData();

            for (var key in data) {
                formData.append(key, data[key]);
            }

            let config: AxiosRequestConfig = {
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`
                }
            };

            return new Promise<string>((resolve, reject) => {
                this.api.post<string>(methodSuffix, formData, config).then(
                    response => resolve(response.data)
                ).catch(
                    error => {
                        if (error.response) {
                            reject(new Error(error.response.data));
                        } else {
                            reject(error);
                        }
                    }
                );
            });
        }

        private formats: Array<string> = ['4cs', '6502acme', '6502kickass', '6502tasm', 'abap', 'actionscript', 'actionscript3', 'ada', 'aimms', 'algol68', 'apache', 'applescript', 'apt_sources', 'arm', 'asm', 'asp', 'asymptote', 'autoconf', 'autohotkey', 'autoit', 'avisynth', 'awk', 'bascomavr', 'bash', 'basic4gl', 'dos', 'bibtex', 'blitzbasic', 'b3d', 'bmx', 'bnf', 'boo', 'bf', 'c', 'c_winapi', 'c_mac', 'cil', 'csharp', 'cpp', 'cpp-winapi', 'cpp-qt', 'c_loadrunner', 'caddcl', 'cadlisp', 'cfdg', 'chaiscript', 'chapel', 'clojure', 'klonec', 'klonecpp', 'cmake', 'cobol', 'coffeescript', 'cfm', 'css', 'cuesheet', 'd', 'dart', 'dcl', 'dcpu16', 'dcs', 'delphi', 'oxygene', 'diff', 'div', 'dot', 'e', 'ezt', 'ecmascript', 'eiffel', 'email', 'epc', 'erlang', 'fsharp', 'falcon', 'fo', 'f1', 'fortran', 'freebasic', 'freeswitch', 'gambas', 'gml', 'gdb', 'genero', 'genie', 'gettext', 'go', 'groovy', 'gwbasic', 'haskell', 'haxe', 'hicest', 'hq9plus', 'html4strict', 'html5', 'icon', 'idl', 'ini', 'inno', 'intercal', 'io', 'ispfpanel', 'j', 'java', 'java5', 'javascript', 'jcl', 'jquery', 'json', 'julia', 'kixtart', 'latex', 'ldif', 'lb', 'lsl2', 'lisp', 'llvm', 'locobasic', 'logtalk', 'lolcode', 'lotusformulas', 'lotusscript', 'lscript', 'lua', 'm68k', 'magiksf', 'make', 'mapbasic', 'matlab', 'mirc', 'mmix', 'modula2', 'modula3', '68000devpac', 'mpasm', 'mxml', 'mysql', 'nagios', 'netrexx', 'newlisp', 'nginx', 'nimrod', 'text', 'nsis', 'oberon2', 'objeck', 'objc', 'ocaml-brief', 'ocaml', 'octave', 'pf', 'glsl', 'oobas', 'oracle11', 'oracle8', 'oz', 'parasail', 'parigp', 'pascal', 'pawn', 'pcre', 'per', 'perl', 'perl6', 'php', 'php-brief', 'pic16', 'pike', 'pixelbender', 'plsql', 'postgresql', 'postscript', 'povray', 'powershell', 'powerbuilder', 'proftpd', 'progress', 'prolog', 'properties', 'providex', 'puppet', 'purebasic', 'pycon', 'python', 'pys60', 'q', 'qbasic', 'qml', 'rsplus', 'racket', 'rails', 'rbs', 'rebol', 'reg', 'rexx', 'robots', 'rpmspec', 'ruby', 'gnuplot', 'rust', 'sas', 'scala', 'scheme', 'scilab', 'scl', 'sdlbasic', 'smalltalk', 'smarty', 'spark', 'sparql', 'sqf', 'sql', 'standardml', 'stonescript', 'sclang', 'swift', 'systemverilog', 'tsql', 'tcl', 'teraterm', 'thinbasic', 'typoscript', 'unicon', 'uscript', 'ups', 'urbi', 'vala', 'vbnet', 'vbscript', 'vedit', 'verilog', 'vhdl', 'vim', 'visualprolog', 'vb', 'visualfoxpro', 'whitespace', 'whois', 'winbatch', 'xbasic', 'xml', 'xorg_conf', 'xpp', 'yaml', 'z80', 'zxbasic']

    }


}