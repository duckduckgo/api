(function(jQuery) {

  var dparams = {
    color: "#000000", /* The font color of the text in the iframe. 
      This can be of the form "000000" or "#000000" or "black".
    Default: "#000000"
    */
    unpunct: false, /* (true/false) Remove punctuations from the selected 
      text if true. Default: false
    */
    "max-length": 60, /* Ignore selected text if number of selected characters 
    are greater than max-length. Default: 60
    */
    singleton: false, /* (true/false) Will allow ONLY 1 instance of this widget on 
      this page if set to true. The value of 'singleton' must be the SAME
      for ALL invocations of this widget on the same page. The behaviour of 
      the widget is undefined if you use different paramaters when invoked 
      on the same page. Default: false
    */
    clickout: false, /* (true/false) Clicking outside the widget closes it if true.
      The value of clickout is meaningful ONLY if the 'singleton' flag is 
      set to true. Default: false
    */
    proximity: true, /* (true/false) If true, changes the opacity of the widget 
      based on widget position and the position of the mouse pointer. The value 
      of proximity holds true only if singleton is set to true. If 
      'proximity' is set to true and 'singleton' is set to false, 
      then the behaviour of this widget can not be defined. Just like 
      'singleton', if you specify a value for 'proximity' once on a page, 
      you MUST use the same value on all invocations on that page.
      Default: true
    */
    cornered: true, /* (true/false). If true, the widget will try to start 
      itself at one of the corners of the screen such that it is not under 
      the mouse. sandesh247 suggested this since most selections would be
      to copy text and not to define a term. Thanks Sandy!! :-) :-)
      Default: true
    */
    "font-family": $("body").css("font-family"), /* The font-family to use in 
      the iframe. If 'font-family' is NOT specified, it is set to the 
    "font-family" attribute of the current document's body element.
    */
    "error-string": "Sorry, nothing could be found :-(", /* The error string to 
      display in the iframe if no matches were found.
    */
	css: { } /* Other css attributes. Default: (empty) 
	*/
  };

  var divstr = "<div class='actions'>" +
  "<div class='left-div'>" + 
  "  <div class='user-sel-text'>Hello World</div>" + 
  "</div>" + 
  "<div class='right-div'>" + 
  "  <div class='close'>X</div>" + 
  "</div>" + 
  "<div style='clear: both;'></div>" + 
  "<div style='clear:both;'></div>" + 
  "<a class='more-info'>More Info.</a>" + 
  "</div>";
  var prev_open = null;
  var last_click_at = (new Date()).getTime();

  /* Body's handlers attached? */
  var _wh = false;


  function getSelected() {
    if(window.getSelection) { return window.getSelection(); }
    else if(document.getSelection) {
      return document.getSelection();
    }
    else {
      var selection = document.selection && document.selection.createRange();
      if(selection.text) {
        return selection.text;
      }
      return false;
    }
    return false;
  }

  function remove_prev_open() {
    if (prev_open) {
      prev_open.remove();
      prev_open = null;
    }
  }

  function unpunct(s) {
    return jQuery.trim((s.replace(/[\W]/g, " ")).replace(/[\s]+/g, " "));
  }

  function clickedOnMe(x, y, p, act, e) {
    return e.pageX >= x-p && e.pageX <= x+act.width()+2*p && 
      e.pageY >= y-p && e.pageY <= y+act.height()+2*p;
  }


  /* Get the LEFT (x) & TOP (y) values for placing the new widget 
   * div on the screen.
   *
   * Parameters:
   * e => The event object that will give the current mouse position
   * a => The new widget div that is going to be shown.
   *
   * Returns { x: x-value, y: y-value }. The x & y positions for the
   * widget to be placed.
   *
   */
  function get_div_start_pos(e, a) {
    var x = parseInt(a.css("left"));
    var y = parseInt(a.css("top"));

    var p = 13;
    var widw = a.width() + 2*p;
    var widh = a.height() + 2*p + 200;
    var winw = $(window).width();
    var winh = $(window).height();
    var otop = $(window).scrollTop();
    var MAGIC = 20;

    /* List of candidate positions */
    var _candidates = [ 
      { x: winw - MAGIC - widw, y: otop + MAGIC }, /* Top Right */
      { x: winw - MAGIC - widw, y: otop + winh - widh - MAGIC }, /* Bottom Right */
      { x: MAGIC, y: otop + MAGIC }, /* Top Left */
      { x: MAGIC, y: otop + winh - widh - MAGIC } /* Bottom Left */
    ];

    for (var i in _candidates) {
      var _c = _candidates[i];
      // console.log(clickedOnMe(_c.x, _c.y, 13, a, e));
      if (!clickedOnMe(_c.x, _c.y, 13, a, e)) {
        return _c;
      }
    }
    /* We failed to find a position!!!! */
    return { x: x, y: y };

  } // get_div_start_pos()


  jQuery.fn.zero_clickable = function(params) {

    params = jQuery.extend({}, dparams, params);
    params.color = escape(params.color);


    if (!_wh && (params.proximity || params.clickout)) {
      _wh = true;

      if (params.proximity) {

        $(window).mousemove(function(e) {
          var a = $(".actions");
          // console.log(a);
          a.each(function() {
            /* To account for the padding and border width */
            var p = 13;
            var i = $(this);
            var x = parseInt(i.css("left"));
            var y = parseInt(i.css("top"));
            var cx = x + (i.width() / 2.0);
            var cy = y + (i.height() / 2.0);
            var dx = Math.abs(cx - e.pageX);
            var dy = Math.abs(cy - e.pageY);

            var d = Math.sqrt(dx*dx + dy*dy);
            // console.log("A", $(i).css("left"));
            var _o = 1.0;
            // console.log(x-p, y-p, i.width()+p, i.height()+p, e.pageX, e.pageY);
            if (clickedOnMe(x, y, p, i, e)) {
              /* Do nothing */
            }
            else {
              if (d < 1000) {
              _o = 1.0 - ((d - 100) / 1000.0);
               // console.log(d);
              } else { _o = 0.0; }
            }
            _o = _o < 0.15 ? 0.15 : _o;
            i.css("opacity", _o);
          });

        }); // $(window).mousemove(function(e)

      } // if (params.proximity)

      if (params.clickout) {
        $(window).click(function(e) {
          // alert("Foo");
          var curr_click_time = (new Date()).getTime();
          var prev_click_time = last_click_at;
          last_click_at = curr_click_time;

          // console.log("LCA:", last_click_at);
          // console.log("selected text: ", getSelected());
          // console.log("Times:", curr_click_time, prev_click_time, curr_click_time - prev_click_time);

          if (curr_click_time - prev_click_time < 500) {
            return;
          }

          var a = $(".actions");

          /* Did someone click on an action div?? */
          var onAction = false;

          a.each(function() {
            if (onAction) {
              return;
            }

            /* To account for the padding and border width */
            var p = 13;
            var i = $(this);
            var x = parseInt(i.css("left"));
            var y = parseInt(i.css("top"));

            if (clickedOnMe(x, y, p, i, e)) {
              onAction = true;
            }
          });

          if (!onAction) {
            remove_prev_open();
          }

        }); // $("body").click(function(e)

      } // if (params.clickout)

    } // if (!_wh)


    $(this).each(function() {

      $(this).mouseup(function(e) {
        // console.log("MOUSEUP");
        // console.log(getSelected());

        var st = jQuery.trim(getSelected().toString());
        if (params.unpunct) {
          st = unpunct(st);
        }
        if (st.length == 0 || st.length > params["max-length"]) {
          return;
        }

        /* Since this is a text selection, we fake a click. This is done to 
         * make the time differences match up.
         */
        last_click_at = (new Date()).getTime();

        /* Popup a div with certain actionable items */
        var a = $(divstr);
        a.css("left", e.pageX)
         .css("top", e.pageY);
        if ("id" in params) {
          a.attr("id", params.id);
        }
        a.find(".user-sel-text").html(st);
        a.find("iframe").remove();
        $("body").append(a);

        if (params.cornered) {
          var _dp = get_div_start_pos(e, a);
          a.css("left", _dp.x.toString() + "px")
           .css("top",  _dp.y.toString() + "px");
        }

		    for (var k in params.css) {
          a.css(k, params.css[k]);
		    }

        a.draggable();
        /* Display it!! */
        a.show();

        /* Check if we are in singleton mode */
        if (params.singleton) {
          remove_prev_open();
          prev_open = a;
        }

        a.find(".more-info").click(function() {
          /* Remove an existing iframe if one exists */
          if (a.find("iframe").length > 0) {
            return;
          }
          var i = $("<iframe></iframe>");
          var q = a.find(".user-sel-text").text();
          var url = "http://dhruvbird.com/ddb/zeroclick.php?color=" + params.color + 
            "&font-family=" + escape(params["font-family"]) + 
            "&q=" + escape(q);
          i.attr("src", url);
          a.append(i);
        }); // $(this).find(".more-info").click

        a.find("div.close").click(function() {
          /* Remove the .actions div */
          a.remove();
        });

        a.mousemove(function() {
          // console.log("AA");
          $(this).css("opacity", 1.0);
        });

      }); // $(this).mouseup

    }); // $(this).each

  };
}(jQuery))
