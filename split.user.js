// ==UserScript==
// @name         Split-view Macrumors Spy
// @namespace    http://forums.macrumors.com/spy/
// @version      0.9.1
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

// CSS to mold/mould the page to our purposes.
var styl = document.createElement('style');
var fadeInTimeMs = 300;
styl.textContent =
  "body { overflow: hidden !important; }" +
  ".postNew .meta:before { position: relative; bottom: 2px; content: 'new '; color: rgb(0, 136, 238); font-size: smaller; font-weight: bold; }" +
  "#navigation { border-bottom: 1px solid rgb(147, 166, 194); }" +
  ".secondary { position: absolute !important; top: 48px; display: none; z-index: 1000; }" +
  "#logo { padding: 0px 10px !important; height: 48px; line-height: 48px; background-color: transparent !important; }" +
  "#logo img { position: relative; top: -2px; height: 31px; }" +
  ".itemCount { margin-top: 33px; }" +
  "body > *, #spyContents .sectionHeaders, #header .funbox, #header .brand, #header .mobile, .itemCount .arrow, .sectionHeaders > *, .sectionHeaders .event { display: none; }" +
  ".titleBar, #AjaxProgress, .listBlock.event { display: none !important; }" +
  "#spyContents { margin: 0; padding: 0; border-right: 0; }" +
  "#spyContents .snippet { max-width: 100%; overflow: hidden; color: #999; font-family: inherit; font-style: normal; white-space: nowrap; text-overflow: ellipsis; }" +
  ".pageWidth { max-width: 94% !important; }" +
  "#header, #header * { box-shadow: none !important; }" +
  "#header .navigation { margin: 0; }" +
  //"#header .secondary { opacity: 0.9; -webkit-transition: opacity 300ms ease-out; -moz-transition: opacity 300ms ease-out; -o-transition: opacity 300ms ease-out; transition: opacity 300ms ease-out; }" +
  "#header .secondary:hover { opacity: 1; }" +

  ".fade-target-300 { display: none; opacity: 0; -webkit-transition: opacity 300ms ease-out; -moz-transition: opacity 300ms ease-out; -o-transition: opacity 300ms ease-out; transition: opacity 300ms ease-out; }" +
  ".fade-in { opacity: 1; }" +
  ".fade-in-90 { opacity: 0.9; }" +

  ".sectionMain { border: none }" +
  ".discussionListItem { border-left: none !important; border-right: none !important }" +
  ".discussionListItem:hover { background-color: #F7FBFD; cursor: pointer; }" +
  ".discussionListItem .listBlock { display: block; width: 100%; box-sizing: border-box; border-right: none; }" +
  ".itemWrapper.firstBatch { visibility: hidden; opacity: 0; -webkit-transition: opacity 300ms ease-out; -moz-transition: opacity 300ms ease-out; -o-transition: opacity 300ms ease-out; transition: opacity 300ms ease-out; }" +
  ".itemWrapper.show { opacity: 1; visibility: visible; }" +
  ".discussionListItem .prefix { position: relative; top: -1px; }" +
  ".discussionListItem .listBlock { vertical-align: top !important; padding: 5px 10px; }" +
  ".whoWhere { padding-bottom: 0; }" +
  ".location .major { font-size: smaller; }" +
  ".listBlock.info { padding: 5px 10px; }" +
  ".listBlock.info .whoWhere { padding: 0; }" +
  "@media (max-width: 610px) { .discussionListItem .listBlock { border-right: none; } }" +
  "@media (max-width: 520px) { .discussionList .info > div { padding: 5px 5px 5px 8px !important; } }" +
  ".threadLoaded .meta:before { content: '• '; color: #04c646; }" +
  ".loggedInUserPost { background-color: rgb(242, 250, 237) !important; }" +
  /* feint text in top corner */
  ".meta { position: relative; float: right; padding-right: 9px; color: #999; font-size: smaller; }" +
  ".meta:after { position: absolute; top: -6px; right: -5px; content: '›'; font-size: 20px; }" +
  /* ignore subforums */
  "#spymod_optionsArea { padding: 3px; }" +
  "#spymod_optionsArea textarea { width: 100%; margin-top: 5px; box-sizing: border-box; border-radius: 4px; border: 1px solid rgb(198, 207, 220); padding: 3px; }" +
  "#spymod_optionsArea textarea:focus { outline: none; }" +
  "#spymod_optionsArea span { margin-left: 0; color: rgb(115, 126, 136); font-size: 12px; }" +
  /* split view structure and contents */
  "#mainview { display: flex; display: -webkit-flex; overflow: hidden; border-top: 1px solid rgb(147, 166, 194); }" +
  "#mainview .header { height: 30px; width: 100%; background-color: #c6d5e8; border-bottom: 1px solid rgb(147, 166, 194); }" +
  "#spymod_col1 { width: 27%; min-width: 220px; max-width: 400px; border-right: 1px solid rgb(147, 166, 194); }" +
  "#spymod_col2 { flex: auto; -webkit-flex: auto; }" +
  "#spymod_col2 .header { text-align: center; line-height: 28px; }" +
  "#threadselector { width: 90%; }" +
  "#threadbox { position: relative; margin-left: 0px; }" +
  ".display-frame { display: none; width: 100%; height: 100%; border: none; position:absolute; top: 0; }" +
  /* button */
  "#refreshFrame { padding: 2px 3px; position: relative; top: 1px; }" +
  /* toast */
  "#newVersionMessage { position: absolute; right: 0; bottom: 0; margin: 1em; padding: 4px 7px; z-index: 10000; border: 1px solid #999; border-radius: 3px; background-color: #eee; font-size: 90%; }" +
  /* no loaded frame message */
  "#startermessage { padding: 5em; box-sizing: border-box; text-align: center; position: absolute; width:100%; }" +
  /* frame loading thing */
  "#frame-loading-message { position: absolute; top: 3em; width: 100%; z-index: 1000; text-align: center; }" +
  "#frame-loading-message span { background-color:rgba(100,100,100,0.78); border-radius:1em; padding:1em; color:white; }" +
  "#loader-frame { opacity: 0; }";

