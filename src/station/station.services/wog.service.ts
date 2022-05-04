import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { WogStation } from '../station.types';
import { TelegramService } from '../../telegram/telegram.service';

@Injectable()
export class WogService {
  constructor(private readonly telegramService: TelegramService) {}

  static parseDescription(description: string) {
    return description
      .split('\n')
      .filter(Boolean)
      .slice(1)
      .filter((fuel) => fuel.includes('95') || fuel.includes('М100'))
      .join('\n');
  }

  private readonly WOG_API_URL = 'https://api.wog.ua/fuel_stations/';

  async run({ senderId, startTime }) {
    const wog = await this.searchStations();
    const latency = ((new Date().getTime() - startTime) / 1000).toFixed(2);

    const message = [
      `WOG: Найдено станций: ${wog.count}\n`,
      wog.stations,
      `\nДанные загружены за ${latency}с.`,
    ].join('\n');

    this.telegramService.sendMessage(senderId, message);
  }

  async searchStations() {
    const response = await axios.get(this.WOG_API_URL);
    const stations: WogStation[] = response.data.data.stations || [];

    const kyivStations = stations.filter((station) => station.city === 'Київ');

    const stationsWithDetails = await Promise.all(
      kyivStations.map((station) => this.getStationDetails(station.id)),
    );

    const stationsShortInfo = stationsWithDetails.map((station) => ({
      name: station.name,
      fuel: WogService.parseDescription(station.workDescription),
    }));

    const stationsWithFuel = stationsShortInfo.filter((station) =>
      station.fuel.includes('Готівка, банк.картки'),
    );

    return {
      count: stationsWithFuel.length,
      stations: stationsWithFuel
        .map((station) => `*WOG: ${station.name}*\n${station.fuel}`)
        .join('\n\n'),
    };
  }

  private async getStationDetails(stationId: number) {
    const details = await axios.get(`${this.WOG_API_URL}${stationId}`);

    return details.data.data;
  }
}
