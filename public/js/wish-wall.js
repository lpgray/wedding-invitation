(function($, glb) {
  'use strict';

  // 动画插件 from https://daneden.github.io/animate.css/
  $.fn.extend({
    animateCss: function(animationName, callback) {
      var animationEnd = (function(el) {
        var animations = {
          animation: 'animationend',
          OAnimation: 'oAnimationEnd',
          MozAnimation: 'mozAnimationEnd',
          WebkitAnimation: 'webkitAnimationEnd',
        };

        for (var t in animations) {
          if (el.style[t] !== undefined) {
            return animations[t];
          }
        }
      })(document.createElement('div'));

      this.removeClass('animate-init').addClass('animated ' + animationName).one(animationEnd, function() {
        $(this).removeClass('animated ' + animationName);

        if (typeof callback === 'function') callback();
      });

      return this;
    },
    makeAnimate: function() {
      this.timeout = [];
      var _ = this;
      this.find('.animate').each(function(i) {
        var $this = $(this);
        var delay = Number($this.data('delay'));
        var animateName = $this.data('animate') || 'flipInX';
        if (animateName) {
          if (delay === 0) {
            $this.animateCss(animateName);
          } else {
            _.timeout[i] = setTimeout(function() {
              $this.animateCss(animateName);
            }, delay);
          }
        }
      });
      return this;
    },
    resetAnimate: function() {
      if (this.timeout) {
        this.timeout.forEach(function(i) {
          clearTimeout(this.timeout[i]);
        });
      }
      this.find('.animate').each(function() {
        var $this = $(this);
        $this.addClass('animate-init');
      });
      return this;
    }
  });

  var $html = $('html');
  var $body = $('body');
  var $win = $(window);
  var $frames = $('.frame');
  var wishes = [];
  var photos = [
  ];
  var photosPauseTime = 5000;

  $html.css('font-size', ($win.width() / 10) + 'px');

  // http://7o52me.com1.z0.glb.clouddn.com/
  // 添加图片 001-045
  for (var i = 1; i <= 45; i++) {
    var s = new String(i);
    var zeroNum = 3 - s.length;
    var fileName = '';
    for (var j = 0; j < zeroNum; j++) {
      fileName += '0';
    }
    fileName += s;
    photos.push(`http://7o52me.com1.z0.glb.clouddn.com/${fileName}.jpg`);
  }
  
  appendFrameBorder($frames);
  requestWishes();
  startShowImgs();
  loopRedPackSignal();

  if ($win.height() <= $win.width()) {
    // 宽屏方案
    $('body').addClass('horizontal');
    $('#J-MainFrame').css({
      height: $win.height(),
      width: $win.width() - $win.width() * 0.5
    });
    $('#J-Wishes').css('padding', '.5rem');
    $('#J-BottomBar').css({
      right: 0,
      left: 'auto',
      top: 0,
      bootom: 'auto',
      width: $win.width() * 0.5,
      height: $win.height()
    });
  } else {
    // 窄屏方案
    $('body').addClass('vertical');
    $('#J-MainFrame').css('height', $win.height() - $win.height() * 0.45);
    $('#J-BottomBar').css({
      height: $win.height() * 0.45
    });
  }

  function appendFrameBorder($frames) {
    var $borders = $('<div class="frame-borders wall-borders"><div class="bottom"></div></div>');
    $frames.each(function() {
      $(this).append($borders.clone());
    });
  }

  function requestWishes() {
    $.get('/wishes', function(res) {
      if (res.success) {
        onGetWishes(res);
        setTimeout(scrollWishes, 1000);
      }
    }, 'json');
  }

  function onGetWishes(res) {
    var tmpl = '';
    wishes = res.data;
    for (var i = 0, l = wishes.length; i < l; i++) {
      tmpl += '<div class="wish-item wish-item-' + i + '">';
      tmpl += '<span class="name">' + wishes[i].name + '</span>';
      tmpl += '<span class="body">' + wishes[i].text + '</span>';
      tmpl += '</div>';

      if (i === 0) {
        tmpl += '<div class="wish-item-subs-wrap">'
      }
    }
    tmpl += '</div>';
    $('#J-Wishes').html(tmpl);
  }

  function scrollWishes() {
    $('.wish-item-0').animateCss('fadeOut', function() {
      var h = $('.wish-item-0').outerHeight() + 20;
      $('.wish-item-0').css('visibility', 'hidden');
      $('.wish-item-subs-wrap').css({
        'transform': 'translate3d(0, -' + h + 'px, 0)',
        'transition': 'all .5s ease'
      }).on('transitionend', function() {
        wishes.splice(0, 1);
        if (wishes.length <= 0) {
          requestWishes();
          return;
        }
        onGetWishes({ data: wishes });
        setTimeout(scrollWishes, 1000);
      });
    });
  }

  function startShowImgs() {
    setTimeout(showImgs, photosPauseTime);
  }

  var anchor = 0;
  function showImgs() {
    var img = new Image();
    var lastIdx = $('#J-Img0').data('last-url-index');
    var idx = typeof lastIdx !== 'undefined' ? lastIdx + 1 : anchor;
    if (idx >= photos.length) {
      idx = 0;
    }
    var imgUrl = photos[idx];
    img.onload = function() {
      $('#J-Img0').animateCss('fadeOut', function() {
        $('#J-Img0').css({
          'background-image': 'url(' + imgUrl + ')'
        }).animateCss('fadeIn').data('last-url-index', idx);
        setTimeout(showImgs, photosPauseTime);
      });
    }
    img.src = imgUrl;

    // var img1 = new Image();
    // var lastIdx1 = $('#J-Img1').data('last-url-index');
    // var idx1 = typeof lastIdx1 !== 'undefined' ? lastIdx1 + 2 : anchor + 1;
    // if (idx1 >= photos.length) {
    //   idx1 = 1;
    // }
    // var img1Url = photos[idx1];
    // img1.onload = function() {
    //   $('#J-Img1').animateCss('fadeOut', function() {
    //     $('#J-Img1').css({
    //       'background-image': 'url(' + img1Url + ')'
    //     }).animateCss('fadeIn').data('last-url-index', idx1);
    //     setTimeout(showImgs, photosPauseTime);
    //   });
    // }
    // img1.src = img1Url;
  }

  
  function loopRedPackSignal() {
    $.get('/red-pack-pass', function(res) {
      if (res.success) {
        $('#J-RedPackPass').fadeIn(2000).find('.pass-wrap').html(res.data);
      } else {
        $('#J-RedPackPass').hide();
      }
      setTimeout(function() {
        loopRedPackSignal();
      }, 3000);
    }, 'json');
  }

}(window.jQuery, window));