import { Application } from '@hotwired/stimulus';
import '@hotwired/turbo';
import ArchiveController from './controllers/archive_controller';
import DemoController from './controllers/demo_controller';
import GifController from './controllers/gif_controller';
import MenuController from './controllers/menu_controller';
import WebglController from './controllers/webgl_controller';
import { startPageTransitions } from './page-transition';

const application = Application.start();

application.register('archive', ArchiveController);
application.register('demo', DemoController);
application.register('gif', GifController);
application.register('menu', MenuController);
application.register('webgl', WebglController);

// Runs once: this bundle loads in <head>, which Turbo keeps across visits.
startPageTransitions();

export { application };
