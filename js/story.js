(function() {
  var Sweet = Backbone.Model.extend({
    defaults: {
      'who': '',
      'what': 'img-anno',
      'where': '',
      'how': {}
    },
      initialize: function() {
      },
      hasTag: function(tag) {
        return this.get('how')['tags'].indexOf(tag);
      }
  });


  var Sweets = Backbone.Collection.extend({
    model: Sweet,
      getAll: function(options) {
        // error checking
        if(!options.what) {
          throw Error('"what" option must be passed to get sweets of a URI');
          return false;
        }
        // setting up params
        var where = options.where || null,
      what = options.what;
  var who = options.who || null;

  var url = "http://teststore.swtr.us/api/sweets/q?what=" + what;

  if(who) {
    url += '&who=' + who;
  }
  // get them!
  this.sync('read', this, {
    url: url,
    success: function() {
      if(typeof options.success === 'function') {
        options.success.apply(this, arguments);
      }
    },
    error: function() {
      if(typeof options.error === 'function') {
        options.error.apply(this, arguments);
      }
    }
  });
      }
  });


  var StoryView = Backbone.View.extend({
    template: _.template($("#story-image-template").html()),
      swtTemplate:_.template($("#swt-template").html()),
      txtTemplate: _.template($("#txt-anno-template").html()),
    events: {
      "click [data-target='#lightbox']": 'onImgClicked'
    },
    initialize: function(options) {
      if(!options.tag) {
        throw Error("Cannot init view without a tag, please provide a tag");
        return false;
      }
      this.tag = options.tag;
      this.listenTo(this.collection, "add", this.render);
      var self = this;
      this.collection.getAll({'what':options.what, who:options.who,
                              success: function(data) {
                                self.collection.add(data);
                              }});
    },
    render: function(model) {
      var swtType = model.get('what');
      if (swtType === 'img-anno'){
        this.$('#' + model.get('id')).append(this.template(model.toJSON()));
      }
      else if (swtType === 'txt-anno') {
        this.$('#' + model.get('id')).append(this.txtTemplate(model.toJSON()));
      }

    },
    onImgClicked: function(e) {
      var $lightbox = $("#lightbox");
      var $img = $(e.currentTarget),
          src = $img.attr('src'),
          alt = $img.attr('alt'),
          css = {
            'maxWidth': $(window).width() - 100,
            'maxHeight': $(window).height() - 100
          };
      var swt = this.collection.find({'id': parseInt($(e.currentTarget).attr("target-id"))});
      if(!swt.get('annotate')) {
        swt.set({'annotate':'http://restory.swtr.us/#/play?url=' +
                 encodeURIComponent(swt.get('where'))});
      }
      if(!swt.get('explore')) {
        swt.set({'explore':'http://restory.swtr.us/#/linked-data?user=' +
                 swt.get('who')});
      }

        $("#modal-content").html("");
        $("#modal-content").append(this.swtTemplate(swt.toJSON()));
        $lightbox.find('.close').addClass('hidden');
        $lightbox.find('img').attr('src', src);
        $lightbox.find('img').attr('alt', alt);
        $lightbox.find('img').css(css);

      }
  });
  /* Populate views based on the requirement for the chapter */
/*  new StoryView({collection: new Sweets(),
    el: "#chapter2",
      "who":"scribe",
      "what":"img-anno",
      "tag": "lolcat"});
  new StoryView({collection: new Sweets(),
    el: "#chapter3",
      "who":"scribe",
      "what":"img-anno",
      "tag": "lolcat"});

  new StoryView({collection: new Sweets(),
    el: "#chapter4",
      "who":"scribe",
      "what":"img-anno",
      "tag": "lolcat"});
  new StoryView({collection: new Sweets(),
    el: "#story-content",
      "who":"scribe",
      "what":"img-anno",
      "tag": "lolcat"});
  new StoryView({collection: new Sweets(),
    el: "#story-content",
      "who":"scribe",
      "what":"txt-anno",
      "tag": "Auto"});
*/
  var $lightbox = $('#lightbox');
  $lightbox.on('shown.bs.modal', function (e) {
    var $img = $lightbox.find('img');

    $lightbox.find('.modal-dialog').css({'width': $img.width()});
    $lightbox.find('.close').removeClass('hidden');
  });

  $(".chapter").waypoint(function() {
    // Set the active class for respective li element
    $("li").removeClass("active");
    $('body').find('li[for="' + $(this).attr('id') + '"]' ).addClass('active');
  });

})();
