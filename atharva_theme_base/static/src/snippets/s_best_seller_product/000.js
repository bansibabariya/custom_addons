odoo.define('atharva_theme_base.s_best_seller_product',function(require){
'use strict';

var sAnimation = require('website.content.snippets.animation');
var ajax = require('web.ajax');

sAnimation.registry.best_seller_product_slider_actions = sAnimation.Class.extend({
    selector : ".as_best_seller",
    disabledInEditableMode: false,
    start: function (editable_mode) {
        var self = this;
        if (self.editableMode){
            self.$target.empty().append('<div class="container"><div class="seaction-head"><h2>Product Best Seller Slider</h2></div></div>');
        }
        if(!self.editableMode){
            var style_id = self.$target.attr("data-slider-style-id");
            ajax.jsonRpc('/get_best_seller_product_data', 'call', {'style_id': style_id})
            .then(function (data) {
                if(data){
                    self.$target.empty().append(data);
                    self.initialize_owl();
                }
            });
        }
    },
    initialize_owl: function () {
        $('.as-product-carousel').owlCarousel({
            loop: false,
            rewind: true,
            margin: 10,
            nav: true,
            lazyLoad:true,
            dots: false,
            navText : ['<span aria-label="Previous"></span>', '<span aria-label="Next"></span>'],
            items: 4,
            responsive: {
                0: {
                    items: 1,
                },
                481: {
                    items: 2,
                },
                768: {
                    items: 2,
                },
                1024: {
                    items: 4,
                },
                1200: {
                    items: 4,
                }
            },
        });
    },
});
});
