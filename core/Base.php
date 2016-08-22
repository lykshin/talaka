<?php

    abstract class Base
    {
        /**
         * @var array - Данные записной книжки пользователя
         */
        public $data = [];

        /**
         * @var string - Идентификатор пользователя
         */
        public $ClientId = null;

        /**
         * Проверка идентификатор пользователя
         * @param $str - ClintId для проверки
         * @return bool - результат проверки ClientID
         */
        function ClientId_Check($str)
        {
            return (boolean) preg_match("/^[a-zA-Z0-9]{".CLIENT_ID_LENGTH."}$/", $str);
        }

        /**
         * Создание идентификатора пользователя
         * @return string - ClintId
         */
        function ClientId_Create()
        {
            $alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
            $ClientId =  substr(str_shuffle($alphabet), 0, CLIENT_ID_LENGTH);

            setcookie("ClientId", $ClientId, time() + 86400*365);
            return $ClientId;
        }

        /**
         * Загрузка данных записной книжки в объект
         * @param $ClientId - Идентификатор пользователя
         * @return bool
         */
        abstract function Init($ClientId);

        /**
         * Удаление существующей записи
         * @param $id - номер записи
         * @return bool
         */
        abstract function Delete($id);

        /**
         * Обновление существующей записи
         * @param $id - номер записи
         * @param $value - значение записи
         * @return bool
         */
        abstract function Update($id, $value);
    }