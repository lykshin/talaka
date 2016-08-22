<?php

    class Notebook extends Base
    {
        private $connect = null;

        public function Init($ClientId)
        {
            $this->ClientId = $ClientId;

            if($this->connect = @mysqli_connect(MYSQL_HOST, MYSQL_USER, MYSQL_PASS, MYSQL_BASE))
            {
                // UTF-8
                mysqli_query($this->connect, "SET NAMES 'UTF8'");

                // Получаем список
                $sql = "SELECT * FROM `notebook` WHERE `client` = '{$this->ClientId}' ORDER BY `id` ASC;";
                $sql = mysqli_query($this->connect, $sql);

                while($item = $sql->fetch_object())
                {
                    $this->data[] =
                    [
                        "id"          => $item->id,
                        "title"       => $item->title,
                        "description" => $item->description,
                        "important"   => (bool) $item->important,
                        "dateCreate"  => $item->dateCreate*1000,
                        "dateUpdate"  => $item->dateUpdate*1000,
                    ];
                }
            }
            else return FALSE;

            return TRUE;
        }

        public function Delete($id)
        {
            if(isset($this->data[$id]) == TRUE)
            {
                return mysqli_query($this->connect, "DELETE FROM `notebook` WHERE `id` = {$this->data[$id]["id"]};");
            }

            return FALSE;
        }

        public function Update($id, $value)
        {
            // Обработка текстовых полей
            foreach(["title", "description"] AS $k)
            {
                $value[$k] = mysqli_real_escape_string($this->connect, $value[$k]);
            }

            // Обработка числовых полей
            foreach(["dateCreate" => 1000, "dateUpdate" => 1000, "important" => 1] AS $k => $d)
            {
                $value[$k] = (int) $value[$k];
                $value[$k] = round($value[$k]/$d);
            }

            if(isset($this->data[$id]) == TRUE)
            {
                $sql = "UPDATE `notebook` SET
                            `title`       = '{$value["title"]}',
                            `description` = '{$value["description"]}',
                            `dateCreate`  = {$value["dateCreate"]},
                            `dateUpdate`  = {$value["dateUpdate"]},
                            `important`   = {$value["important"]}
                        WHERE `id` = {$this->data[$id]["id"]} LIMIT 1;";
            }
            else
            {
                $sql = "INSERT INTO `notebook` (`client`, `title`, `description`, `dateCreate`, `dateUpdate`, `important`)
                        VALUES ('{$this->ClientId}', '{$value["title"]}', '{$value["description"]}', {$value["dateCreate"]}, {$value["dateUpdate"]}, {$value["important"]});";
            }

            return mysqli_query($this->connect, $sql);
        }
    }