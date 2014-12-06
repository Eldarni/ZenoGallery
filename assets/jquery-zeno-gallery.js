/**
 * ZenoGallery - A simple JQuery based gallery
 *
 * @author Richard Smith <richard@smith-net.org.uk>
 * @copyright 2014 Richard Smith
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// <div class="zg-wrapper">
//     <div class="zg-frame">
//         ...
//     </div>
//     <div class="zg-prev-image"></div>
//     <div class="zg-next-image"></div>
//     <div class="zg-control-bar"></div>
//         <div class="zg-thumbnails"></div>
//         <div class="zg-slideshow"></div>
//         <div class="zg-position"></div>
//         <div class="zg-message"></div>
//         <div class="zg-fullscreen"></div>
//     </div>
// </div>

(function($, undefined) {
    "use strict";

    //get the key codes for the commonly used keys
    var keys = {'up': 38, 'down': 40, 'left': 37, 'right': 39, 'enter': 13, 'escape': 27, 'backspace': 8, 'space': 32};

    //setup the default options - we can override these later
    var defaults = {'path' : '/', 'autoplay': false, 'delay': 5000, 'speed': 400, 'preload': 3};

    //setup our constructor - this will figure out the main conventions
    var ZenoGallery = function(element, options) {

        //setup an alternate to this
        var self = this;

        //extend the default options with the user provided ones
        this._options = $.extend({}, defaults, options);

        //keep a reference to the various parts of the gallery dom
        this._element = element; 

        //start adding all the markup needed by the gallery
        this._element.children().wrapAll('<div class="zg-frame"/>');
        this._element.append('<div class="zg-prev-image"/><div class="zg-next-image"/>');
        this._element.append('<div class="zg-control-bar"><div class="zg-thumbnails"/><div class="zg-slideshow"/><div class="zg-position"/><div class="zg-message"/><div class="zg-fullscreen"/></div>');
        this._element.children().wrapAll('<div class="zg-wrapper"/>');

        //store the current image shown and the total images we have 
        this._current_image = 1; this._total_images = this._element.find('.zg-frame > div').length;

        //clone the first and last element in the image data to allow for an infinite next/previous effect
        var $images = this._element.find('.zg-frame > div');
        $images.filter(':first').before($images.slice(-1).clone());
        $images.filter(':last').after($images.slice(0, 1).clone());

        //bind the left/right arrow keys to the galleries previous/next image functions
        this._element.attr('tabindex', 0).on('keypress', function(event) {
            if (event.keyCode == keys.left)  self.showPrevImage();
            if (event.keyCode == keys.right) self.showNextImage();
        });

        //bind the main control options
        this._element.on('click', '.zg-prev-image', function(event) { event.preventDefault(); self.showPrevImage();  });
        this._element.on('click', '.zg-next-image', function(event) { event.preventDefault(); self.showNextImage();  });
        this._element.on('click', '.zg-slideshow',  function(event) { event.preventDefault(); self.toggleSlideshow(); });
        this._element.on('click', '.zg-fullscreen', function(event) { event.preventDefault(); self.toggleFullscreen(); });

        //wait for the on change event to make the changes needed for full screen operation
        $(document).on('fullscreenchange', function() {
            self.prepareGallery();
            self.updateGallery();
        });

        //initialize all the display elements of the gallery
        this.prepareGallery(); this.updateGallery();

        //should we start the slide show immediately
        if (this._options.autoplay) self.startSlideshow();
    };

    //update the gallery widths and stuff
    ZenoGallery.prototype.prepareGallery = function () {

        //get the width and height from the parent element - or the screen if in full screen mode
        if (this._element.find('.zg-wrapper').zeno_fullscreen()) {
            this._options.width  = screen.width;
            this._options.height = screen.height;
        }
        else
        {
            this._options.width  = this._element.width();
            this._options.height = this._element.height();
        }

        //update the width of the image containers to fill the gallery
        this._element.find('.zg-frame > div').css('width', this._options.width);
        
        //set the displayed image to the current image - this resets the margin if the images change size
        this._element.find('.zg-frame').css('margin-left', ((this._options.width * this._current_image) * -1));

        //set some default css to make everything work
        this._element.find('.zg-frame').css({
            'width'      : (this._options.width * (this._total_images + 2)) + 100,
            'height'     : (this._options.height),
            'margin-top' : ((this._options.height / 2) * -1),
        });
    };

    //load the image asset
    ZenoGallery.prototype.loadImage = function () {};

    //show the previous image in the gallery
    ZenoGallery.prototype.showPrevImage = function () { 
        console.info('ZenoGallery::showPrevImage()'); 
        if (this._element.find('.zg-frame:not(:animated)').length > 0) {
            this._current_image = (this._current_image - 1); 
            this.updateGallery();
        }
    };

    //show the next image in the gallery
    ZenoGallery.prototype.showNextImage = function () { 
        console.info('ZenoGallery::showNextImage()'); 
        if (this._element.find('.zg-frame:not(:animated)').length > 0) {
            this._current_image = (this._current_image + 1); 
            this.updateGallery(); 
        }
    };

    //toggle the slidshow the slide show mode
    ZenoGallery.prototype.toggleSlideshow = function () {
        console.info('ZenoGallery::toggleSlideshow()');
        this.toggleCall((this._slideshow === undefined), 'startSlideshow', 'stopSlideshow');
    };

    //start the slide show mode
    ZenoGallery.prototype.startSlideshow = function () {
        console.info('ZenoGallery::startSlideshow()');
        this._slideshow = window.setInterval(this.showNextImage.bind(this), this._options.delay);
    };

    //stop the slide show mode
    ZenoGallery.prototype.stopSlideshow = function () {
        console.info('ZenoGallery::stopSlideshow()');
        window.clearTimeout(this._slideshow); delete this._slideshow;
    };

    //toggle the fullscreen display the slide show mode
    ZenoGallery.prototype.toggleFullscreen = function () {
        console.info('ZenoGallery::toggleFullscreen()');
        this.toggleCall((this._element.zeno_fullscreen() === true), 'stopFullscreen', 'startFullscreen');
    };

    //display the gallery in full screen mode
    ZenoGallery.prototype.startFullscreen = function () {
        console.info('ZenoGallery::startFullscreen()');
        this._element.find('.zg-wrapper').zeno_fullscreen('start');
    };

    //revert the gallery back to normal
    ZenoGallery.prototype.stopFullscreen = function () {
        console.info('ZenoGallery::stopFullscreen()');
        this._element.find('.zg-wrapper').zeno_fullscreen('stop');
    };

    //update all the various display bits
    ZenoGallery.prototype.updateGallery = function () {
        console.info('ZenoGallery::updateGallery()');
        this.updateControlBarPosition();
        this.updateControlBarMessage();
        this.updateDisplayedImage();
    };

    //update the gallery to display the current image - if we end up on the cloned elements - reset the display to the "real" element
    ZenoGallery.prototype.updateDisplayedImage = function () {
        console.info('ZenoGallery::updateDisplayedImage()');
        this._element.find('.zg-frame').animate({ 'margin-left' : ((this._options.width * this._current_image) * -1) }, this._options.speed, function() {
            if (this._current_image <= 0 || this._current_image > this._total_images) {
                this._current_image = ((this._current_image > this._total_images) ? 1 : this._total_images);
                this._element.find('.zg-frame').css('margin-left', ((this._options.width * this._current_image) * -1));
            }
        }.bind(this));
    };

    //update the position value on the main control bar
    ZenoGallery.prototype.updateControlBarPosition = function () {
        console.info('ZenoGallery::updateControlBarPosition()');
        this._element.find('.zg-control-bar > .zg-position').html((this._current_image) + ' / ' + this._total_images);
    };

    //use the meta data for the current image to populate the message bar
    ZenoGallery.prototype.updateControlBarMessage = function () {
        console.info('ZenoGallery::updateControlBarMessage()');
        //this._element.find('.zg-control-bar > .zg-message').html('<b>' + this._images[this._current_image].title + '</b> ' + this._images[this._current_image].description);
    };

    //toggle function - calls the function depending on the boolean state of expression
    ZenoGallery.prototype.toggleCall = function(expression, onTrue, onFalse) {
        console.info('ZenoGallery::toggleCall()');
        return this[((expression === true) ? onTrue : onFalse)]();
    };

    //define the ZenoGallery method on the core jquery object - this will be use to initialize the gallery by the user
    $.fn.zeno_gallery = function(options) {
        if (!$(this).length) return console.error('ZenoGallery: Unable to find the selector "' + this.selector + '". ');
        return this.each(function() {
            var $this = $(this), data = $this.data('zeno_gallery');
            if (!data) { $this.data('zeno_gallery', (data = new ZenoGallery($this, options))); }
        });
    };

})(jQuery);