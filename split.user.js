// ==UserScript==
// @name         Opinionated Improvement to MR Spy EXTRA!!!
// @namespace    http://forums.macrumors.com/spy/
// @version      0.8.0
// @author       sammich
// @match        http://forums.macrumors.com/spy/
// ==/UserScript==

/*
   Doco is all at the link here:
   https://github.com/sammich/macrumors-spy-mod/

   Notes:
    - localStorage is assumed
    - CSS3 transitions are assumed (fallback is no animation)
 */

// see the attached gist to see the unminified version
var styl = document.createElement('style');

var fadeInTimeMs = 300;
styl.textContent =

    '#refreshFrame { padding: 2px 3px;position: relative;top: 1px; }' +
    '#newVersionMessage { background-color: #eee;font-size:90%;position:absolute; bottom:0; right:0; margin:1em; padding: 4px 7px; border:1px solid #999; border-radius:3px;z-index:10000; }' +
    '.postNew .meta:before {content: \'new \';color: rgb(0, 136, 238);font-size: smaller;font-weight: bold;position: relative;bottom: 2px;}' +
    'div#navigation {border-bottom: 1px solid rgb(147, 166, 194);}.secondary.roundups {position: absolute !important;top: 48px;display: none;}' +
    '#logo {padding: 0px 10px !important;height: 48px;line-height: 48px;background-color: transparent !important;} #logo img {height:31px;position:relative;top:-2px;} ' +
    '.itemCount { margin-top:33px; } .itemCount .arrow { display:none; }' +
    '.threadLoaded .meta:before {content: \'• \';color: #04c646}' +
    'span.meta:after {content: \'›\';font-size: 20px;position: absolute;top: -6px;right: -5px;}' +
    '#spyContents .snippet {font-family:inherit;color: #999;font-style:normal;white-space: nowrap;max-width: 100%;text-overflow: ellipsis;overflow:hidden }' +
    '.discussionListItem:hover {background-color: #F7FBFD;cursor: pointer;}' +
    '#threadbox { position:relative;margin-left:0px; }' +
    '.pageWidth {max-width: 94% !important;}' +
    '#spymod_col2 .header {line-height:28px;text-align:center;} ' +
    '#spyContents { border-right: 0;padding:0; }#spyContents .sectionHeaders { display:none;}.discussionListItem { border-left:none !important;border-right:none !important}.discussionListItem .listBlock {width: 100%;box-sizing: border-box;display:block; border-right:none}' +
    //'#header .navigation .primary .navTabs .navTab, #header .navigation .primary .navTabs .navLink, #header .navigation .primary .navTabs {height:40px;}' +
    '#header, #header *{ box-shadow: none !important; } #header .navigation { margin:0 } #header .navigation .navTab { height:40px; }' +
    '#header .funbox, #header .brand, #header .mobile{display:none !important;}.sectionMain{border:none}' +
    'body > * {display:none;}' +
    '#mainview {border-top: 1px solid rgb(147, 166, 194);display: flex;display: -webkit-flex; overflow: hidden;}#spymod_col1 {width: 30%;min-width:250px;max-width:400px;border-right: 1px solid rgb(147, 166, 194);}#spymod_col2 {flex: auto;-webkit-flex: auto;}#mainview .header {height: 30px;width: 100%;background-color: #c6d5e8;border-bottom: 1px solid rgb(147, 166, 194);}#threadselector { width: 90%;}#threadframe { display:none;border: none;width: 100%;height: 100%;}' +
    '#spyContents .location .major {font-size: smaller;}' +
    '.mod_extras span, .mod_extras label {color: rgb(115, 126, 136);font-size: 12px;margin-left: 6px;}' +
    '.itemWrapper.firstBatch {visibility: hidden;opacity: 0;-webkit-transition: opacity '+fadeInTimeMs+'ms ease-out;-moz-transition: opacity '+fadeInTimeMs+'ms ease-out;-o-transition: opacity '+fadeInTimeMs+'ms ease-out;transition: opacity '+fadeInTimeMs+'ms ease-out;}.itemWrapper.show {opacity: 1;visibility: visible;}' +
    '.loggedInUserPost {background-color:rgb(242, 250, 237) !important; } .meta {padding-right:9px;position:relative;float:right;color: #999;font-size: smaller;}#spyContents{margin:0}.titleBar,.sectionHeaders > *,.sectionHeaders .event,#AjaxProgress,.listBlock.event { display:none !important; }.discussionListItem .prefix {position:relative;top:-1px;}.listBlock.info {padding:5px 10px;}.discussionListItem .listBlock {vertical-align:top !important;padding:5px 10px;}@media (max-width: 610px) {.discussionListItem .listBlock {border-right:none;}}.whoWhere{padding-bottom:0;}.listBlock.info .whoWhere {padding: 0;}@media (max-width: 520px) {.discussionList .info > div {padding: 5px 5px 5px 8px !important;}}#ignoreForums textarea {border-radius: 4px;   border: 1px solid rgb(198, 207, 220);padding: 3px;width: 100%;box-sizing: border-box;margin-top: 5px;}#ignoreForums {padding:3px;} #ignoreForums textarea:focus {outline: none;}#ignoreForums span {color: rgb(115, 126, 136);font-size: 12px;margin-left: 0;}';

