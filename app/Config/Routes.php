<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */

//:HOME
$routes->get('/', 'Site\SiteView::index');
$routes->get('home', 'Home\Home::index');

//:AGENDA
$routes->get('agenda', 'Calendar\CalendarMain::index');
$routes->post('calendarLibraries/find_clinic', 'Calendar\Libraries\Find_clinic::find');
$routes->group('calendarRegister', ['namespace' => 'App\Controllers\Calendar\Register'], static function ($routes) {
    $routes->post('getData', 'CalendarRegister::getData');
});
