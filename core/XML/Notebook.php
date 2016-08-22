<?php

    class Notebook extends Base
    {
        const WAY = "./core/XML";

        public function Init($ClientId)
        {
            $this->ClientId = $ClientId;

            if(file_exists(self::WAY."/data/".$this->ClientId.".xml") == TRUE)
            {
                if($XML = simplexml_load_file(self::WAY."/data/".$this->ClientId.".xml"))
                {
                    foreach($XML->item AS $item)
                    {
                        $this->data[] =
                        [
                            "title"       => (string) $item->title,
                            "description" => (string) $item->description,
                            "important"   => (int) $item["important"],
                            "dateCreate"  => (int) $item["dateCreate"],
                            "dateUpdate"  => (int) $item["dateUpdate"],
                        ];
                    }
                }
                else
                {
                    return FALSE;
                }
            }

            return TRUE;
        }

        public function Delete($id)
        {
            unset($this->data[$id]);
            return $this->Save();
        }

        public function Update($id, $value)
        {
            $this->data[$id] = $value;
            return $this->Save();
        }

        /**
         * @return bool - Результат сохранения записи в файл
         */
        public function Save()
        {
            $XML = simplexml_load_file(self::WAY."/example.xml");

            // Создание XML файла
            foreach($this->data AS $k => $v)
            {
                $item = $XML->addChild("item");

                foreach(["dateCreate", "dateUpdate", "important"] AS $vv)
                {
                    $v[$vv] = (int) $v[$vv];
                    $item->addAttribute($vv, $v[$vv]);
                }

                foreach(["title", "description"] AS $vv)
                {
                    $item->addChild($vv, $v[$vv]);
                }
            }

            // Сохранение XML файла
            return $XML->asXML(self::WAY."/data/".$this->ClientId.".xml");
        }
    }