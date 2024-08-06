import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
    private readonly stripe;

    constructor() {
        this.stripe = new Stripe(`********`, {
            apiVersion: '2024-06-20',
        });
    }

    async createCustomer(email: string): Promise<Stripe.Customer> {
        return this.stripe.customers.create({ email });
    }

    async createPaymentIntent(amount: number, currency: string): Promise<Stripe.PaymentIntent> {
        return this.stripe.paymentIntents.create({ amount, currency });
    }

    async createSubscription(customerId: string, priceId: string): Promise<Stripe.Subscription> {
        return this.stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
        });
    }

    async addCard(customerId: string, paymentMethodId: string): Promise<Stripe.PaymentMethod> {
        await this.stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
        await this.stripe.customers.update(customerId, {
            invoice_settings: { default_payment_method: paymentMethodId },
        });
        return this.stripe.paymentMethods.retrieve(paymentMethodId);
    }

    async updateCard(customerId: string, paymentMethodId: string, cardDetails: Partial<Stripe.PaymentMethod.Card>): Promise<Stripe.PaymentMethod> {
        return this.stripe.paymentMethods.update(paymentMethodId, {
            card: cardDetails,
        });
    }

    async deleteCard(customerId: string, paymentMethodId: string): Promise<Stripe.PaymentMethod> {
        return this.stripe.paymentMethods.detach(paymentMethodId);
    }

    constructEvent(payload: Buffer, signature: string, endpointSecret: string): Stripe.Event {
        return this.stripe.webhooks.constructEvent(payload, signature, endpointSecret);
    }

    async handleWebhook(event: Stripe.Event): Promise<void> {
        switch (event.type) {
            case 'invoice.payment_succeeded':
                const invoice = event.data.object as Stripe.Invoice;
                console.log(`Invoice ${invoice.id} payment succeeded!`);
                break;
            case 'customer.subscription.created':
                const subscription = event.data.object as Stripe.Subscription;
                console.log(`Subscription ${subscription.id} created!`);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    }
}
