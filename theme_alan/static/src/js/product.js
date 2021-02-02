odoo.define('theme_alan.product', function(require) {
"use strict";

const publicWidget = require('web.public.widget');

publicWidget.registry.product = publicWidget.Widget.extend({
    selector: "#wrapwrap",
    start: function() {
        self = this;
        this._super.apply(this, arguments);
        self.displayHeader();
    },
    displayHeader: function() {
        $("#wrapwrap").on("scroll", function() {
            const getPriceHtml = $('div#product_details .product_price').html();
            if ($('.as_prod_sticky').length && $('div#product_details a#add_to_cart').length) {
                if ($(this).scrollTop() > $('div#product_details a#add_to_cart').offset().top) {
                    $('div#wrapwrap .as_prod_sticky').fadeIn();
                    /* Prices on AddtoCart sticky*/
                    if ($(".js_product .js_main_product").hasClass("css_not_available")) {
                        $('div#wrapwrap .prod_price').html('');
                        $(".as_prod_sticky .as_add_cart #add_to_cart, .as_prod_sticky .as_add_cart #buy_now").addClass('disabled');
                    } else {
                        $('div#wrapwrap .prod_price').html(getPriceHtml);
                        $(".as_prod_sticky .as_add_cart #add_to_cart, .as_prod_sticky .as_add_cart #buy_now").removeClass('disabled');
                    }

                    $(".as_prod_sticky .as_add_cart #add_to_cart").click(function() {
                        $("div#product_details .js_product .js_main_product #add_to_cart").trigger("click");
                        return false;
                    });
                    $(".as_prod_sticky .as_add_cart #buy_now").click(function() {
                        $("div#product_details .js_product .js_main_product #buy_now").trigger("click");
                        return false;
                    });
                } else {
                    $('div#wrapwrap .as_prod_sticky').fadeOut();
                }
            }
        });
    },
});
});
