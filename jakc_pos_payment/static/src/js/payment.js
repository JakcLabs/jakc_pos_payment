odoo.define('pos_payment.pos_payment', function (require) {
"use strict";

var Class   = require('web.Class');
var Model   = require('web.Model');
var session = require('web.session');
var core    = require('web.core');
var screens = require('point_of_sale.screens');
var gui     = require('point_of_sale.gui');
var pos_model = require('point_of_sale.models');
var utils = require('web.utils');

var QWeb = core.qweb;
var _t   = core._t;


var BarcodeParser = require('barcodes.BarcodeParser');
var PopupWidget = require('point_of_sale.popups');
var ScreenWidget = screens.ScreenWidget;
var PaymentScreenWidget = screens.PaymentScreenWidget;
var round_pr = utils.round_precision;

//Load Field payment_type
pos_model.load_fields("account.journal", "payment_type");

var _paylineproto = pos_model.Paymentline.prototype;
pos_model.Paymentline = pos_model.Paymentline.extend({
    init_from_JSON: function (json) {
        _paylineproto.init_from_JSON.apply(this, arguments);

        this.paid = json.paid;
        this.paymenttype = json.paymenettype;
        this.cardnumber = json.cardnumber;
        this.cardowner = json.cardowner;
        this.debitnumber = json.debitnumber;
        this.couponumber = json.couponnumber;
        this.depositnumber = json.depositnumber;
       
    },
    export_as_JSON: function () {
        return _.extend(_paylineproto.export_as_JSON.apply(this, arguments), {paid: this.paid,
                                                                              cardnumber: this.cardnumber,
                                                                              cardowner: this.cardowner,
                                                                              debitnumber: this.debitnumber,
                                                                              couponnumber: this.couponnumber,
                                                                              depositnumber: this.depositnumber,});
                                                                              
    },
   
});

//Popup to show all transaction state for the payment.
var PaymentCreditPopupWidget = PopupWidget.extend({
    template: 'PaymentCreditPopupWidget',
    show: function (options) {
        var self = this;
        this._super(options);
    }
});

gui.define_popup({name:'payment-credit', widget: PaymentCreditPopupWidget});

var PaymentDebitPopupWidget = PopupWidget.extend({
    template: 'PaymentDebitPopupWidget',
    show: function (options) {
        var self = this;
        this._super(options);
    }
});

gui.define_popup({name:'payment-debit', widget: PaymentDebitPopupWidget});

var PaymentCouponopupWidget = PopupWidget.extend({
    template: 'PaymentCouponPopupWidget',
    show: function (options) {
        var self = this;
        this._super(options);
    }
});

gui.define_popup({name:'payment-coupon', widget: PaymentCouponPopupWidget});


var PaymentDepositPopupWidget = PopupWidget.extend({
    template: 'PaymentDepositPopupWidget',
    show: function (options) {
        var self = this;
        this._super(options);
    }
});

gui.define_popup({name:'payment-deposit', widget: PaymentDepositPopupWidget});


PaymentScreenWidget.include({
        	   
            click_credit_paymentline: function(cid){
                var self = this;
                var order = this.pos.get_order();
            	var lines = order.get_paymentlines();
                for ( var i = 0; i < lines.length; i++ ) {
                    if (lines[i].cid === cid) {
        				self.gui.show_popup('payment-credit',{
        				    'title': _t('Credit Number'),
        		            'value': order.selected_paymentline.cardnumber,
        		            'confirm': function(value) {
        		            	order.selected_paymentline.cardnumber = value;
        		                self.order_changes();
        		                self.render_paymentlines();
        		            }
        				});
                    }
                }	        
            },
            
            
            click_debit_paymentline: function(cid){
                var self = this;
                var order = this.pos.get_order();
            	var lines = order.get_paymentlines();
                for ( var i = 0; i < lines.length; i++ ) {
                    if (lines[i].cid === cid) {
        				self.gui.show_popup('payment-debit',{
        				    'title': _t('Debit Number'),
        		            'value': order.selected_paymentline.debitnumber,
        		            'confirm': function(value) {
        		            	order.selected_paymentline.debitnumber = value;
        		                self.order_changes();
        		                self.render_paymentlines();
        		            }
        				});
                    }
                }	        
            },
            
            click_coupon_paymentline: function(cid){
                var self = this;
                var order = this.pos.get_order();
            	var lines = order.get_paymentlines();
                for ( var i = 0; i < lines.length; i++ ) {
                    if (lines[i].cid === cid) {
        				self.gui.show_popup('payment-coupon',{
        				    'title': _t('Coupon Number'),
        		            'value': order.selected_paymentline.couponnumber,
        		            'confirm': function(value) {
        		            	order.selected_paymentline.couponnumber = value;
        		                self.order_changes();
        		                self.render_paymentlines();
        		            }
        				});
                    }
                }	        
            },

            click_deposit_paymentline: function(cid){
                var self = this;
                var order = this.pos.get_order();
            	var lines = order.get_paymentlines();
                for ( var i = 0; i < lines.length; i++ ) {
                    if (lines[i].cid === cid) {
        				self.gui.show_popup('payment-deposit',{
        				    'title': _t('Deposit Number'),
        		            'value': order.selected_paymentline.depositnumber,
        		            'confirm': function(value) {
        		            	order.selected_paymentline.depositnumber = value;
        		                self.order_changes();
        		                self.render_paymentlines();
        		            }
        				});
                    }
                }	        
            },
            
            render_paymentlines: function() {
            	var self  = this;
                var order = this.pos.get_order();
                if (!order) {
                    return;
                }

                var lines = order.get_paymentlines();
                var due   = order.get_due();
                var extradue = 0;
                if (due && lines.length  && due !== order.get_due(lines[lines.length-1])) {
                    extradue = due;
                }

                this.$('.paymentlines-container').empty();
                var lines = $(QWeb.render('PaymentScreen-Paymentlines', { 
                    widget: this, 
                    order: order,
                    paymentlines: lines,
                    extradue: extradue,
                }));

                lines.on('click','.delete-button',function(){
                    self.click_delete_paymentline($(this).data('cid'));
                });

                lines.on('click','.credit-button',function(){
                	console.log('Click Credit Button');
                    self.click_credit_paymentline($(this).data('cid'));
                });
                
                lines.on('click','.debit-button',function(){
                	console.log('Click Debit Button'); 
                	self.click_debit_paymentline($(this).data('cid'));
                });
                
                lines.on('click','.coupon-button',function(){
                	console.log('Click Coupon Button');
                	self.click_coupon_paymentline($(this).data('cid'));
                });
                
                lines.on('click','.deposit-button',function(){
                	console.log('Click Deposit Button');
                	self.click_deposit_paymentline($(this).data('cid'));
                });
                
                lines.on('click','.paymentline',function(){
                    self.click_paymentline($(this).data('cid'));
                });
                    
                lines.appendTo(this.$('.paymentlines-container'));
            	
                
            },    
});


})