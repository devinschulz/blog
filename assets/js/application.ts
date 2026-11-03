import StretchArrowController from './controllers/stretch_arrow_controller';
import { Application } from '@hotwired/stimulus';
import '@hotwired/turbo';
import GifController from './controllers/gif_controller';
import MenuController from './controllers/menu_controller';
import ThemeController from './controllers/theme_controller';
import MeasurementController from './controllers/measurement_controller';
import ReadingController from './controllers/reading_controller';
import CodeController from './controllers/code_controller';
import SearchController from './controllers/search_controller';
import ProjectPreviewController from './controllers/project_preview_controller';
import './inspect-trigger';

const application = Application.start();
application.register('gif', GifController);
application.register('menu', MenuController);
application.register('theme', ThemeController);
application.register('measurement', MeasurementController);
application.register('reading', ReadingController);
application.register('code', CodeController);
application.register('search', SearchController);
application.register('project-preview', ProjectPreviewController);
export { application };

application.register('stretch-arrow', StretchArrowController);
