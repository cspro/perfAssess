/*=================================================*/
/*== Application ==================================*/
/*=================================================*/

var pageIds = null; // Array of string ids, which are also HTML filenames
var currPageNum = 0; // Index of current pageId in array
var menuLinks = null;
var cache = {
	// If url is '' (no fragment), display this div's content.
	'' : $('.content-default')
};
var isBrainsharkPlaying = false;  

//TODO: Move this out to config file, load in using require.js
var hashPrefix = '?page=';
var debugHistory = false;
brainsharkURLs = {
	'home'       : 'http://www.brainshark.com/pearsonschool/vu?pi=zGOze1mO1zBy4Rz0',
	'scrtei'     : 'http://www.brainshark.com/pearsonschool/vu?pi=zHMz3tdeNzBy4Rz0&intk=367046328',
	'essays'     : 'http://www.brainshark.com/pearsonschool/vu?pi=zGDzd3VV5zBy4Rz0&intk=276408450',
	'tasks'      : 'http://www.brainshark.com/pearsonschool/vu?pi=zFJzBQeIzBy4Rz0&intk=214276015',
	'demos'      : 'http://www.brainshark.com/pearsonschool/vu?pi=zHSzDRRkqzBy4Rz0&intk=923989530',
	'projects'   : 'http://www.brainshark.com/pearsonschool/vu?pi=zHoz162vWtzBy4Rz0',
	'portfolios' : 'http://www.brainshark.com/pearsonschool/vu?pi=zI5zwqEnOzBy4Rz0&intk=145361535',
	'games'      : 'http://www.brainshark.com/pearsonschool/vu?pi=zI4zLplZgzBy4Rz0&intk=432524160',
	'default'    : 'http://www.brainshark.com/pearsonschool/vu?pi=zHoz162vWtzBy4Rz0'
};

brainsharkURLSuffix = '&dm=5&pause=1&nrs=1';

/*=================================================*/
/*== Navigation Menu ==============================*/
/*=================================================*/

function getPageIdFromJElem(jelem) {
	var pageId = jelem.attr('href').replace('#', '');
	return pageId;
}

function initMenu() {
	pageIds = [];
	menuLinks = $('.menulink');
	menuLinks.each(function(index, elem) {
		var jelem = $(elem);
		var pageId = getPageIdFromJElem(jelem);
		pageIds.push(pageId);
		jelem.click(pageId, onNavClick);
	});
	$('html').click(function() {
		closeMenu(); // Clicking anywhere outside the menu closes the menu
	});
	$('#menuButton').click(onMenuButtonClick);
}

function onMenuButtonClick(e) {
	e.stopPropagation(); // Prevent html-level click handler
	$('#menuList').toggleClass('closed');
	$('#menuButton').toggleClass('open');
	return false;
}

function closeMenu() {
	$('#menuList').addClass('closed');
	$('#menuButton').removeClass('open');
}

function onNavClick(e) {
	var pageId = e.data;
	changeHistoryState(pageId);
	return false;
}

function setMenuState(currPageId) {
	menuLinks.each(function(index, elem) {
		var jelem = $(elem);
		var pageId = getPageIdFromJElem(jelem);
		if (pageId != currPageId) {
			jelem.removeClass('currentPage');
		} else {
			jelem.addClass('currentPage');
		}
	});
}

/*=================================================*/
/*== Footer Page Nav ==============================*/
/*=================================================*/

function loadPageNum(pageNum) {
	if (pageIds) {
		if (pageIds.length >= pageNum) {
			var pageId = pageIds[pageNum];
		} else {
			pageId = pageIds[0];
		}
		changeHistoryState(pageId);
	} else {
		throw new Error("Pages not loaded.");
	}
}

function initPageNav() {
	// Pass encapsulated actions to each button as data, so that click handler can be abstracted
	var prevAction = function() {if (currPageNum > 0) {loadPageNum(currPageNum-1);}}
	$("#prevPageButton").click({action: prevAction}, onPageNavButtonClick);
	var homeAction = function() {loadPageNum(0);}
	$("#homePageButton").click({action: homeAction}, onPageNavButtonClick);
	var nextAction = function() {if (currPageNum < pageIds.length-1) {loadPageNum(currPageNum+1);}}
	$("#nextPageButton").click({action: nextAction}, onPageNavButtonClick);
}

function onPageNavButtonClick(e) {
	if ($(e.target).hasClass('disabled')) {
		e.stopPropagation();
	} else {
		e.data.action.apply();
	}
	return false;
}

