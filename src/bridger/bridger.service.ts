import { Injectable, Scope } from '@nestjs/common';
import * as CryptoJs from 'crypto-js'
import { HttpService } from 'src/http/http.service';
import * as QueryString from 'qs'
import { CookieJar } from 'tough-cookie';

@Injectable({
  scope: Scope.REQUEST
})
export class BridgerService {
  private username: string
  private password: string

  constructor(
    private readonly http: HttpService
  ) { }

  /**
   * 对password进行des加密
   * @param password 密码
   * @param crypto 初次访问页面得到的DES密钥
   * @returns 加密后的密码
   */
  private encryptoPassword(password: string, crypto: string) {
    return CryptoJs.DES.encrypt(password, CryptoJs.enc.Base64.parse(crypto), {
      mode: CryptoJs.mode.ECB,
      padding: CryptoJs.pad.Pkcs7,
    }).toString();
  }

  /**
   * 获取登陆时必要的execution和crypto值
   * @param source 网页源代码
   * @returns 解析后的execution和crypto值
   */
  private getEssentials(source: string) {
    const executionReg = /<p id="login-page-flowkey">(.*?)<\/p>/;
    const cryptoReg = /<p id="login-croypto">(.*?)<\/p>/;
    return {
      execution: executionReg.exec(source)?.at(1),
      crypto: cryptoReg.exec(source)?.at(1)
    }
  }

  /**
   * 测试是否成功登录
   * @returns boolean
   */
  private async isLogined() {
    const url = 'https://jwglxt.webvpn.zstu.edu.cn/sso/jasiglogin';
    return await this.http.fetch({ url }).then(value =>
      value.data.match('教学管理信息服务平台') != null
    );
  }

  async login() {
    if (this.username && this.password) {
      let url = 'https://sso.zstu.edu.cn/login';
      let res = await this.http.fetch({
        url,
        validateStatus: () => true,
      }).then((value) => value.data);

      let essentials = this.getEssentials(res);
      const payload = {
        username: this.username,
        type: 'UsernamePassword',
        _eventId: 'submit',
        geolocation: '',
        execution: essentials.execution,
        captcha_code: '',
        croypto: essentials.crypto,
        password: this.encryptoPassword(this.password, essentials.crypto!),
      };
      let status = await this.http.fetch({
        url,
        data: QueryString.stringify(payload),
        method: 'post',
        validateStatus: () => true,
      }).then(value => value.status);

      /** 这里可以预检查，防止造成后续无效操作 */
      if (status != 200) return false;

      url = 'https://jwglxt.webvpn.zstu.edu.cn/sso/jasiglogin';
      res = await this.http.fetch({ url }).then((value) => value.data);
      essentials = this.getEssentials(res);
      payload.execution = essentials.execution
      payload.croypto = essentials.crypto
      payload.password = this.encryptoPassword(this.password, essentials.crypto!)
      url = 'https://sso-443.webvpn.zstu.edu.cn/login';
      await this.http.fetch({
        url,
        data: QueryString.stringify(payload),
        method: 'post',
        validateStatus: () => true,
      });
    }
    return this.isLogined()
  }

  /**
   * 初次登录使用账号密码登录，登陆后保存CookieJar，使用fromCookieJar恢复
   * @param username 用户名
   * @param password 密码
   */
  fromUserPass(username: string, password: string) {
    this.username = username
    this.password = password
  }

  /**
   * 在CookieJar可用的情况下，使用CookieJar恢复对象对API的合法访问
   * @param jar CookieJar
   */
  fromCookieJar(jar: CookieJar | string) {
    /** 如果不进行此操作将会报错，目前不知道原因 */
    this.http.useCookieJar(jar)
  }

  /**
   * 返回CookieJar
   * @returns 返回的CookieJar
   */
  getCookieJar() { return this.http.getCookieJar() }

  async getClass() {
    const url = 'https://jwglxt.webvpn.zstu.edu.cn/jwglxt/xsxxxggl/xsgrxxwh_cxXsgrxx.html?gnmkdm=N100801&layout=default'
    const res = await this.http.fetch({ url }).then(value => value.data)
    const classReg = /<div class=\"col-sm-8\" id=\"col_bh_id\">.*?<p class=\"form-control-static\">(.*?)<\/p>.*?<\/div>/ms
    return classReg.exec(res)?.at(1)?.trimStart().trimEnd()
  }

  /**
   * 
   * @returns Object Id
   */
  private async getObjectId() {
    const url = 'https://service.zstu.edu.cn/getUser';
    const res = await this.http.fetch({
      url,
      validateStatus: () => true,
    }).then(value => value.data);

    return res['objectId'];
  }

  /**
   * 返回个人信息原始数据
   * @returns 个人数据
   */
  private async getPersonalInfoRaw() {
    const objectId = await this.getObjectId();
    const url =
      'https://service.zstu.edu.cn/linkid/api/aggregate/user/identityInfo/list/';
    const payload = [objectId];
    const res = await this.http.fetch({
      url,
      data: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'post',
      validateStatus: () => true,
    }).then(value => value.data);
    return res;
  }

  /**
   * 返回格式化后的个人数据
   * @returns 格式化后的个人数据
   */
  async getPersonalInfo() {
    const res = await this.getPersonalInfoRaw();
    if (res && res['code'] == 200) {
      return {
        name: res['data'][0]['identity']['XM'],
        gender: res['data'][0]['identity']['XB'] == 1 ? '男' : '女',
        academic: res['data'][0]['orgInfo'][0]['org'][2]['title'],
        class: await this.getClass(),
        year: parseInt(res['data'][0]['identity']['SZNJ']),
        type: res['data'][0]['identity']['SFLBMC'],
        phone: res['data'][0]['identity']['TEL'],
        idcard: res['data'][0]['identity']['IDCARD']
      };
    }
  }

  async getAllGrades() {
    const url =
      'https://jwglxt.webvpn.zstu.edu.cn/jwglxt/cjcx/cjcx_cxXsgrcj.html?doType=query&gnmkdm=N305005';
    const payload = {
      xnm: '',
      xqm: '',
      'queryModel.showCount': 5000,
    };
    const res = await this.http.fetch({
      url,
      data: QueryString.stringify(payload),
      method: 'post',
    }).then((value) => value.data.items);

    const grades: [
      {
        kcbh: number;
        kcmc: string;
        xn: number;
        xq: number;
        cj: string;
        jd: number;
        xf: number;
        rkls: string[];
        kclbmc: string;
        kcxzmc: string;
        xfjd: number;
        bfzcj: number;
      }?,
    ] = [];
    for (const item of res) {
      grades.push({
        kcbh: parseInt(item.kch),
        kcmc: item.kcmc,
        xn: parseInt(item.xnm),
        xq: parseInt(item.xqmmc),
        cj: item.cj,
        jd: parseFloat(item.jd),
        xf: parseFloat(item.xf),
        rkls: item.jsxm.split(';'),
        kclbmc: item.kclbmc,
        kcxzmc: item.kcxzmc,
        xfjd: parseFloat(item.xfjd),
        bfzcj: parseInt(item.bfzcj),
      });
    }
    return grades;
  }
}
