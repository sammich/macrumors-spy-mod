## Macrumors Forum Spy Mod ##

This userscript enhances the existing spy at the [Macrumors Forum Spy](forums.macrumors.com/spy/). There are two version of the script:

- Enhanced - keeps things mostly the same but adds features like subforum ignore and tidies up things
- Split - totally wraps up the Spy into a totally contained pro-browsing pseudo-app

The mod is made as the MR Spy was at 2015-07-10 0030 (AEST).

I 'built' and tested it on Chrome via the Tampermonkey extension with basic tests on Firefox and Safari 8 and 9.

#### Updates ####

- 2015-06-15
    - added the ability to ignore specific forums
    - fixed: posts weren't ignored on first load
- 2015-06-23
    - changed the initial post set loading mechanism, it's less stuttery and fades in!
- 2015-07-05
    - added a right-aligned mode
- 2015-07-09
    - added a split-view mode (only run one script at a time)

## Modifications ##

- the ability to ignore specific forums
- hide the 'event column'
- hide the column headers and the description
- added the timestamp to the now first column so that it's floated in the top right corner
- fixed up some CSS issues in the smaller width modes
- posts you make will be highlighted in green
- new threads will get a green tag next to the thread title
- first batch of posts won't slide in one by one - they fade in all at once
- added in a right-aligned mode (checkbox below ignore forum text input, bottom of page)
- added a separate script for a split screen view

## Installation ##

1. Make sure you have the userscript extension installed
    - Safari
        - download and install [Tampermonkey](http://tampermonkey.net/?browser=safari) extension
    - Chrome
        - add [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en) to Chrome
    - Firefox
        - install [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)
2. Click on this link '[enhanced.user.js](https://github.com/sammich/macrumors-spy-mod/raw/master/enhanced.user.js)' (or click the link)
3. Click on the 'Install' button
4. Refresh [MR Spy](http://forums.macrumors.com/spy/)
5. Enjoy!