function setPageNavState(pageNum) {
	if (pageNum < 1) {
		$("#prevPageButton").addClass("disabled")
		$("#homePageButton").addClass("disabled");
		$("#nextPageButton").removeClass("disabled");
	} else if (pageNum >= pageIds.length-1) {
		$("#prevPageButton").removeClass("disabled")
		$("#homePageButton").removeClass("disabled");
		$("#nextPageButton").addClass("disabled");
	} else {
		$("#prevPageButton").removeClass("disabled")
		$("#homePageButton").removeClass("disabled");
		$("#nextPageButton").removeClass("disabled");
	}
}

/*=================================================*/
/*== Content Page Controls ========================*/
/*=================================================*/

function onContentPageLoad(pageId) {
	initFloatingMenu();
	initAccordion(pageId);
	initBrainshark(pageId);
}

function onContentPageHide(page) {
	var bsWrapper = page.find('div.brainsharkWrapper');
	if (bsWrapper && bsWrapper.length > 0) {
		var bsElement = bsWrapper.get(0);
		bsElement.storedHTML = bsWrapper.html();
		bsWrapper.html('<p>This Brainshark has been hidden.</p>');
	}
}

function initAccordion(pageId) {
	var allPanels = $('.' + pageId + ' .accordion > dd').hide();
	$('.' + pageId + ' .accordion')
		.off('click', '> dt > a', onAccordionClick)
		.on('click', '> dt > a', onAccordionClick);
}

function onAccordionClick(e) {
	var that = $(this);
	var target = that.parent().next();
	var accordion = target.parent();

	if (target.hasClass('active')) {
		// close the current panel
		target.removeClass('active').slideUp(250);
	} else {
		var dds = accordion.children('dd').removeClass('active').slideUp(250);
		target.addClass('active').slideDown(250);
	}
	return false;
}

function initBrainshark(pageId) {
	var page = $('.'+pageId);
	var bsWrapper = page.find('div.brainsharkWrapper');
	if (bsWrapper && bsWrapper.length > 0) {
		var bsElement = bsWrapper.get(0);
		if (bsElement.storedHTML) {
			bsWrapper.html(bsElement.storedHTML);
			bsElement.storedHTML = null;
		} else {
			// initial load; get Brainshark id from map and write iFrame
			var url = brainsharkURLs[pageId] ? brainsharkURLs[pageId] : brainsharkURLs['default'];
			var src = url + brainsharkURLSuffix;
			var iframe = '<iframe src="' + src + '"></iframe>';
			bsWrapper.html(iframe);
		}
	}
}

/*=================================================*/
/*== Floating Menu ===============================*/
/*=================================================*/

function initFloatingMenu() {
	$('.floatingMenu a').click(this, onFloatingMenuItemClick);
}

function onFloatingMenuItemClick(e) {
	if ($(e.target).hasClass('selected')) {
		e.stopPropagation();
	} else {
		var pageId = getPageIdFromHistory();
		var sectionId = $(this).attr('href').replace('#', '');
		changeHistoryState(pageId, sectionId);
		// showContentSection(pageId, sectionId, true, true);
	}
	return false;
}

function setFloatingMenuState(sectionId) {
	var sectionTabs = $('#contentContainer .floatingMenu a');
	sectionTabs.each(function(index, elem) {
		var jelem = $(elem);
		var tabId = jelem.attr('href').replace('#', '');
		jelem.toggleClass('selected', (tabId == sectionId));
	});
}

/*=================================================*/
/*== Content Load & Display =======================*/
/*=================================================*/

function loadContent(pageId, sectionId) {

	closeMenu();
	
	var visChildren = $("#contentContainer").children(':visible');
	if (visChildren.length == 0) {
		// first page loaded
		showContent(pageId, sectionId);
	} else {
		visChildren.fadeOut(125, function() {
			var prevPage = $(visChildren);
			onContentPageHide(prevPage);
			showContent(pageId, sectionId);
		});
	}
	
	currPageNum = pageIds.indexOf(pageId);
	setMenuState(pageId);
	setPageNavState(currPageNum);
	
}

function showContent(pageId, sectionId) {
	
	if ( cache[pageId] ) {
		// Since the element is already in the cache, it doesn't need to be
		// created, so instead of creating it again, let's just show it!
		cache[pageId].fadeIn(250);
		showContentSection(pageId, sectionId, false);
	} else {
		// Show "loading" content while AJAX content loads.
		$('#contentLoading').fadeIn(250);
		// Create container for this url's content and store a reference to it in
		// the cache.
		cache[pageId] = $('<div class="contentItem ' + pageId + '"/>')
			// Append the content container to the parent container.
			.appendTo('#contentContainer')
			// Load external content via AJAX. Note that in order to keep this
			// example streamlined, only the content in .infobox is shown. You'll
			// want to change this based on your needs.
			.load('content/' + pageId + '.html', function(){
				// Load complete, hide "loading" screen and fade in new content.
				$('#contentLoading').fadeOut(100);
				showContentSection(pageId, sectionId, false);
				$(this).fadeIn(250);
			})
			.hide();
	}
}

