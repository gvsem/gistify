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
                api_paste_code: snippet.getData(),
                api_paste_format: snippet.getFormat()
            };

            if (this.userToken !== null) {
                data['api_user_key'] = this.userToken;
            }

            return new Promise<Reference>((resolve) => {
                Client.callPostMethod('api_post.php', data).then(
                    body => {
                        resolve(new Reference(body));
                    }
                )
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
                    response => {
                        if (response.data.startsWith('Bad API request')) {
                            reject(response.data);
                        } else {
                            resolve(response.data);
                        }
                    }
                )
            });
        }

    }


}