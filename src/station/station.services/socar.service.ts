import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { SocarStation } from '../station.types';
import { TelegramService } from '../../telegram/telegram.service';

@Injectable()
export class SocarService {
  constructor(private readonly telegramService: TelegramService) {}

  private readonly SOCAR_API_URL =
    'https://socar.ua/api/map/stations?region=207&services=';

  async run(senderId: number) {
    const socar = await this.searchStations();

    const message = `SOCAR: Найдено станций: ${socar.count}\n\n${socar.stations}`;
    this.telegramService.sendMessage(senderId, message);
  }

  async searchStations() {
    const response = await axios.get(this.SOCAR_API_URL);
    const unstructuredStations = response.data.data || [];

    const stations: SocarStation[] = unstructuredStations.map((station) => ({
      id: station.id,
      ...station.attributes,
    }));

    const stationsWithFuel = stations.filter(
      (station) => station.fuelPrices.length > 0,
    );

    const stationsInfo = stationsWithFuel.map(
      (station) =>
        `*SOCAR: ${station.address}*\n${station.fuelPrices.join('\n')}`,
    );

    return {
      count: stationsInfo.length,
      stations: stationsInfo.join('\n\n'),
    };
  }
}
