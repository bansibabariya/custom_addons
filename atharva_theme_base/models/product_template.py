# -*- coding: utf-8 -*-

from odoo import fields, models

class ProductTemplate(models.Model):
    _inherit = "product.template"

    pro_label_line_ids = fields.One2many('as.product_label.line', 'product_tmpl_id', string='Product Labels', help="Set the product labels")
    product_brand_id = fields.Many2one('as.product.brand',string='Brand',help='Select a brand for this product')
    pro_tab_ids = fields.One2many('as.product_tab', 'product_id',string='Product Tabs', help="Set the product tabs")
    category_name = fields.Char("Category Name", translate=True)


class ProductTemplate(models.Model):
    _inherit = "product.template"



class EventInherit(models.Model):
    _inherit = 'event.event'

    state_ids = fields.Many2many('res.country.state', string='Cities')
    event_date_ids = fields.One2many(comodel_name="event.date", inverse_name="event_id", string="Event Date", required=False, )



class EventDate(models.Model):
    _name = 'event.date'

    date = fields.Date(string="Date")
    event_id = fields.Many2one(comodel_name="event.event", string="Event", required=False, )