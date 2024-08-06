import { Controller, Post, Body, Req, Res, Headers, Param, Put, Delete } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { Request, Response } from 'express';
import Stripe from 'stripe';

@Controller('stripe')
export class StripeController {
    constructor(private readonly stripeService: StripeService) { }

    @Post('create-customer')
    async createCustomer(@Body('email') email: string) {
        return this.stripeService.createCustomer(email);
    }

    @Post('create-payment-intent')
    async createPaymentIntent(@Body('amount') amount: number, @Body('currency') currency: string) {
        const paymentIntent = await this.stripeService.createPaymentIntent(amount, currency);
        return { clientSecret: paymentIntent.client_secret };
    }

    @Post('create-subscription')
    async createSubscription(@Body('customerId') customerId: string, @Body('priceId') priceId: string) {
        return this.stripeService.createSubscription(customerId, priceId);
    }

    @Post('add-card')
    async addCard(@Body('customerId') customerId: string, @Body('paymentMethodId') paymentMethodId: string) {
        return this.stripeService.addCard(customerId, paymentMethodId);
    }

    @Put('update-card/:customerId/:paymentMethodId')
    async updateCard(@Param('customerId') customerId: string, @Param('paymentMethodId') paymentMethodId: string, @Body() cardDetails: Partial<Stripe.PaymentMethod.Card>) {
        return this.stripeService.updateCard(customerId, paymentMethodId, cardDetails);
    }

    @Delete('delete-card/:customerId/:paymentMethodId')
    async deleteCard(@Param('customerId') customerId: string, @Param('paymentMethodId') paymentMethodId: string) {
        return this.stripeService.deleteCard(customerId, paymentMethodId);
    }

    @Post('webhook')
    async handleWebhook(@Req() req: Request, @Res() res: Response, @Headers('stripe-signature') signature: string) {
        const endpointSecret = "***********"
        let event;

        try {
            event = this.stripeService.constructEvent(req.body, signature, endpointSecret);
        } catch (err) {
            console.log(`⚠️  Webhook signature verification failed.`);
            return res.sendStatus(400);
        }

        await this.stripeService.handleWebhook(event);
        res.sendStatus(200);
    }
}
