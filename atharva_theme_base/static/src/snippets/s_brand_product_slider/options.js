odoo.define('atharva_theme_base.s_brand_product_slider_options',function(require){
'use strict';

var core = require('web.core');
var rpc = require('web.rpc');
var options = require('web_editor.snippets.options');
var wUtils = require('website.utils');
var _t = core._t;
var weContext = require('web_editor.context');

options.registry['brand_product_slider_actions'] = options.Class.extend({
    start: function () {
        var self = this;
        return this._super.apply(this, arguments);
    },
    popup_template_id: "brand_product_slider_layout_template",
    popup_title: _t("Select Slider Layout"),
    brand_product_slider_configure: function (previewMode, value) {
            var self = this;
            var def = wUtils.prompt({
                'id': this.popup_template_id,
                'window_title': this.popup_title,
                'select': _t("Slider Layout"),

                'init': function (field) {
                    var $form = this.$dialog.find('div.form-group');
                    $form.prepend('<label class="col-md-4 col-form-label">Select Brand:</label><div class="width_div col-md-8"><select multiple class="form-control" id="slider_brand_option"></select></div>');
                    var slider_styles = rpc.query({
                        model: 'as.product.brand',
                        method: 'name_search',
                        args: ['', [['website_id','in',[false,parseInt($("html").attr("data-website-id"))]],['active','=',true]]],
                        context: weContext.get(),
                    });
                    slider_styles.then(function (data) {
                        $.each(data, function(key, value) {
                             $('#slider_brand_option').append($("<option></option>").attr("value",value[0]).text(value[1]));
                        });
                    });
                    return rpc.query({
                        model: 'product_slider.options',
                        method: 'name_search',
                        context: weContext.get(),
                    });
                },
            });
            def.then(function (data) {
                var dialog = data.dialog;
                if(dialog)
                {
                    var selectedSlider = data.field[0].options['selectedIndex']
                    var slidername = data.field[0].options[selectedSlider].innerHTML
                    var brand_ids = dialog.find('#slider_brand_option').val();
                    self.$target.attr("data-slider-brand-id", brand_ids);
                    self.$target.attr("data-slider-style-id", data.val);
                    self.$target.attr("data-name", slidername);
                    self.$target.empty().append('<div class="container"><div class="seaction-head"><h2>'+ self.$target.attr("data-name") +'</h2></div></div>');
                }
            });
        return def;
    },
    onBuilt: function(){
        var self = this;
        this._super();
        this.brand_product_slider_configure('click').guardedCatch(function () {
            self.getParent()._onRemoveClick($.Event( "click" ));
        });
    },
    cleanForSave: function () {
        this.$target.empty();
        $('.as_brand_product').empty();
        var model = this.$target.parent().attr('data-oe-model');
        if(model){
            this.$target.parent().addClass('o_editable o_dirty');
        }
    },

});

});
