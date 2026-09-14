import { Application } from '@hotwired/stimulus';
import '@hotwired/turbo';
import ArchiveController from './controllers/archive_controller';
import DemoController from './controllers/demo_controller';
import GifController from './controllers/gif_controller';
import MenuController from './controllers/menu_controller';
import WebglController from './controllers/webgl_controller';

const application = Application.start();

application.register('archive', ArchiveController);
application.register('demo', DemoController);
application.register('gif', GifController);
application.register('menu', MenuController);
application.register('webgl', WebglController);

export { application };
