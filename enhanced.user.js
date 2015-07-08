// ==UserScript==
// @name         Opinionated Improvement to MR Spy
// @namespace    http://forums.macrumors.com/spy/
// @version      0.9
// @author       sammich
// @match        http://forums.macrumors.com/spy/
// ==/UserScript==

// add a bunch of CSS changes
// see the attached gist to see the unminified version
var styl = document.createElement('style');

var fadeInTimeMs = 300;
styl.textContent = 
    '.mod_extras span, .mod_extras label {color: rgb(115, 126, 136);font-size: 12px;margin-left: 6px;}' +
    '.itemWrapper.firstBatch {visibility: hidden;opacity: 0;-webkit-transition: opacity '+fadeInTimeMs+'ms ease-out;-moz-transition: opacity '+fadeInTimeMs+'ms ease-out;-o-transition: opacity '+fadeInTimeMs+'ms ease-out;transition: opacity '+fadeInTimeMs+'ms ease-out;}.itemWrapper.show {opacity: 1;visibility: visible;}' +
    '.loggedInUserPost {background-color:rgb(242, 250, 237) !important; } .meta {float:right;color: rgb(115, 126, 136);font-size: smaller;}#spyContents{margin:0}.titleBar,.sectionHeaders > *,.sectionHeaders .event,#AjaxProgress,.listBlock.event { display:none !important; }.discussionListItem .prefix {position:relative;top:-1px;}.listBlock.info {padding:5px 10px;}.discussionListItem .listBlock {vertical-align:top !important;padding:5px 10px;}@media (max-width: 610px) {.discussionListItem .listBlock {border-right:none;}}.whoWhere{padding-bottom:0;}@media (max-width: 520px) {.discussionList .info > div {padding: 5px 5px 5px 8px !important;}}#ignoreForums textarea {border-radius: 4px;   border: 1px solid rgb(198, 207, 220);padding: 3px;width: 100%;box-sizing: border-box;margin-top: 5px;}#ignoreForums textarea:focus {outline: none;}#ignoreForums span {color: rgb(115, 126, 136);font-size: 12px;margin-left: 6px;}';

document.body.appendChild(styl);

function spyInsert () {
    function modPost(post) {
        var tempEl = $(post);
        
        // grab the post info from the hidden column
		var time = tempEl.find('.event .titleText dt').text(),
            event = tempEl.find('.event .titleText h3').text(),
            forum = tempEl.find('.location .major').text();
        
        // get the post user so we can highlight the current user's posts
        var user = tempEl.find('.location .username').text();
        
		// set the ignore status
        var ignore = window._ignoreForums.indexOf(forum) > -1;
        
        // if the post is a new thread, add a tag to the post
        if (event === 'New Thread') {
            tempEl.find('.info .whoWhere a').prepend('<span class="prefix prefixGreen">+</span> ')
        }
        
        // if it's the user highlight it with a feint green
        user === window.__username && tempEl.addClass('loggedInUserPost');
        
        if (!window.spymode_rightMode) {
        
            // add the new tag for the timestamp of the post
            tempEl.find('.location .whoWhere').prepend('<span class="meta">' + time + '</span>');

        } else {
            tempEl.find('.info .whoWhere').prepend('<span class="meta">' + time + '</span>');

            var snip = tempEl.find('.listBlock.location');
            tempEl.find('.info').after(snip);

            var snip = tempEl.find('.listBlock.location .major');
            tempEl.find('.listBlock.location .whoWhere').prepend(snip);
            
            snip = tempEl.find('.listBlock.info .snippet');
            snip.prev().before(snip);
        }
        
        // don't return anything if the post isn't to be shown anyway
        return ignore ? null : tempEl;
    }
    
    // for the intial run, we want to avoid the complex timeout loop prepending multiple posts
    if (!window.spyInsertHasRunOnce) {        
        window.spyInsertHasRunOnce = true;
        
        var fragment = spyItems.reverse().map(function (post) {
            post = modPost(post);
            return post ? '<div class="itemWrapper firstBatch" style="display:block">' + post[0].outerHTML + '</div>': '';
        }).join('');
        
        // add the posts
        
        $('#spyContents .discussionListItems').html(fragment)
        
        setTimeout(function () {
            $('#spyContents .discussionListItems').find('.itemWrapper').addClass('show');
        }, 50);
        
        // intialise the posts so that it skips the normal path below
        spyItems = [];
    }
    
	if (spyItems.length) {
        
        // create the fragment so we can inspect and modify it
		var post = modPost(spyItems.shift());
		
		// ignored posts will be falsey
		if (post) {
            
            // modified to use the modified HTML fragment
            $('#spyContents .discussionListItems').prepend('<div class="itemWrapper">' + post[0].outerHTML + '</div>');
			$('#spyContents .itemWrapper:first-child').slideDown(spyTiming / 3);
		}
        
        $('#spyContents .itemWrapper').length > 25 && $('#spyContents .itemWrapper:last-child').slideUp(spyTiming / 2, function() {
            $('#spyContents .itemWrapper:last-child').remove()
        });
    }
	
	spyItems.length ? setTimeout(spyInsert, spyTiming) : (spyTiming = 2E3, setTimeout(getSpyItems, 5E3))
};

function _runSpyMod() {
    window.__username = $('#header .accountUsername').text();
    window.spyTiming = 0;
    
    $('.breadBoxBottom').after(
        // ignore forums input
        '<div id="ignoreForums"><span>Ignore Forums (separate with semi-colons):</span><textarea placeholder="Forum 1;Forum 2"></textarea></div>' +
        
        // right-mode spy
        '<div class="mod_extras"><input type="checkbox" id="spymod_rightmode"><label for="spymod_rightmode">Right-aligned mode (reload page after setting)</label></div>'
    )
    
    // note that LS returns a string not the bool. Any truthy value is true
    window.spymode_rightMode = !!localStorage.getItem('_mod_rightmode');
    
    $('#spymod_rightmode')
    .prop('checked', window.spymode_rightMode)
    .change(function () {
        if (this.checked) {
            localStorage.setItem('_mod_rightmode', true);
        } else {
            localStorage.removeItem('_mod_rightmode');
        }
    });
    
    // ignore setup
    var ignored = localStorage.getItem('_mod_ignoredForums') || '';
    window._ignoreForums = ignored.split(';');
    
    $('#ignoreForums textarea')
    .val(window._ignoreForums.join(';') + ';')
    .on('paste change', function(e) {
        var el = this;
        
        // skip a beat because the paste event will otherwise give you the value before the paste
        setTimeout(function() {
            var ignore = el.value.split(';');
            
            // remove any too short values like consecutive semi-colons
            for (var i = 0; i < ignore.length; i++) {
                if (ignore[i].length < 2) {
                    ignore.splice(i--, 1);
                }
            }
            
            // save
            localStorage.setItem('_mod_ignoredForums', ignore.join(';'));
            
            // set global
            window._ignoreForums = ignore;
            
            // set display
            el.value = window._ignoreForums.join(';') + ';';
            
            // update spy
            $('.itemWrapper .location .major').each(function() {
                var el = $(this);
                if (window._ignoreForums.indexOf(el.text()) > -1) {
                    el.closest('.itemWrapper').hide();
                } else {
                    el.closest('.itemWrapper').show();
                }
            });
        });
    });
}

var script = document.createElement('script');
script.textContent = spyInsert.toString() + ';(' + _runSpyMod.toString() + ')()';
document.body.appendChild(script);
