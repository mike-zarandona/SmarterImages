# SmarterImages

_Images are dumb - make them smarter with flexible dynamic image replacement_

[Demo on CodePen.io](http://codepen.io/mike-zarandona/full/cowJq/)


## About

*SmarterImages* aims to be the most flexible dynamic image replacement jQuery plugin. Think [CDN](https://www.google.com/search?q=define+cdn), but without the server.

The plugin watches the browser viewport width on `load()` and `resize()`, and when the zone changes the plugin rebuilds a new `src` URL.  If the object in question is an `<img/>` element, it gets a new `src`; if the object in question is anything else (such as a `<div/>`) it will get an updated `background-image` style property. 

### Features

+ Works with *any* custom image processor URL or [CloudImage.io](http://cloudimage.io)
+ Define your own custom breakpoints: as many or few as required  ("`small` / `medium` / `large`" wasn't exactly *flexible*)
+ Works with inline images and background images
+ Option to upsize and downsize images, or upsize only to reduce server calls
+ Option to maintain image aspect ratio or resize-only
+ Define image URL protocols
+ Callback function for custom code image replacements after

### Inline Images and Placeholder.gif

To fire SmarterImages on inline `<img/>` elements, they are required to have **both** an `src` attribute *and* a `data-si-src` attribute.  Even though the "real" `src` is stored inside `data-si-src`, without a "true" `src` the image won't load correctly.  To get around this, the fastest-known solution named `placeholder.gif` is included - a 43byte 1px x 1px transparent GIF, [more on that here](http://css-tricks.com/snippets/html/base64-encode-of-1x1px-transparent-gif/).  Please note that in some cases it's more appropriate for user experience to implement a "loading" graphic, [like a nice FontAwesome animated icon](http://fontawesome.io/examples/#spinning).

### Definitions: Breakpoints vs. Zones

This document will refer to terms such as "`breakpoint`" and "`zone`" - here's what they mean:

**_breakpoint_**<br />A pixel integer value at which the script will initiate an image swap.  These markers encapsulate the _zones_.  They're defined by passing in an array of integers to `options.breakpoints`.

**_zone_**<br />The range in which a breakpoint-specific sized image is visible.  These are the areas between the _breakpoints_, and are automatically calculated.

```
breakpoints
|--------|-----------|-----------|-----------|-----------|-----------|---------->
0		360			480			768			1050		1300		1600

		0 (min)			   1		   2		   3		   4		5 (max)
|--------------------|-----------|-----------|-----------|-----------|---------->
zones
```

<br />



## Processors

Processors are any services, CDNs, APIs, or custom functions which handle image sizing and/or serving.  Additional options for processors are always welcome and appreciated, please [open an issue](https://github.com/mike-zarandona/SmarterImages/issues) with suggestions!

### CloudImage.io

> **&lt;cloudimage.io/>** is the easiest way to resize, store, and deliver your images to your customers. &nbsp; &nbsp; &mdash; [http://cloudimage.io](http://cloudimage.io)

To use CloudImage.io (*paid service*) set `options.useCloudImageIO` to `true`, and pass in your CloudImage.io URL prefix to `options.cloudImageIO`.  That's it!

### Custom Processor

To use *any* other custom setup, set `options.useCustomURL` to `true` and pass in a custom URL to `options.customURL`.  Two replacement variables are available to help build the correct URL - check out the code examples section later in this document.

##### Custom Processor URL Replacement Variables

**`%%size%%`**
This string will be replaced with the current breakpoint size dynamically.

Example:  `http://fakecdn.com/resize/%%size%%/http://example.com/path/to/myimage.png`
Output:  `http://fakecdn.com/resize/768/http://example.com/path/to/myimage.png`

**`%%source%%`**
This string will be replaced with the current image's source attribute (`data-si-src`).

Example:  `http://fakecdn.com/resize/768/%%source%%`
Output:  `http://fakecdn.com/resize/768/http://example.com/path/to/myimage.png`

### Placeholders

To use placeholders for mock-ups or testing purposes (*for science*), set `options.usePlaceholders` to `true`.  **Note** that this will ignore the `data-si-src` option completely and will populate the targeted object(s) with placeholder images served from [Placehold.it](http://placehold.it).

<br />
 
 

## Options

| Option				| Type			|	Default								| Description														|
|:----------------------|:-------------:|:-------------------------------------:|:------------------------------------------------------------------|
| **breakpoints**		| `array`		| `[360, 480, 768, 1050, 1300, 1600]`	| Defines the breakpoints at which targeted images will be replaced.	|
| **upsizeOnly**		| `boolean`		| `false`								| If true, images will only load larger sizes to reduce server calls;  if false, images with load larger and smaller sizes.	|
| **maintainAspect**	| `boolean`		| `false`								| If true, images will maintain their original width / height aspect ratio.	|
| **useCloudImageIO**	| `boolean`		| `false`								| Switch to turn on / off the CloudImage.io image processor.	|
| **cloudImageIO**		| `string`		| N/A									| CloudImage.io URL account prefix.	|
| **useCustomURL**		| `boolean`		| `false`								| Switch to turn on / off the custom URL image processor.	|
| **customURL**			| `string`		| N/A									| Custom image processor URL pattern.	|
| **usePlaceholders**	| `boolean`		| `false`								| Turn on placeholder images for testing.	|
| **protocol**			| `string`		| `http://`								| Defines the protocol for the target image URLs (`http://`, `https://`, `//`).	|
| **logging**			| `boolean`		| `false`								| Turns on / off console messages for debugging / testing.	|
| **onImgSwap**			| `function`	| `false`								| Callback function which fires after each replacement.	|

<br />



## Examples

### Basic Examples

_**Inline Image**_

```html
<!-- HTML -->
<img src="/path/to/placeholder.gif" data-si-src="http://example.com/image.png"></div>
```
```javascript
// jQuery
// when the document is ready
$(document).ready(function() {

	// call SmarterImages
	$('img[data-si-src]').smarterImages();
});
```

_**Background Image**_

```html
<!-- HTML -->
<div class="smarter-image" data-si-src="http://example.com/image.png"></div>
```
```javascript
// jQuery
$('.smarter-image').smarterImages();
```

### CloudImage.io Example

```javascript
// jQuery
$('.smarter-image').smarterImages({
	useCloudImageIO: true,
	cloudImageIO: 'abcdef'
});
```

### Custom URL Example

```javascript
// jQuery
$('.resize-images').smarterImages({
	useCustomURL: true,
	customURL: 'http://fakecdn.com/resize/%%size%%/%%source%%'
```

### Callback Function Example

`$this` is exposed so that each `<img/>` can be targeted individually.

`thisBreakpoint` holds the current zone's size, in pixels.

```javascript
// jQuery
$('.fadein-imgs').smarterImages({
	useCloudImageIO: true,
	cloudImageIO: 'abcdef',

	onImgSwap: function($this, thisBreakpoint) {
		// your callback function code here
		// ...
	}
});
```

### Kitchen Sink Example

```javascript
	$('img[data-si-src]').smarterImages({
		// basic things
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
		onImgSwap: function($this, thisBreakpoint) {
			// ...
		}
	});
```

<br />



## Changelog

### v1.0.0
Initial release.

<br />



## Author

[Mike Zarandona](http://twitter.com/mikezarandona) | [mike.zarandona.com](http://mike.zarandona.com)