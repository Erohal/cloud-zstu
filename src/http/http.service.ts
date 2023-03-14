import { Injectable, Scope } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

@Injectable({
  scope: Scope.REQUEST
})
export class HttpService {
  private client: AxiosInstance

  constructor() {
    this.client = wrapper(axios.create({ jar: new CookieJar() }))
  }

  fetch(config: AxiosRequestConfig<any>) {
    return this.client(config)
  }

  useCookieJar(jar: CookieJar | string) {
    if (typeof jar == 'string') {
      jar = CookieJar.fromJSON(jar)
    } else {
      jar = CookieJar.fromJSON(JSON.stringify(jar))
    }
    this.client = wrapper(axios.create({ jar }))
  }

  getCookieJar() {
    return this.client.defaults.jar
  }
}
