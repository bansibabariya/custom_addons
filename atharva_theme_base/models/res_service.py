
from odoo import models, fields, api
from odoo.tools.translate import html_translate
from odoo.addons.http_routing.models.ir_http import slug



class ResService(models.Model):
    _name = "res.service"
    _inherit = ['website.published.multi.mixin']
    _description = "Service"

    name = fields.Char(string="Name", required=True)
    description = fields.Html(string="Description", required=True,translate=html_translate)
    is_published = fields.Boolean('Is Published', copy=False, index=True)
    can_publish = fields.Boolean('Can Publish', compute='_compute_can_publish')
    website_url = fields.Char('Website URL', compute='_compute_website_url')

    def _compute_can_publish(self):
        for record in self:
            record.can_publish = True

    @api.depends_context('lang')
    def _compute_website_url(self):
        for record in self:
            if record:
                record.website_url = "/service/%s" % slug(record)

    def open_website_url(self):
        return {
            'type': 'ir.actions.act_url',
            'url': self.website_url,
            'target': 'self',
        }