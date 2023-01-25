import * as DeviceDetector from 'device-detector-js';
import { ClientInfo } from './types';

const UNKNOWN = 'unknown';

export class DeviceDetectorService {
  deviceDetector: DeviceDetector;

  constructor() {
    this.deviceDetector = new DeviceDetector();
  }

  parse(userAgent: string | undefined): ClientInfo {
    const clientInfo = {
      clientName: UNKNOWN,
      osName: UNKNOWN,
      deviceType: UNKNOWN,
      deviceBrand: UNKNOWN,
      deviceModel: UNKNOWN,
    };

    if (!userAgent) {
      return clientInfo;
    }

    const result = this.deviceDetector.parse(userAgent);

    if (result.client && result.client.name) {
      clientInfo.clientName = result.client.name;
    }

    if (result.os && result.os.name) {
      clientInfo.osName = result.os.name;
    }

    if (result.device) {
      if (result.device.type) {
        clientInfo.deviceType = result.device.type;
      }
      if (result.device.brand) {
        clientInfo.deviceBrand = result.device.brand;
      }
      if (result.device.model) {
        clientInfo.deviceModel = result.device.model;
      }
    }

    return clientInfo;
  }
}
