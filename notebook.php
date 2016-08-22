<?php

    include('.config.php');

    if(isset($_POST["action"]) && in_array($_POST["action"], ["load", "delete", "update"]))
    {
        include('./core/Base.php');
        include('./core/'.CORE.'/Notebook.php');

        $Notebook = new Notebook();

        // Проверка/генерация ClientID
        $ClientId = (isset($_COOKIE["ClientId"]) && $Notebook->ClientId_Check($_COOKIE["ClientId"])) ? $_COOKIE["ClientId"] : $Notebook->ClientId_Create();

        // Загрузка записной книжки
        if($Notebook->Init($ClientId))
        {
            // Отправка заголовка
            header("Content-Type: application/json");

            // Выбор действия с записной книжкой
            switch($_POST["action"])
            {
                case "load":
                    echo json_encode($Notebook->data);
                break;

                case "delete":
                    if(isset($_POST["id"]) && is_numeric($_POST["id"]))
                    {
                        $Notebook->Delete($_POST["id"]);
                        echo json_encode(["ok"]);
                    }
                    else http_response_code(550);
                break;

                case "update":
                    if(isset($_POST["id"], $_POST["data"]) && is_numeric($_POST["id"]))
                    {
                        $data = json_decode($_POST["data"], TRUE);

                        $Notebook->Update($_POST["id"], $data);
                        echo json_encode(["ok"]);
                    }
                    else http_response_code(551);
                break;
            }
        }
        else http_response_code(500);
    }
    else http_response_code(400);


