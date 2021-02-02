odoo.define('atharva_theme_base.s_product_slider_options',function(require){
'use strict';

var ajax = require('web.ajax');
var core = require('web.core');
var rpc = require('web.rpc');
var weContext = require('web_editor.context');
var web_editor = require('web_editor.editor');
var options = require('web_editor.snippets.options');
var wUtils = require('website.utils');
var qweb = core.qweb;
var _t = core._t;

ajax.loadXML('/atharva_theme_base/static/src/xml/product_slider_popup.xml', core.qweb);

options.registry['product_slider_actions'] = options.Class.extend({
    popup_template_id: "main_product_slider_layout_template",
    popup_title: _t("Select Product Slider Layout"),

    start: function () {
        var self = this;
        return this._super.apply(this, arguments);
    },

    product_slider_configure: function(previewMode, value){
        var self = this;
        if(previewMode === false || previewMode === "click"){
            self.$modal = $(qweb.render("atharva_theme_base.p_slider_popup_template"));
            $('body > #product_slider_modal').remove();
            self.$modal.appendTo('body');
            self._rpc({
                model: 'slider_temp.collection.configure',
                method: 'name_search',
                args: ['', [['website_id','in',[false,parseInt($("html").attr("data-website-id"))]]]],
                context: weContext.get()
            }).then(function(data){

                var pro_col_ele = $("#product_slider_modal select[name='pro_collection']");
                pro_col_ele.empty();
                var val_in_list_flag = true;
                var val_in_list = false;

                if(data){
                    for(var i = 0; i < data.length; i++){
                        pro_col_ele.append("<option value='" + data[i][0] + "'>" + data[i][1] + "</option>");
                        if(data[i][0].toString() === self.$target.attr("data-collection_id") && val_in_list_flag){
                            val_in_list = true;
                            val_in_list_flag = false;
                        }
                    }
                    if(self.$target.attr("data-collection_id") !== "0" && val_in_list){
                        pro_col_ele.val(self.$target.attr("data-collection_id"));
                    }
                }

                if(data){
                    var pro_tab_ele = $("#product_dynamic_slider_modal select[name='pro_collection']");
                    pro_tab_ele.empty();
                    for(var i = 0; i < data.length; i++){
                        pro_tab_ele.append("<option value='" + data[i][0] + "'>" + data[i][1] + "</option>");
                    }
                    $('#multiselect').multiselect();
                }
                $('#pro_all').on('click', function(e){
                    e.preventDefault();
                    $('#multiselect option').prop('selected', true);
                });

                $('#pro_reset').on('click', function(e){
                    e.preventDefault();
                    $("#multiselect option:selected").prop('selected', false);
                });
                self._rpc({
                    model: 'product_slider.options',
                    method: 'name_search',
                    args: ['', []],
                    context: weContext.get()
                }).then(function(data){
                    var slider_design_ele = $("#product_slider_modal select[name='slider_type']");
                    slider_design_ele.empty();
                    val_in_list_flag = true;
                    val_in_list = false;
                    if(data){
                        var data = data.sort((a,b) => a[1].toUpperCase().localeCompare(b[1].toUpperCase()));
                        for(var i = 0; i < data.length; i++){
                            slider_design_ele.append("<option value='slider_layout_" + data[i][0] + "'>" + data[i][1] + "</option>");
                            if(data[i][0].toString() === self.$target.attr("data-collection_id") && val_in_list_flag){
                                val_in_list = true;
                                val_in_list_flag = false;
                            }
                        }
                        if(val_in_list && self.$target.attr("data-collection_id") !== "0" && val_in_list){
                            slider_design_ele.val(self.$target.attr("data-collection_id"));
                        }
                    }
                });
            });
            // change slider image
            self.$modal.on('change', self.$modal.find("select[name='slider_type']"), function(e){
                var $sel_ele;
                var val_list = [];
                if(self.$modal.find("select[name='slider_type']").val()){
                    $sel_ele = self.$modal.find("select[name='slider_type']");
                    self.$modal.find("form .p_slider_sample_view img.snip_sample_img").attr("src", "/atharva_theme_base/static/src/img/snippets/product_slider/" + $sel_ele.val() + ".png");
                }
            });
            // grid options
            self.$modal.on('change', self.$modal.find("select[name='slider_type']"), function (e){
                if ($(this).find("select[name='slider_type'] option:selected").text().indexOf('Grid') != -1) {
                    $("div.prod_count").hide();
                    $("div.auto_load").hide();
                }
                else{
                    $("div.prod_count").show();
                    $("div.auto_load").show();
                }
            });
            // sliding time
            self.$modal.on('change', self.$modal.find("input[name='prod-auto']"), function(e){
                if ($("input#prod-auto").is(':checked')) {
                    $("div.slider_time").show();
                }
                else {
                    $("div.slider_time").hide();
                }
            });
            self.$modal.on('click', ".btn_apply", function(){
                var product_list = [];
                var $sel_ele = self.$modal.find("select[name='slider_type']");
                var $pro_list = self.$modal.find("select[name='pro_collection']");
                var $form = self.$modal.find("form");
                var $prod_count = self.$modal.find("#prod-count");
                var $prod_auto = self.$modal.find("#prod-auto");
                var $slider_time = self.$modal.find("#slider_time");
                var $add_to_cart = self.$modal.find("#add_to_cart");
                var $quick_view = self.$modal.find("#quick_view");
                var $pro_compare = self.$modal.find("#pro_compare");
                var $pro_wishlist = self.$modal.find("#pro_wishlist");
                var $pro_ribbon = self.$modal.find("#pro_ribbon");
                var $pro_ratting = self.$modal.find("#pro_ratting");
                var collection_name = '';
                var check = false;
                var check_add_to_cart = false;
                var check_quick_view = false;
                var check_pro_compare = false;
                var check_pro_wishlist = false;
                var check_pro_ribbon = false;
                var check_pro_ratting = false;

                // Check if autoPlay
                if($prod_auto.is(":checked") == true){
                    check = true;
                }
                if($add_to_cart.is(":checked") == true){
                    check_add_to_cart = true;
                }
                if($quick_view.is(":checked") == true){
                    check_quick_view = true;
                }
                if($pro_compare.is(":checked") == true){
                    check_pro_compare = true;
                }
                if($pro_wishlist.is(":checked") == true){
                    check_pro_wishlist = true;
                }
                if($pro_ribbon.is(":checked") == true){
                    check_pro_ribbon = true;
                }
                if($pro_ratting.is(":checked") == true){
                    check_pro_ratting = true;
                }

                if($sel_ele.val()){
                    collection_name = $form.find("select[name='pro_collection'] option:selected").text();
                    if(!collection_name)
                        collection_name = "NO COLLECTION SELECTED";

                    self.$target.attr("data-collection_id", $form.find("select[name='pro_collection']").val());
                    self.$target.attr("data-collection_name", collection_name);
                    self.$target.attr("data-slider_type", $form.find("select[name='slider_type']").val());
                    self.$target.attr("data-prod-count", $prod_count.val());
                    self.$target.attr("data-prod-auto", check);
                    self.$target.attr("data-slider_time", $slider_time.val());
                    self.$target.attr("data-add_to_cart", check_add_to_cart);
                    self.$target.attr("data-quick_view", check_quick_view);
                    self.$target.attr("data-pro_compare", check_pro_compare);
                    self.$target.attr("data-pro_wishlist", check_pro_wishlist);
                    self.$target.attr("data-pro_ribbon", check_pro_ribbon);
                    self.$target.attr("data-pro_ratting", check_pro_ratting);
                }
                else{
                    collection_name = 'NO COLLECTION SELECTED';
                }

                product_list = $form.find("select[name='pro_collection'] option:selected").text();
                if(!product_list)
                    product_list = "NO PRODUCT SELECTED";
                self.$target.attr('data-product_list', $pro_list.val());

                self.$target.empty().append('<div class="container"><div class="seaction-head"><h2>' + collection_name + '</h2></div></div>');
            });

            var product_list = self.$target.attr("data-product_list") || '';
            var sn_col = self.$target.attr("data-collection_id");
            var sn_layout = self.$target.attr("data-slider_type");
            var sn_count = self.$target.attr("data-prod-count");
            var sn_play = self.$target.attr("data-prod-auto") || '';
            var slider_min = self.$target.attr("data-slider_time") || '';
            var sn_add_to_cart = self.$target.attr("data-add_to_cart") || '';
            var sn_quick_view = self.$target.attr("data-quick_view") || '';
            var sn_pro_compare = self.$target.attr("data-pro_compare") || '';
            var sn_pro_wishlist = self.$target.attr("data-pro_wishlist") || '';
            var sn_pro_ribbon = self.$target.attr("data-pro_ribbon") || '';
            var sn_pro_ratting = self.$target.attr("data-pro_ratting") || '';

            sn_play = sn_play.toLowerCase() == 'true' ? true : false;
            sn_add_to_cart = sn_add_to_cart.toLowerCase() == 'true' ? true : false;
            sn_quick_view = sn_quick_view.toLowerCase() == 'true' ? true : false;
            sn_pro_compare = sn_pro_compare.toLowerCase() == 'true' ? true : false;
            sn_pro_wishlist = sn_pro_wishlist.toLowerCase() == 'true' ? true : false;
            sn_pro_ribbon = sn_pro_ribbon.toLowerCase() == 'true' ? true : false;
            sn_pro_ratting = sn_pro_ratting.toLowerCase() == 'true' ? true : false;

            $('#prod-auto').prop('checked', sn_play);
            $('#add_to_cart').prop('checked', sn_add_to_cart);
            $('#quick_view').prop('checked', sn_quick_view);
            $('#pro_compare').prop('checked', sn_pro_compare);
            $('#pro_wishlist').prop('checked', sn_pro_wishlist);
            $('#pro_ribbon').prop('checked', sn_pro_ribbon);
            $('#pro_ratting').prop('checked', sn_pro_ratting);

            // Set Count in Modify
            if(sn_count !== "0")
            {
                self.$modal.find("form input[name='prod-count']").val(sn_count);
            }
            self.$modal.modal();

            $('#product_slider_modal').on('shown.bs.modal', function (e) {
                if(sn_play != false){
                    $("div.slider_time").show();
                    self.$modal.find("form input[id='slider_time']").val(slider_min);
                }
                self.$modal.find("form select[name='slider_type']").val(sn_layout);
                if(product_list != '')
                {
                    $('#multiselect').val(product_list.split(','));
                    $("#multiselect").multiselect("refresh");
                }
            });
        }
        return self;
    },
    onBuilt: function(){
        var self = this;
        this._super();
        this.product_slider_configure('click');
    },
});

});
