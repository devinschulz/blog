import { Application } from '@hotwired/stimulus';
import '@hotwired/turbo';
import GifController from './controllers/gif_controller';
import MenuController from './controllers/menu_controller';
import ThemeController from './controllers/theme_controller';
import MeasurementController from './controllers/measurement_controller';
import ReadingController from './controllers/reading_controller';
import './inspect-trigger';

const application = Application.start();
application.register('gif', GifController);
application.register('menu', MenuController);
application.register('theme', ThemeController);
application.register('measurement', MeasurementController);
application.register('reading', ReadingController);
export { application };
