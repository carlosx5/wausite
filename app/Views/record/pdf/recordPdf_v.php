<!DOCTYPE html>
<html>

<head>
    <style>
        :root {
            --top: 210px;
        }

        @page {
            margin: var(--top) 50px 100px 50px;

            /*//: (1)px → margem superior da página (deixa espaço para o cabeçalho fixo) */
            /*//: (2)px → margem direita */
            /*//: (3)px → margem inferior da página (deixa espaço para o rodapé fixo) */
            /*//: (4)px → margem esquerda */
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            margin: 0;
            padding: 0;
        }

        .header {
            position: fixed;
            top: calc(var(--top) * -1);
            left: 0;
            right: 0;
            height: calc(var(--top) - 20px);
            border-bottom: 1px solid #000;
            font-size: 12px;
            padding-bottom: 10px;
            /* background-color: aquamarine; */
        }

        .footer {
            position: fixed;
            bottom: -70px;
            left: 0;
            right: 0;
            height: 40px;
            border-top: 1px solid #000;
            text-align: center;
            font-size: 12px;
            padding-top: 5px;
            /* background-color: aquamarine; */
        }

        .pagenum:before {
            content: counter(page);
        }

        .content {
            font-size: 12px;
            margin-top: 0;
        }

        .logo {
            font-size: 18px;
            font-weight: bold;
            vertical-align: middle;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        td {
            padding: 4px;
        }

        .title {
            text-align: center;
            margin: 10px 0;
            font-size: 16px;
        }

        hr {
            border: none;
            height: .5px;
            background-color: #ccc;
            margin: 10px 0;
        }

        ul.check,
        ul.radio,
        ul.textlist,
        ul.numberList {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        ul.check li,
        ul.radio li,
        ul.numberList li {
            display: inline-block;
            width: 30%;
            vertical-align: top;
            margin-bottom: 6px;
            box-sizing: border-box;
            padding-right: 10px;
        }
    </style>
</head>

<body>
    <!--//+ Cabeçalho fixo em todas as páginas -->
    <div class="header">
        <table>
            <tr>
                <td class="logo" rowspan="2">LOGO</td>
                <td><strong>Clínica:</strong> <?= $clinicaName ?></td>
                <td><strong>Profissional:</strong> <?= $profName ?></td>
            </tr>
            <tr>
                <td><strong>Data:</strong> <?= $date ?></td>
                <td><strong>Procedimento:</strong> <?= $procedure ?></td>
            </tr>
        </table>
        <hr>
        <table>
            <tr>
                <td colspan="2"><strong>Paciente:</strong> <?= $patientName ?></td>
            </tr>
            <tr>
                <td><strong>Clínica:</strong> <?= $clinicaName ?></td>
                <td><strong>Profissional:</strong> <?= $profName ?></td>
            </tr>
            <tr>
                <td><strong>Nascimento:</strong> <?= $patientBirthday ?></td>
                <td><strong>Idade:</strong> <?= $patientAge ?></td>
            </tr>
        </table>
        <h3 class="title">Prontuário Eletrônico</h3>
    </div>

    <!--//+ Rodapé fixo em todas as páginas -->
    <div class="footer">
        Este é um rodapé fixo - Página <span class="pagenum"></span>
    </div>

    <!--//+ Conteúdo principal -->
    <div class="content">
        <?= $content ?>
    </div>
</body>

</html>