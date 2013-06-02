/* Load this script using conditional IE comments if you need to support IE 7 and IE 6. */

window.onload = function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'icomoon\'">' + entity + '</span>' + html;
	}
	var icons = {
			'icon-twitter' : '&#x74;',
			'icon-facebook' : '&#x66;',
			'icon-google-plus' : '&#x67;',
			'icon-house' : '&#x68;',
			'icon-next' : '&#x3e;',
			'icon-previous' : '&#x3c;',
			'icon-first' : '&#x2b;',
			'icon-last' : '&#x2c;',
			'icon-caret-left' : '&#x62;',
			'icon-caret-right' : '&#x6e;',
			'icon-th-list' : '&#x6d;',
			'icon-cog' : '&#x73;',
			'icon-arrow-right' : '&#x29;',
			'icon-arrow-left' : '&#x28;'
		},
		els = document.getElementsByTagName('*'),
		i, attr, html, c, el;
	for (i = 0; ; i += 1) {
		el = els[i];
		if(!el) {
			break;
		}
		attr = el.getAttribute('data-icon');
		if (attr) {
			addIcon(el, attr);
		}
		c = el.className;
		c = c.match(/icon-[^\s'"]+/);
		if (c && icons[c[0]]) {
			addIcon(el, icons[c[0]]);
		}
	}
};