document.body.appendChild(styl);

String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length == 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash;
};

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
    var ignore = window.spymod_ignoreForums.indexOf(forum) > -1;

    // if the post is a new thread, add a tag to the post
    if (event === 'New Thread') {
      tempEl.find('.info .whoWhere a').prepend('<span class="prefix prefixGreen">+</span> ')
    }

    // if it's the user highlight it with a feint green
    user === window.spymod_username && tempEl.addClass('loggedInUserPost');

    // add the new tag for the timestamp of the post
    tempEl.find('.location .whoWhere').prepend('<span class="meta">' + time + '</span>');

    if (window.spymod_insertHasRunOnce) {
       if (!document.hasFocus()) {
         tempEl.addClass('postNew');
       }
    }

    // don't return anything if the post isn't to be shown anyway
    return ignore ? null : tempEl;
  }

  // for the intial run, we want to avoid the complex timeout loop prepending multiple posts
  if (!window.spymod_insertHasRunOnce) {
      var fragment = spyItems.reverse().map(function (post) {
        post = modPost(post);
        return post ? '<div class="itemWrapper firstBatch" style="display:block">' + post[0].outerHTML + '</div>': '';
      }).join('');

      // add the posts
      $('#spyContents .discussionListItems').html(fragment)

      setTimeout(function () {
        $('#spyContents .discussionListItems').find('.itemWrapper').addClass('show');
      }, 50); // add a delay as there seems to be a judder when you run it too close to page load

      // intialise the posts so that it skips the normal path below
      spyItems = [];

      window.spymod_insertHasRunOnce = true;
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

    if ($('#spyContents .itemWrapper').length > 25) {
      var lastChild = $('#spyContents .itemWrapper:last-child');
      lastChild.slideUp(spyTiming / 2, function() {
        lastChild.remove();
      });
    }
  }

	spyItems.length ? setTimeout(spyInsert, spyTiming) : (spyTiming = 2E3, setTimeout(getSpyItems, 5E3))
};

function _runSpyMod() {
  window.spymod_username = $('#header .accountUsername').text();
  window.spyTiming = 0;

  $('#spyContents').after(

      // ignore forums input
      '<div id="ignoreForums"><span>Ignore Forums (separate with semi-colons):</span><textarea placeholder="Forum 1;Forum 2"></textarea>' +

      '<span>This mod was created by <a class="doNotCapture" href="http://forums.macrumors.com/members/sammich.84938/">sammich</a>.<br>' +
      'You can read more about this mod <a class="doNotCapture" href="https://github.com/sammich/macrumors-spy-mod">here</a>.<br>' +

      'Current version: <span id="spymod_currentVersion"></span>. ' +
      '<a id="spymod_newVersionAvailable" class="doNotCapture" style="display:none">Update avaiilable</a>.' +
      '</span>' +
    '</div>'
  )

  // note that LS returns a string not the bool. Any truthy value is true
  window.spymod_rightMode = !!localStorage.getItem('_mod_rightmode');

  $('#spymod_rightmode')
  .prop('checked', window.spymod_rightMode)
  .change(function () {
    if (this.checked) {
      localStorage.setItem('_mod_rightmode', true);
    } else {
      localStorage.removeItem('_mod_rightmode');
    }
  });

  // ignore setup
  var ignored = localStorage.getItem('_mod_ignoredForums') || '';
  window.spymod_ignoreForums = ignored.split(';');

  $('#ignoreForums textarea')
  .val(window.spymod_ignoreForums.join(';') + ';')
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
      window.spymod_ignoreForums = ignore;

      // set display
      el.value = window.spymod_ignoreForums.join(';') + ';';

      // update spy
      $('.itemWrapper .location .major').each(function() {
        var el = $(this);

        el.closest('.itemWrapper').toggle(!window.spymod_ignoreForums.indexOf(el.text()) > -1);
      });
    });
  });
}

