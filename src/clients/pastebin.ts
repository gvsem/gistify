import * as vscode from 'vscode';
import { UtilClasses } from './util';

export module Pastebin {

    export class Reference {

        private link: string

        constructor(link: string) {
            this.link = link
        }

    }

    export class Client {
    
        private apiToken: string
        private userToken: string | null

        constructor(apiToken : string, userToken : string | null = null) {
            this.apiToken = apiToken
            this.userToken = userToken
        }

        public initializeWithUserCredentials(login : string, password: string) {
            
            
        }

        public upload(snippet : UtilClasses.Snippet) : Reference {

            // const response = await fetch(myUrl, {
            //     method: 'POST',
            //     body: content,
            //     headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'} });
              
            //   if (!response.ok) { /* Handle */ }
              
            //   // If you care about a response:
            //   if (response.body !== null) {
            //     // body is ReadableStream<Uint8Array>
            //     // parse as needed, e.g. reading directly, or
            //     const asString = new TextDecoder("utf-8").decode(response.body);
            //     // and further:
            //     const asJSON = JSON.parse(asString);  // implicitly 'any', make sure to verify type on runtime.
            //   }
            
        }

    }


}