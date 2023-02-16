
<img src="logo256.png" height="220px"><img src="images/gistify.png" height="220px">

## Gistify &nbsp; ![](https://vsmarketplacebadges.dev/version-short/GistifyAB.gistify.svg) ![](https://vsmarketplacebadges.dev/installs-short/GistifyAB.gistify.svg) ![](https://vsmarketplacebadges.dev/trending-monthly/GistifyAB.gistify.svg) ![license](https://img.shields.io/badge/license-MIT-blue)

[![Visual Studio Code](https://img.shields.io/badge/Download%20for%20Visual%20Studio%20Code-0078d7.svg?style=for-the-badge&logo=visual-studio-code&logoColor=white)](https://marketplace.visualstudio.com/items?itemName=GistifyAB.gistify)


Reliable extension to upload snippets to GitHub Gists & Pastebin for Visual Studio Code. Created by [@gvsem](https://github.com/gvsem) and [@jvstme](https://github.com/jvstme)

## Configuration

### GitHub Gists

You need to retrieve access token from GitHub to publish Gists:

* `gistify.gists.userToken`: API token with `gist` permission must be received at [GitHub Tokens](https://github.com/settings/tokens/new)

### Pastebin

You need to retrieve access token from Pastebin to publish snippets:

* `gistify.pastebin.apiToken`: API token must be received at [Pastebin Docs / Your Unique Developer API Key](https://pastebin.com/doc_api#1)

## Features

Gistify can upload your snippets. Use our menu:

![Menu usage](images/menu.png)

You can do selections and publish them:

![RMB usage](images/editor_context_menu.jpg)

Track your snippets in a convinient way:

![RMB usage](images/tracker.jpg)

> Notice: you can not track several types of files. ![RMB usage](images/tracker_warning.jpg)


-----------------------------------------------------------------------------------------------------------

## Known Issues

Contact us at [our issue email](mailto:incoming+mrgeorgeous-gistify-27337429-issue-@incoming.gitlab.com) if you have encountered any problems.

## Release Notes

We are not magicians, we are still students.

### 1.0.0

Initial release of Gistify.
* Upload snippets at Pastebin and Gists (Ctrl+Alt+U)
* Upload selections using RBM in editor
* Track uploaded snippets in View


