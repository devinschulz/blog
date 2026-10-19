import { Application } from '@hotwired/stimulus';
import '@hotwired/turbo';
import GifController from './controllers/gif_controller';
import MenuController from './controllers/menu_controller';
import ThemeController from './controllers/theme_controller';

const application = Application.start();
application.register('gif', GifController);
application.register('menu', MenuController);
application.register('theme', ThemeController);
export { application };
