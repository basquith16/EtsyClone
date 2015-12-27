"use strict";

const API_KEY = 'psw5gnpus7ch68ghavfx2b6z';
const API_ROOT = 'https://openapi.etsy.com/v2/listings/';

//Models
var Listing = Backbone.Model.extend({
  url: function() {
    return API_ROOT + this.get('listing_id') + '.js?api_key=' + API_KEY + '&callback=?&includes=Images:1:0';
  },

  parse(response) {
    if (Array.isArray(response.results)) {
      return response.results[0];
    } else {
      return response;
    }
  },

  imageURL() {
    return this.attributes.Images[0]["url_570xN"];
  },

  serialize() {
    let json = this.toJSON();
    json.imageURL = this.imageURL();
    return json;
  }
});

var Listings = Backbone.Collection.extend({
  get url() {
    return `https://openapi.etsy.com/v2/listings/active.js?api_key=${API_KEY}&callback=?&includes=Images:1:0`;
  },

  parse(data) {
    return data.results;
  },

  get model() {
    return Listing;
  }
});


//Views
var ShowListing = Backbone.View.extend({
  template: _.template($('#showListing').text()),

  render: function() {
    var self = this;
    self.$el.html(self.template(this.model.attributes));
    return self.$el;
  }
})
var ItemsView = Backbone.View.extend({
  tagName: 'ul',
  template: _.template($('#itemsTemplate').text()),

  initialize: function() {
    this.listenTo(this.collection, 'update', this.render);
    this.collection.fetch();
  },

  render: function() {
    let items = this.template();
    this.collection.each((listing) => {
      let view = new DetailView({
        model: listing
      })
      this.$el.append(view.render());
    });

    return this.$el;
  },

  serialize() {
    let json = this.toJSON();
    json.imageURL = this.imageURL();
    return json;
  }
});

var DetailView = Backbone.View.extend({
  template: _.template($('#detailsTemplate').text()),

  render: function() {
    $('.mainPic').show();
    var detailsTemplate = this.template(this.model.serialize());
    this.$el.html(detailsTemplate);
    return this.el;
  },
});

//Router
var Router = Backbone.Router.extend({
  routes: {
    "": "index",
    "showListing/:id": "showSingle"
  },

  showSingle: function(listing_id) {
    $('.mainPic').hide();
    var listing = new Listing({
      listing_id: listing_id
    });

    listing.fetch().then(function() {
      var showListing = new ShowListing({
        model: listing
      });
      $('.content').html(showListing.render());
    })
  },

  initialize: function() {
    console.log('initialized listing');
    this.listing = new Listing();
    this.showListing = new ShowListing();
  },

  index: function() {
    var itemsView = new ItemsView({
      collection: new Listings()
    });
    $('.content').html(itemsView.render());
  },

  details: function(listing_id) {
    var item = new Listing({
      listing_id: listing_id
    });
    var detailView = new DetailView({
      model: item
    });
    $('.content').html(detailView.render());
  }
});

$(document).ready(function() {
  var router = new Router();
  Backbone.history.start();
  console.log('history started');
});
