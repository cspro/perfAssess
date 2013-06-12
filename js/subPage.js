// $('section[id*="_"]').hide();
$('.floatingMenu a').click(this, floatingMenuHook);

contentPageLoadHook();

// Accordion
var allPanels = $('.accordion > dd').hide();
$('.accordion > dt > a').click(function() {
	$this = $(this);
	$target = $this.parent().next();

	if (!$target.hasClass('active')) {
		allPanels.removeClass('active').slideUp(250);
		$target.addClass('active').slideDown(250);
	}
	return false;
});

