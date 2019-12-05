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
  followed = ['TSLA', 'ALEUP.PA', 'BTC-USD', 'MSFT'];

  timeoutID: any;

  constructor() {
    this.sdk = new Sdk();
    this.sdk.config().subscribe((conf: any) => {
      this.configChange(conf)
    })
  }

  configChange(conf: any) {
    if (conf.followed) {
      this.followed = [conf.followed]
    }

    if (this.timeoutID !== undefined) {
      clearTimeout(this.timeoutID)
    }

    this.getStockSummary()
  }

  showSummary(res: any) {

    $('tbody').children().remove();
    for (let index = 0; index < res.length; index++) {
      const element = res[index];
      $('tbody').append('<tr id="' + index + '"></tr>');
      let newLine = $('#' + index)

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

    $('table').removeClass('hidden');
    $('.lds-ring').addClass('hidden');
    this.widget.html($('body').html());
    this.update();
  }

  getStockSummary() {
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
    
    axios.all(requests).then((res: any) => {
        this.showSummary(res)
    }).catch((err: any) => {
      console.log(err);
    });
  }

  update() {
    this.timeoutID = setTimeout(() => {
      this.getStockSummary();
    }, 300000);
  }

  async start() {
    this.widget = this.sdk.createWidget();
    this.widget.html($('body').html())

    this.getStockSummary();
  }
}

new Finance().start();


