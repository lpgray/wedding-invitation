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
  var $name = $('#J-YourName');
  var $wish = $('#J-Wish');
  var photos = [
    'http://7xq1q6.com1.z0.glb.clouddn.com/wedding/1-n.jpg',
    'http://7xq1q6.com1.z0.glb.clouddn.com/wedding/2.jpg',
    'http://7xq1q6.com1.z0.glb.clouddn.com/wedding/3.jpg',
    'http://7o52me.com1.z0.glb.clouddn.com/black-1.jpg',
    'http://7xq1q6.com1.z0.glb.clouddn.com/wedding/5.jpg',
    'http://7o52me.com1.z0.glb.clouddn.com/white-2.jpg',
    'http://7xq1q6.com1.z0.glb.clouddn.com/wedding/7.jpg',
    'http://7xq1q6.com1.z0.glb.clouddn.com/wedding/8.jpg',
    'http://7xq1q6.com1.z0.glb.clouddn.com/wedding/9.jpg',
    'http://7xq1q6.com1.z0.glb.clouddn.com/wedding/10.jpg',
    'http://7xq1q6.com1.z0.glb.clouddn.com/wedding/11.jpg',
    'http://7xq1q6.com1.z0.glb.clouddn.com/wedding/12.jpg',
  ];
  var photoSwiper;
  var together = new Date();
  together.setFullYear(2014, 6, 14);
  together.setHours(0);
  together.setMinutes(0);
  together.setSeconds(0);
  together.setMilliseconds(0);

  $html.css('font-size', ($win.width() / 10) + 'px');
  appendFrameBorder($frames);
  initMap();
  initSwiper();
  loveTimer();
  requestWishes();
  initWx();

  function appendFrameBorder($frames) {
    var $borders = $('<div class="frame-borders"><div class="bottom"></div></div>');
    $frames.each(function() {
      $(this).css('height', $body.height()).append($borders.clone());
    });
  }
  function initMap() {
    var map = new AMap.Map('J-Map', {
      resizeEnable: true,
      zoom: 14,
      center: [116.949093, 34.728785]
    });
    var marker = new AMap.Marker({
      icon: "http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
      position: [116.949093, 34.728785]
    });
    marker.setMap(map);
  }
  function initSwiper() {
    var swiper = new Swiper('#J-MainSwiper', {
      direction: 'vertical',
      speed: 500,
      effect: 'coverflow',
      pagination: {
        el: '#J-MainSwiperPagin',
        clickable: true,
      },
      on: {
        init: function() {
          if (this.realIndex === 0) {
            $('.frame-' + (this.realIndex + 1)).makeAnimate();
          }
        },
        transitionEnd: function() {
          $('.frame-' + (this.previousIndex + 1)).resetAnimate();
          $('.frame-' + (this.realIndex + 1)).makeAnimate();
          if (this.realIndex === 3) {
            initHeart();
          }
        }
      }
    });
  }
  function loveTimer() {
    function timeElapse(date) {
      var current = Date();
      var seconds = (Date.parse(current) - Date.parse(date)) / 1000;
      var days = Math.floor(seconds / (3600 * 24));
      seconds = seconds % (3600 * 24);
      var hours = Math.floor(seconds / 3600);
      if (hours < 10) {
        hours = "0" + hours;
      }
      seconds = seconds % 3600;
      var minutes = Math.floor(seconds / 60);
      if (minutes < 10) {
        minutes = "0" + minutes;
      }
      seconds = seconds % 60;
      if (seconds < 10) {
        seconds = "0" + seconds;
      }
      // var result = "<span class=\"digit\">" + days + "</span> days <span class=\"digit\">" + hours + "</span> hours <span class=\"digit\">" + minutes + "</span> minutes <span class=\"digit\">" + seconds + "</span> seconds";
      var result = '<span>' + days + '</span> 天 <span>' + hours + '</span> 时 <span>' + minutes + '</span> 分 <span>' + seconds + '</span> 秒'
      $("#J-ElapseClock").html(result);
    }
    timeElapse(together);
    setInterval(function() {
      timeElapse(together);
    }, 500);
  }
  function requestWishes() {
    $.get('/wishes', function(res) {
      if (res.success) {
        onGetWishes(res.data);
      }
    }, 'json');
  }
  var sendLoading = false;
  function sendWish() {
    var name = $('#J-YourName').val();
    var text = $('#J-Wish').val();
    if (name && text) {
      if (sendLoading) {
        return;
      }
      sendLoading = true;
      $.post('/wishes', {
        name: name,
        text: text
      }, function(res) {
        glb.hideWishModal();
        if (res.success) {
          onGetWishes(res.data);
          sendLoading = false;
        }
      });
    }
  }
  var scrollTimer;
  function scrollWishes() {
    clearInterval(scrollTimer);
    var $wishes = $('#J-Wishes');
    var $wishesContainer = $wishes.parent();
    var wishesHeight = $wishes.height();
    var wishesCtnHeight = $wishesContainer.height();
    var initTop = wishesCtnHeight;
    if (wishesHeight > wishesCtnHeight); {
      scrollTimer = setInterval(function() {
        initTop -= 1;
        $wishes.css({
          'transform': 'translate3d(0, ' + initTop + 'px, 0',
          'webkitTransform': 'translate3d(0, ' + initTop + 'px, 0'
        });
        if (-initTop > wishesHeight + 20) {
          initTop = wishesCtnHeight;
        }
      }, 20);
    }
  }
  var heartInited = false;
  function initHeart() {
    if (heartInited) {
      return;
    }
    // setup garden
    var $window = $(window), gardenCtx, gardenCanvas, $garden, garden;
    var clientWidth = $(window).width();
    var clientHeight = $(window).height();
    var $loveHeart = $("#loveHeart");

    if (clientWidth < 670) {
      var s = clientWidth / 690 / 1.2;
      $loveHeart.css({
        'transform': 'scale(' + s + ')',
        '-webkit-transform': 'scale(' + s + ')'
      })
    }

    $garden = $("#garden");
    gardenCanvas = $garden[0];
    gardenCanvas.width = $("#loveHeart").width();
    gardenCanvas.height = $("#loveHeart").height();
    gardenCtx = gardenCanvas.getContext("2d");
    gardenCtx.globalCompositeOperation = "lighter";
    garden = new Garden(gardenCtx, gardenCanvas);

    // $("#content").css("width", $loveHeart.width() + $("#code").width());
    // $("#content").css("height", Math.max($loveHeart.height(), $("#code").height()));
    $("#content").css("margin-top", Math.max(($window.height() - $("#content").height()) / 2, 10));
    // $("#content").css("margin-left", Math.max(($window.width() - $("#content").width()) / 2, 10));

    // renderLoop
    setInterval(function() {
      garden.render();
    }, Garden.options.growSpeed);

    function getHeartPoint(angle) {
      var t = angle / Math.PI;
      var x = 19.5 * (16 * Math.pow(Math.sin(t), 3));
      var y = -20 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      return new Array(offsetX + x, offsetY + y);
    }

    function startHeartAnimation() {
      var interval = 50;
      var angle = 10;
      var heart = new Array();
      var animationTimer = setInterval(function() {
        var bloom = getHeartPoint(angle);
        var draw = true;
        for (var i = 0; i < heart.length; i++) {
          var p = heart[i];
          var distance = Math.sqrt(Math.pow(p[0] - bloom[0], 2) + Math.pow(p[1] - bloom[1], 2));
          if (distance < Garden.options.bloomRadius.max * 1.3) {
            draw = false;
            break;
          }
        }
        if (draw) {
          heart.push(bloom);
          garden.createRandomBloom(bloom[0], bloom[1]);
        }
        if (angle >= 30) {
          clearInterval(animationTimer);
        } else {
          angle += 0.2;
        }
      }, interval);
    }

    var offsetX = $("#loveHeart").width() / 2;
    var offsetY = $("#loveHeart").height() / 2 - 55;
    startHeartAnimation();
    heartInited = true;
  }

  // play music
  document.addEventListener('DOMContentLoaded', function() {
    function audioAutoPlay() {
      var audio = document.getElementById('bg-music');
      audio.play();
      document.addEventListener("WeixinJSBridgeReady", function() {
        audio.play();
      }, false);
      var paused = false;
      $('#J-PlayMusic').on('touchend', function() {
        var $this = $(this);
        if (paused) {
          audio.play();
          paused = false;
          $this.addClass('icon-music-animate');
        } else {
          audio.pause();
          paused = true;
          $this.removeClass('icon-music-animate');
        }
      });
    }
    audioAutoPlay();
  });

  // 祝福获取回调
  function onGetWishes(wishes) {
    var tmpl = '';
    wishes.forEach(function(item) {
      tmpl += '<li>';
      tmpl += '  <span class="name">' + item.name + '：</span>';
      tmpl += '  <span class="body">' + item.text + '</span>';
      tmpl += '</li>';
    });
    $('#J-Wishes').html(tmpl);
    scrollWishes();
  }

  // 全局函数
  glb.showWishModal = function() {
    $('.wish-form').show();
  }
  glb.hideWishModal = function() {
    // $name.val('');
    $wish.val('');
    $('.wish-form').hide();
  }
  glb.showMorePhotos = function() {
    if (photoSwiper) {
      $('.more-photos').show();
      return;
    }
    var tmpl = '';
    photos.forEach(function(src) {
      tmpl += '<div class="swiper-slide">';
      tmpl += '<img data-src="' + src + '" class="swiper-lazy">';
      tmpl += '<div class="swiper-lazy-preloader"></div>';
      tmpl += '</div>';
    });
    $('#J-SwiperPhotos').children('.swiper-wrapper:first-child').html(tmpl);
    $('.more-photos').show();
    photoSwiper = new Swiper('#J-SwiperPhotos', {
      // direction: 'vertical',
      preloadImages: false,
      lazy: true,
      on: {
        tap: function() {
          glb.hodeMorePhotos();
        }
      }
    });
    $('#J-PhotosToast').animateCss('fadeOut', function() {
      $('#J-PhotosToast').remove();
    });
  }
  glb.hodeMorePhotos = function() {
    $('.more-photos').hide();
  }
  glb.openMap = function() {
    wx.openLocation({
      latitude: 34.728785, // 纬度，浮点数，范围为90 ~ -90
      longitude: 116.949093, // 经度，浮点数，范围为180 ~ -180。
      name: '回味从前', // 位置名
      scale: 10, // 地图缩放级别,整形值,范围从1~28。默认为最大
    });
  }
  glb.sendWish = sendWish;

  // TODO: 微信分享封面图
  function initWx() {
    const url = location.href.split('#')[0];
    $.get('/wxconfig?url=' + url, function(res) {
      wx.config({
        debug: location.search.indexOf('_debug_') > -1 ? true : false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: res.data.appId,
        timestamp: res.data.timestamp,
        nonceStr: res.data.noncestr,
        signature: res.data.signature,
        url: url,
        jsApiList: ['openLocation'] // 必填，需要使用的JS接口列表
      });
      wx.ready(function(){
        // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
        // console.log('微信API注册成功');
      });
      wx.error(function(res) {
        console.error('微信API注册失败', res);
        // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
      });
    });
  }
  
}(window.jQuery, window));