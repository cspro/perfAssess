$(function(){
  
  /* ========================================================== */
  /* == hashChange plugin ===================================== */
  /* == handles content caching and back-button behavior ====== */
  /* ========================================================== */
  
  // Keep a mapping of url-to-container for caching purposes.
  var cache = {
    // If url is '' (no fragment), display this div's content.
    '': $('.content-default')
  };
  
  // Bind an event to window.onhashchange that, when the history state changes,
  // gets the url from the hash and displays either our cached content or fetches
  // new content to be displayed.
  $(window).bind( 'hashchange', function(e) {
    
    // Get the hash (fragment) as a string, with any leading # removed. Note that
    // in jQuery 1.4, you should use e.fragment instead of $.param.fragment().
    var url = $.param.fragment();
    
    // Remove .content-current class from any previously "current" link(s).
    $( 'a.content-current' ).removeClass( 'content-current' );
    
    // Hide any visible ajax content.
    $( '#contentContainer' ).children( ':visible' ).hide();
    
    // Add .content-current class to "current" nav link(s), only if url isn't empty.
    url && $( 'a[href="#' + url + '"]' ).addClass( 'content-current' );
    
    if ( cache[ url ] ) {
      // Since the element is already in the cache, it doesn't need to be
      // created, so instead of creating it again, let's just show it!
      cache[ url ].show();
      
    } else {
      // Show "loading" content while AJAX content loads.
      $( '.content-loading' ).show();
      
      // Create container for this url's content and store a reference to it in
      // the cache.
      cache[ url ] = $( '<div class="content-item"/>' )
        
        // Append the content container to the parent container.
        .appendTo( '#contentContainer' )
        
        // Load external content via AJAX. Note that in order to keep this
        // example streamlined, only the content in .infobox is shown. You'll
        // want to change this based on your needs.
        .load( url, function(){
          // Content loaded, hide "loading" content.
          $( '.content-loading' ).hide();
        });
    }
  })
  
  // Since the event is only triggered when the hash changes, we need to trigger
  // the event now, to handle the hash the page may have loaded with.
  $(window).trigger( 'hashchange' );
  
  /* ========================================================== */
  /* == end hashChange plugin ================================= */
  /* ========================================================== */
  
});