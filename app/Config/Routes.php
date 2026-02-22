<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */

//:TESTE
$routes->get('background-remover', 'BackgroundRemover::render');


//:HOME
$routes->get('/', 'Home\Home::index');
$routes->get('home', 'Home\Home::index');

//:AGENDA
$routes->get('agenda', 'Calendar\CalendarMain::index');
$routes->post('calendarLibraries/find_clinic', 'Calendar\Libraries\Find_clinic::find');
$routes->post('calendarLibraries/find_prof', 'Calendar\Libraries\Find_prof::find');
$routes->group('calendarRegister', ['namespace' => 'App\Controllers\Calendar\Register'], static function ($routes) {
    $routes->post('getData', 'CalendarRegister::getData');
    $routes->post('setCalendar', 'CalendarRegister::setCalendar');
    $routes->post('sendScheduleConfirmation', 'CalendarRegister::sendScheduleConfirmation');
    $routes->post('delCalendar', 'CalendarRegister::delCalendar');
});

//:API
$routes->group('api', ['namespace' => 'App\Controllers\Api'], static function ($routes) {
    // $routes->post('gti/send-message', 'Gti\Webhook::send_message');
    $routes->post('gti/messages-upsert', 'Gti\Webhook::messages_upsert');
});

//:ARQUIVOS
$routes->get('arquivos', 'Archive\ArchiveMain::index');
$routes->group('archiveImage', ['namespace' => 'App\Controllers\Archive\Image'], static function ($routes) {
    $routes->post('getData', 'ArchiveImage::getData');
    $routes->post('getQrKey', 'ArchiveImage::getQrKey');
    $routes->post('setByPc', 'ArchiveImage::setImage');
    $routes->post('delImage', 'ArchiveImage::delImage');
});
//:ARQUIVOS - API PARA IMAGENS
$routes->post('apiPicture', 'Api\Image\SetImage::setImage');
// $routes->group('apiPicture', ['namespace' => 'App\Controllers\Api\Image'], static function ($routes) {
//     $routes->post('', 'SetImage::setDocument');
// });

//:BANCOS
$routes->get('bancos', 'Bank\BankMain::index');
$routes->post('bankLibraries/find_bank', 'Bank\Libraries\Find_bank::find');
$routes->group('bankRegister', ['namespace' => 'App\Controllers\Bank\Register'], static function ($routes) {
    $routes->post('getData', 'BankRegister::getData');
    $routes->post('setBank', 'BankRegister::setBank');
});

//:CLINICAS
$routes->get('clinicas', 'Clinic\ClinicMain::index');
$routes->post('clinic/findClinic', 'Clinic\Libraries\Find_clinic::find');
$routes->group('clinic', ['namespace' => 'App\Controllers\Clinic\Libraries'], static function ($routes) {
    $routes->post('changeLogClinic', 'ClinicLogin::changeLogClinic');
});
$routes->group('clinicRegister', ['namespace' => 'App\Controllers\Clinic\Register'], static function ($routes) {
    $routes->post('getData', 'ClinicRegister::getData');
    $routes->post('setClinic', 'ClinicRegister::setClinic');
});
$routes->group('clinicImage', ['namespace' => 'App\Controllers\Clinic\Image'], static function ($routes) {
    $routes->post('getData', 'ClinicImage::getData');
    $routes->post('setData', 'ClinicImage::setData');
});

//:DEV
$routes->group('dev', ['namespace' => 'App\Controllers\Dev'], static function ($routes) {
    $routes->post('getNemCode', 'DevNewCode::get');
    $routes->post('setNemCode', 'DevNewCode::set');
    $routes->post('devPermRefresh', 'DevPermRefresh::get');
    $routes->post('getSession', 'DevSession::get');
    $routes->post('runDevmode', 'DevDevmode::runDevmode');
    $routes->post('refresh', 'DevRefresh::run');
    $routes->post('setEnvironment', 'DevEnvironment::setEnvironment');
});

//:DOCUMENTOS
$routes->get('docUpdate/(:any)', 'Api\Image\SetImage::index/$1');

