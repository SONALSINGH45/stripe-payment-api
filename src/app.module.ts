import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { stripeModule } from './stripe/stripe.module';

@Module({
  imports: [stripeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
