import { Injectable } from '@nestjs/common';

@Injectable()
export class OkkoService {
  private readonly OKKO_API_URL: string =
    'https://www.okko.ua/api/uk/type/gas_stations?filter[gas_stations,fuel_type]=252,251&';

  async run() {
    // ПИДОРАСЫ РАЗРЕШАЮТ ЗАПРОСЫ ТОЛЬКО С БРАУЗЕРА
    await this.searchStations();
  }

  async searchStations() {
    return {
      count: 0,
      stations: '',
    };
  }
}
