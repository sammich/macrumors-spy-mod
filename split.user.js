// ==UserScript==
// @name         Opinionated Improvement to MR Spy EXTRA!!!
// @namespace    http://forums.macrumors.com/spy/
// @version      0.5.3
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
    '.threadLoaded .meta:before {content: \'• \';color: #04c646}' +
    'span.meta:after {content: \'›\';font-size: 20px;position: absolute;top: -6px;right: -5px;}' +
    '#spyContents .discussionListItems .itemWrapper .snippet {font-family:inherit;color: #999;font-style:normal; }' +
    '.discussionListItem:hover {background-color: #F7FBFD;cursor: pointer;}' +
    '#threadbox { position:relative;margin-left:1px; }' +
    '.pageWidth {max-width: 94% !important;}' +
    '#spymod_col2 .header {line-height:38px;text-align:center;} ' +
    '#spyContents { border-right: 0;padding:0; }#spyContents .sectionHeaders { display:none;}.discussionListItem { border-left:none !important;border-right:none !important}.discussionListItem .listBlock {width: 100%;box-sizing: border-box;display:block; border-right:none}' +
    '#header .navigation .primary .navTabs .navTab, #header .navigation .primary .navTabs .navLink, #header .navigation .primary .navTabs {height:40px;}' +
    '#header, #header *{ box-shadow: none !important; } #header .navigation { margin:0 } #header .navigation .navTab { height:40px; }' +
    '#header .funbox, #header .brand , #header .secondary, #header .desktop, #header .mobile{display:none !important;}.sectionMain{border:none}' +
    'body > * {display:none;}' +
    '#mainview {display: flex;-webkit-flex: auto; overflow: hidden;}#spymod_col1 {width: 30%;min-width:250px;max-width:400px;border-right: 1px solid rgb(147, 166, 194);}#spymod_col2 {flex: auto;-webkit-flex: auto;}#mainview .header {height: 40px;width: 100%;background-color: #c6d5e8;border-bottom: 1px solid rgb(147, 166, 194);}#threadselector { width: 96%%;}#threadframe { display:none;border: none;width: 100%;height: 100%;}' +
    '#spyContents .location .major {font-size: smaller;}' +
    '.mod_extras span, .mod_extras label {color: rgb(115, 126, 136);font-size: 12px;margin-left: 6px;}' +
    '.itemWrapper.firstBatch {visibility: hidden;opacity: 0;-webkit-transition: opacity '+fadeInTimeMs+'ms ease-out;-moz-transition: opacity '+fadeInTimeMs+'ms ease-out;-o-transition: opacity '+fadeInTimeMs+'ms ease-out;transition: opacity '+fadeInTimeMs+'ms ease-out;}.itemWrapper.show {opacity: 1;visibility: visible;}' +
    '.loggedInUserPost {background-color:rgb(242, 250, 237) !important; } .meta {padding-right:9px;position:relative;float:right;color: #999;font-size: smaller;}#spyContents{margin:0}.titleBar,.sectionHeaders > *,.sectionHeaders .event,#AjaxProgress,.listBlock.event { display:none !important; }.discussionListItem .prefix {position:relative;top:-1px;}.listBlock.info {padding:5px 10px;}.discussionListItem .listBlock {vertical-align:top !important;padding:5px 10px;}@media (max-width: 610px) {.discussionListItem .listBlock {border-right:none;}}.whoWhere{padding-bottom:0;}.listBlock.info .whoWhere {padding: 0;}@media (max-width: 520px) {.discussionList .info > div {padding: 5px 5px 5px 8px !important;}}#ignoreForums textarea {border-radius: 4px;   border: 1px solid rgb(198, 207, 220);padding: 3px;width: 100%;box-sizing: border-box;margin-top: 5px;}#ignoreForums textarea:focus {outline: none;}#ignoreForums span {color: rgb(115, 126, 136);font-size: 12px;margin-left: 6px;}';

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
    var ignore = window.spymod_ignoreForums.indexOf(forum) > -1;

    // if the post is a new thread, add a tag to the post
    if (event === 'New Thread') {
      tempEl.find('.info .whoWhere a').prepend('<span class="prefix prefixGreen">+</span> ')
    }

    // if it's the user highlight it with a feint green
    user === window.spymod_username && tempEl.addClass('loggedInUserPost');

    if (!window.spymod_rightMode) {

      // add the new tag for the timestamp of the post
      tempEl.find('.location .whoWhere').prepend('<span class="meta">' + time + '</span>');
    } else {
      tempEl.find('.info .whoWhere').prepend('<span class="meta">' + time + '</span>');

      var snip = tempEl.find('.listBlock.location');
      tempEl.find('.info').after(snip);

      snip = tempEl.find('.listBlock.location .major');
      tempEl.find('.listBlock.location .whoWhere').prepend(snip);

      //snip = tempEl.find('.listBlock.info .snippet');
      //snip.prev().before(snip);
    }

    // don't return anything if the post isn't to be shown anyway
    return ignore ? null : tempEl;
  }

  // for the intial run, we want to avoid the complex timeout loop prepending multiple posts
  if (!window.spymod_insertHasRunOnce) {
      window.spymod_insertHasRunOnce = true;

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
    '<div id="ignoreForums"><span>Ignore Forums (separate with semi-colons):</span><textarea placeholder="Forum 1;Forum 2"></textarea></div>' +

    // right-mode spy
    '<div class="mod_extras"><input type="checkbox" id="spymod_rightmode"><label for="spymod_rightmode">Right-aligned mode (reload page after setting)</label></div>'
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
    $('body').append('<div id="mainview"> <div id="spymod_col1"> <div class="header"></div> <div id="postslist" style="overflow: scroll;"></div> </div> <div id="spymod_col2"> <div class="header"><select id="threadselector"><option id="messageoption" disabled>- Select a thread to begin -</option></select></div> <div id="threadbox"><div id="startermessage" style="padding:5em;box-sizing:border-box;text-align:center;position:absolute;width:100%">To start, click a thread to the left.</div><iframe src="" frameborder="0" id="threadframe"></iframe></div> </div> </div>');
    $('#postslist').append($('#spyContents').parent())
    window.spymod_userpopups = $('#AccountMenu').add('#AlertsMenu').add('#ConversationsMenu');

    window.onresize = function () {
        window.mainview.style.height = window.innerHeight + 'px'
        window.threadbox.style.height = (window.innerHeight-40)+ 'px'
        window.postslist.style.height = (window.innerHeight-40)+ 'px'
    }
    window.onresize();

    function runInFrame() {
        $('body').click(function() {
            window.top.spymod_userpopups.hide()
        });
    }

    var frame = $('#threadframe')[0];
    frame.onload = function () {
        window.startermessage.style.display = 'none';

        var styl = document.createElement('style');
        styl.textContent = '#uix_wrapper, .sharePage, .breadBoxBottom, .funbox, footer, .similarThreads  { display:none; }'
        frame.contentDocument.body.appendChild(styl);

        var script = document.createElement('script');
        script.textContent = ';(' + runInFrame.toString() + ')()';
        frame.contentDocument.body.appendChild(script);
    }

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
    })

    $('#spymod_col1 .header').append($('#header'))
}

var script = document.createElement('script');
script.textContent = spyInsert.toString() + ';(' + _runSuperMod.toString() + ')()' + ';(' + _runSpyMod.toString() + ')()';
document.body.appendChild(script);
