import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import { SocarStation } from '../station.types';
import { TelegramService } from '../../telegram/telegram.service';
import { Cache } from 'cache-manager';

@Injectable()
export class SocarService {
  constructor(
    private readonly telegramService: TelegramService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private readonly SOCAR_API_URL =
    'https://socar.ua/api/map/stations?region=207&services=';

  async run({ senderId, startTime, useCache = true }) {
    const socar = await this.searchStations(useCache);
    const latency = ((new Date().getTime() - startTime) / 1000).toFixed(2);

    const message = [
      `SOCAR: Найдено станций: ${socar.count}`,
      socar.stations,
      `Данные загружены за ${latency}с.`,
    ]
      .filter(Boolean)
      .join('\n\n');

    this.telegramService.sendMessage(senderId, message);
  }

  async searchStations(useCache = true) {
    if (useCache) {
      const cache = await this.cacheManager.get<string>('socar');

      if (cache) {
        return JSON.parse(cache);
      }
    }

    const response = await axios.get(this.SOCAR_API_URL);
    const unstructuredStations = response.data.data || [];

    const stations: SocarStation[] = unstructuredStations.map((station) => ({
      id: station.id,
      ...station.attributes,
    }));

    const stationsWithFuel = stations
      .filter((station) => station.fuelPrices.length > 0)
      .filter((station) =>
        station.fuelPrices.some(
          (fuel) => fuel.includes('95') || fuel.includes('100'),
        ),
      );

    const stationsInfo = stationsWithFuel.map(
      (station) =>
        `*SOCAR: ${station.address}*\n${station.fuelPrices.join('\n')}`,
    );

    const socarData = {
      count: stationsInfo.length,
      stations: stationsInfo.join('\n\n'),
    };

    await this.cacheManager.set('socar', JSON.stringify(socarData), {
      ttl: 120,
    });

    return {
      count: stationsInfo.length,
      stations: stationsInfo.join('\n\n'),
    };
  }
}