function showContentSection(pageId, sectionId, fade) {
	
	var section = null;
	var allSections = $('.' + pageId + ' section');
	 // = page.children('section');
	if (!sectionId) {
		// Get first section child of this page
		section = allSections.first();
		sectionId = section.attr('id');
	} else {
		section = $('.' + pageId + ' #' + sectionId);
	}
	if (fade) {
		allSections.each(function(index, elem) {
			var jelem = $(elem);
			if (jelem.is(':visible')) {
				setFloatingMenuState(sectionId);
				jelem.fadeOut(125, function() {
					section.fadeIn(250, function() {
						onContentPageLoad(pageId);
					});
				});
			}
		});
	} else {
		// Loading from URL hash
		allSections.each(function(index, elem) {
			$(elem).hide();
		});
		section.show();
		onContentPageLoad(pageId);
	}
	if (pageId != sectionId) {
	    // Page has a specific subsection (with an underscore)
		setFloatingMenuState(sectionId);
	}
}

/*=================================================*/
/*== History ======================================*/
/*=================================================*/

function initHistory() {
	
	if (document.location.hostname == "localhost" && debugHistory) {
		History.options.debug = true;
		$('body').append('<textarea id="log"></textarea>');
	} 
	
	History.options.disableSuid = true;
	
	// Log Initial state
	var	state = History.getState();
	History.debug('initHistory::', ' > data: ' + state.data, ' > title: ' + state.title, ' > url: ' + state.url);
	
	// Bind to state Change
	History.Adapter.bind(window,'statechange', onHistoryStateChange);
}

function changeHistoryState(pageId, sectionId, replaceState) {
	var newHash = hashPrefix + (sectionId ? pageId + "_" + sectionId : pageId);
	History.debug((replaceState?'replace':'push') + 'HistoryState:: pageId: ' + pageId + '; sectionId: ' + sectionId + '; newHash: ' + newHash);
	var title = "Performance Assessment: " + ucwords(pageId + (sectionId ? ': '+sectionId : ''));
	if (replaceState) {
		History.replaceState({page: pageId, section: sectionId}, title, newHash);
	} else {
		History.pushState({page: pageId, section: sectionId}, title, newHash);
	}
	var state = History.getState(); // Note: We are using History.getState() instead of event.state
	History.debug(' ↳ New '+ (replaceState ? 'replaced' : 'pushed') +' state: ', '     url: ' + state.url);
}

function onHistoryStateChange(e) {
	var state = History.getState(); // Note: We are using History.getState() instead of event.state
	History.debug('onHistoryStateChange::', '     url: ' + state.url);
	var pageId = state.data.page;
	var sectionId = state.data.section;
	loadContent(pageId, sectionId);
}

/*=================================================*/
/*== Utility ======================================*/
/*=================================================*/

function getWindowHash() {
	var hash = window.location.search;
	hash = hash.replace(hashPrefix, '');
	return hash;
}

function getPageIdFromHash() {
	var hash = getWindowHash();
	var pageId = hash.indexOf('_') > 0 ? hash.substr(0, hash.indexOf('_')) : hash;
	return pageId;
}

function getPageIdFromHistory() {
	var state = History.getState();
	return state.data.page;
}

function getSectionIdFromHash() {
	var hash = getWindowHash();
	var sectionId = hash.indexOf('_') > 0 ? hash.substr(hash.indexOf('_'), hash.length).replace('_', '') : '';
	return sectionId;
}

function ucwords (str) {
    return (str + '').replace(/^([a-z])|\s+([a-z])/g, function ($1) {
        return $1.toUpperCase();
    });
}

$(document).ready(function() {
	
	initMenu();
	initPageNav();
	initHistory();
	
	// Add no-touch class to document to allow :hover states for non-iOS devices
	if (("ontouchstart" in document.documentElement)) {
		// document.documentElement.className += " no-touch";
		$('.bottomNav a').addClass('no-hover');
	}
	
	var hash = getWindowHash();
	if (hash) {
		var pageId = getPageIdFromHash();
		var sectionId = getSectionIdFromHash();
		changeHistoryState(pageId, sectionId, true);
		// Must manually trigger event on initial load
		History.Adapter.trigger(window, 'statechange');
	} else {
		loadPageNum(0);
	}
	
});