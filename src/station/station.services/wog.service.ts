import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import { WogStation } from '../station.types';
import { TelegramService } from '../../telegram/telegram.service';
import type { Cache } from 'cache-manager';

@Injectable()
export class WogService {
  constructor(
    private readonly telegramService: TelegramService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  static parseDescription(description: string) {
    return description
      .split('\n')
      .filter(Boolean)
      .slice(1)
      .filter(
        (fuel) =>
          fuel.includes('95') || fuel.includes('М100') || fuel.includes('98'),
      )
      .join('\n');
  }

  private readonly WOG_API_URL = 'https://api.wog.ua/fuel_stations/';

  async run({ senderId, startTime, useCache = true }) {
    const wog = await this.searchStations(useCache);
    const latency = ((new Date().getTime() - startTime) / 1000).toFixed(2);

    if (wog.count === 0) {
      return this.telegramService.sendMessage(
        senderId,
        'WOG: Не найдены заправки с топливом',
      );
    }

    const message = [
      `WOG: Найдено станций: ${wog.count}`,
      wog.stations,
      `Данные загружены за ${latency}с.`,
    ]
      .filter(Boolean)
      .join('\n\n');

    await this.telegramService.sendMessage(senderId, message);
  }

  async searchStations(useCache) {
    if (useCache) {
      const cache = await this.cacheManager.get<string>('wog');

      if (cache) {
        return JSON.parse(cache);
      }
    }

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

    const stationsWithFuel = stationsShortInfo.filter((station) => {
      const lower = station.fuel.toLowerCase();

      return (
        lower.includes('готівка, банк.картки') ||
        lower.includes('прайд') ||
        lower.includes('талон')
      );
    });

    const wogData = {
      count: stationsWithFuel.length,
      stations: stationsWithFuel
        .map((station) => `*WOG: ${station.name}*\n${station.fuel}`)
        .join('\n\n'),
    };

    await this.cacheManager.set('wog', JSON.stringify(wogData), { ttl: 120 });

    return wogData;
  }

  private async getStationDetails(stationId: number) {
    const details = await axios.get(`${this.WOG_API_URL}${stationId}`);

    return details.data.data;
  }
}
