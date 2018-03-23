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
  
  if (localStorage.getItem('name')) {
    $name.val(localStorage.getItem('name'));
  }

  $html.css('font-size', ($win.width() / 10) + 'px');
  appendFrameBorder($frames);

  function appendFrameBorder($frames) {
    var $borders = $('<div class="frame-borders"><div class="bottom"></div></div>');
    $frames.each(function() {
      $(this).css('height', $body.height()).append($borders.clone());
    });
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
        if (res.success) {
          alert('发送成功');
          localStorage.setItem('name', name);
          location.reload();
        }
      });
    }
  }
  glb.sendWish = sendWish;

  // 请求红包图片地址
  $.get('/red-pack', function(res) {
    if (res.success && res.data) {
      var img = new Image();
      img.onload = function() {
        $('#J-Red-Pack').css({
          'background-image': 'url(' + res.data + ')',
          display: 'block'
        }).animateCss('zoomIn');
      }
      img.src = res.data;
    } else {
      $('#J-Frame-Post').show();
    }
  }, 'json');
  
}(window.jQuery, window));