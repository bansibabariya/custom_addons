odoo.define('theme_alan.shop', function (require) {
"use strict";

const sAnimations = require('website.content.snippets.animation');

sAnimations.registry.shopScript = sAnimations.Class.extend({
    selector: '.oe_website_sale',
    read_events: {
        'click .clear_filter': '_onClearAttribute',
        'click .as_attribute_name': '_onAttributeClick',
    },
    _onClearAttribute: function(ev) {
        ev.stopPropagation();
        var self = ev.currentTarget;
        var $attr_box = $(self).parents("li.nav-item");
        $attr_box.find("input[name='attrib'][value^='" + $(self).data("attr_id") + "-']").each(function(){
            $(this).prop("checked", false);
        });
        var id = $(self).attr("data-id");
        $attr_box.find("option[selected='True']").each(function(){
            $(this).removeAttr('selected');
        });
        $attr_box.find("input[name='brand']").each(function(){
            $(this).removeAttr('checked');
        });
        $(self).parents("form.js_attributes").submit();
    },
    _onAttributeClick: function(ev) {
        var self = ev.currentTarget;
        var attr_li = $(self).parents("li.nav-item");
        var attr_ul = attr_li.find("ul");
        var select_attr = attr_li.find("select");

        if (attr_ul.hasClass("show_section")) {
            attr_ul.removeClass("show_section").toggle('slow');
        } else {
            attr_ul.addClass("show_section").toggle('slow');
        }

        if (select_attr.length == 1) {
            $("select.form-control.open_select").css('display','block');
            if (select_attr.hasClass("show_select")) {
                select_attr.removeClass("show_select").toggle('slow');
            }
            else {
                select_attr.addClass("show_select").toggle('slow');
            }
        }

        var color_attr = attr_li.find("div.collapsible_attr_color");
        if (color_attr.length == 1) {
            if (color_attr.hasClass("show_color")) {
                color_attr.removeClass("show_color").toggle('slow');
            }
            else {
                color_attr.addClass("show_color").toggle('slow');
            }
        }
    },
});
});

$(document).ready(function () {
    var change_in_price_filter = false;
    $("#price_filter_input").slider();
    $(document).on("change", "#price_filter_input", function(){
        if($(this).val()){
            var prices = $(this).val().split(",");
            $('#min_val').val(prices[0]);
            $('#max_val').val(prices[1]);
            $('span.text_min_val').text(prices[0]);
            $('span.text_max_val').text(prices[1]);
            change_in_price_filter = true;
        }
    });
});
$(document).on("click", "#products_grid_before .apply_price_filter", function(){
    $("#products_grid_before form.js_attributes").submit();
});



// Shop Filter Menu
$(document).ready(function(){
    $('.as_aside_filter_open').click(function(){
        $(this).addClass('active');
        $('.as-aside-filter-close').addClass('active');
        $('#products_grid_before').addClass('products_grid_before_open');
    });
    $('.as_aside_filter_close').click(function(){
        $('.as-aside-filter-close').removeClass('active');
        $('.as_aside_filter_open').removeClass('active');
        $('#products_grid_before').removeClass('products_grid_before_open');
    });

    $("#top_menu .dropdown > .dropdown-toggle").after("<span class='mob_menu' data-toggle='dropdown' aria-expanded='false'></span>")
    $(".mm-mega-menu .mm-cat-level-1 > .cat-level-title .mm-title").after("<span class='mob_menu'></span>")

    $(".mm-mega-menu .mob_menu").click(function() {
        $(this).parent('li').toggleClass("open-mob-menu");
        $(this).toggleClass("mob-menu-open");
    });
    
    $(".mm-category-level .mob_menu").click(function() {
        $(this).parent().parent('.mm-cat-level-1').toggleClass("open-mob-menu");
        $(this).toggleClass("mob-menu-open");
    });
    
});

// Multi Level Mega Menu
$(document).on('mouseenter', 'header li.mm-mega-menu', function() {
    if ($(this).find(".mm-maga-main.mm-mega-cat-level").length > 0) {
        var $first_tab = $(this).find(".mm-category-level .mm-cat-level-1:eq(0)");
        $first_tab.find(".cat-level-title").addClass("active-li");
        $first_tab.find(".mm-cat-level-2").addClass("menu-active");
    }
});
$(document).on('mouseenter', '.mm-cat-level-1', function() {
    var $first_div = $(this).find('.cat-level-title');
    $first_div.addClass("active-li");
    $(this).find('.mm-cat-level-2').addClass("menu-active");
});
$(document).on('mouseleave', '.mm-cat-level-1', function() {
    var $first_div = $(this).find('.cat-level-title')
    $first_div.removeClass("active-li");
    $(this).find('.mm-cat-level-2').removeClass("menu-active");
});