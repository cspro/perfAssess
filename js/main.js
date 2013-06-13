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
var hashPrefix = '?page=';
var isBrainsharkPlaying = false;  
var debugHistory = false;

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
	initBrainshark();
}

function onContentPageHide(pageId) {
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

function initBrainshark() {
	$('.brainsharkWrapper iframe').click(function() {
		alert('direct click');
	});
}

function onBrainsharkClick(e) {
	alert('Brainshark clicked.');
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
		var pageId = getPageIdFromHash();
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
	
	// Log Initial State
	var	State = History.getState();
	History.debug('initHistory::', ' > data: ' + State.data, ' > title: ' + State.title, ' > url: ' + State.url);
	
	// Bind to State Change
	History.Adapter.bind(window,'statechange', onHistoryStateChange);
}

function changeHistoryState(pageId, sectionId, replaceState) {
	var newHash = "?page=" + (sectionId ? pageId + "_" + sectionId : pageId);
	History.debug((replaceState?'replace':'push') + 'HistoryState:: pageId: ' + pageId + '; sectionId: ' + sectionId + '; newHash: ' + newHash);
	var title = "Performance Assessment: " + ucwords(pageId + (sectionId ? ': '+sectionId : ''));
	if (replaceState) {
		History.replaceState({page: pageId, section: sectionId}, title, newHash);
	} else {
		History.pushState({page: pageId, section: sectionId}, title, newHash);
	}
	var State = History.getState(); // Note: We are using History.getState() instead of event.state
	History.debug(' ↳ New '+ (replaceState ? 'replaced' : 'pushed') +' state: ', '     url: ' + State.url);
}

function onHistoryStateChange(e) {
	var State = History.getState(); // Note: We are using History.getState() instead of event.state
	History.debug('onHistoryStateChange::', '     url: ' + State.url);
	var pageId = State.data.page;
	var sectionId = State.data.section;
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