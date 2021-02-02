# -*- coding: utf-8 -*-

import json
import math
from odoo import http
from odoo.http import request
from werkzeug.exceptions import NotFound
from odoo.addons.website_sale.controllers.main import WebsiteSale
from odoo.addons.website_sale.controllers.main import TableCompute
from odoo.addons.website.controllers.main import QueryURL
from odoo.addons.http_routing.models.ir_http import slug

class WebsiteSale(WebsiteSale):

    @http.route()
    def shop(self, page=0, category=None, search='', ppg=False, **post):
        """ Override for shop method """
        max_val = min_val = 0
        custom_min_val = custom_max_val = 0
        add_qty = int(post.get('add_qty', 1))
        Category = request.env['product.public.category']
        if category:
            category = Category.search([('id', '=', int(category))], limit=1)
            if not category or not category.can_access_from_current_website():
                raise NotFound()
        else:
            category = Category

        if ppg:
            try:
                ppg = int(ppg)
                post['ppg'] = ppg
            except ValueError:
                ppg = False
        if not ppg:
            ppg = request.env['website'].get_current_website().shop_ppg or 20
        ppr = request.env['website'].get_current_website().shop_ppr or 4
        product_ids = request.env['product.template'].search(
            ['&', ('sale_ok', '=', True), ('active', '=', True)])
        if product_ids and product_ids.ids:
            request.cr.execute(
                'select min(list_price),max(list_price) from product_template where id in %s', (tuple(product_ids.ids),))
            min_max_vals = request.cr.fetchall()
            min_val = min_max_vals[0][0] or 0
            if int(min_val) == 0:
                min_val = 1
            max_val = min_max_vals[0][1] or 1
            if post.get('min_val') and post.get('max_val'):
                custom_min_val = float(post.get('min_val'))
                custom_max_val = float(post.get('max_val'))
                post.update(
                    {'attrib_price': '%s-%s' % (custom_min_val, custom_max_val)})
            else:
                post.update({'attrib_price': '%s-%s' % (min_val, max_val)})

        attrib_list = request.httprequest.args.getlist('attrib')
        attrib_values = [[int(x) for x in v.split("-")]
                         for v in attrib_list if v]
        attributes_ids = {v[0] for v in attrib_values}
        attrib_set = {v[1] for v in attrib_values}

        domain = self._get_search_domain(search, category, attrib_values)

        if post.get('min_val') and post.get('max_val'):
            domain += [('list_price', '>=', float(post.get('min_val'))),
                       ('list_price', '<=', float(post.get('max_val')))]

        brand_ids = []
        brand = post.get('brand')

        brand_list = request.httprequest.args.getlist('brand')
        if brand:
            # brand_list = request.httprequest.args.getlist('brand')
            brand_values = [[str(x) for x in v.rsplit("-", 1)]
                            for v in brand_list if v]
            brand_ids = list(set([int(v[1]) for v in brand_values]))
            if len(brand_ids) > 0:
                domain += [('product_brand_id', 'in', brand_ids)]

        keep = QueryURL('/shop', category=category and int(category),
                        search=search, attrib=attrib_list, order=post.get('order')
                        ,brand=post.get('brand'),min_val=post.get('min_val'),max_val=post.get('max_val'))

        pricelist_context, pricelist = self._get_pricelist_context()

        request.context = dict(
            request.context, pricelist=pricelist.id, partner=request.env.user.partner_id)

        url = "/shop"
        if search:
            post["search"] = search
        if attrib_list:
            post['attrib'] = attrib_list

        Product = request.env['product.template'].with_context(bin_size=True)

        order = http.request.website.sale_get_order()
        if order and order.state != 'draft':
            http.request.session['sale_order_id'] = None
            order = http.request.website.sale_get_order()

        search_product = Product.search(domain)
        website_domain = request.website.website_domain()
        categs_domain = [('parent_id', '=', False)] + website_domain
        if search:
            search_categories = Category.search(
                [('product_tmpl_ids', 'in', search_product.ids)] + website_domain).parents_and_self
            categs_domain.append(('id', 'in', search_categories.ids))
        else:
            search_categories = Category
        categs = Category.search(categs_domain)

        if category:
            url = "/shop/category/%s" % slug(category)

        product_count = len(search_product)
        pager = request.website.pager(
            url=url, total=product_count, page=page, step=ppg, scope=7, url_args=post)
        products = Product.search(
            domain, limit=ppg, offset=pager['offset'], order=self._get_search_order(post))

        ProductAttribute = request.env['product.attribute']
        if products:
            # get all products without limit
            attributes = ProductAttribute.search(
                [('product_tmpl_ids', 'in', search_product.ids)])
            brands = request.env['as.product.brand'].sudo().search(
                [('active', '=', True), ('website_id', 'in', (False, request.website.id)), ('brand_product_ids', 'in', search_product.ids)])
        else:
            attributes = ProductAttribute.browse(attributes_ids)
            brands = request.env['as.product.brand'].sudo().search(
                [('active', '=', True), ('website_id', 'in', (False, request.website.id))])

        layout_mode = request.session.get('website_sale_shop_layout_mode')
        if not layout_mode:
            if request.website.viewref('website_sale.products_list_view').active:
                layout_mode = 'list'
            else:
                layout_mode = 'grid'
        values = {
            'search': search,
            'category': category,
            'attrib_values': attrib_values,
            'attrib_set': attrib_set,
            'product_order':post.get('order'),
            'pager': pager,
            'pricelist': pricelist,
            'add_qty': add_qty,
            'products': products,
            'search_count': product_count,  # common for all searchbox
            'bins': TableCompute().process(products, ppg, ppr),
            'ppg': ppg,
            'ppr': ppr,
            'brands': brands,
            'brand_set': brand_ids,
            'categories': categs,
            'attributes': attributes,
            'keep': keep,
            'search_categories_ids': search_categories.ids,
            'layout_mode': layout_mode,
            'min_val': min_val,
            'max_val': max_val,
            'custom_min_val': custom_min_val,
            'custom_max_val': custom_max_val,
            'floor': math.floor,
            'ceil': math.ceil,
            'website_sale_order': order,
        }
        if category:
            values['main_object'] = category
        return request.render("website_sale.products", values)

    @http.route('/json/shop/product/', type='json', auth="public", website=True, sitemap=False)
    def get_next_product(self,page,ppg,category_id=None,search=None,**post):

        if(post.get("previous") != None):
            page = int(page) - 1
        else:
            page = int(page) + 1
        Category = request.env['product.public.category']
        if category_id:
            category = Category.search([('id', '=', int(category_id))], limit=1)
            if not category or not category.can_access_from_current_website():
                return False
        else:
            category = Category
        order = http.request.website.sale_get_order()
        if order and order.state != 'draft':
            http.request.session['sale_order_id'] = None
            order = http.request.website.sale_get_order()
        ppr = request.env['website'].get_current_website().shop_ppr or 4

        attrib_list = request.httprequest.args.getlist('attrib')
        attrib_values= post.get("attrval")
        attrib_values = json.loads(attrib_values)

        realpost = {}
        if(len(attrib_values) != 0):
            str_attr_val = [str(i) for i in attrib_values[0]]
            str_attr_val = "-".join(str_attr_val)
            realpost['attrib'] = str_attr_val

        domain = self._get_search_domain(search, category, attrib_values)
        if post.get('min_val') != '0' and post.get('max_val') != '0':
            domain += [('list_price', '>=', float(post.get('min_val'))),
                       ('list_price', '<=', float(post.get('max_val')))]
            realpost['min_val'] = int(json.loads(post.get('min_val')))
            realpost['max_val'] = int(json.loads(post.get('max_val')))

        if post.get('brand_ids'):
            brand_ids = json.loads(post.get('brand_ids'))
            if(len(brand_ids) > 0):
                domain += [('product_brand_id', 'in', brand_ids)]
                # post['brand_ids'] = brand_ids
                get_brand_url = request.env['as.product.brand'].search([('id','=',brand_ids[0])])
                brandurl = get_brand_url.name + "-" + str(get_brand_url.id)
                realpost['brand'] = brandurl

        Product = request.env['product.template']
        search_product = Product.search(domain,order=super()._get_search_order(post))
        url = "/shop"
        if search:
            post["search"] = search
            realpost['search'] = search
        if attrib_list:
            post['attrib'] = attrib_list
        if category:
            url = "/shop/category/%s" % slug(category)
        if post.get('order'):
            realpost['order'] = post.get('order')
        product_count = len(search_product)
        ppg = int(ppg)
        pager = request.website.pager(url=url, total=product_count, page=page, step=ppg, scope=7, url_args=realpost)

        offset = pager['offset']
        products = search_product[offset: offset + ppg]
        keep = QueryURL('/shop', category=category and int(category), search=None, attrib=attrib_list,
                        order=post.get('order'),brand=post.get('brand'),
                        min_val=post.get('min_val'),max_val=post.get('max_val'))
        bins = TableCompute().process(products, ppg, ppr)
        temp_of_prod = request.env.ref("atharva_theme_base.ajax_product")._render({"bins":bins,
                        "pager": pager,"keep":keep,'website_sale_order': order})
        pager_template = request.env['ir.ui.view']._render_template('portal.pager', {'pager':pager})
        data = {"product":temp_of_prod,"max_page":pager["page_count"],
                "pagerheader": page,"pager_template":pager_template}
        return data

    @http.route(['/shop/brand/<model("as.product.brand"):brand>'], type='http', auth="public", website=True)
    def product_brand(self, brand=None, **post):
        """ get data for product brands """
        if brand:
            brand = request.env['as.product.brand'].search([('id', '=', int(brand)), ('active', '=', True)], limit=1)
            data = {'brand': brand,'products': brand.brand_product_ids}
            return request.render("atharva_theme_base.as_product_brands", data)
        return False

    @http.route()
    def cart(self, access_token=None, revive='', **post):
        res = super(WebsiteSale, self).cart(access_token=access_token, revive=revive, **post)
        if post.get('type') == 'cart_lines_popup':
            return request.render('theme_alan.cart_lines_popup_content', res.qcontext)
        else:
            return res

    @http.route(['/service/<model("res.service"):service>'], type='http', auth="public", website=True)
    def service_url_page(self, service, **kwargs):
        return request.render('atharva_theme_base.service_page', {'service': service})
