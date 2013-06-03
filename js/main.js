/*=================================================*/
/*== Application ==================================*/
/*=================================================*/

var pageIds = null; // Array of string ids, which are also HTML filenames
var currPageNum = 0; // Index of current pageId in array
var menuLinks = null;

/*=================================================*/
/*== Navigation Menu ==============================*/
/*=================================================*/

function initNav() {
	pageIds = [];
	menuLinks = $('.menulink');
	menuLinks.each(function(index, elem) {
		jelem = $(elem);
		var pageId = jelem.attr('datasrc');
		pageIds.push(pageId);
		jelem.click(pageId, onNavClick);
	}); 
}

function onMenuButtonClick(e) {
	$('#menuList').toggleClass('closed');
	$('#menuButton').toggleClass('open');
}

function closeMenu() {
	$('#menuList').addClass('closed');
	$('#menuButton').removeClass('open');
}

function onNavClick(e) {
	loadContent(e.data);
	// set selection state
	menuLinks.each(function(index, elem) {
		jelem = $(elem);
		var pageId = jelem.attr('datasrc');
		if (pageId != e.data) {
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
	closeMenu();
}

/*=================================================*/
/*== Document =====================================*/
/*=================================================*/

$(document).ready(function() {
	initNav();
});