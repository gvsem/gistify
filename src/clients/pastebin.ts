import * as vscode from 'vscode';
import { ReferenceTreeItem } from '../gistify/referencesView';
import { UtilClasses } from './util';
let request = require("request");

export module Pastebin {

    export class Reference extends UtilClasses.Reference {

        private link: string;

        constructor(link: string) {
            super();
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

        public toJSONObject() : any {
            super.toJSONObject();
            var r = JSON.parse('{}');
            r['link'] = this.getLink();
            return r;
        }

        public static fromJSONObject(json : any) : Reference | null {
            super.fromJSONObject(null);
            if ((typeof json === 'object') && (typeof json['link'] === 'string')) {
                return new Reference(json['link']);
            }
            return null;
        }

        public getReferenceTreeItem() : ReferenceTreeItem | null {
            return new ReferenceTreeItem('Pastebin Ref', this.getLink());
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

            return new Promise<string>((resolve, reject) => {
                request.post({
                    url: 'https://pastebin.com/api/api_login.php',
                    formData: data
                }, (err, httpResponse, body) => {
                    console.log(body);
                    if (body.startsWith("Bad API request")) {
                        reject(body);
                    } else {
                        resolve(body);
                    }
                });
            });

        }


        public upload(snippet : UtilClasses.Snippet, privacy : Pastebin.Privacy, expireDate : ExpireDate) : Promise<Reference> {

            var data = {
                api_dev_key: this.apiToken,
                api_option: 'paste',
                api_paste_private: privacy,
                api_paste_expire_date: expireDate,
                api_paste_name: snippet.getName(),
                api_paste_code: snippet.getData(),
                api_paste_format: snippet.getFormat()
            };

            if (this.userToken !== null) {
                data['api_user_key'] = this.userToken;
            }

            return new Promise<Reference>((resolve, reject) => {
                request.post({
                    url: 'https://pastebin.com/api/api_post.php',
                    formData: data
                }, (err, httpResponse, body) => {
                    console.log(body);
                    if (body.startsWith("Bad API request")) {
                        reject(body);
                    } else {
                        resolve(new Reference(body));
                    }
                });
            });
        
        }

    }


}