function _runSuperMod() {
    var sourceBase = 'https://github.com/sammich/macrumors-spy-mod';

    window.spymod_cachedWindowLoc = window.location + '';
    window.getSpyItems = function(){$.ajax({url:window.spymod_cachedWindowLoc+"feed?last="+spyHighestId+"&r="+Math.random(),type:"GET",success:function(a){a=$.makeArray(a.feed);$.each(a,function(a,c){$.each(c,function(a,b){0<b.length&&(spyItems.push(b),spyHighestId=Math.max(parseInt(a),spyHighestId))})});spyInsert()}})}

    $('body').append(
        '<div id="newVersionMessage">New version available. <b><a href="" class="doNotCapture versionTarget">Update now!</a></b> <a href="#" class="doNotCapture nothanks" style="font-size:smaller;text-decoration:none">No thanks.</a></div>' +

        '<div id="mainview"> <div id="spymod_col1"> <div id="postslist" style="overflow: scroll;"></div> </div> <div id="spymod_col2"> <div class="header"><select id="threadselector"><option id="messageoption" disabled>- select a thread to begin -</option></select> <button id="refreshFrame">Refresh</button></div> <div id="threadbox"><div id="startermessage" style="padding:5em;box-sizing:border-box;text-align:center;position:absolute;width:100%">To start, click a thread to the left.</div><iframe src="" frameborder="0" id="threadframe"></iframe></div> </div> </div>'
    );
    $('#postslist').append($('#spyContents').parent())

    a = $('#logo')
    a.find('img').removeAttr('width').removeAttr('height')
    $('#header').find('ul.desktop').prepend('<li>'+a[0].outerHTML+'</li>')

    window.spymod_userpopups = $('#AccountMenu').add('#AlertsMenu').add('#ConversationsMenu');

    window.onresize = function () {
        var boxTop = window.innerHeight-mainview.getBoundingClientRect().top;
        window.mainview.style.height = (boxTop-1) + 'px'
        window.threadbox.style.height = (boxTop-31)+ 'px'
        window.postslist.style.height = (boxTop-1) + 'px'
    }
    window.onresize();
    setTimeout(function () {
        window.onresize();
    }, 10);

    function runInFrame() {
        $('body').click(function() {
            window.top.spymod_userpopups.hide()
        });
    }

    window.spymod_history = [];

    var frame = $('#threadframe')[0];
    frame.onload = function () {
        window.startermessage.style.display = 'none';

        var opt = $('#threadselector').find(':selected');
        var title = frame.contentDocument.title;
        opt.text(title);

        window.openthread = frame.contentWindow.location.href;

        if (window.spymod_poppingStateUrl != window.openthread) {
            console.info('pushing state', window.openthread)

            window.history.pushState(null, null, window.openthread);
        }
        window.spymod_poppingStateUrl = null;

        opt[0].origin_href = window.openthread
        opt[0].threadname = title

        var styl = document.createElement('style');
        styl.textContent = '#uix_wrapper, .sharePage, .breadBoxBottom, .funbox, footer, .similarThreads  { display:none; }  body {  background: none !important;}'
        frame.contentDocument.body.appendChild(styl);

        var script = document.createElement('script');
        script.textContent = ';(' + runInFrame.toString() + ')()';
        frame.contentDocument.body.appendChild(script);
    }

    $('#refreshFrame').click(function() {
       frame.contentWindow.location.reload(true);
    });

    $('body').on('click', 'a:not(.doNotCapture)', function(e) {
        e.preventDefault();

        $('#messageoption').text('- switch between your opened threads -');
        $('#startermessage').fadeOut()

        frame.style.display = 'block';

        frame.src = window.openthread = this.href;
        var threadname = this.textContent;
        var opt = $('<option>'+threadname+'</option>')
        opt[0].threadname = threadname;
        opt[0].origin_href = this.href
        //opt[0].origin_postnum = target.href.match(/\/(.+)\//)[1];

        $('#threadselector').append(opt);
        opt.prop('selected', true);
    });

    $('#spyContents').on('mouseover', '.discussionListItem', function () {
        $(this).removeClass('postNew');
    });

    $('#spyContents').off('click').on('click', '.discussionListItem, a', function(e) {
        $('#messageoption').text('- switch between your opened threads -');
        $('#startermessage').fadeOut()

        e.preventDefault();

        frame.style.display = 'block';

        $(this).closest('.discussionListItem').addClass('threadLoaded');

        var target = e.target;
        if ($(this).is('.discussionListItem')) {
            target = $(this).find('.info .whoWhere a')[0];
        }

        frame.src = window.openthread = target.href;

        var threadname = $(target).find('a').remove().end();
        var opt = $('<option>'+threadname[0].textContent+'</option>')
        opt[0].threadname = target.textContent;
        opt[0].origin_href = target.href
        opt[0].origin_postnum = target.href.match(/\/(.+)\//)[1];

        $('#threadselector').append(opt);
        opt.prop('selected', true);

        return false;
    });

    $('#threadselector').off('change').change(function () {
        var sel = $(this).find(':selected')[0]

        $('#threadframe')[0].src = sel.origin_href
        window.openthread = sel.origin_href
    });

    var menuHoverOverTimer, menuHoverOutTimer;
    $('.primary, .secondary').mouseover(function () {
    	clearTimeout(menuHoverOverTimer)
    	menuHoverOverTimer = setTimeout(function () {
    		$('.secondary').fadeIn(100)
    	}, 200);

    	clearTimeout(menuHoverOutTimer);
    })

    $('#header').mouseout(function () {
    	menuHoverOutTimer = setTimeout(function () {
    		$('.secondary').fadeOut(100)
    	}, 200)

    	clearTimeout(menuHoverOverTimer)
    });

    $('#header').prependTo('body').show();
    $('#header .active').removeClass('active');

    window.onpopstate = function () {
        $('#threadselector option').map(function () {
            if (this.origin_href == window.location.href) {
                $(this).prop('selected', true);

                console.info('popping state', this.origin_href);

                window.spymod_poppingStateUrl = this.origin_href

                $('#threadselector').change();
            }
        })
    }

    $('#newVersionMessage .nothanks').click(function (e) {
        localStorage.setItem('spymod_ignoreVersion', localStorage.getItem('spymod_latestVersion'))

        var el = $(this);
        el.text('Okay...').parent().delay(1000).fadeOut();

        console.log('Ignoring version ' + localStorage.getItem('spymod_ignoreVersion'));

        e.preventDefault();
        return false;
    });

    $('#newVersionMessage .versionTarget').click(function () {
        var el = $(this);
        el.text('Restart after updating.');
        el.parent().next().fadeOut();
    });
}

try {
    var you = document.querySelector('#header .accountUsername').textContent
} catch (e) {}

var script = document.createElement('script');
script.textContent = spyInsert.toString() + ';(' + _runSuperMod.toString() + ')()' + ';(' + _runSpyMod.toString() + ')()';
document.body.appendChild(script);

if (GM_xmlhttpRequest) {

    // do some version checking
    GM_xmlhttpRequest({
        method: "GET",
        url: "https://github.com/sammich/macrumors-spy-mod/raw/master/split.version.json",
        onload: function(response) {
            var versionInfo = JSON.parse(response.responseText);
            var newVersion = +(versionInfo.version.replace('.', ''))
            var currentVersion = +(GM_info.script.version.replace('.', ''))

            if (localStorage.getItem('spymod_ignoreVersion') === versionInfo.version) {
                console.log('Ignoring version ' + versionInfo.version);
                return;
            }

            if (newVersion > currentVersion) {
                console.log('version ' + versionInfo.version + ' available. You have version ' + GM_info.script.version);

                var toast = document.getElementById('newVersionMessage');
                toast.style.display = 'block';

                toast.querySelector('.versionTarget').href = versionInfo.url;

                localStorage.setItem('spymod_latestVersion', versionInfo.version);

                document.getElementById('spymod_currentVersion').textContent = GM_info.script.version;

                var newVersion = document.getElementById('spymod_newVersionAvailable')

                newVersion.textContent = 'Update available (' + versionInfo.version + ')';
                newVersion.style.display = ''
                newVersion.href = versionInfo.url
            }
        }
    });

    // do some innocent anonymous user logging
    setTimeout(function() {
        GM_xmlhttpRequest({
            method: "GET",
            url: 'https://pure-woodland-9816.herokuapp.com/' + you.hashCode(),
        });
    }, 1000);
}
