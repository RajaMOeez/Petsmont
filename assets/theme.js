(function($){
var $ = jQuery = $;

theme.strings = $.extend(theme.strings || {}, {
  addressError: "Error looking up that address",
  addressNoResults: "No results for that address",
  addressQueryLimit: "You have exceeded the Google API usage limit. Consider upgrading to a \u003ca href=\"https:\/\/developers.google.com\/maps\/premium\/usage-limits\"\u003ePremium Plan\u003c\/a\u003e.",
  authError: "There was a problem authenticating your Google Maps API Key."
});

theme.icons = {
  chevronLightLeft: '<svg fill="currentColor" viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M 14.51,6.51 14,6 8,12 14,18 14.51,17.49 9.03,12 Z"></path></svg>',
  chevronLightRight: '<svg fill="currentColor" viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M 10,6 9.49,6.51 14.97,12 9.49,17.49 10,18 16,12 Z"></path></svg>',
  arrowLeft: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>',
  arrowRight: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-right"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>'
};

// Lightbox
theme.fbOpts = { overlayColor: '#fff', padding: 1, margin: 60, overlayOpacity: 0.9 };
theme.lightbox_min_window_width = 768;
theme.lightbox_min_window_height = 580;

theme.loadPageHeaderImage = function(target) {
  // could have been removed
  theme.checkForBannerBehindHeader();
}

theme.unloadPageHeaderImage = function(target) {
}

theme.runMultiCurrency = function() {
  // multi-currency
  if(typeof Currency != 'undefined' && typeof Currency.convertAll != 'undefined' && $('[name=currencies]').length) {
    Currency.convertAll(shopCurrency, $('[name=currencies]').first().val(), theme.money_container);
    theme.onCurrencyChange();
  }
}

theme.Sections = new function(){
  var _ = this;

  var sections = [];
  var instances = [];

  _.init = function(){
    $(document).on('shopify:section:load', function(e){
      // load a new section
      var target = _._themeSectionTargetFromShopifySectionTarget(e.target);
      if(target) {
        _.sectionLoad(target);
      }
    }).on('shopify:section:unload', function(e){
      // unload existing section
      var target = _._themeSectionTargetFromShopifySectionTarget(e.target);
      if(target) {
        _.sectionUnload(target);
      }
    });
  }

  // register a type of section
  _.register = function(type, section){
    sections.push({ type: type, section: section });
    $('[data-section-type="'+type+'"]').each(function(){
      _.sectionLoad(this);
    });
  }

  // load in a section
  _.sectionLoad = function(target){
    var target = target;
    var section = _._sectionForTarget(target);
    if(section !== false) {
      instances.push({
        target: target,
        section: section
      });
      section.onSectionLoad(target);
      $(target).on('shopify:block:select', function(e){
        _._callWith(section, 'onBlockSelect', e.target);
      }).on('shopify:block:deselect', function(e){
        _._callWith(section, 'onBlockDeselect', e.target);
      });
    }
  }

  // unload a section
  _.sectionUnload = function(target){
    var instanceIndex = -1;
    for(var i=0; i<instances.length; i++) {
      if(instances[i].target == target) {
        instanceIndex = i;
      }
    }
    if(instanceIndex > -1) {
      $(target).off('shopify:block:select shopify:block:deselect');
      _._callWith(instances[instanceIndex].section, 'onSectionUnload', target);
      instances.splice(instanceIndex);
    }
  }

  // helpers
  _._callWith = function(object, method, param) {
    if(typeof object[method] === 'function') {
      object[method](param);
    }
  }

  _._themeSectionTargetFromShopifySectionTarget = function(target){
    var $target = $('[data-section-type]:first', target);
    if($target.length > 0) {
      return $target[0];
    } else {
      return false;
    }
  }

  _._sectionForTarget = function(target) {
    var type = $(target).attr('data-section-type');
    for(var i=0; i<sections.length; i++) {
      if(sections[i].type == type) {
        return sections[i].section;
      }
    }
    return false;
  }
}

theme.loadStyleOnce = function(src) {
  var srcWithoutProtocol = src.replace(/^https?:/, '');
  if(!document.querySelector('link[href="' + encodeURI(srcWithoutProtocol) + '"]')) {
    var tag = document.createElement('link');
    tag.href = srcWithoutProtocol;
    tag.rel = 'stylesheet';
    tag.type = 'text/css';
    var firstTag = document.getElementsByTagName('link')[0];
    firstTag.parentNode.insertBefore(tag, firstTag);
  }
};

theme.ProductMediaGallery = function ($gallery) {
  $gallery.addClass('product-photos--initialized');

  var _this = this;
  var currentMedia;
  var initialisedMedia = {};
  var $viewInSpaceButton = $gallery.find('.view-in-space');
  var $thumbContainer = $gallery.find('.thumbnails');

  this.Image = function ($elem, autoplay) {
    this.show = function () {
      $elem.show();
    };

    this.destroy = function () { };
    this.pause = function () { };

    this.hide = function () {
      $elem.hide();
    };

    //Init the image
    this.show();
  };

  this.Video = function ($elem, autoplay) {
    var _video = this;
    var playerObj = {
      play: function(){},
      pause: function(){},
      destroy: function(){}
    };
    var videoElement = $elem.find('video')[0];

    this.show = function () {
      $elem.show();
    };

    this.play = function () {
      _video.show();
      playerObj.play();
    };

    this.pause = function () {
      playerObj.pause();
    };

    this.hide = function () {
      playerObj.pause();
      $elem.hide();
    };

    this.destroy = function () {
      playerObj.destroy();
      $(videoElement).off('playing', _this.pauseAllMedia);
    };

    //Init the video
    theme.loadStyleOnce('https://cdn.shopify.com/shopifycloud/shopify-plyr/v1.0/shopify-plyr.css');

    // set up a controller for Plyr video
    window.Shopify.loadFeatures([{
      name: 'video-ui',
      version: '1.0',
      onLoad: function () {
        playerObj = {
          playerType: 'html5',
          element: videoElement,
          plyr: new Shopify.Plyr(videoElement, {
            controls: [
              'play',
              'progress',
              'mute',
              'volume',
              'play-large',
              'fullscreen'
            ],
            loop: {
              active: $elem.data('enable-video-looping')
            },
            autoplay: ($(window).width() >= 768 && autoplay),
            hideControlsOnPause: true,
            iconUrl: '//cdn.shopify.com/shopifycloud/shopify-plyr/v1.0/shopify-plyr.svg',
            tooltips: {
              controls: false,
              seek: true
            }
          }),
          play: (function () {
            this.plyr.play();
          }),
          pause: (function () {
            this.plyr.pause();
          }),
          destroy: (function () {
            this.plyr.destroy();
          })
        };

        $elem.addClass('product-media--video-loaded');

        initialisedMedia[$elem.data('media-id')] = _video;
      }.bind(this)
    }]);

    $(videoElement).on('playing', function(){_this.pauseAllMedia($elem.data('media-id'));});

    _video.show();
  };

  this.ExternalVideo = function ($elem, autoplay) {
    var _video = this;
    var playerObj = {
      play: function(){},
      pause: function(){},
      destroy: function(){}
    };
    var iframeElement = $elem.find('iframe')[0];

    this.play = function () {
      _video.show();
      playerObj.play();
    };

    this.pause = function () {
      playerObj.pause();
    };

    this.show = function () {
      $elem.show();
    };

    this.hide = function () {
      playerObj.pause();
      $elem.hide();
    };

    this.destroy = function () {
      playerObj.destroy();
    };

    //Init the external video
    if (/^(https?:\/\/)?(www\.)?(youtube\.com|youtube-nocookie\.com|youtu\.?be)\/.+$/.test(iframeElement.src)) {

      var loadYoutubeVideo = function () {
        playerObj = {
          playerType: 'youtube',
          element: iframeElement,
          player: new YT.Player(iframeElement, {
            videoId: $elem.data('video-id'),
            events: {
              onReady: function () {
                initialisedMedia[$elem.data('media-id')] = _video;

                $elem.addClass('product-media--video-loaded');

                if (autoplay && $(window).width() >= 768) {
                  _video.play();
                }
              },
              onStateChange: function (event) {
                if(event.data === 1){
                  _this.pauseAllMedia($elem.data('media-id'));
                }

                if (event.data === 0 && $elem.data('enable-video-looping')) {
                  event.target.seekTo(0);
                }
              }
            }
          }),
          play: (function () {
            this.player.playVideo()
          }),
          pause: (function () {
            this.player.pauseVideo()
          }),
          destroy: (function () {
            this.player.destroy()
          })
        };
      };

      if (window.YT && window.YT.Player) {
        loadYoutubeVideo();
      } else {
        // set up a controller for YouTube video
        var temp = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = function () {
          temp();
          loadYoutubeVideo();
        };

        theme.loadScriptOnce('https://www.youtube.com/iframe_api');
      }
    }

    _video.show();
  };

  this.Model = function ($elem, autoplay, dontShow) {
    var _model = this;
    var playerObj = {
      play: function(){},
      pause: function(){},
      destroy: function(){}
    };
    var modelElement = $elem.find('model-viewer')[0];

    this.show = function () {
      $elem.show();

      if (window.ShopifyXR && $viewInSpaceButton.length) {
        //Change the view in space button to launch this model
        $viewInSpaceButton.attr('data-shopify-model3d-id', $elem.data('media-id'));
        window.ShopifyXR.setupXRElements();
      }
    };

    this.play = function () {
      _model.show();
      playerObj.play();
    };

    this.pause = function () {
      playerObj.pause();
    };

    this.hide = function () {
      playerObj.pause();
      $elem.hide();

      if (window.ShopifyXR && $viewInSpaceButton.length) {
        //Reset the view in space button to launch the first model
        $viewInSpaceButton.attr('data-shopify-model3d-id', $viewInSpaceButton.data('shopify-model3d-first-id'));
        $viewInSpaceButton.attr('data-shopify-title', $viewInSpaceButton.data('shopify-first-title'));
        window.ShopifyXR.setupXRElements();
      }
    };

    this.destroy = function () {
      //Nothing needed
    };

    this.initAugmentedReality = function () {
      if ($('.model-json', $gallery).length) {
        var doInit = function () {
          if (!window.ShopifyXR) {
            document.addEventListener('shopify_xr_initialized', function shopifyXrEventListener(event) {
              doInit();

              //Ensure this only fires once
              event.target.removeEventListener(event.type, shopifyXrEventListener);
            });

            return;
          }

          window.ShopifyXR.addModels(JSON.parse($('.model-json', $gallery).html()));
          window.ShopifyXR.setupXRElements();
        };

        window.Shopify.loadFeatures([{
          name: 'shopify-xr',
          version: '1.0',
          onLoad: doInit
        }]);
      }
    };

    //Init the model
    theme.loadStyleOnce('https://cdn.shopify.com/shopifycloud/model-viewer-ui/assets/v1.0/model-viewer-ui.css');

    window.Shopify.loadFeatures([
      {
        name: 'model-viewer-ui',
        version: '1.0',
        onLoad: (function () {
          playerObj = new Shopify.ModelViewerUI(modelElement);
          $elem.addClass('product-media--model-loaded');

          if (autoplay && $(window).width() >= 768) {
            _model.play();
          }

          //Prevent the buttons from submitting the form
          $elem.find('button').attr('type', 'button');
        }).bind(this)
      }
    ]);

    initialisedMedia[$elem.data('media-id')] = _model;

    if(!dontShow) {
      _model.show();
    }

    if (!window.ShopifyXR) {
      _model.initAugmentedReality();
    }
  };

  this.pauseAllMedia = function (ignoreKey) {
    for (var key in initialisedMedia) {
      if (initialisedMedia.hasOwnProperty(key) && (!ignoreKey ||  key != ignoreKey)) {
        initialisedMedia[key].pause();
      }
    }
  };

  this.showMedia = function ($mediaToShow, autoplay, preventHide) {
    //In with the new
    if ($mediaToShow.length) {
      //Out with the old
      if (currentMedia && !preventHide) {
        currentMedia.hide();
      }

      //Function to instantiate and return the relevant media
      var getMedia = function(MediaType) {
        var media;

        if (initialisedMedia.hasOwnProperty($mediaToShow.data('media-id'))) {
          media = initialisedMedia[$mediaToShow.data('media-id')];

          if (autoplay && $(window).width() >= 768) {
            media.show();
            //Delay play so its easier for users to understand that it paused
            setTimeout(media.play, 250);
          } else {
            media.show();
          }
        } else {
          media = new MediaType($mediaToShow, autoplay);
        }

        return media;
      };

      //Initialise the media
      if ($mediaToShow.data('media-type') === "image") {
        currentMedia = getMedia(_this.Image);
      } else if ($mediaToShow.data('media-type') === "video"){
        currentMedia = getMedia(_this.Video);
      } else if ($mediaToShow.data('media-type') === "external_video"){
        currentMedia = getMedia(_this.ExternalVideo);
      } else if ($mediaToShow.data('media-type') === "model") {
        currentMedia = getMedia(_this.Model);
      } else {
        console.warn('Media is unknown', $mediaToShow);
        $gallery.find('.product-media:visible').hide();
        $mediaToShow.show();
      }
    }
  };

  this.destroy = function () {
    for (var i = 0; i < initialisedMedia.length; i++) {
      initialisedMedia[i].destroy();
    }

    $gallery.off('click', '.thumbnails .thumb');
    $gallery.off('click', '.load-all-thumbs');
    $gallery.off('click', '.product-media--image a.main-img-link');
    $(window).off('debouncedresize.gallery', updateThumbArrowStates);
  };

  var $mediaToInit = $gallery.find('.product-media:first');
  var $activeThumbnail = $gallery.find('.thumb.active');

  if($activeThumbnail.length) {
    $mediaToInit = $gallery.find('.product-media[data-media-id="' + $activeThumbnail.data('media-id') + '"]');
  }

  // Init the first media item
  _this.showMedia($mediaToInit, false);

  // On mobile, init the first model (without showing it) to init the view in your space button
  if($mediaToInit.data('media-type') !== 'model' && $(window).width() < 768){
    var $firstModel = $gallery.find('.product-media[data-media-type="model"]:first');
    if($firstModel.length){
      new _this.Model($firstModel, false, true);
    }
  }

  // Click a thumbnail
  $gallery.on('click', '.thumbnails .thumb', function(e){
    e.preventDefault();

    if(!$(this).hasClass('active')) {
      $(this).addClass('active').siblings('.active').removeClass('active');
      var $mediaToShow = $gallery.find('.product-media[data-media-id="' + $(this).data('media-id') + '"]');
      _this.showMedia($mediaToShow, true);
    }
  });

  // Click next/prev
  $gallery.on('click', '.thumbnails__prev,.thumbnails__next', function(e){
    e.preventDefault();
    if($(this).hasClass('thumbnails__prev')){
      //Go backwards
      $thumbContainer.animate({
        scrollLeft: $thumbContainer.scrollLeft() - ($thumbContainer.outerWidth() * .8)
      }, 500);
    }else{
      //Go forwards
      $thumbContainer.animate({
        scrollLeft: ($thumbContainer.outerWidth() * .8) + $thumbContainer.scrollLeft()
      }, 500);
    }
  });

  var $prevArrow = $gallery.find('.thumbnails__prev');
  var $nextArrow = $gallery.find('.thumbnails__next');
  var $thumbsInner = $thumbContainer.find('.thumbnails-inner');
  var $thumbsOuter = $gallery.find('.thumbnails-outer');

  // Update the state of the arrows (enabled/disabled) based on the scroll position of the thumbs;
  function updateThumbArrowStates(){
    if($thumbsInner.outerWidth() < $thumbContainer.outerWidth()) {
      //No need for arrows, remove em
      $thumbsOuter.addClass('thumbnails--no-arrows');
    }else if($thumbContainer.scrollLeft() === 0){
      $thumbsOuter.removeClass('thumbnails--no-arrows');
      $prevArrow.attr('disabled', 'true');
      $nextArrow.removeAttr('disabled');
    }else if(($thumbContainer.innerWidth() + $thumbContainer.scrollLeft())  === $thumbsInner.outerWidth()) {
      $thumbsOuter.removeClass('thumbnails--no-arrows');
      $prevArrow.removeAttr('disabled');
      $nextArrow.attr('disabled', 'true');
    }else{
      $thumbsOuter.removeClass('thumbnails--no-arrows');
      $prevArrow.removeAttr('disabled');
      $nextArrow.removeAttr('disabled');
    }
  };
  updateThumbArrowStates();

  // Detect when scroll has finished
  var thumbScrollTimer;
  $thumbContainer.scroll(function() {
    clearTimeout(thumbScrollTimer);
    thumbScrollTimer = setTimeout(updateThumbArrowStates, 100);
  });

  // Update arrows on window resize
  $(window).on('debouncedresize.gallery', updateThumbArrowStates);

  // Expand all thumbs into large images
  $gallery.on('click', '.load-all-thumbs', function(){
    $gallery.css('height', $gallery.height() + 'px');
    $gallery.addClass('product-photos--expanded-all');

    $gallery.find('.product-media').each(function(){
      _this.showMedia($(this), false, true);
    });

    $gallery.css('height', $gallery.find('.main-wrapper').height() + 'px');

    setTimeout(function(){
      $gallery.css('height', 'auto');
    },1100);

    return false;
  });

  // Click on main image
  $gallery.on('click', '.product-media--image a.main-img-link', function(e){
    e.preventDefault();
    //Don't do anything if the screen isn't very tall, otherwise, lightbox!
    if($(window).height() >= theme.lightbox_min_window_height && $(window).width() >= theme.lightbox_min_window_width) {
      if($gallery.find('.product-media--image').length == 1) {
        //One image only?
        $.colorbox({ href: $(this).attr('href'), maxWidth: '94%' });
      } else {
        //Many images. Dupe thumbs to create a faux-gallery
        var imgSel = $gallery.find('.main').length > 1 ? '.main' : '.thumbnails';
        $('#gallery-cont').remove();
        var $galleryCont = $('<div id="gallery-cont"/>').append(
            $gallery.find(imgSel).find('a.thumb--media-image:has(img)').clone().attr({ rel: 'gallery', title: '' })
        ).hide().appendTo('body');
        //Trigger box (on the right one)
        $galleryCont.children().colorbox({maxWidth:'94%'}).filter('[href="'+$(this).attr('href')+'"]').first().click();
      }
    }
  });
};

// Loading third party scripts
theme.scriptsLoaded = {};
theme.loadScriptOnce = function(src, callback, beforeRun) {
  if(typeof theme.scriptsLoaded[src] === 'undefined') {
    theme.scriptsLoaded[src] = [];
    var tag = document.createElement('script');
    tag.src = src;

    if(beforeRun) {
      tag.async = false;
      beforeRun();
    }

    if(typeof callback === 'function') {
      theme.scriptsLoaded[src].push(callback);
      if (tag.readyState) { // IE, incl. IE9
        tag.onreadystatechange = (function() {
          if (tag.readyState == "loaded" || tag.readyState == "complete") {
            tag.onreadystatechange = null;
            for(var i = 0; i < theme.scriptsLoaded[this].length; i++) {
              theme.scriptsLoaded[this][i]();
            }
            theme.scriptsLoaded[this] = true;
          }
        }).bind(src);
      } else {
        tag.onload = (function() { // Other browsers
          for(var i = 0; i < theme.scriptsLoaded[this].length; i++) {
            theme.scriptsLoaded[this][i]();
          }
          theme.scriptsLoaded[this] = true;
        }).bind(src);
      }
    }

    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    return true;
  } else if(typeof theme.scriptsLoaded[src] === 'object' && typeof callback === 'function') {
    theme.scriptsLoaded[src].push(callback);
  } else {
    if(typeof callback === 'function') {
      callback();
    }
    return false;
  }
}

// Manage videos
theme.VideoManager = new function(){
  var _ = this;

  // Youtube
  _.youtubeVars = {
    incrementor: 0,
    apiReady: false,
    videoData: {},
    toProcessSelector: '.video-container[data-video-type="youtube"]:not(.video--init)'
  };

  _.youtubeApiReady = function() {
    _.youtubeVars.apiReady = true;
    _._loadYoutubeVideos();
  }

  _._loadYoutubeVideos = function(container) {
    if($(_.youtubeVars.toProcessSelector, container).length) {
      if(_.youtubeVars.apiReady) {
        // play those videos
        $(_.youtubeVars.toProcessSelector, container).addClass('video--init').each(function(){
          _.youtubeVars.incrementor++;
          var containerId = 'theme-yt-video-'+_.youtubeVars.incrementor;
          var videoElement = $('<div>').attr('id', containerId).appendTo(this);
          var autoplay = $(this).data('video-autoplay');
          var player = new YT.Player(containerId, {
            height: '390',
            width: '640',
            videoId: $(this).data('video-id'),
            playerVars: {
              iv_load_policy: 3,
              modestbranding: 1,
              autoplay: autoplay ? 1 : 0,
              rel: 0
            },
            events: {
              onReady: _._onYoutubePlayerReady.bind({ autoplay: autoplay }),
              onStateChange: _._onYoutubePlayerStateChange
            }
          });
          _.youtubeVars.videoData[containerId] = {
            id: containerId,
            container: this,
            videoElement: videoElement,
            player: player
          };
        });
      } else {
        // load api
        theme.loadScriptOnce('https://www.youtube.com/iframe_api');
      }
    }
  }

  _._onYoutubePlayerReady = function(event) {
    event.target.setPlaybackQuality('hd1080');
    if(this.autoplay) {
      event.target.mute();
    }
  }

  _._onYoutubePlayerStateChange = function(event) {
  }

  _._getYoutubeVideoData = function(event) {
    return _.youtubeVars.videoData[event.target.h.id];
  }

  _._unloadYoutubeVideos = function(container) {
    for(var dataKey in _.youtubeVars.videoData) {
      var data = _.youtubeVars.videoData[dataKey];
      if($(container).find(data.container).length) {
        data.player.destroy();
        delete _.youtubeVars.videoData[dataKey];
        return;
      }
    }
  }

  // Vimeo
  _.vimeoVars = {
    incrementor: 0,
    apiReady: false,
    videoData: {},
    toProcessSelector: '.video-container[data-video-type="vimeo"]:not(.video--init)'
  };

  _.vimeoApiReady = function() {
    _.vimeoVars.apiReady = true;
    _._loadVimeoVideos();
  }

  _._loadVimeoVideos = function(container) {
    if($(_.vimeoVars.toProcessSelector, container).length) {
      if(_.vimeoVars.apiReady) {
        // play those videos
        $(_.vimeoVars.toProcessSelector, container).addClass('video--init').each(function(){
          _.vimeoVars.incrementor++;
          var $this = $(this);
          var containerId = 'theme-vi-video-'+_.vimeoVars.incrementor;
          var videoElement = $('<div>').attr('id', containerId).appendTo(this);
          var autoplay = !!$(this).data('video-autoplay');
          var player = new Vimeo.Player(containerId, {
            url: $(this).data('video-url'),
            width: 640,
            loop: false,
            autoplay: autoplay
          });
          player.ready().then(function(){
            if(autoplay) {
              player.setVolume(0);
            }
            if(player.element && player.element.width && player.element.height) {
              var ratio = parseInt(player.element.height) / parseInt(player.element.width);
              $this.css('padding-bottom', (ratio*100) + '%');
            }
          });
          _.vimeoVars.videoData[containerId] = {
            id: containerId,
            container: this,
            videoElement: videoElement,
            player: player,
            autoPlay: autoplay
          };
        });
      } else {
        // load api
        if(window.define) {
          // workaround for third parties using RequireJS
          theme.loadScriptOnce('https://player.vimeo.com/api/player.js', function(){
            _.vimeoVars.apiReady = true;
            _._loadVimeoVideos();
            window.define = window.tempDefine;
          }, function(){
            window.tempDefine = window.define;
            window.define = null;
          });
        } else {
          theme.loadScriptOnce('https://player.vimeo.com/api/player.js', function(){
            _.vimeoVars.apiReady = true;
            _._loadVimeoVideos();
          });
        }
      }
    }
  }

  _._unloadVimeoVideos = function(container) {
    for(var dataKey in _.vimeoVars.videoData) {
      var data = _.vimeoVars.videoData[dataKey];
      if($(container).find(data.container).length) {
        data.player.unload();
        delete _.vimeoVars.videoData[dataKey];
        return;
      }
    }
  }

  // Compatibility with Sections
  this.onSectionLoad = function(container){
    _._loadYoutubeVideos(container);
    _._loadVimeoVideos(container);

    // play button
    $('.video-container__play, .video-container__overlay-text', container).on('click', function(evt){
      evt.preventDefault();
      // reveal
      var $cover = $(this).closest('.video-container__cover').addClass('video-container__cover--playing');
      // play
      var id = $cover.next().attr('id');
      if(id.indexOf('theme-yt-video') === 0) {
        _.youtubeVars.videoData[id].player.playVideo();
      } else {
        _.vimeoVars.videoData[id].player.play();
      }
    });
  }

  this.onSectionUnload = function(container){
    $('.video-container__play, .video-container__overlay-text', container).off('click');
    _._unloadYoutubeVideos(container);
    _._unloadVimeoVideos(container);
  }
}

// Youtube API callback
window.onYouTubeIframeAPIReady = function() {
  theme.VideoManager.youtubeApiReady();
}

// Manage option dropdowns
theme.productData = {};

theme.OptionManager = new function(){
  var _ = this;

  _._getVariantOptionElement = function(variant, $container) {
    return $container.find('select[name="id"] option[value="' + variant.id + '"]');
  };

  _.selectors = {
    container: '.product',
    gallery: '.product-photos',
    priceArea: '.product-price',
    submitButton: 'input[type=submit], button[type=submit]',
    multiOption: '.option-selectors'
  };

  _.strings = {
    priceNonExistent: "Unavailable",
    priceSoldOut: '<span class="productlabel soldout"><span>'+"Out of stock"+'</span></span>',
    buttonDefault: "Add to cart",
    buttonNoStock: "Out of stock",
    buttonNoVariant: "Unavailable"
  };

  _._getString = function(key, variant){
    var string = _.strings[key];
    if(variant) {
      string = string.replace('[PRICE]', '<span class="product-price__amount theme-money">'+Shopify.formatMoney(variant.price, theme.money_format)+'</span>');
    }
    return string;
  }

  _.getProductData = function($form) {
    var productId = $form.data('product-id');
    var data = null;
    if(!theme.productData[productId]) {
      theme.productData[productId] = JSON.parse(document.getElementById('ProductJson-' + productId).innerHTML);
    }
    data = theme.productData[productId];
    if(!data) {
      console.log('Product data missing (id: '+$form.data('product-id')+')');
    }
    return data;
  }

  _.addVariantUrlToHistory = function(variant) {
    if(variant) {
      var newurl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?variant=' + variant.id;
      window.history.replaceState({path: newurl}, '', newurl);
    }
  }

  _.updateSku = function(variant, $container){
    $container.find('.sku .sku__value').html( variant ? variant.sku : '' );
    $container.find('.sku').toggleClass('sku--no-sku', !variant || !variant.sku);
  }

  _.updateBarcode = function(variant, $container){
    $container.find('.barcode .barcode__value').html( variant ? variant.barcode : '' );
    $container.find('.barcode').toggleClass('barcode--no-barcode', !variant || !variant.barcode);
  }

  _.updateBackorder = function(variant, $container){
    var $backorder = $container.find('.backorder');
    if($backorder.length) {
      if (variant && variant.available) {
        if (variant.inventory_management && _._getVariantOptionElement(variant, $container).data('stock') == 'out') {
          var productData = _.getProductData($backorder.closest('form'));
          $backorder.find('.selected-variant').html(productData.title + (variant.title.indexOf('Default') >= 0 ? '' : ' - '+variant.title) );
          $backorder.show();
        } else {
          $backorder.hide();
        }
      } else {
        $backorder.hide();
      }
    }
  }

  _.updatePrice = function(variant, $container) {
    var $priceArea = $container.find(_.selectors.priceArea);
    $priceArea.removeClass('on-sale');

    if(variant && variant.available == true) {
      var $newPriceArea = $('<div>');
      $('<span class="product-price__amount theme-money">').html(Shopify.formatMoney(variant.price, theme.money_format)).appendTo($newPriceArea);
      if(variant.compare_at_price > variant.price) {
        $newPriceArea.append(' ');
        $('<span class="product-price__compare theme-money">').html(Shopify.formatMoney(variant.compare_at_price, theme.money_format)).appendTo($newPriceArea);
        $priceArea.addClass('on-sale');
      }
      $priceArea.html($newPriceArea.html());
    } else {
      if(variant) {
        $priceArea.html(_._getString('priceSoldOut', variant));
      } else {
        $priceArea.html(_._getString('priceNonExistent', variant));
      }
    }
  }

  _._updateButtonText = function($button, string, variant) {
    $button.each(function(){
      var newVal;
      newVal = _._getString('button' + string, variant);
      if(newVal !== false) {
        if($(this).is('input')) {
          $(this).val(newVal);
        } else {
          $(this).html(newVal);
        }
      }
    });
  }

  _.updateButtons = function(variant, $container) {
    var $button = $container.find(_.selectors.submitButton);

    if(variant && variant.available == true) {
      $button.removeAttr('disabled');
      _._updateButtonText($button, 'Default', variant);
    } else {
      $button.attr('disabled', 'disabled');
      if(variant) {
        _._updateButtonText($button, 'NoStock', variant);
      } else {
        _._updateButtonText($button, 'NoVariant', variant);
      }
    }
  }

  _.updateContainerStatusClasses = function(variant, $container) {
    $container.toggleClass('variant-status--unavailable', !variant.available);
    $container.toggleClass('variant-status--backorder', variant.available
      && variant.inventory_management
      && _._getVariantOptionElement(variant, $container).data('stock') == 'out');
  }

  _.initProductOptions = function(originalSelect) {
    $(originalSelect).not('.theme-init').addClass('theme-init').each(function(){
      var $originalSelect = $(this);
      var productData = _.getProductData($originalSelect.closest('form'));

      // change state for original dropdown
      $originalSelect.on('change.themeProductOptions firstrun.themeProductOptions', function(e, variant){
        if($(this).is('input[type=radio]:not(:checked)')) {
          return; // handle radios - only update for checked
        }
        var variant = variant;
        if(!variant && variant !== false) {
          for(var i=0; i<productData.variants.length; i++) {
            if(productData.variants[i].id == $(this).val()) {
              variant = productData.variants[i];
            }
          }
        }
        var $container = $(this).closest(_.selectors.container);

        // update buttons
        _.updateButtons(variant, $container);

        // update price (after button, in case price is in button)
        _.updatePrice(variant, $container);

        // variant images
        if (variant && variant.featured_media && variant.featured_media.preview_image) {
          $container.find(_.selectors.gallery).trigger('variantImageSelected', variant);
        }

        // extra details
        _.updateBarcode(variant, $container);
        _.updateSku(variant, $container);
        _.updateBackorder(variant, $container);
        _.updateContainerStatusClasses(variant, $container);

        // variant urls
        var $form = $(this).closest('form');
        if($form.data('enable-history-state') && e.type != 'firstrun') {
          _.addVariantUrlToHistory(variant);
        }

        // multi-currency
        theme.runMultiCurrency();
      });

      // split-options wrapper
      $originalSelect.closest(_.selectors.container).find(_.selectors.multiOption).on('change.themeProductOptions', 'select', function(){
        var selectedOptions = [];
        $(this).closest(_.selectors.multiOption).find('select').each(function(){
          selectedOptions.push($(this).val());
        });
        // find variant
        var variant = false;
        for(var i=0; i<productData.variants.length; i++) {
          var v = productData.variants[i];
          var matchCount = 0;
          for(var j=0; j<selectedOptions.length; j++) {
            if(v.options[j] == selectedOptions[j]) {
              matchCount++;
            }
          }
          if(matchCount == selectedOptions.length) {
            variant = v;
            break;
          }
        }
        // trigger change
        if(variant) {
          $originalSelect.val(variant.id);
        }
        $originalSelect.trigger('change', variant);
      });

      // first-run
      $originalSelect.trigger('firstrun');
    });
  }

  _.unloadProductOptions = function(originalSelect) {
    $(originalSelect).each(function(){
      $(this).off('.themeProductOptions');
      $(this).closest(_.selectors.container).find(_.selectors.multiOption).off('.themeProductOptions');
    });
  }
}

// Orphan reduction on reasonable screens
theme.reduceOrphans = function($items) {
  if($(window).width() > 500) {
    $items.each(function(){
      var html = $(this).html();
      var words = html.split(' ');
      if(words.length > 3) {
        var joinedOrphanLength = words[words.length - 2].length + words[words.length - 1].length + 1;
        var isNotLongerThanPrior = html.length > joinedOrphanLength * 2;
        var isDecentLength = joinedOrphanLength < 20;
        if(isNotLongerThanPrior
          && isDecentLength) {
          var idx = html.lastIndexOf(' ');
          var newHtml = html.substr(0, idx) + '&nbsp;' + html.substr(idx + 1);
          $(this).html(newHtml);
        }
      }
    });
  }
}

theme.SlideshowSection = new function(){
  var _ = this;

  this.assessSlideshowOverlayHeight = function(){
    // ensure image is at least as tall as the overlay text
    $('.section--slideshow .overlay').each(function(){
      var vertPad = parseInt($(this).css('padding-top')) + parseInt($(this).css('padding-bottom'));
      var textHeight = $(this).find('.innest').outerHeight();
      var $e = $(this).closest('.banner-image');
      if($e.hasClass('fixed-height')) {
        $e.closest('.slide').css('min-height', textHeight + vertPad);
      } else {
        $e.find('.rimage-wrapper').css('min-height', textHeight + vertPad);
      }
    });
  }

  this.onSectionLoad = function(target){
    theme.reduceOrphans($('.slide-heading, .slide-text', target));

    // Set up the slideshow
    $('.slideshow', target).each(function(){
      var isCarousel = $(this).data('carousel');
      var doFade = $(this).data('transition') == 'fade';
      var doTransitions = true;
      $(this).on('init', function(e, slideshow){
        $('.lazyload--manual', this).removeClass('lazyload--manual').addClass('lazyload');

        if(doTransitions) {
          // reveal overlays
          $('.slick-active .overlay--transition', this).removeClass('overlay--transition-out').each(function(){
            // match clones
            $(this).closest('.slideshow').find('.slick-clone .block-' + $(this).closest('.slide').data('index') + ' .overlay--transition').removeClass('overlay--transition-out');
          });
        }
      }).on('afterChange setPosition', function(e, slideshow){
        if(doTransitions) {
          // hide overlays when off screen
          $('.slick-slide:not(.slick-active):not(.slick-clone) .overlay--transition', this).addClass('overlay--transition-out').each(function(){
            // match clones
            $(this).closest('.slideshow').find('.slick-clone:not(.slick-active) .block-' + $(this).closest('.slide').data('index') + ' .overlay--transition').addClass('overlay--transition-out');
          });
          // reveal overlays
          $('.slick-active .overlay--transition', this).removeClass('overlay--transition-out').each(function(){
            // match clones (a clone can be active in carousel)
            $(this).closest('.slideshow').find('.block-' + $(this).closest('.slide').data('index') + ' .overlay--transition').removeClass('overlay--transition-out');
          });
        }
      }).slick({
        autoplay: $(this).hasClass('auto-play'),
        fade: !isCarousel && doFade,
        infinite: true,
        slidesToShow: isCarousel ? 2 : 1,
        useTransform: true,
        arrows: true,
        dots: false,
        prevArrow: [
          '<button type="button" class="slick-prev" aria-label="', theme.strings.previous, '">',
          '<span class="desktop-only">',
          theme.icons.chevronLightLeft,
          '</span>',
          '<span class="mobile-only">',
          theme.icons.arrowLeft,
          '</span>',
          '</button>'
        ].join(''),
        nextArrow: [
          '<button type="button" class="slick-next" aria-label="', theme.strings.next, '">',
          '<span class="desktop-only">',
          theme.icons.chevronLightRight,
          '</span>',
          '<span class="mobile-only">',
          theme.icons.arrowRight,
          '</span>',
          '</button>'
        ].join(''),
        autoplaySpeed: 7000, // milliseconds to wait between slides
        responsive: [
          {
            breakpoint: 900,
            settings: {
              fade: doFade,
              slidesToShow: 1
            }
          },
          {
            breakpoint: 768,
            settings: {
              fade: doFade,
              arrows: true,
              dots: true,
              slidesToShow: 1
            }
          }
        ]
      });
    });

    $(window).off('.slideshowSection').on('debouncedresize.slideshowSection', _.assessSlideshowOverlayHeight);
    _.assessSlideshowOverlayHeight();
  }

  this.onSectionUnload = function(target){
    $('.slick-slider', target).slick('unslick').off('init afterChange setPosition');
    $(window).off('.slideshowSection');
  }

  this.onBlockSelect = function(target){
    $(target).closest('.slick-slider')
      .slick('slickGoTo', $(target).data('slick-index'))
      .slick('slickPause');
  }

  this.onBlockDeselect = function(target){
    $(target).closest('.slick-slider')
      .slick('slickPlay');
  }
}

theme.BannerIndexSection = new function(){
  this.onSectionLoad = function(target) {
    var target = target;
    theme.checkForBannerBehindHeader();
    theme.SlideshowSection.onSectionLoad(target);
  }

  this.onSectionUnload = function(target) {
    theme.SlideshowSection.onSectionUnload(target);
  }

  this.onBlockSelect = theme.SlideshowSection.onBlockSelect;

  this.onBlockDeselect = theme.SlideshowSection.onBlockDeselect;
}

theme.SlideshowWithTextSection = new function(){
  this.onSectionLoad = function(target){
    $('.slideshow', target).each(function(){
      $(this).on('init', function(){
        $('.lazyload--manual', this).removeClass('lazyload--manual').addClass('lazyload');
      }).slick({
        autoplay: $(this).hasClass('auto-play'),
        fade: $(this).data('transition') == 'fade',
        autoplaySpeed: 7000, // milliseconds to wait between slides
        infinite: true,
        useTransform: true,
        arrows: true,
        prevArrow: [
          '<button type="button" class="slick-prev" aria-label="', theme.strings.previous, '">',
          '<span class="desktop-only">',
          theme.icons.chevronLightLeft,
          '</span>',
          '<span class="mobile-only">',
          theme.icons.arrowLeft,
          '</span>',
          '</button>'
        ].join(''),
        nextArrow: [
          '<button type="button" class="slick-next" aria-label="', theme.strings.next, '">',
          '<span class="desktop-only">',
          theme.icons.chevronLightRight,
          '</span>',
          '<span class="mobile-only">',
          theme.icons.arrowRight,
          '</span>',
          '</button>'
        ].join(''),
        dots: true
      });
    });
  }

  this.onSectionUnload = function(target){
    $('.slick-slider', target).slick('unslick').off('init');
  }

  this.onBlockSelect = function(target){
    $(target).closest('.slick-slider')
      .slick('slickGoTo', $(target).data('slick-index'))
      .slick('slickPause');
  }

  this.onBlockDeselect = function(target){
    $(target).closest('.slick-slider')
      .slick('slickPlay');
  }
}

theme.FeaturedCollectionSection = new function(){
  this.onSectionLoad = function(target){
    $(window).trigger('checkcaptionheights');
  }
}

theme.FeaturedCollectionsSection = new function(){
  this.onSectionLoad = function(target){
    $(window).trigger('checkcaptionheights');
  }
}

theme.ProductTemplateSection = new function(){
  var galleries = [];

  this.onSectionLoad = function(target){
    $('.product-photos:not(.product-photos--initialized)', target).each(function(){
      galleries.push(new theme.ProductMediaGallery($(this)));
    });

    theme.loadPageHeaderImage(target);
    theme.OptionManager.initProductOptions($('select[name="id"]', target));
    $(window).trigger('checkcaptionheights');
    $('.product-review-summary a', target).on('click', function(e){
      e.preventDefault();
      $('html,body').animate({
        scrollTop: $($(this).attr('href')).offset().top - 120
      }, 1000, 'swing');
    });
  }

  this.onSectionUnload = function(target){
    theme.unloadPageHeaderImage(target);
    theme.OptionManager.unloadProductOptions($('select[name="id"]', target));
    $('.product-review-summary a', target).off('click');
    if(galleries.length){
      for(var i=0; i<galleries.length; i++){
        galleries[i].destroy();
      }
    }
  }
}

theme.FeaturedProductSection = new function(){
  var galleries = [];

  this.onSectionLoad = function(target){
    $('.product-photos:not(.product-photos--initialized)', target).each(function(){
      galleries.push(new theme.ProductMediaGallery($(this)));
    });
    theme.loadPageHeaderImage(target);
    theme.OptionManager.initProductOptions($('select[name="id"]', target));
    $(window).trigger('checkcaptionheights');
  }

  this.onSectionUnload = function(target){
    theme.unloadPageHeaderImage(target);
    theme.OptionManager.unloadProductOptions($('select[name="id"]', target));
    if(galleries.length){
      for(var i=0; i<galleries.length; i++){
        galleries[i].destroy();
      }
    }
  }
}

theme.TestimonialsSection = new function(){
  var _ = this;

  this.assessTestimonialCarouselLayout = function(){
    $('.testimonials__items.slick-slider').each(function(){
      var containerWidth = $(this).width();
      var itemsSumWidth = 0;
      $(this).find('.slick-slide').each(function(){
        itemsSumWidth += $(this).outerWidth(true) + 1; // defensive rounding
      });
      $(this).toggleClass('slick-slider--center-carousel', itemsSumWidth < containerWidth);
    });
  }

  this.onSectionLoad = function(target){
    var $carousel = $('.testimonials__items', target);

    // initialise carousel
    $carousel.on('afterChange', function(e, slideshow){
      // prepare for caption transition
      var $container = $(this).closest('.testimonials');
      clearTimeout($container.data('captionChangeTimeoutId'));
      clearTimeout($container.data('captionChangeTimeoutId2'));
      var captionToShowEl = $container.find('.testimonials__caption')[$container.find('.slick-current').data('slick-index')];
      $container.find('.testimonials__caption--active').addClass('testimonials__caption--fade-out');
      $container.data(
        'captionChangeTimeoutId',
        setTimeout(function(){
          $(captionToShowEl).addClass('testimonials__caption--active testimonials__caption--fade-out').siblings('.testimonials__caption--active').removeClass('testimonials__caption--active');
          // initiate fade-in after old one has faded out and new one is ready to fade in
          $container.data(
            'captionChangeTimeoutId2',
            setTimeout(function(){
              $(captionToShowEl).removeClass('testimonials__caption--fade-out');
            }, 10)
          );
        }, 400) // matches css transition
      );
    }).slick({
      autoplay: $carousel.data('autoplay'),
      autoplaySpeed: $carousel.data('autoplay-delay'),
      infinite: false,
      slidesToShow: 1,
      centerMode: true,
      variableWidth: true,
      useTransform: true,
      arrows: false,
      dots: false
    });

    // focus on click
    $carousel.on('click', '.testimonials__item', function(e){
      e.preventDefault();
      $carousel.slick('slickGoTo', $(this).data('slick-index'));
    });

    // assess if we can centre the carousel or not
    $(window).off('.testimonialsSection').on('debouncedresize.testimonialsSection', _.assessTestimonialCarouselLayout);
    _.assessTestimonialCarouselLayout();
  }

  this.onSectionUnload = function(target){
    $('.slick-slider', target).slick('unslick').off('init afterChange click');
    $(window).off('.testimonialsSection');
  }

  this.onBlockSelect = function(target){
    var $carousel = $(target).closest('.slick-slider');
    if($carousel.data('autoplay')) {
      $carousel.slick('slickGoTo', $(target).data('slick-index')).slick('slickPause');
    }
  }

  this.onBlockDeselect = function(target){
    var $carousel = $(target).closest('.slick-slider');
    if($carousel.data('autoplay')) {
      $carousel.slick('slickPlay');
    }
  }
}

theme.GallerySection = new function(){
  this.onSectionLoad = function(target){
    theme.reduceOrphans($('.overlay__title, .overlay__subheading', target));
  }
}

theme.CollectionTemplateSection = new function(){
  this.onSectionLoad = function(target){
    theme.loadPageHeaderImage(target);

    // Sorting
    var $sortBy = $('#sort-by', target);
    if($sortBy.length > 0) {
      queryParams = {};
      if (location.search.length) {
        for (var aKeyValue, i = 0, aCouples = location.search.substr(1).split('&'); i < aCouples.length; i++) {
          aKeyValue = aCouples[i].split('=');
          if (aKeyValue.length > 1) {
            queryParams[decodeURIComponent(aKeyValue[0])] = decodeURIComponent(aKeyValue[1]);
          }
        }
      }
      $sortBy.val($sortBy.data('initval')).trigger('change').on('change', function() {
        queryParams.sort_by = $(this).val();
        location.search = $.param(queryParams);
      });
    }

    // set up mobile filter reveal link
    $('.filter-toggle-button', target).on('click', function(e){
      e.preventDefault();

      // hide btn
      var revealBtnContHeight = $(this).outerHeight(true) + 2; // plus 2 for underline style
      $(this).closest('.mobile-filter-reveal').addClass('mobile-filter-reveal--fade-out');

      // prep filters
      var $filters = $(this).closest('.content-main').find('.filters');
      $filters.height(revealBtnContHeight);

      // show filters
      setTimeout(function(){
        $filters.addClass('filters--transition');
        setTimeout(function(){
          $filters.css({
            height: $filters.find('.filters__inner').height() + 'px',
            opacity: 1
          });
        }, 10);
      }, 250);
    });

    $('#filter-tag', target).on('change', function(){
      window.location = $(this).val();
    });

    $(window).trigger('checkcaptionheights');
  }

  this.onSectionUnload = function(target){
    theme.unloadPageHeaderImage(target);

    $('#sort-by', target).off('change');
    $('#filter-tag', target).off('change');
    $('.filter-toggle-button', target).off('click');
  }
}

theme.BlogTemplateSection = new function(){
  this.onSectionLoad = function(target){
    theme.loadPageHeaderImage(target);

    $('#filter-tag', target).on('change', function(){
      window.location = $(this).val();
    });

    // set up mobile filter reveal link
    $('.filter-toggle-button', target).on('click', function(e){
      e.preventDefault();

      // hide btn
      var revealBtnContHeight = $(this).outerHeight(true) + 2; // plus 2 for underline style
      $(this).closest('.mobile-filter-reveal').addClass('mobile-filter-reveal--fade-out');

      // prep filters
      var $filters = $(this).closest('.content-main').find('.filters');
      $filters.height(revealBtnContHeight);

      // show filters
      setTimeout(function(){
        $filters.addClass('filters--transition');
        setTimeout(function(){
          $filters.css({
            height: $filters.find('.filters__inner').height() + 'px',
            opacity: 1
          });
        }, 10);
      }, 250);
    });
  }

  this.onSectionUnload = function(target){
    theme.unloadPageHeaderImage(target);
    $('#filter-tag', target).off('change');
    $('.filter-toggle-button', target).off('click');
  }
}

theme.ArticleTemplateSection = new function(){
  var _ = this;

  // load content products one at a time to avoid spamming requests
  this.loadNextContentProduct = function(target) {
    var $toLoad = $('.content-products [data-lazy-product-handle].prod-block:first', target);
    if($toLoad.length) {
      $.get('/products/' + $toLoad.data('lazy-product-handle') + '/?section_id=product-item', function(response){
        $toLoad.replaceWith($('<div>' + response + '</div>').find('.prod-block'));
        theme.runMultiCurrency();
        $(window).trigger('checkcaptionheights');
        theme.checkForRevealElements();
        // Shopify reviews app
        if(window.SPR && SPR.initDomEls && SPR.loadBadges) {
          SPR.initDomEls();
          SPR.loadBadges();
        }
      }).error(function(){
        $toLoad.remove();
      }).complete(function(){
        _.loadNextContentProduct(target);
      });
    }
  }

  this.onSectionLoad = function(target){
    theme.loadPageHeaderImage(target);
    _.loadNextContentProduct(target);
  }

  this.onSectionUnload = function(target){
    theme.unloadPageHeaderImage(target);
  }
}

theme.ListCollectionsTemplateSection = new function(){
  this.onSectionLoad = function(target){
    theme.loadPageHeaderImage(target);
    $(window).trigger('checkcaptionheights');
  }

  this.onSectionUnload = function(target){
    theme.unloadPageHeaderImage(target);
  }
}

theme.NothingButAHeaderImageSection = new function(){
  this.onSectionLoad = theme.loadPageHeaderImage;
  this.onSectionUnload = theme.unloadPageHeaderImage;
}

theme.announcementHeight = 0;
theme.HeaderSection = new function(){
  this.onSectionLoad = function(target){
    // search
    var $searchContainer = $('.header-search__content', target);
    var $searchResultsContainer = $('.header-search__results', target);
    var currentReq = null;
    var searchThrottleDelay = 400;
    var searchThrottleTimeoutId = -1;
    var imageReplaceRegex = {
      search: /(\.[^\.]+)$/,
      replace: '_100x$1'
    };
    var removeResultsAndPrepForMore = function(){
      var $oldResults = $searchResultsContainer.addClass('header-search__results--disband');
      setTimeout(function(){
        $oldResults.remove();
      }, 500);
      $searchResultsContainer = $('<div class="header-search__results">').insertAfter($searchResultsContainer);
    };
    $('.header-search .input-and-button-row__input', target).on('change.themeHeaderSection keyup.themeHeaderSection paste.themeHeaderSection', function(e){
      var $input = $(this);

      // has value changed?
      if($input.val() == $input.data('previous-value')) {
        return;
      }

      // set content state
      $searchContainer.toggleClass('header-search__content--input-entered', $input.val().length > 0);

      // set loading state
      $searchContainer.addClass('header-search__content--loading');

      // fetch after short timeout, to avoid multiple requests after rapid keypresses
      clearTimeout(searchThrottleTimeoutId);

      if($input.val().length == 0) {
        removeResultsAndPrepForMore();
        $searchContainer.removeClass('header-search__content--has-results header-search__content--loading');
        return;
      }

      searchThrottleTimeoutId = setTimeout(function(){
        // avoid overlapping requests - abort and fetch latest
        if(currentReq) {
          currentReq.abort();
        }
        // fetch info
        $input.data('previous-value', $input.val());
        currentReq = $.get(
          '/search/suggest.json',
          {
            "s": $input.val(),
            "resources": {
              "types": ['product'],
              "unavailable_products": 'bury',
              "limit": 6
            }
          },
          function(response){
            removeResultsAndPrepForMore();
            $searchContainer.toggleClass('header-search__content--has-results', response.resources.results.products.length > 0);

            for(var i = 0; i < response.resources.results.products.length; i++) {
              var p = response.resources.results.products[i];
              var $result = $('<a class="search-result__link">').attr('href', p.url);
              $('<div class="search-result__image">').append(
                $('<img>').attr('src', p.image.replace(imageReplaceRegex.search, imageReplaceRegex.replace)).attr('alt', p.title)
              ).appendTo($result);
              var $resultRight = $('<div class="search-result__detail">').appendTo($result);
              $('<div class="search-result__title">').html(p.title).appendTo($resultRight);

              var $price = $('<div class="search-result__price product-price">').appendTo($resultRight);
              if(p.price_max != p.price_min) {
                $('<span class="product-price__from">').html("From").appendTo($price);
                $price.append(' ');
              }
              $('<span class="product-price__amount theme-money">').html(Shopify.formatMoney(p.price_min, theme.money_format)).appendTo($price);
              if(p.compare_at_price_min > p.price_min) {
                $price.append(' ');
                $('<span class="product-price__compare theme-money">').html(Shopify.formatMoney(p.compare_at_price_min, theme.money_format)).appendTo($price);
              }

              $('<div class="search-result">').append($result).appendTo($searchResultsContainer);
            }

            if(response.resources.results.products.length > 0) {
              $('<a class="feature-link">').attr('href', '/search?' + $input.closest('form').serialize())
                .html("See all results")
                .appendTo($searchResultsContainer);
            }
            var $thisSearchResultsContainer = $searchResultsContainer;
            theme.runMultiCurrency();
            setTimeout(function(){
              $thisSearchResultsContainer.addClass('header-search__results--show');
            }, 10);
          },
          'json'
        )
          .fail(function(response){
            console.log('Error', response);
          })
          .always(function(response){
            currentReq = null;
            $searchContainer.removeClass('header-search__content--loading');
          });
      }, searchThrottleDelay);
    });

    $('.input-with-clear__clear', target).on('click.themeHeaderSection', function(e){
      e.preventDefault();
      $(this).closest('.input-with-clear').find('input').val('').trigger('change');
    });

    // set announcement offset for scroll checks
    var announcement = document.getElementById('announcement_bar')
    if(announcement) {
      theme.announcementHeight = announcement.clientHeight;
      $(window).on('debouncedresize.headerSection', function(){
        theme.announcementHeight = announcement.clientHeight;
      });
    } else {
      theme.announcementHeight = 0;
    }

    // alter classes on scroll for sticky headers
    $('body').removeClass('scrolled-down');
    if($('.pageheader__contents--sticky', target).length) {
      $(window).on('scroll.headerSection', function(){
        if(!$('body').hasClass('scrolled-down') && $(window).scrollTop() > theme.announcementHeight) {
          $('body').css('overflow-anchor', 'none');
          clearTimeout(theme.debouncedWindowScrollOverflowAnchorTimeoutId);
          theme.debouncedWindowScrollOverflowAnchorTimeoutId = setTimeout(function(){
            $('body').css('overflow-anchor', '');
          }, 255);
        }
        $('body').toggleClass('scrolled-down', $(window).scrollTop() > theme.announcementHeight);
      });
    }

    // set up multi-currency flag button proxy
    $('.switcher-flags', target).on('click', '.switcher-flag', function(e){
      e.preventDefault();
      $(this).closest('.switcher').find('select').val($(this).data('value')).trigger('change');
      $('.open-menu').removeClass('open-menu');
      theme.toggleNavTabIndices();
    });
  }

  this.onSectionUnload = function(target){
    $('.header-search .input-and-button-row__input', target).off('.themeHeaderSection');
    $('.input-with-clear__clear', target).off('.themeHeaderSection');
    $('.switcher-flags', target).off('click');
    $(window).off('.headerSection');
  }
}

theme.CartTemplateSection = new function(){
  this.onSectionLoad = function(target){
    theme.loadPageHeaderImage(target);
    // terms and conditions checkbox
    if($('#cartform input#terms', target).length > 0) {
      $(document).on('click.cartTemplateSection', '#cartform [name="checkout"]:submit, a[href="/checkout"]', function() {
        if($('#cartform input#terms:checked').length == 0) {
          alert("You must agree to the terms and conditions before continuing.");
          return false;
        }
      });
    }
  }

  this.onSectionUnload = function(target){
    theme.unloadPageHeaderImage(target);
    $(document).off('.cartTemplateSection');
  }
}

theme.MapSection = new function(){
  var _ = this;
  _.config = {
    zoom: 14,
    styles: {
      default: [],
      silver: [{"elementType":"geometry","stylers":[{"color":"#f5f5f5"}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#f5f5f5"}]},{"featureType":"administrative.land_parcel","elementType":"labels.text.fill","stylers":[{"color":"#bdbdbd"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#eeeeee"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#e5e5e5"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#ffffff"}]},{"featureType":"road.arterial","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#dadada"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"color":"#e5e5e5"}]},{"featureType":"transit.station","elementType":"geometry","stylers":[{"color":"#eeeeee"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#c9c9c9"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]}],
      retro: [{"elementType":"geometry","stylers":[{"color":"#ebe3cd"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#523735"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#f5f1e6"}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#c9b2a6"}]},{"featureType":"administrative.land_parcel","elementType":"geometry.stroke","stylers":[{"color":"#dcd2be"}]},{"featureType":"administrative.land_parcel","elementType":"labels.text.fill","stylers":[{"color":"#ae9e90"}]},{"featureType":"landscape.natural","elementType":"geometry","stylers":[{"color":"#dfd2ae"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#dfd2ae"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#93817c"}]},{"featureType":"poi.park","elementType":"geometry.fill","stylers":[{"color":"#a5b076"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#447530"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#f5f1e6"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#fdfcf8"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#f8c967"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#e9bc62"}]},{"featureType":"road.highway.controlled_access","elementType":"geometry","stylers":[{"color":"#e98d58"}]},{"featureType":"road.highway.controlled_access","elementType":"geometry.stroke","stylers":[{"color":"#db8555"}]},{"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"color":"#806b63"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"color":"#dfd2ae"}]},{"featureType":"transit.line","elementType":"labels.text.fill","stylers":[{"color":"#8f7d77"}]},{"featureType":"transit.line","elementType":"labels.text.stroke","stylers":[{"color":"#ebe3cd"}]},{"featureType":"transit.station","elementType":"geometry","stylers":[{"color":"#dfd2ae"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#b9d3c2"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#92998d"}]}],
      dark: [{"elementType":"geometry","stylers":[{"color":"#212121"}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#212121"}]},{"featureType":"administrative","elementType":"geometry","stylers":[{"color":"#757575"}]},{"featureType":"administrative.country","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]},{"featureType":"administrative.land_parcel","stylers":[{"visibility":"off"}]},{"featureType":"administrative.locality","elementType":"labels.text.fill","stylers":[{"color":"#bdbdbd"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#181818"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"featureType":"poi.park","elementType":"labels.text.stroke","stylers":[{"color":"#1b1b1b"}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"color":"#2c2c2c"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#8a8a8a"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#373737"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#3c3c3c"}]},{"featureType":"road.highway.controlled_access","elementType":"geometry","stylers":[{"color":"#4e4e4e"}]},{"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"featureType":"transit","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#000000"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#3d3d3d"}]}],
      night: [{"elementType":"geometry","stylers":[{"color":"#242f3e"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#746855"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#242f3e"}]},{"featureType":"administrative.locality","elementType":"labels.text.fill","stylers":[{"color":"#d59563"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#d59563"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#263c3f"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#6b9a76"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#38414e"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#212a37"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#9ca5b3"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#746855"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#1f2835"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#f3d19c"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#2f3948"}]},{"featureType":"transit.station","elementType":"labels.text.fill","stylers":[{"color":"#d59563"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#17263c"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#515c6d"}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"color":"#17263c"}]}],
      aubergine: [{"elementType":"geometry","stylers":[{"color":"#1d2c4d"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#8ec3b9"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#1a3646"}]},{"featureType":"administrative.country","elementType":"geometry.stroke","stylers":[{"color":"#4b6878"}]},{"featureType":"administrative.land_parcel","elementType":"labels.text.fill","stylers":[{"color":"#64779e"}]},{"featureType":"administrative.province","elementType":"geometry.stroke","stylers":[{"color":"#4b6878"}]},{"featureType":"landscape.man_made","elementType":"geometry.stroke","stylers":[{"color":"#334e87"}]},{"featureType":"landscape.natural","elementType":"geometry","stylers":[{"color":"#023e58"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#283d6a"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#6f9ba5"}]},{"featureType":"poi","elementType":"labels.text.stroke","stylers":[{"color":"#1d2c4d"}]},{"featureType":"poi.park","elementType":"geometry.fill","stylers":[{"color":"#023e58"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#3C7680"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#304a7d"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#98a5be"}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"color":"#1d2c4d"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#2c6675"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#255763"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#b0d5ce"}]},{"featureType":"road.highway","elementType":"labels.text.stroke","stylers":[{"color":"#023e58"}]},{"featureType":"transit","elementType":"labels.text.fill","stylers":[{"color":"#98a5be"}]},{"featureType":"transit","elementType":"labels.text.stroke","stylers":[{"color":"#1d2c4d"}]},{"featureType":"transit.line","elementType":"geometry.fill","stylers":[{"color":"#283d6a"}]},{"featureType":"transit.station","elementType":"geometry","stylers":[{"color":"#3a4762"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#0e1626"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#4e6d70"}]}]
    }
  };
  _.apiStatus = null;
  _.mapsToLoad = [];

  this.geolocate = function($map) {
    var deferred = $.Deferred();
    var geocoder = new google.maps.Geocoder();
    var address = $map.data('address-setting');

    geocoder.geocode({ address: address }, function(results, status) {
      if (status !== google.maps.GeocoderStatus.OK) {
        deferred.reject(status);
      }

      deferred.resolve(results);
    });

    return deferred;
  }

  this.createMap = function() {
    var _this = this;

    var $map = _this.$container.find('.map-section__map-container');

    return _this.geolocate($map)
      .then(
        function(results) {
          var mapOptions = {
            zoom: _this.config.zoom,
            styles: _this.config.styles[_this.style],
            center: results[0].geometry.location,
            scrollwheel: false,
            disableDoubleClickZoom: true,
            disableDefaultUI: true,
            zoomControl: true
          };

          _this.map = new google.maps.Map($map[0], mapOptions);
          _this.center = _this.map.getCenter();

          var marker = new google.maps.Marker({
            map: _this.map,
            position: _this.center,
            clickable: false
          });

          google.maps.event.addDomListener(window, 'resize', function() {
            google.maps.event.trigger(_this.map, 'resize');
            _this.map.setCenter(_this.center);
          });
        }.bind(this)
      )
      .fail(function() {
        var errorMessage;

        switch (status) {
          case 'ZERO_RESULTS':
            errorMessage = theme.strings.addressNoResults;
            break;
          case 'OVER_QUERY_LIMIT':
            errorMessage = theme.strings.addressQueryLimit;
            break;
          default:
            errorMessage = theme.strings.addressError;
            break;
        }

        // Only show error in the theme editor
        if (Shopify.designMode) {
          var $mapContainer = $map.parents('.map-section');

          $mapContainer.addClass('page-width map-section--load-error');
          $mapContainer
            .find('.map-section__wrapper')
            .html(
              '<div class="errors text-center">' + errorMessage + '</div>'
            );
        }
      });
  }

  this.onSectionLoad = function(target){
    // Global function called by Google on auth errors
    window.gm_authFailure = function() {
      if (!Shopify.designMode) return;

      theme.$currentMapContainer.addClass('page-width map-section--load-error');
      theme.$currentMapContainer
        .find('.map-section__wrapper')
        .html(
          '<div class="errors text-center">' + theme.strings.authError + '</div>'
        );
    }

    // create maps
    theme.$currentMapContainer = _.$container = $(target);
    var key = _.$container.data('api-key');
    _.style = _.$container.data('map-style');

    if (typeof key !== 'string' || key === '') {
      return;
    }

    if (_.apiStatus === 'loaded') {
      // Check if the script has previously been loaded with this key
      var $script = $('script[src*="' + key + '&"]');
      if ($script.length === 0) {
        $.getScript(
          'https://maps.googleapis.com/maps/api/js?key=' + key
        ).then(function() {
          _.apiStatus = 'loaded';
          _.createMap();
        });
      } else {
        _.createMap();
      }
    } else {
      _.mapsToLoad.push(jQuery.extend({}, this));

      if (_.apiStatus !== 'loading') {
        _.apiStatus = 'loading';
        if (typeof window.google === 'undefined') {
          $.getScript(
            'https://maps.googleapis.com/maps/api/js?key=' + key
          ).then(function() {
            _.apiStatus = 'loaded';
            // API has loaded, load all Map instances in queue
            $.each(_.mapsToLoad, function(index, instance) {
              instance.createMap();
            });
          });
        }
      }
    }
  }

  this.onSectionUnload = function(target){
    if (typeof window.google !== 'undefined') {
      google.maps.event.clearListeners(this.map, 'resize');
    }
  }
}

// A generic text notification above an element
theme.showQuickPopup = function(message, $origin){
  var $popup = $('<div class="simple-popup"/>');
  var offs = $origin.offset();
  $popup.html(message).css({ 'left':offs.left, 'top':offs.top }).hide();
  $('body').append($popup);
  $popup.css('margin-top', - $popup.outerHeight() - 10);
  $popup.fadeIn(200).delay(3500).fadeOut(400, function(){
    $(this).remove();
  });
}

// Changes the tabindex value of items in the nav based on whether its open or not (to avoid tab traps)
theme.toggleNavTabIndices = function(){
  if($('html').hasClass('open-menu')){
    $('#main-menu a[tabindex]').removeAttr('tabindex');
  }else{
    $('#main-menu a').attr('tabindex', '-1');
  }
};

// Changes the tabindex value of items in the search popup based on whether its open or not (to avoid tab traps)
theme.toggleSearchTabIndices = function(){
  if($('body').hasClass('open-search')){
    $('.header-search').find('a[tabindex], button[tabindex], input[tabindex]').removeAttr('tabindex');
  }else{
    $('.header-search').find('a, button, input').attr('tabindex', '-1');
  }
};

$(function($){
  theme.toggleNavTabIndices();
  theme.toggleSearchTabIndices();

  /// Persistent events for nav interaction
  $(document).on('keydown', '.main-menu-toggle', function(e){
    // return or space - toggle menu and move focus
    if(e.which == 13 || e.which == 32) {
      e.preventDefault();
      e.stopPropagation();
      $('html').toggleClass('open-menu');
      theme.toggleNavTabIndices();
      if($('html').hasClass('open-menu')) {
        $('#main-menu .main-menu-links a:first').focus();
      } else {
        $('#pageheader .main-menu-toggle').focus();
      }
    }
  });

  $(document).on('click', '.main-menu-toggle', function(e){
    $('html').toggleClass('open-menu');
    theme.toggleNavTabIndices();
    e.preventDefault();
  });

  $(document).on('click touchstart touchend', '.open-menu .focus-tint', function(e){
    $('.open-menu').removeClass('open-menu');
    theme.toggleNavTabIndices();
    e.preventDefault();
  });

  $(document).on('click touchstart touchend', '.open-search .focus-tint', function(e){
    $('.open-search').removeClass('open-search');
    theme.toggleSearchTabIndices();
    e.preventDefault();
  });

  var menuPanelTransitionDelay = 300;
  $(document).on('click', '.has-children > .main-menu-link', function(e){
    e.preventDefault();
    $(this).attr('aria-expanded', 'true');
    var $disappearing = $(this).closest('.main-menu-panel').addClass('main-menu-panel--inactive-left');
    var $appearing = $('#' + $(this).attr('aria-controls'));
    var offset = Math.round($('#main-menu-panel .main-menu-list-item').position().top - $('.main-menu-breadcrumbs:first').height());
    $appearing.css('padding-top', offset);
    setTimeout(function(){
      $appearing.removeClass('main-menu-panel--inactive-right');
    }, menuPanelTransitionDelay);
  });

  $(document).on('click', '.main-menu-breadcrumbs__link', function(e){
    e.preventDefault();
    var $appearing = $($(this).attr('href'));
    var $disappearing = $(this).closest('.main-menu-panel').addClass('main-menu-panel--inactive-right');
    if($(this).attr('href') == '#main-menu-panel') {
      // 3rd tier -> 1st tier, hide middle menu
      $('.main-menu-panel--child.main-menu-panel--inactive-left').addClass('main-menu-panel--inactive-right').removeClass('main-menu-panel--inactive-left');
    }
    setTimeout(function(){
      $appearing.removeClass('main-menu-panel--inactive-left');
    }, menuPanelTransitionDelay);
  });

  /// Toggle mini-menu search
  $(document).on('click', '.header-search-toggle', function(e){
    e.preventDefault();
    if( $('body').toggleClass('open-search').hasClass('open-search') ) {
      setTimeout(function(){
        $('.header-search input[name="q"]').focus();
      }, 500);
    }
    theme.toggleSearchTabIndices();
  });

  /// Gallery
  // variant images
  $(document).on('variantImageSelected', '.product-photos', function(e, data){
    // get image src
    var variantSrc = data.featured_media.preview_image.src.split('?')[0].replace(/http[s]?:/, '');

    // locate matching thumbnail & click it
    var $thumb = $(this).find('.thumbnails:not(.hidden) a[href^="' + variantSrc + '"]:first');
    $thumb.trigger('click');
  });

  //Ajax add-to-cart
  var shopifyAjaxAddURL = '/cart/add.js';
  var shopifyAjaxCartURL = '/cart.js';
  var shopifyAjaxStorePageURL = '/search';

  $(document).on('submit', 'form[action^="/cart/add"]:not(.noAJAX)', function(e) {
    console.log('submit');
    var $form = $(this);
    //Disable add button
    $form.find(':submit').attr('disabled', 'disabled').each(function(){
      var contentFunc = $(this).is('button') ? 'html' : 'val';
      $(this).data('previous-value', $(this)[contentFunc]())[contentFunc]("Adding...");
    });

    //Add to cart
    $.post(shopifyAjaxAddURL, $form.serialize(), function(itemData) {
      //Enable add button
      $form.find(':submit').each(function(){
        $btn = $(this);
        var contentFunc = $(this).is('button') ? 'html' : 'val';
        //Set to 'DONE', alter button style, wait a few secs, revert to normal
        $btn[contentFunc]("Added to cart");
        setTimeout(function(){
          $btn.removeAttr('disabled')[contentFunc]($btn.data('previous-value'));
        }, 4000);
      });

      //Update header summary
      $.get(shopifyAjaxStorePageURL, function(data){
        var $newDoc = $($.parseHTML('<div>' + data + '</div>'));
        var sels = ['.pageheader .header-items'];
        for(var i=0; i<sels.length; i++) {
          var cartSummarySelector = sels[i];
          var $newCartObj = $newDoc.find(cartSummarySelector);
          var $currCart = $(cartSummarySelector);
          $currCart.replaceWith($newCartObj);
        }
        theme.runMultiCurrency();
      });


    }, 'text').error(function(data) {
      //Enable add button
      var $firstBtn = $form.find(':submit').removeAttr('disabled').each(function(){
        var $btn = $(this);
        var contentFunc = $btn.is('button') ? 'html' : 'val';
        $btn[contentFunc]($btn.data('previous-value'))
      }).first();

      //Not added, show message
      if(typeof(data) != 'undefined' && typeof(data.status) != 'undefined') {
        var jsonRes = $.parseJSON(data.responseText);
        theme.showQuickPopup(jsonRes.description, $firstBtn);
      } else {
        //Some unknown error? Disable ajax and submit the old-fashioned way.
        $form.addClass('noAJAX');
        $form.submit();
      }
    });
    return false;
  });

  /// General lightbox for all
  $('a[rel=lightbox]').colorbox({ maxWidth: '94%' });

  /// Galleries (only on large screens)
  if($(window).height() >= theme.lightbox_min_window_height && $(window).width() >= theme.lightbox_min_window_width) {
    $('a[rel="gallery"]').colorbox({rel:'gallery',maxWidth:'94%'});
  }

  ///Utility class for detecting touch devices
  function isTouchDevice(){
    var prefixes = '-webkit- -moz- -o- -ms-'.split(' ');
    var mq = function(query) {
      return window.matchMedia(query).matches;
    };

    if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
      return true;
    }

    var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
    return mq(query);
  }

  /// Immmediately select contents when focussing on some inputs
  $(document).on('focusin click', 'input.select-on-focus', function(){
    if(!isTouchDevice()) {
      $(this).select();
    }
  }).on('mouseup', 'input.select-on-focus', function(e){
    e.preventDefault(); //Prevent mouseup killing select()
  });

  /// Product blocks should have consistent heights, if that setting is enabled
  
  $(window).on('load debouncedresize checkcaptionheights', function(){
    $('.product-list').each(function(){
      // images and captions, by row
      var $firstBlock = $('.prod-block:first', this).first();
      var productsPerRow = Math.round($firstBlock.parent().width() / $firstBlock.outerWidth(true));

      var $caps = $('.prod-caption', this);
      var $imgs = $('.rimage-outer-wrapper, .placeholder', this);
      var $imgContainers = $('.prod-image-wrap', this);

      for(var i = 0; i < Math.ceil($caps.length / productsPerRow); i++) {
        var $captionsToProcess = $caps.slice(i * productsPerRow, (i + 1) * productsPerRow);
        var tallest = 0;
        $captionsToProcess.each(function(){
          var ch = $(this).children().outerHeight();
          if(ch > tallest) tallest = ch;
        }).height(tallest);

        var $imagesToProcess = $imgs.slice(i * productsPerRow, (i + 1) * productsPerRow);
        var $imgContainersToProcess = $imgContainers.slice(i * productsPerRow, (i + 1) * productsPerRow);
        tallest = 0;
        $imagesToProcess.each(function(){
          var ch = $(this).outerHeight();
          if(ch > tallest) tallest = ch;
        });
        $imgContainersToProcess.height(tallest);
      }
    });
  }).trigger('checkcaptionheights');
  

  window.SPRCallbacks = {
    onBadgeLoad: function(){
      $(window).trigger('checkcaptionheights');
    }
  }

  /// Show newsletter signup response
  if($('.newsletter-response').length > 0) {
    $.colorbox({
      fixed: true,
      html:[
        '<div class="signup-modal-feedback">',
        $('.newsletter-response:first').html(),
        '</div>'
      ].join('')
    });
  }


  /// Reveal transition
  
  theme.checkForRevealElements(true);
  $(window).on('load scroll', theme.checkForRevealElements);
  $(document).on('shopify:section:load shopify:section:unload shopify:section:reorder', theme.checkForRevealElements);
  


  /// Register all sections
  theme.Sections.init();
  theme.Sections.register('header', theme.HeaderSection);
  theme.Sections.register('banner-index', theme.BannerIndexSection);
  theme.Sections.register('slideshow', theme.SlideshowSection);
  theme.Sections.register('slideshow-with-text', theme.SlideshowWithTextSection);
  theme.Sections.register('video', theme.VideoManager);
  theme.Sections.register('featured-collection', theme.FeaturedCollectionSection);
  theme.Sections.register('featured-collections', theme.FeaturedCollectionsSection);
  theme.Sections.register('product-template', theme.ProductTemplateSection);
  theme.Sections.register('cart-template', theme.CartTemplateSection);
  theme.Sections.register('collection-template', theme.CollectionTemplateSection);
  theme.Sections.register('blog-template', theme.BlogTemplateSection);
  theme.Sections.register('article-template', theme.ArticleTemplateSection);
  theme.Sections.register('search-template', theme.NothingButAHeaderImageSection);
  theme.Sections.register('page-template', theme.NothingButAHeaderImageSection);
  theme.Sections.register('page-contact-template', theme.NothingButAHeaderImageSection);
  theme.Sections.register('page-list-collections-template', theme.ListCollectionsTemplateSection);
  theme.Sections.register('list-collections-template', theme.ListCollectionsTemplateSection);
  theme.Sections.register('featured-product', theme.FeaturedProductSection);
  theme.Sections.register('map', theme.MapSection);
  theme.Sections.register('testimonials', theme.TestimonialsSection);
  theme.Sections.register('gallery', theme.GallerySection);
});

$.extend($.colorbox.settings, {
  previous: '<svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><title>Left</title><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>',
  next: '<svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><title>Right</title><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>',
  close: '<svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><title>Close</title><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>'
});

})(theme.jQuery);
$(".dropdown-toggle").hover(function(){
    $(".dropdown-menu").toggleClass('show');
}); 
// $(".slick-slides").each(function(){
//   if(window.innerWidth >= 750){
//     $(this).slick({
//       centerMode:true,      
//       centerPadding:"180px",
//         infinite: true,
//         slidesToShow: 3,
//         slidesToScroll: 1,
//        autoplay:false,
//       prevArrow:"<img class='prev-icon1' src='https://cdn.shopify.com/s/files/1/0284/2391/3547/files/New_Project_2.png?v=1630391900'/>",
//     	nextArrow:"<img class='nxt-icon1' src='https://cdn.shopify.com/s/files/1/0284/2391/3547/files/New_Project_3.png?v=1630391976'/>", 
//       responsive:[
//       	    {
//             breakpoint: 1200,
//             settings: {
//               slidesToShow: 2,
//               slidesToScroll: 1
//             }
//           	},
        
//          	 {
//               breakpoint:992 ,
//               settings: {
//                 centerPadding:"180px",
//                 slidesToShow:1,
//                 slidesToScroll: 1, 
//               }
//             },
//         	{
//               breakpoint:768 ,
//               settings: {
//                 centerPadding:"60px",
//                 slidesToShow:1,
//                 slidesToScroll: 1, 
//               }
//             },
        
//         	{
//               breakpoint:576,
//               settings: {
//                 centerPadding:"30px",
//                 slidesToShow:1,
//                 slidesToScroll: 1, 
//               }
//             },
//       ]
// 	});
  
//   }else{
//   $(this).slick({
//       infinite: true,
//       slidesToShow: 1,
//       slidesToScroll: 1,
//        autoplay:true,
//     	 prevArrow:"<img class='prev-icon1' src='https://cdn.shopify.com/s/files/1/0284/2391/3547/files/New_Project_2.png?v=1630391900'/>",
//     	nextArrow:"<img class='nxt-icon1' src='https://cdn.shopify.com/s/files/1/0284/2391/3547/files/New_Project_3.png?v=1630391976'/>"
// 	});
//   }
// });
$(".slick-slides").each(function(){
  if(window.innerWidth >= 750){
    $(this).slick({
        infinite: true,
        slidesToShow: 3,
        slidesToScroll: 1,
       autoplay:true,
      prevArrow:"<img class='prev-icon1' src='https://cdn.shopify.com/s/files/1/0284/2391/3547/files/New_Project_2.png?v=1630391900'/>",
    	nextArrow:"<img class='nxt-icon1' src='https://cdn.shopify.com/s/files/1/0284/2391/3547/files/New_Project_3.png?v=1630391976'/>", 
      responsive:[
      	    {
            breakpoint: 1200,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 1
            }
          	},
        
         	 {
              breakpoint:992 ,
              settings: {
                centerPadding:"180px",
                slidesToShow:1,
                slidesToScroll: 1, 
              }
            },
        	{
              breakpoint:768 ,
              settings: {
                centerMode:true,
                centerPadding:"60px",
                slidesToShow:1,
                slidesToScroll: 1, 
              }
            },
        
        	{
              breakpoint:576,
              settings: {
                centerMode:true,
                slidesToShow:1,
                slidesToScroll: 1, 
              }
            },
      ]
	});
  
  }else{
  $(this).slick({
      infinite: true,
      slidesToShow: 1,
      slidesToScroll: 1,
       autoplay:false,
    	 prevArrow:"<img class='prev-icon1' src='https://cdn.shopify.com/s/files/1/0284/2391/3547/files/New_Project_2.png?v=1630391900'/>",
    	nextArrow:"<img class='nxt-icon1' src='https://cdn.shopify.com/s/files/1/0284/2391/3547/files/New_Project_3.png?v=1630391976'/>"
	});
  }
});

$('.testimonila_slider').each(function(){
  if(window.innerWidth >= 750){
    $(this).slick({
      infinite: true,
      slidesToShow: 3,
      slidesToScroll: 3,
       autoplay:true
      });
  }else{
    $(this).slick({
      infinite: true,
      slidesToShow: 1,
      slidesToScroll: 1,
       autoplay:true,
       prevArrow:"<img class='prev-icon1' src='https://cdn.shopify.com/s/files/1/0284/2391/3547/files/New_Project_2_1.png?v=1630474587'/>",
    	nextArrow:"<img class='nxt-icon1' src='https://cdn.shopify.com/s/files/1/0284/2391/3547/files/New_Project_3_2_1.png?v=1630474248'/>"
      
      });
  }
});
$('.testimonila_sliders').each(function(){
  if(window.innerWidth >= 750){
    $(this).slick({
      infinite: true,
      slidesToShow: 3,
      slidesToScroll: 3,
      autoplay:true
      });
  }else{
    $(this).slick({
      infinite: true,
      slidesToShow: 1,
      slidesToScroll: 1,
       autoplay:true,
       prevArrow:"<img class='prev-icon1' src='https://cdn.shopify.com/s/files/1/0284/2391/3547/files/New_Project_2.png?v=1630391900'/>",
    	nextArrow:"<img class='nxt-icon1' src='https://cdn.shopify.com/s/files/1/0284/2391/3547/files/New_Project_3.png?v=1630391976'/>"     
      });
  }
});



var acc = document.getElementsByClassName("accordion");
var i;

for (i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function() {
    debugger;
    this.classList.toggle("active");
    var panel = this.nextElementSibling;
    if (panel.style.display === "block") {
      panel.style.display = "none";
    } else {
      panel.style.display = "block";
    }
  });
}



// $('.testimonila_center').slick({
//   slidesToShow: 3,
//   slidesToScroll: 1,
//   autoplay: true,
//   autoplaySpeed: 2000,
// });
	

$('.testimonila_center').each(function(){
  //if(window.innerWidth >= 750){ 
    
    
    $(this).slick({
      infinite: true,
      slidesToShow: 3,
      slidesToScroll: 1,
      centerMode: true,
      centerPadding: '0px',
      autoplay:false,
      prevArrow:"<img class='prev-icon1' src='https://cdn.shopify.com/s/files/1/0284/2391/3547/files/New_Project_2.png?v=1630391900'/>",
     nextArrow:"<img class='nxt-icon1' src='https://cdn.shopify.com/s/files/1/0284/2391/3547/files/New_Project_3.png?v=1630391976'/>", 
    
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows:true,
          centerMode: false,
          centerPadding: '0px',
          slidesToShow: 1
        }
      }]

      });
});
    if( window.innerWidth < 768){
    $('.ooo-instagram-feed__list').addClass('instagram-slider');
      $('.instagram-slider').each(function(){
    $(this).slick({
      infinite: true,
      slidesToShow: 1,
      slidesToScroll: 1,
       autoplay:true,
       prevArrow:"<img class='prev-icon1' src='https://cdn.shopify.com/s/files/1/0284/2391/3547/files/New_Project_2.png?v=1630391900'/>",
    	nextArrow:"<img class='nxt-icon1' src='https://cdn.shopify.com/s/files/1/0284/2391/3547/files/New_Project_3.png?v=1630391976'/>"     
      });
});
    }








//Toggle Jquery
 $(".navbar-toggler-icon").click(function(){
    $(".navbar-collapse, .offcanvas-collapse").toggleClass("removeToggle");
  });
$(".search-icon").click(function(){
$("body").addClass("open-search");
});
    