//:LOGIN
$routes->get('login', 'Login\Login::index');
$routes->get('pass-recover', 'Login\Login::passwordRecoverView');
$routes->group('login', ['namespace' => 'App\Controllers\Login'], static function ($routes) {
    $routes->post('doLogin', 'Login::doLogin');
    $routes->post('doLogout', 'Login::doLogout');
    $routes->post('passwordRecover', 'Login::passwordRecover');
    $routes->post('passwordRecoverSave', 'Login::passwordRecoverSave');
});
$routes->get('loginDebugger', 'Login\Debugger\DebuggerMain::index');
$routes->group('loginDebugger', ['namespace' => 'App\Controllers\Login\Debugger'], static function ($routes) {
    $routes->post('getUserList', 'DebuggerFetch::getUserList');
    $routes->post('startDebugger', 'DebuggerFetch::startDebugger');
    $routes->post('stopDebugger', 'DebuggerFetch::stopDebugger');
    $routes->post('find_clinic', 'Find_clinic::find');
});

//:MENSAGENS NA TELA
$routes->get('mensagem/(:any)', 'Tools\ViewMessage\Message::index/$1');

//:PACIENTES - CADASTRO
$routes->get('pacientes', 'Patient\PatientMain::index');
$routes->post('patientLibraries/find_patient', 'Patient\Libraries\Find_patient::find');
$routes->group('patientRegister', ['namespace' => 'App\Controllers\Patient\Register'], static function ($routes) {
    $routes->post('getData', 'PatientRegister::getData');
    $routes->post('setData', 'PatientRegister::setData');
    $routes->post('delPatient', 'PatientRegister::delPatient');
    $routes->post('checkCpf', 'PatientRegister::checkCpf');
});
//:PACIENTES - FINANCEIRO
$routes->get('pacientes-financeiro', 'Financial\FinancialMain::index');
// $routes->post('patientLibraries/find_patient', 'Patient\Libraries\Find_patient::find');
$routes->group('financialRegister', ['namespace' => 'App\Controllers\Financial\Register'], static function ($routes) {
    $routes->post('getData', 'FinancialRegister::getData');
    $routes->post('setNewFinancial', 'FinancialRegister::setNewFinancial');
    $routes->post('deleteFinancial', 'FinancialRegister::deleteFinancial');
});

//:PLANOS/CONVENIOS
$routes->get('convenios', 'Plan\PlanMain::index');
$routes->post('planLibraries/find_plan', 'Plan\Libraries\Find_plan::find');
$routes->group('planRegister', ['namespace' => 'App\Controllers\Plan\Register'], static function ($routes) {
    $routes->post('getData', 'PlanRegister::getData');
    $routes->post('setPlan', 'PlanRegister::setPlan');
});

//:PROCEDIMENTOS
$routes->get('procedimentos', 'Procedure\ProcedureMain::index');
$routes->post('procedure/find_procedure', 'Procedure\Libraries\Find_procedure::find');
$routes->post('procedure/find_category', 'Procedure\Libraries\Find_category::find');
$routes->group('procedureRegister', ['namespace' => 'App\Controllers\Procedure\Register'], static function ($routes) {
    $routes->post('getData', 'ProcedureRegister::getData');
    $routes->post('setProcedure', 'ProcedureRegister::setProcedure');
});

//:PRONTUÁRIOS
$routes->get('prontuarios', 'Record\RecordMain::index');
$routes->group('recordRegister', ['namespace' => 'App\Controllers\Record\Register'], static function ($routes) {
    $routes->post('getData', 'RecordRegister::getData');
    $routes->post('setData', 'RecordRegister::setData');
    $routes->post('deleteRecord', 'RecordRegister::deleteRecord');
    $routes->post('setPdf', 'RecordRegister::setPdf');
    $routes->post('checkPendingRecord', 'RecordRegister::checkPendingRecord');
    $routes->post('newRecord', 'RecordRegister::newRecord');
    $routes->post('finalizeRecord', 'RecordRegister::finalizeRecord');
});
$routes->group('recordList', ['namespace' => 'App\Controllers\Record\List'], static function ($routes) {
    $routes->post('getData', 'RecordList::getData');
    $routes->post('getModules', 'RecordList::getModules');
    $routes->post('getModulePdf', 'RecordList::getModulePdf');
});