// inject the style tag into our host page
document.body.appendChild(styl);

// hashes a string
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

// this function replaces the one that comes on the host page
function spyInsert() {
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

    // we don't want the initial load of posts to get this tag
    if (window.spymod_insertHasRunOnce) {

      // tag posts while the window isn't in focus
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

    // truncate posts when they get to 25
    if ($('#spyContents .itemWrapper').length > 25) {
      var lastChild = $('#spyContents .itemWrapper:last-child');
      lastChild.slideUp(spyTiming / 2, function() {
        lastChild.remove();
      });
    }
  }

  $('#spyContents .postNew:not(.intented)')
  .addClass('intented')
  .hoverIntent(function () {
    $(this).removeClass('postNew');
  })

	spyItems.length ? setTimeout(spyInsert, spyTiming) : (spyTiming = 2E3, setTimeout(getSpyItems, 5E3))
};

function _run_spymod() {

  // get current logged in username
  window.spymod_username = $('#header .accountUsername').text();

  $('#spyContents').after(

    // ignore forums input
    '<div id="spymod_optionsArea">' +
      '<span>Ignore Forums (separate with semi-colons):</span>' +
      '<textarea placeholder="Forum 1;Forum 2"></textarea>' +

      // self-attribution
      '<span>This mod was created by <a href="http://forums.macrumors.com/members/sammich.84938/">sammich</a>.<br>' +
      'You can read more about this mod <a class="doNotCapture" target="_blank" href="https://github.com/sammich/macrumors-spy-mod">here</a>.<br>' +

      // version info
      'Current version: <span id="spymod_currentVersion"></span>. ' +
      '<a id="spymod_newVersionAvailable" class="doNotCapture" style="display:none">Update avaiilable.</a>' +
      '</span>' +

      // opt out of tracking
      '<br><br><span>' +
        '<input type="checkbox" id="spymod_optOutAnonymousTracking"> ' +
        '<label for="spymod_optOutAnonymousTracking">Opt-out of anonymous tracking</label><br>' +
        'This mod anonymises your username and sends it to a server to see how many users are using it.' +
      '<span>' +
    '</div>'
  )

  $('#spymod_optOutAnonymousTracking').change(function () {
    localStorage.setItem('spymod_optOutAnonymousTracking', this.checked)
  }).prop('checked', localStorage.getItem('spymod_optOutAnonymousTracking') === 'true')

  // setup ignore forum feature                                  get rid of this later
  var ignored = localStorage.getItem('_spymod_ignoredForums') || localStorage.getItem('_mod_ignoredForums') || '';
  window.spymod_ignoreForums = ignored.split(';');

  $('#spymod_optionsArea textarea')
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
        } else {
          ignore[i] = ignore[i].trim();
        }
      }

      // save
      localStorage.setItem('_spymod_ignoredForums', ignore.join(';'));

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

