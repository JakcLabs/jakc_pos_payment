# -*- coding: utf-8 -*-
#################################################################################
#
#    Copyright (c) 2016-Present Jakc Labs. (<http://www.jakc-labs.com/>)
#
#################################################################################
{
    'name': 'POS:  Payment',
    'summary': 'Extend Payment Features',
    'version': '1.0',
    'category': 'Point Of Sale',
    "sequence": 1,
    'description': """
Point Of Sale - Payment
=====================================

Features:
----------------
    * Add ability to using Other Payment Method in POS.
    * For Odoo 9

""",
    "author": "Wahyu Hidayat - Jakc Labs.",
    'website': 'http://www.jakc-labs.com',
    'depends': [
        'point_of_sale',
        ],
    'data': [
        'views/jakc_pos_payment_view.xml',
        'views/templates.xml',
    ],
    'qweb': [
        'static/src/xml/pos_payment.xml',
    ],    
    "installable": True,
    "application": True,
    "auto_install": False,        
}