//:RELATÓRIOS->ATENDIMENTOS
$routes->get('relatorio-atendimentos', 'Report\Service\ReportServiceMain::index');
$routes->post('report/find_prof', 'Report\Libraries\Find_prof::find');
$routes->post('report/find_clinic', 'Report\Libraries\Find_clinic::find');
$routes->group('reportServiceList', ['namespace' => 'App\Controllers\Report\Service\List'], static function ($routes) {
    $routes->post('getData', 'ReportServiceList::getData');
});
//:RELATÓRIOS->BANCOS
$routes->get('relatorio-bancos', 'Report\Bank\ReportBankMain::index');
$routes->post('report/find_bank', 'Report\Libraries\Find_bank::find');
$routes->group('reportBankList', ['namespace' => 'App\Controllers\Report\Bank\List'], static function ($routes) {
    $routes->post('getData', 'ReportBankList::getData');
});
//:RELATÓRIOS->PACIENTES
$routes->get('relatorio-pacientes', 'Report\Patient\ReportPatientMain::index');
$routes->post('report/find_patient', 'Report\Libraries\Find_patient::find');
$routes->group('reportPatientList', ['namespace' => 'App\Controllers\Report\Patient\List'], static function ($routes) {
    $routes->post('getData', 'ReportPatientList::getData');
});
//:RELATÓRIOS->SERVIÇOS
$routes->get('relatorio-servicos', 'Report\Os\ReportOsMain::index');
$routes->post('report/find_prof', 'Report\Libraries\Find_prof::find');
$routes->post('report/find_clinic', 'Report\Libraries\Find_clinic::find');
$routes->group('reportOsList', ['namespace' => 'App\Controllers\Report\Os\List'], static function ($routes) {
    $routes->post('getData', 'ReportOsList::getData');
});

//:SERVIÇOS / OS
$routes->get('servicos', 'Os\OsMain::index');
$routes->post('osLibraries/find_procedure', 'Os\Libraries\Find_procedure::find');
$routes->post('osLibraries/find_stock', 'Os\Libraries\Find_stock::find');
$routes->post('osLibraries/find_prof', 'Os\Libraries\Find_prof::find');
$routes->group('osRegister', ['namespace' => 'App\Controllers\Os\Register'], static function ($routes) {
    $routes->post('getData', 'OsRegister::getData');
    $routes->post('setData', 'OsRegister::setData');
    $routes->post('moveStock', 'OsRegister::moveStock');
    $routes->post('deleteOs', 'OsRegister::deleteOs');
    $routes->get('deleteOs/(:any)', 'OsRegister::deleteOs/$1');
});
$routes->group('osList', ['namespace' => 'App\Controllers\Os\List'], static function ($routes) {
    $routes->post('getData', 'OsList::getData');
});

//:TESTE
$routes->get("teste", "Tools\Teste\Teste::index");

//:TOOLS
$routes->get("tool-viewsize", "Tools\ShowViewSize\ShowViewSize::index");

//:USUÁRIOS
$routes->get('usuarios', 'User\UserMain::index');
$routes->post('userLibraries/find_user', 'User\Libraries\Find_user::find');
$routes->post('userLibraries/find_activity', 'User\Libraries\Find_activity::find');
$routes->group('userRegister', ['namespace' => 'App\Controllers\User\Register'], static function ($routes) {
    $routes->post('getData', 'UserRegister::getData');
    $routes->post('setUser', 'UserRegister::setUser');
});
$routes->group('userPermission', ['namespace' => 'App\Controllers\User\Permission'], static function ($routes) {
    $routes->post('getData', 'UserPermission::getData');
    $routes->post('setUserPerm', 'UserPermission::setUserPerm');
    $routes->post('setViewConfig', 'UserPermission::setViewConfig');
    $routes->post('setPermConfig', 'UserPermission::setPermConfig');
    $routes->post('getActivity', 'UserPermission::getActivity');
    $routes->post('setActivity', 'UserPermission::setActivity');
    $routes->post('setActivityPermOnOff', 'UserPermission::setActivityPermOnOff');
});
$routes->group('userRecord', ['namespace' => 'App\Controllers\User\Record'], static function ($routes) {
    $routes->post('getData', 'UserRecord::getData');
    $routes->post('saveData', 'UserRecord::saveData');
});
$routes->group('userConfig', ['namespace' => 'App\Controllers\User\Config'], static function ($routes) {
    $routes->post('getData', 'UserConfig::getData');
    $routes->post('colorChange', 'UserConfig::colorChange');
});

return;


$routes->get('print-prontuario', 'Record\Pdf\PdfView::index');