// add the split view behaviour
function _run_buildSplitView() {

  // clicking to open the menu will open the page otherwise
  $('#roundups a').addClass('doNotCapture');

  // repo URL
  var sourceBase = 'https://github.com/sammich/macrumors-spy-mod';

  // grab and save the instance of the XenForo Popup so we can reset it later
  setTimeout(function() {
    window.spymod_alertPopup = $('#AlertsMenu_Counter').closest('li').data('XenForo.PopupMenu');
  }, 1000)

  // cache the url of the window
  // we use pushstate when pages are opened so we reference this when we need fixed URL requests
  window.spymod_cachedWindowLoc = window.location + '';

  // modify the host getSpyItems function to use the location cache
  window.getSpyItems = function(){$.ajax({url:window.spymod_cachedWindowLoc+"feed?last="+spyHighestId+"&r="+Math.random(),type:"GET",success:function(a){a=$.makeArray(a.feed);$.each(a,function(a,c){$.each(c,function(a,b){0<b.length&&(spyItems.push(b),spyHighestId=Math.max(parseInt(a),spyHighestId))})});spyInsert()}})}

  $('body').append(

    // split view elements
    '<div id="mainview">' +
      '<div id="spymod_col1">' +
        '<div id="postslist" style="overflow: scroll;"></div>' +
      '</div>' +
      '<div id="spymod_col2">' +
        '<div class="header">' +
          '<select id="threadselector">' +
            '<option id="messageoption" disabled>- select a thread to begin -</option>' +
          '</select> ' +
          '<button id="refreshFrame" disabled>Refresh</button>' +
        '</div>' +
        '<div id="threadbox">' +
          '<div id="startermessage">To start, click a thread to the left.</div>' +
	      '<div id="frame-loading-message" class="fade-target-300"><span>Loading...</span></div>' +
          '<iframe id="visible-frame" class="display-frame fade-target-300" src="" frameborder="0"></iframe>' +
          '<iframe id="loader-frame" class="display-frame fade-target-300" src="" frameborder="0"></iframe>' +
        '</div>' +
      '</div>' +
    '</div>' +

    // toast-style message popup for new version alert
    '<div id="newVersionMessage">' +
      'New version available. ' +
      '<b>' +
        '<a href="" class="doNotCapture versionTarget">Update now!</a>' +
      '</b>' +
      '<a href="#" class="doNotCapture nothanks" style="font-size:smaller;text-decoration:none">No thanks.</a>' +
    '</div>'
  );

  var refreshControl = $('#refreshFrame'),
    secondary_header = $('.secondary').addClass('fade-target-300'),
	frameLoadMessage = $('#frame-loading-message');

  // split-view panes need this height fixing otherwise overscroll won't work properly
  window.onresize = function () {
    var boxTop = window.innerHeight-mainview.getBoundingClientRect().top;
    window.mainview.style.height = (boxTop-1) + 'px'
    window.threadbox.style.height = (boxTop-31)+ 'px'
    window.postslist.style.height = (boxTop-1) + 'px'
  };

  // skip a beat before running an initial resize
  setTimeout(function () {
    window.onresize();
  }, 10);

  // move the spy container into our left split view pane
  $('#postslist').append($('#spyContents').parent())

  // move navigation menu to the top of the page
  $('#header').prependTo('body').show();

  // 'Forums' navtab will be active by default
  $('#header .active').removeClass('active');

  // move the logo into the main header because otherwise, we'd have no idea it was a MR site!
  // also, it adds some colour to the page
  var logo = $('#logo')
  logo.find('img').removeAttr('width').removeAttr('height')
  $('#header').find('ul.desktop').prepend('<li>'+logo[0].outerHTML+'</li>')

  // cache the popups - these are referred to when we click inside an iFrame
  window.spymod_userpopups = $('#AccountMenu').add('#AlertsMenu').add('#ConversationsMenu');

  // reset the loader every so often when it's not open
  setInterval(function () {
    if (!$('#AlertsMenu').is(':visible')) {
      window.spymod_alertPopup.resetLoader();
    }
  }, 5000);

  // define a function to be run
  function runInFrame() {

    // by default, the popups will close when you click outside of them
    // clicks inside an iFrame don't bubble into the parent frame
    // this simply translates a click into the parent
    $('body').click(function() {
        window.top.spymod_userpopups.hide()
    });

	  /*
    var count = +($('#AlertsMenu_Counter .Total').text());
    var topCount = +(window.top.$('#AlertsMenu_Counter .Total'));

    if (isNaN(count) && !isFinite(count)) count = 0;
    if (isNaN(count) && !isFinite(count)) topCount = 0;

    topCount.text(count + topCount);
    window.top.$('#AlertsMenu_Counter').toggleClass('Zero', count + topCount === 0);
    */

    // when the inner page is loaded, get the alerts counter
    // apply it to the top level spy because the alert counter isn't loaded more than
    // once per page load and they can be missed
    var count = $('#AlertsMenu_Counter .Total').text();
    window.top.$('#AlertsMenu_Counter .Total').text(count);
    window.top.$('#AlertsMenu_Counter').toggleClass('Zero', count === '0');
    window.top.spymod_alertPopup.resetLoader();
  }

  // part of a not yet implemented feature to reload history into the select dropdown
  // window.spymod_history = [];

  var frame = {};

  Object.defineProperty(frame, 'viewer', {
    get: function() {
      return $('#visible-frame')[0];
    }
  });
  Object.defineProperty(frame, 'loader', {
    get: function() {
      return $('#loader-frame')[0];
    }
  });
  frame.swap = function () {
    var v = frame.viewer,
      l = frame.loader;

      v.id = 'loader-frame';
      l.id = 'visible-frame';

      $(v).removeClass('fade-in');
      setTimeout(function () {
        $(v).hide()
      }, 300);

      $(l).show()
      setTimeout(function () {
        $(l).addClass('fade-in');
      }, 10);

      window.blah = l;
  };

  // when the frame is loaded, do something...
  function onFrameLoad() {

    // hide the initial message
    window.startermessage.style.display = 'none';
	
	frameLoadMessage.removeClass('fade-in');
	setTimeout(function () {
	  frameLoadMessage.hide();
	}, 300);

    // only available when it's loaded
    refreshControl.prop('disabled', false);

    // pull the title from the inner frame and update the current option text to match it
    var opt = $('#threadselector').find(':selected');
    var title = frame.loader.contentDocument.title;
    opt.text(title);

    window.openthread = frame.loader.contentWindow.location.href;

    // push the state so we can use the browser back to view a previous thread
    // this is a little buggy when hashes are followed inside the inner frame
    if (window.spymod_poppingStateUrl != window.openthread) {
      //console.info('pushing state', window.openthread)

      window.history.pushState(null, null, window.openthread);
    }

    // try not push a state when we're going back history
    // buggy
    window.spymod_poppingStateUrl = null;

    opt[0].origin_href = window.openthread
    opt[0].threadname = title

    // inject some CSS into the inner page to remove headers and footers
    var styl = document.createElement('style');
    styl.textContent = '#uix_wrapper, .sharePage, .breadBoxBottom, .funbox, footer, .similarThreads  { display:none; }  body {  background: none !important;}'
    frame.loader.contentDocument.body.appendChild(styl);

    // inject a function into the page to be run
    var script = document.createElement('script');
    script.textContent = ';(' + runInFrame.toString() + ')()';
    frame.loader.contentDocument.body.appendChild(script);

    // swap frames
    frame.swap();
  }
  
  frame.loader.onload = onFrameLoad;
  frame.viewer.onload = onFrameLoad;

  // refresh the frame when the button is click, but only when the src is defined
  refreshControl.click(function() {
    var url = frame.getAttribute('src');
    if (url) {
      frame.src = url;
    }
  });

  // handles links clicked on
  function openLinkInFrame(e, el) {
    e.preventDefault();

    $('#messageoption').text('- switch between your opened threads -');
    $('#startermessage').fadeOut()

    loadUrlIntoFrame(el.href);

    var threadname = el.textContent;
    var opt = $('<option>'+threadname+'</option>')
    opt[0].threadname = threadname;
    opt[0].origin_href = el.href
    //opt[0].origin_postnum = target.href.match(/\/(.+)\//)[1];

	frameLoadMessage.find('span').text('Loading: ' + threadname);
	
    $('#threadselector').append(opt);
    opt.prop('selected', true);

    return false;
  }

  function loadUrlIntoFrame(url) {
    frame.viewer.style.display = 'block';

    // can't refresh if the page hasn't loaded
    refreshControl.prop('disabled', true);

	frameLoadMessage.show()
	setTimeout(function () {
	  frameLoadMessage.addClass('fade-in');
	}, 10);
	
    window.openthread = url;
    frame.loader.src = url;
  }

  // click handler to intercept all links
  // open them in our frame
  $('body').on('click', 'a:not(.doNotCapture)', function(e) {
    return openLinkInFrame(e, this);
  });

  $('#spyContents').off('click').on('click', '.discussionListItem, a', function(e) {
    var $el = $(this);
    $el.closest('.discussionListItem').addClass('threadLoaded');

    var target = e.target;
    if ($el.is('.discussionListItem')) {
      target = $el.find('.info .whoWhere a')[0];
    }

    // strip the tags from the element
    var target = $(target.outerHTML).find('span').remove().end()[0];

    return openLinkInFrame(e, target);
  });

  $('#threadselector').change(function () {
    var sel = $(this).find(':selected')[0];

    loadUrlIntoFrame(sel.origin_href);
  });

  $('#header').hoverIntent(
    function () {
      secondary_header.show()

      setTimeout(function () {
        secondary_header.addClass('fade-in-90');
    	},10);
    },
    function () {
      secondary_header.removeClass('fade-in-90');
      setTimeout(function () {
        secondary_header.hide();
      }, 300);
    }
  );

  window.onpopstate = function () {
    $('#threadselector option').map(function () {
      if (this.origin_href == window.location.href) {
        $(this).prop('selected', true);

        window.spymod_poppingStateUrl = this.origin_href;

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
    el.text('Refresh after updating.');
    el.parent().next().fadeOut();
  });
}

try {
  var you = document.querySelector('#header .accountUsername').textContent
} catch (e) {}

var __hoverIntent = '!function(e){"use strict";"function"==typeof define&&define.amd?define(["jquery"],e):jQuery&&e(jQuery)}(function(e){"use strict";var t,n,o={interval:100,sensitivity:6,timeout:0},i=0,r=function(e){t=e.pageX,n=e.pageY},u=function(e,o,i,v){return Math.sqrt((i.pX-t)*(i.pX-t)+(i.pY-n)*(i.pY-n))<v.sensitivity?(o.off("mousemove.hoverIntent"+i.namespace,r),delete i.timeoutId,i.isActive=!0,delete i.pX,delete i.pY,v.over.apply(o[0],[e])):(i.pX=t,i.pY=n,i.timeoutId=setTimeout(function(){u(e,o,i,v)},v.interval),void 0)},v=function(e,t,n,o){return delete t.data("hoverIntent")[n.id],o.apply(t[0],[e])};e.fn.hoverIntent=function(t,n,s){var a=i++,d=e.extend({},o);d=e.isPlainObject(t)?e.extend(d,t):e.isFunction(n)?e.extend(d,{over:t,out:n,selector:s}):e.extend(d,{over:t,out:t,selector:n});var m=function(t){var n=e.extend({},t),o=e(this),i=o.data("hoverIntent");i||o.data("hoverIntent",i={});var s=i[a];s||(i[a]=s={id:a}),s.timeoutId&&(s.timeoutId=clearTimeout(s.timeoutId));var m=s.namespace=".hoverIntent"+a;if("mouseenter"===t.type){if(s.isActive)return;s.pX=n.pageX,s.pY=n.pageY,o.on("mousemove.hoverIntent"+m,r),s.timeoutId=setTimeout(function(){u(n,o,s,d)},d.interval)}else{if(!s.isActive)return;o.off("mousemove.hoverIntent"+m,r),s.timeoutId=setTimeout(function(){v(n,o,s,d.out)},d.timeout)}};return this.on({"mouseenter.hoverIntent":m,"mouseleave.hoverIntent":m},d.selector)}});';

var script = document.createElement('script');
script.textContent = spyInsert.toString() + ';(' + _run_buildSplitView.toString() + ')()' + ';(' + _run_spymod.toString() + ')();' + __hoverIntent;
document.body.appendChild(script);

//
// Greasemonkey Dependant code
//
if (GM_xmlhttpRequest) {
  document.getElementById('spymod_currentVersion').textContent = GM_info.script.version;

  // do some version checking
  GM_xmlhttpRequest({
    method: 'GET',
    url: 'https://github.com/sammich/macrumors-spy-mod/raw/master/split.version.json',
    onload: function(response) {
      var versionInfo = JSON.parse(response.responseText);
      var newVersion = +(versionInfo.version.replace('.', ''))
      var currentVersion = +(GM_info.script.version.replace('.', ''))

      if (localStorage.getItem('spymod_ignoreVersion') === versionInfo.version) {
        console.log('Ignoring version ' + versionInfo.version);
        return;
      }

      //console.log('Latest version: ' + versionInfo.version);

      if (newVersion > currentVersion) {
        console.log('version ' + versionInfo.version + ' available. You have version ' + GM_info.script.version);

        var toast = document.getElementById('newVersionMessage');
        toast.style.display = 'block';

        toast.querySelector('.versionTarget').href = versionInfo.url;

        localStorage.setItem('spymod_latestVersion', versionInfo.version);

        var newVersion = document.getElementById('spymod_newVersionAvailable');

        newVersion.textContent = 'Update available (' + versionInfo.version + ')';
        newVersion.style.display = ''
        newVersion.href = versionInfo.url
      }
    }
  });

  // do some innocent anonymous user logging
  if (you && localStorage.getItem('spymod_optOutAnonymousTracking') !== 'true') {
    setTimeout(function() {
      GM_xmlhttpRequest({
        method: "GET",
        url: 'https://pure-woodland-9816.herokuapp.com/' + you.hashCode()
      });
    }, 1000);
  }
}
