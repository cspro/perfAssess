/*===================age==============================*/
/*== Application ==================================*/
/*=================================================*/

var pageIds = null; // Array of string ids, which are also HTML filenames
var currPageNum = 0; // Index of current pageId in array
var menuLinks = null;
// Keep a mapping of url-to-container for caching purposes.
var cache = {
	// If url is '' (no fragment), display this div's content.
	'': $('.content-default')
};


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
	loadContent(e.data);
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
		loadContent(pageId);
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
	// $(e.target).blur();
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
/*== Floating Subnav menu =========================*/
/*=================================================*/

/*
 * Called on content page load 
 */
function floatingMenuHook(e) {
	if ($(e.target).hasClass('selected')) {
		e.stopPropagation();
	} else {
		var sectionId = $(this).attr('href').replace('#', '');
		showContentSection(sectionId, true);
	}
	return false;
}

function showContentSection(sectionId, fade) {
	var section = $("#" + sectionId);
	var allSections = $('#contentContainer section');
	if (fade) {
		allSections.each(function(index, elem) {
			var jelem = $(elem);
			if (jelem.is(':visible')) {
				setFloatingMenuState(sectionId);
				jelem.fadeOut(250, function() {
					section.fadeIn(250, function() {
						setSubSectionHash(sectionId);
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
		setFloatingMenuState(sectionId);
	}
	setSubSectionHash(sectionId);
}

function setSubSectionHash(sectionId) {
	var hash = window.location.hash.replace('#', '');
	var pageId = hash.indexOf('_') > 0 ? hash.substr(0, hash.indexOf('_')) : hash;
	window.location.hash = pageId + '_' + sectionId;
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
/*== Document =====================================*/
/*=================================================*/

/*
 * Primary page load method; other methods should call this
 */
function loadContent(pageId, sectionId) {

	closeMenu();
	
	var cont = $("#contentContainer");
	var visChildren = cont.children(':visible');
	if (visChildren.length == 0) {
		// first page loaded
		showContent(pageId, sectionId);
	} else {
		visChildren.fadeOut(250, function() {
			showContent(pageId, sectionId);
		});
	}
	
	currPageNum = pageIds.indexOf(pageId);
	setMenuState(pageId);
	setPageNavState(currPageNum);
	
	// Set hash for deep-linking and refresh
	window.location.hash = sectionId ? pageId + "_" + sectionId : pageId;
}

function showContent(pageId, sectionId) {
	
	if ( cache[pageId] ) {
		// Since the element is already in the cache, it doesn't need to be
		// created, so instead of creating it again, let's just show it!
		if (sectionId && sectionId.length > 0) {
			showContentSection(sectionId, false);
		}
		cache[pageId].fadeIn(250);
	} else {
		// Show "loading" content while AJAX content loads.
		$('#contentLoading').fadeIn(250);
		// Create container for this url's content and store a reference to it in
		// the cache.
		cache[pageId] = $('<div class="contentItem"/>')
			// Append the content container to the parent container.
			.appendTo('#contentContainer')
			// Load external content via AJAX. Note that in order to keep this
			// example streamlined, only the content in .infobox is shown. You'll
			// want to change this based on your needs.
			.load('content/' + pageId + '.html', function(){
				// Load complete, hide "loading" screen and fade in new content.
				$('#contentLoading').fadeOut(100);
				if (sectionId && sectionId.length > 0) {
					showContentSection(sectionId, false);
				}
				$(this).fadeIn(250);
			})
			.hide();
	}
}

$(document).ready(function() {
	
	initMenu();
	initPageNav();
	
	// Add no-touch class to document to allow :hover states for non-iOS devices
	if (("ontouchstart" in document.documentElement)) {
		// document.documentElement.className += " no-touch";
		$('.bottomNav a').addClass('no-hover');
	}
	
	// Get the hash (fragment) as a string, with leading # removed.
	var hash = window.location.hash.replace('#', '');
	var pageId = hash.indexOf('_') > 0 ? hash.substr(0, hash.indexOf('_')) : hash;
	var sectionId = hash.indexOf('_') > 0 ? hash.substr(hash.indexOf('_'), hash.length).replace('_', '') : '';
	if (hash) {
		loadContent(pageId, sectionId);
	} else {
		loadPageNum(0);
	}
	
});