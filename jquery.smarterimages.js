/*
***********************************************************
* smarterImages | Images are dumb - make them smarter
* 
* Version:		v1.0.0
* Author:		Mike Zarandona
* Release:		August 04 2014
* 				Initial release.
* 
* Reqs:			jQuery
* 
* Usage:		$('img[data-si-src]').smarterImages();
***********************************************************
*/

(function($, undefined) {
	$.fn.smarterImages = function(options) {

		var obj = $(this);		// Store `this` in a variable to reduce DOM searches

		// Override defaults with specified options
		options = $.extend({}, $.fn.smarterImages.options, options);

		if ( options.logging ) { console.info('SmarterImages initialized'); }

		// fire event on .load or .resize
		$(window).on('load resize', function() {

			var viewportWidth = $(window).outerWidth(true),			//- get the viewport width
				thisZone = evalWidths(options, viewportWidth);		//- use `evalWidths()` to get which zone we're in now (returns INT in px)

			// Main loop to iterate over all the images
			obj.each(function(eachIndex) {

				// figure out if it's swappin' time
				var isItTime = fireLoadImageLogic(options, obj, thisZone, eachIndex);

				if ( isItTime ) {

					// SWAP!  THAT!  IMAAAAGE!!
					loadImage(options, obj, thisZone, eachIndex);

					// callback time if `onImgSwap` is in fact a function
					if ( typeof(options.onImgSwap) == 'function' ) {

						// pass `obj` to the callback function for `$this` image access, plus the breakpoint
						options.onImgSwap(obj, thisZone);
					}
				}
			});
		});
	};



	/**
	* evalWidths()
	* Function to evaluate the viewport width
	* and the size of the image
	*	options: object | main scope overridden options
	* 	viewportWidth: int | the current width of the viewport
	*/
	function evalWidths(options, viewportWidth) {

		var breakpointFlag;		//- flag used to mark which zone is currently active


		// check the min range
		if ( (viewportWidth > 0) && (viewportWidth < options.breakpoints[1]) ) {
			// fire on zone min
			breakpointFlag = options.breakpoints[0];
		}
		// check the max range
		else if ( viewportWidth >= options.breakpoints[ options.breakpoints.length-1 ] ) {
			// fire on zone max
			breakpointFlag = options.breakpoints[ options.breakpoints.length-1 ];
		}
		// not max or min - down to business
		else {
			// loop through all the mid-range zones
			for ( var i = 1; i < options.breakpoints.length-1; i++ ) {

				if ( (viewportWidth >= options.breakpoints[i]) && (viewportWidth < options.breakpoints[i+1]) ) {

					// fire on `this` zone
					breakpointFlag = options.breakpoints[i];
				}
			}
		}

		// return the breakpointFlag
		return breakpointFlag;
	}



	/**
	* loadImage(options, obj, zone)
	* Function to handle loading images
	*	options: object | main scope overridden options
	*	obj: object | the object scope of $(this) image in the loop
	* 	zone: int | value of array `options.breakpoints`, the current responsive zone
	*	eachIndex: int | the index of which element is currently active in the .each() loop
	*/
	function loadImage(options, obj, zone, eachIndex) {

		var isUnique = false,	//- boolean flag to be used to stop from writing the src over and over
			isIMG = false,		//- boolean flag to be used to determine if `this` is an `<img/>` or not
			srcString = '';		//- string which will be used to build the new src


		// aspect ratio
		if ( options.maintainAspect ) {

			// if the data-si-aspect attribute doesn't exist
			if ( obj.attr('data-si-aspect') === undefined ) {
				var thisHeight = obj.innerHeight(),
					thisWidth = obj.innerWidth(),
					thisAspect = thisWidth / thisHeight;

				// assign it to the object
				obj.attr('data-si-aspect', thisAspect);
			}
		}


		// Build the new SRC string
		// cloudimage.io
		if ( options.useCloudImageIO ) {

			// if the aspect ration is being maintained
			if (options.maintainAspect ) {

				// read the aspect radio, calc the new height
				var aspectRatio = parseInt( obj.attr('data-si-aspect') ),
					aspectHeight = Math.floor(zone / aspectRatio);

				srcString = options.protocol + options.cloudImageIO + '.cloudimage.io/s/crop/' + zone + 'x' + aspectHeight +  '/' + obj.attr('data-si-src');
			}
			else {
				srcString = options.protocol + options.cloudImageIO + '.cloudimage.io/s/resize/' + zone + '/' + obj.attr('data-si-src');
			}
		}
		// custom url
		else if ( options.useCustomURL ) {
			srcString = customURLTreatment(options, obj, zone);
		}
		// placeholders
		else if ( options.usePlaceholders ) {
			srcString =  options.protocol + 'placehold.it/' + zone + 'x' + zone;
		}
		// error checking
		else {
			if ( options.logging ) { console.error('SmarterImages Error: No processors active!'); }
		}


		// Continue Testing
		// determine if the object is an `<img/>` or not
		if ( obj.get(eachIndex).tagName == 'IMG' ) { isIMG = true; }
		else { isIMG = false; }

		// determine if the src is unique or not
		if ( isIMG ) {
			if ( obj.attr('src') != srcString ) { isUnique = true; }
			else { isUnique = false; }
		}
		else {
			if ( obj.css('background-image') != 'url(' + srcString + ')' ) { isUnique = true; }
			else { isUnique = false; }
		}


		// change the `src` of the image (or bg-image) based on uniqueness and node type
		if ( isUnique ) {
			if ( isIMG ) {
				obj.attr( 'src', srcString );
			}
			else {
				obj.css('background-image', 'url(' + srcString + ')');
			}
		}

		// if we're only upsizing, keep track of the maxsize
		if ( options.upsizeOnly ) {
			obj.attr( 'data-si-maxsize', zone );
		}
	}



	/**
	* fireLoadImageLogic()
	* Logic to determine if it's time to fire loadImage()
	* runs comparisons against the image and the viewport
	*	options: object | main scope overridden options
	*	obj: object | the object scope of $(this) image in the loop
	* 	thisZone: int | value of array `options.breakpoints`, the current responsive zone
	**/
	function fireLoadImageLogic(options, obj, thisZone) {

		var shouldFire = false;		//- boolean flag to determine if the loadImage() function should indeed fire now

		// if only upsizing, get and set the max size
		if ( options.upsizeOnly ) {

			// store the largest size this image has been or is
			var thisMaxSize = obj.attr('data-si-maxsize');

			// if the maxsize hasn't been set, load this image right frigging now
			if ( thisMaxSize === undefined ) {
				shouldFire = true;
			}
			// if maxsize is set on this element, eval against the current viewport
			else {
				// flip this bad-boy into an int for comparisons
				thisMaxSize = parseInt(thisMaxSize);

				// load the image if the viewport is correct
				if ( thisZone >= thisMaxSize ) {
					shouldFire = true;
				}
			}
		}
		else {
			shouldFire = true;
		}

		return shouldFire;
	}



	/**
	* customURLTreatment()
	* Handles converting the custom URL variables to real things
	*	options: object | main scope overridden options
	*	obj: object | the object scope of $(this) image in the loop
	* 	zone: int | value of array `options.breakpoints`, the current responsive zone
	**/
	function customURLTreatment(options, obj, thisZone) {

		var url = options.customURL,		//- "working" string variable while we slice and dice it
			tempArr = [];					//- array used when slicing and dicing to store the segments

		// splice in the size variable: %%size%%
		tempArr = url.split('%%size%%');

		// start the concatenation
		url = tempArr[0];

		// finish with a loop for multiple `%%size%%` instances
		for (var j = 1; j < tempArr.length; j++) {
			url += thisZone + tempArr[j];
		}


		// splice in the source variable: %%source%%
		tempArr = url.split('%%source%%');

		// error checking
		if ( (obj.attr('data-si-src') === undefined) && (options.logging) ) {
			console.error('SmarterImages Error:  Attribute `data-si-src` is undefined for ' + obj.get(0).tagName + '.' + obj.get(0).className);
		}

		// string concatenation
		url = tempArr[0] + obj.attr('data-si-src') + tempArr[1];

		// donezo, send it back
		return url;
	}



	// Default the defaults
	$.fn.smarterImages.options = {
		breakpoints: [360, 480, 768, 1050, 1300, 1600],
		upsizeOnly: true,
		maintainAspect: false,

		// cloudimage.io setup
		useCloudImageIO: false,
		cloudImageIO: '',

		// custom url setup
		useCustomURL: false,
		customURL: '',

		// placeholders (for science)
		usePlaceholders: false,

		// nuts + bolts
		protocol: 'http://',
		logging: false,

		// callback function
		onImgSwap: false
	};
})(jQuery);


// read initial aspect ratio
// persistant aspect ratio, they use CROP which is specifying a width and a height
