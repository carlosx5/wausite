<?php

use App\Libraries\Sidebar;

$sb = new Sidebar();
?>

<!-- GRID INICIO -->
<div class="body-grid">

    <!-- //+SIDEBAR -->
    <aside class="sidebar" id="sidebar">
        <!-- //+ Controlhe superior -->
        <div class="top-controll">
            <!-- //+ Icones -->
            <div class="icons-box">
                <button class="btn sidebarToggle" title="Abre e fecha menu lateral">
                    <i class="fa-light fa-bars fa-xl"></i>
                </button>
                <button class="btn home" title="Pagina principal">
                    <i class="fa-light fa-house fa-xl secondary"></i>
                </button>
                <button class="btn help" title="Video tutorial">
                    <i class="fa-light fa-camera-movie fa-xl secondary"></i>
                </button>
                <?php if (isDev()) : ?>
                    <!-- //+ Botão DEV -->
                    <div class="dropdown dev">
                        <button class="btn dropdown-toggle border-0" data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="false">
                            <i class="fa-light fa-gear-complex-code fa-xl secondary"></i>
                        </button>
                        <div class="dropdown-menu p-0 m-0">
                            <?= $this->include("sidebar/dev/dev.html") ?>
                        </div>
                    </div>
                <?php endif; ?>
            </div>

            <!-- //+ Usuario/clinica -->
            <div class="user-box">
                <div class="d-flex pointer mt-2">
                    <button class="btn user"><i class="fa-light fa-user"></i></button>
                    <h6 class="user">...</h6>
                </div>
                <div class="clinic-box d-flex pointer mt-3">
                    <button class="btn clinic"><i class="fa-light fa-house-chimney-medical"></i></button>
                    <h6 class="clinic">...</h6>
                </div>
            </div>
        </div>

        <!-- //+NAVBAR -->
        <nav class="navbar sb">
            <ul class="nav flex-column" id="sidebarNavList">
                <?php $sb->sb('Home', 'fa-light fa-house fa-xl', 'home', '999P'); ?>

                <!-- //+PACIENTES -->
                <?php $sb->sb('Pacientes', 'fa-light fa-user-injured fa-xl', 'pacientes', '69P'); ?>

                <!-- //+AGENDA -->
                <?php $sb->sb('Agenda', 'fa-light fa-calendar-days fa-xl', 'agenda', '127P'); ?>

                <!-- //+RELATÓRIOS -->
                <?php $sb->sbDrop('Relatórios', 'fa-light fa-list fa-xl', '69P,120P,169P,9P', [
                    ['Pacientes', 'relatorio-pacientes', '69P'],
                    ['Serviços', 'relatorio-servicos', '120P'],
                    ['Atendimentos', 'relatorio-atendimentos', '170P'],
                    ['Bancos', 'relatorio-bancos', '169P'],
                    ['Planos Saúde', 'relatorio-planos', '9P'],
                ]); ?>

                <!-- //+PROCEDIMENTOS -->
                <?php $sb->sb('Procedimentos', 'fa-light fa-hospital-user fa-xl', 'procedimentos', '163P'); ?>

                <!-- //+USUÁRIOS -->
                <?php $sb->sb('Usuários', 'fa-light fa-user fa-xl', 'usuarios', '50P'); ?>

                <!-- //+CLINICAS -->
                <?php $sb->sb('Clínicas', 'fa-light fa-house-chimney-medical fa-xl', 'clinicas', '54P'); ?>

                <!-- //+ESTOQUE -->
                <?php $sb->sb('Estoque', 'fa-light fa-shelves fa-xl', 'estoque', '10P'); ?>

                <!-- //+BANCOS -->
                <?php $sb->sb('Bancos', 'fa-light fa-sack-dollar fa-xl', 'bancos', '58P'); ?>

                <!-- //+CONVENIOS -->
                <?php $sb->sb('Convênios', 'fa-light fa-money-check-dollar-pen fa-xl', 'convenios', '72P'); ?>

                <!-- //+CONFIGURAÇÕES -->
                <?php $sb->sbDrop('Configurações', 'fa-light fa-gear fa-xl', '9P', [
                    ['Prontuário', 'record/config/recordConfig', '138P'],
                    ['Estoque', 'estoque', '10P'],
                    ['Compras', 'stock/purchasing/purchasing', '9P'],
                    ['Fornecedores', 'fornecedores', '87P'],
                ]); ?>

                <!-- //+EXTRATO -->
                <?php $sb->sbDrop(' Extratos', 'fa-light fa-list-ul fa-xl', '112P,113P,114P,115P,116P,117P,118P', [
                    ['Extrato de Bancos', 'statement/bank', '114P', 1],
                    ['Extrato de Clínicas', 'statement/clinic', '113P'],
                    ['Extrato de Usuários', 'statement/user', '112P,115P,116P,117P', 1],
                    ['Extrato de Fornecedores', 'statement/provider', '118P'],
                ]); ?>

                <!-- //+TAREFAS -->
                <?php $sb->sbDrop('Tarefas', 'fa-light fa-list-check fa-xl', '9P', [
                    ['Lista de Leads', 'marketing/lead/report/report', '9P', 1],
                ]); ?>

                <!-- //+MARKETING -->
                <?php $sb->sbDrop('Marketing', 'fab fa-instagram fa-xl', '9P', [
                    ['Ads', 'marketing/ads/adsTrigger', '9P', 1],
                    ['ChatBot', 'marketing/chatbot/chatbot', '9P', 1],
                    ['Tarefas', 'marketing/task/taskList', '9P', 1],
                    ['Lista de Leads', 'marketing/lead/report/report', '9P', 1],
                ]); ?>

                <!-- //+FINANCEIRO -->
                <?php $sb->sbDrop('Financeiro', 'fas fa-dollar-sign fa-xl', '9P', [
                    ['Empréstimos', 'bank/loan/bankLoan', '9P'],
                    ['Fechamento', 'bank/audit/bankAudit', '9P'],
                    ['Checa Saldos', 'bank/config/balance', '9P'],
                ]); ?>

                <!-- //+VOUCHER -->
                <?php $sb->sb('Voucher', 'fas fa-file-invoice-dollar fa-xl', 'api/voucher/voucher_send', '154P'); ?>

                <!-- //+CONVITES -->
                <?php $sb->sbDrop('Convites', 'far fa-handshake fa-xl', '91P,93P,106P', [
                    ['Convidar Funcionário', 'user/invite/user_invite_send/?table=14', '137P'],
                    ['Convidar Agente', 'user/invite/user_invite_send/?table=6', '91P'],
                    ['Convidar Médico', 'user/invite/user_invite_send/?table=5', '93P'],
                    ['Convidar Coletador', 'user/invite/user_invite_send/?table=3', '106P'],
                    ['Convites Pendentes', 'user/invite/user_invite_pending', '999P'],
                ]); ?>

                <!-- //+DASHBOARD -->
                <?php $sb->sbDrop('Dashboard', 'fa-light fa-chart-mixed fa-xl', '9P', [
                    ['Marketing', 'dashboard/ads/dashAds', '126P'],
                    ['Faturamento', 'dashboard/dashboard', '9P'],
                    ['Planos de Saúde', 'dashboard/dashboard_plan', '9P'],
                ]); ?>

                <!-- //+IA -->
                <?php $sb->sb('IA', 'fas fa-biohazard fa-xl', 'gpt/gpt', '169P'); ?>

                <!-- //+WHATSAPP -->
                <?php $sb->sb('Whatsapp', 'fab fa-whatsapp fa-xl', 'whatsapp/console/console', '161P'); ?>

                <!-- //+CONFIGURAÇÕES -->
                <?php $sb->sb('Configurações', 'fas fa-cog fa-xl', 'tools/config/config/config', '9P'); ?>

                <!-- //+IA -->
                <?php $sb->sb('Inteligência Artificial', 'fas fa-info-circle fa-xl', 'ai/ai_chat', '9P'); ?>
            </ul>
        </nav>

        <div class="modal-overlay modal-find"></div>
    </aside><!-- //+ SIDEBAR FIM -->
    <?= "\n" ?>