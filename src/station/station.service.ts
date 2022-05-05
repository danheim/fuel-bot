import { Injectable } from '@nestjs/common';
// import { Interval } from '@nestjs/schedule';
import axios from 'axios';

@Injectable()
export class StationService {
  // @Interval(5000)
  searchPrices() {
    console.log('this search prices');
    axios.get('https://store.wog.ua/ua').then((response) => {
      console.log(response);
    });
  }
}
