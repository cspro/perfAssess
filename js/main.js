/*=================================================*/
/*== Application ==================================*/
/*=================================================*/

var pageIds = null; // Array of string ids, which are also HTML filenames
var currPageNum = 0; // Index of current pageId in array
var menuLinks = null;

/*=================================================*/
/*== Navigation Menu ==============================*/
/*=================================================*/

function initMenu() {
	pageIds = [];
	menuLinks = $('.menulink');
	menuLinks.each(function(index, elem) {
		jelem = $(elem);
		var pageId = jelem.attr('datasrc');
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
}

function closeMenu() {
	$('#menuList').addClass('closed');
	$('#menuButton').removeClass('open');
}

function onNavClick(e) {
	loadContent(e.data);
}

function setMenuState(currPageId) {
	menuLinks.each(function(index, elem) {
		jelem = $(elem);
		var pageId = jelem.attr('datasrc');
		if (pageId != currPageId) {
			jelem.removeClass('currentPage');
		} else {
			jelem.addClass('currentPage');
		}
	});
}

function loadContent(pageId) {
	var cont = $("#contentContainer");
	cont.load("content/" + pageId + ".html");
	currPageNum = pageIds.indexOf(pageId);
	setMenuState(pageId);
	setPageNavState(currPageNum);
	closeMenu();
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
	$("#prevPageButton").click(onPrevPageButtonClick);
	$("#homePageButton").click(onHomePageButtonClick);
	$("#nextPageButton").click(onNextPageButtonClick);
}

// FIXME: refactor to encapsulate, remove duplication
function onPrevPageButtonClick(e) {
	if ($("#prevPageButton").hasClass('disabled')) {
		e.stopPropagation();
		return false;
	}
	if (currPageNum > 0) {
		loadPageNum(currPageNum-1);
	}
	return false;
}

function onHomePageButtonClick(e) {
	if ($("#homePageButton").hasClass('disabled')) {
		e.stopPropagation();
		return false;
	}
	loadPageNum(0);
	return false;
}

function onNextPageButtonClick(e) {
	if ($("#nextPageButton").hasClass('disabled')) {
		e.stopPropagation();
		return false;
	}
	if (currPageNum < pageIds.length-1) {
		loadPageNum(currPageNum+1);
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
/*== Document =====================================*/
/*=================================================*/

$(document).ready(function() {
	initMenu();
	initPageNav();
	loadPageNum(0);
});