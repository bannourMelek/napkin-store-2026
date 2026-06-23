/**
 * GPIO Configuration
 * Defines GPIO pins for hardware buttons
 */

export const GPIO_CONFIG = {
  // Button pins for disabling (simulating hardware button clicks)
  BUTTON_PIN_A: 5,  // Primary button pin
  BUTTON_PIN_B: 6,  // Secondary button pin

  // These can be overridden from environment variables if needed
  // Example: import { environment } from '../../environments/environment';
  // BUTTON_PIN_A: environment.gpioButtonPinA || 5,
};
