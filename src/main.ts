import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { MessageInterceptor } from './common/interceptors/message.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter())
  app.useGlobalInterceptors(new MessageInterceptor())
  await app.listen(3000);
}
bootstrap();
