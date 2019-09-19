import Sdk from "elios-sdk";
import * as cheerio from 'cheerio';
import axios from 'axios';
import { setInterval } from "timers";

var html = require('./index.html');
var credentials = require('../resources/credentials.json');

const $ = cheerio.load(html);

export default class Finance {

  sdk: Sdk;
  widget: any;
  followed: any;

  constructor() {
    this.sdk = new Sdk();
    this.followed = ['TSLA', 'ALEUP.PA', 'BTC-USD', 'MSFT'];
  }

  showSummary(res: any) {
    for (let index = 0; index < res.length; index++) {
      const element = res[index];
      let newLine = $('table').append('<tr></tr>');

      if (element.data.price.longName == null)
        $(newLine).append('<td>' + element.data.price.shortName + '</td>')
      else
        $(newLine).append('<td>' + element.data.price.longName + '</td>')

        $(newLine).append('<td>' + element.data.price.regularMarketPrice.fmt + '</td>')

        if (element.data.price.regularMarketChange.fmt > 0) {
          $(newLine).append('<td class="green">' + element.data.price.regularMarketChange.fmt + '</td>')
          $(newLine).append('<td class="green">' + element.data.price.regularMarketChangePercent.fmt + '</td>')  
        } else if (element.data.price.regularMarketChange.fmt < 0) {
          $(newLine).append('<td class="red">' + element.data.price.regularMarketChange.fmt + '</td>')
          $(newLine).append('<td class="red">' + element.data.price.regularMarketChangePercent.fmt + '</td>')  
        }
 
    }
    // if (res.price.regularMarketChange.raw > 0) {
    //   $('.price').attr('style', 'color:lightgreen;')
    // }
    // $('.price').append('' + res.price.regularMarketPrice.fmt);
    // $('.symbol').append(res.price.longName);
    // $('.change').append('' + res.price.regularMarketChange.fmt + ' ' + res.price.regularMarketChangePercent.fmt)
    this.widget.html($('body').html());
  }

  async getStockSummary() {
    let url = "https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-summary";
    let requests = [];

    for (let index = 0; index < this.followed.length; index++) {
      const element = this.followed[index];
      requests.push(axios.get(url, {
        params: {
          'symbol': element
        },
        headers: {
          'x-rapidapi-host': credentials.RapidAPI.host,
          'x-rapidapi-key': credentials.RapidAPI.api_key
        }
      }))
    }
    await axios.all(requests).then((res) => {
        this.showSummary(res)
    });
    // axios.get(url, {
    //   params: {
    //     'symbol': 'TSLA'
    //   },
    //   headers: {
    //     'x-rapidapi-host': credentials.RapidAPI.host,
    //     'x-rapidapi-key': credentials.RapidAPI.api_key
    //   }
    // }).then((res) => {
    //   console.log(res)
    //   this.showSummary(res.data);
    // })
  }

  stayOpen() {
    while (true) {

    }
  }

  async start() {
    this.widget = this.sdk.createWidget();

    await this.getStockSummary();

    setInterval(async () => {
      await this.getStockSummary();
    }, 3000);

    this.stayOpen();
  }
}

new Finance().start();


