/**
 * GPIO Service
 * Handles Raspberry Pi GPIO operations and hardware control
 */

import logger from '@/utils/logger.js';
import { config } from '@/config/env.js';

// Try to import GPIO library, but continue if not available (for non-RPi development)
let GPIO: any = null;
let gpioAvailable = false;

try {
  // For Raspberry Pi
  if (config.ENABLE_GPIO) {
    // Using 'onoff' package for Node.js GPIO
    // npm install onoff
    logger.warn('⚠️  GPIO service initialized but not imported (requires: npm install onoff)');
    // In production: import { Gpio } from 'onoff';
    // GPIO = { Gpio };
    gpioAvailable = false;
  }
} catch (error) {
  logger.warn('⚠️  GPIO library not available - running in server-only mode');
  gpioAvailable = false;
}

interface GPIOPin {
  pin: number;
  direction: 'in' | 'out';
}

interface GPIOPins {
  relayA: GPIOPin;
  relayB: GPIOPin;
  buttonA: GPIOPin;
  buttonB: GPIOPin;
  ledA: GPIOPin;
  ledB: GPIOPin;
}

class GPIOService {
  private pins: Partial<GPIOPins> = {};
  private isInitialized = false;

  /**
   * Initialize GPIO pins
   */
  async init(): Promise<void> {
    if (!config.ENABLE_GPIO) {
      logger.info('ℹ️  GPIO is disabled');
      return;
    }

    if (!gpioAvailable) {
      logger.warn('⚠️  GPIO not available - simulating GPIO operations');
      return;
    }

    try {
      logger.info('🔌 Initializing GPIO pins...');

      // Would setup actual GPIO here
      // For now, we simulate it

      this.isInitialized = true;
      logger.info('✅ GPIO initialized successfully');
    } catch (error) {
      logger.error(`❌ GPIO initialization failed:`, error);
      this.isInitialized = false;
    }
  }

  /**
   * Trigger relay
   */
  async triggerRelay(relay: 'A' | 'B', duration: number = 500): Promise<void> {
    try {
      const pin = relay === 'A' ? config.RELAIS_A_PIN : config.RELAIS_B_PIN;

      if (!gpioAvailable) {
        logger.info(`🔄 [SIM] Triggering relay ${relay} on pin ${pin} for ${duration}ms`);
        return;
      }

      logger.info(`⚡ Triggering relay ${relay} on pin ${pin}`);

      // Would toggle GPIO pin here
      // gpio.writeSync(pin, 1); // HIGH
      // setTimeout(() => gpio.writeSync(pin, 0), duration); // LOW

      logger.info(`✅ Relay ${relay} triggered`);
    } catch (error) {
      logger.error(`❌ Error triggering relay ${relay}:`, error);
      throw error;
    }
  }

  /**
   * Read button state
   */
  async readButton(button: 'A' | 'B'): Promise<number> {
    try {
      const pin = button === 'A' ? config.BUTTON_A_PIN : config.BUTTON_B_PIN;

      if (!gpioAvailable) {
        logger.debug(`🔍 [SIM] Reading button ${button} on pin ${pin}`);
        return 0;
      }

      logger.debug(`🔍 Reading button ${button}`);

      // Would read GPIO pin here
      // return gpio.readSync(pin);

      return 0;
    } catch (error) {
      logger.error(`❌ Error reading button ${button}:`, error);
      throw error;
    }
  }

  /**
   * Set LED state
   */
  async setLED(led: 'A' | 'B', state: 'on' | 'off'): Promise<void> {
    try {
      const pin = led === 'A' ? config.LED_A_PIN : config.LED_B_PIN;
      const value = state === 'on' ? 1 : 0;

      if (!gpioAvailable) {
        logger.debug(`💡 [SIM] Setting LED ${led} on pin ${pin} to ${state}`);
        return;
      }

      logger.debug(`💡 Setting LED ${led} to ${state}`);

      // Would set GPIO pin here
      // gpio.writeSync(pin, value);

      logger.debug(`✅ LED ${led} set to ${state}`);
    } catch (error) {
      logger.error(`❌ Error setting LED ${led}:`, error);
      throw error;
    }
  }

  /**
   * Cleanup GPIO resources
   */
  async cleanup(): Promise<void> {
    try {
      if (!this.isInitialized || !gpioAvailable) {
        return;
      }

      logger.info('🧹 Cleaning up GPIO resources...');

      // Would cleanup GPIO here
      // gpio.unexportAll();

      this.isInitialized = false;
      logger.info('✅ GPIO cleanup complete');
    } catch (error) {
      logger.error('❌ Error cleaning up GPIO:', error);
    }
  }

  /**
   * Check if GPIO is available
   */
  isAvailable(): boolean {
    return gpioAvailable && this.isInitialized;
  }

  /**
   * Get GPIO status
   */
  getStatus() {
    return {
      enabled: config.ENABLE_GPIO,
      available: gpioAvailable,
      initialized: this.isInitialized,
      mode: config.GPIO_MODE,
      pins: {
        relayA: config.RELAIS_A_PIN,
        relayB: config.RELAIS_B_PIN,
        buttonA: config.BUTTON_A_PIN,
        buttonB: config.BUTTON_B_PIN,
        ledA: config.LED_A_PIN,
        ledB: config.LED_B_PIN,
      },
    };
  }
}

// Create singleton instance
export const gpioService = new GPIOService();

export default gpioService;
