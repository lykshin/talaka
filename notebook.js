var Notebook =
{
    data: [],   // Массив данных записной книжки
    type: null, // Место хранения данных (1 - клиент, 2 - сервер)

    // Задержка при сохранении на сервере
    ajax      : 0,
    ajax_wait : 500,

    // Параметры устанавливаемых Cookies
    cookies:
    {
        expires: 365,
        secure:  false
    },

    /*
     * Форматирование даты
     */
    Date: function(timestamp)
    {
        var obj = new Date(timestamp);

        var str = (obj.getDate()    > 9 ? obj.getDate()    : "0" + obj.getDate()   ) + ".";
            str+= (obj.getMonth()   > 9 ? obj.getMonth()   : "0" + obj.getMonth()  ) + " ";
            str+= (obj.getHours()   > 9 ? obj.getHours()   : "0" + obj.getHours()  ) + ":";
            str+= (obj.getMinutes() > 9 ? obj.getMinutes() : "0" + obj.getMinutes());

        return str;
    },
    /*
     * Инициализация скрипта
     * 1. Проверка места хранения данных
     * 2. Загрузка данных
     */
    Init: function()
    {
        var data, id;

        if(this.type = Cookies.get('ClientType'))
        {
            /* Обработка на стороне сервера */
            if(this.type == 2)
            {
                $.ajaxSetup(
                    {
                        method   : "POST",
                        //dataType : "json",
                        url      : "notebook.php",
                        error    : function(XHR)
                        {
                            alert("Ошибка при обращении к серверу: " + XHR.status + " > " + XHR.statusText);
                        }
                    }
                );

                $.ajax(
                    {
                        data:
                        {
                            action: "load",
                            client: Cookies.get('ClientId')
                        }
                    })
                    .done
                    (
                        function(data)
                        {
                            Notebook.data = data;
                            Notebook.Load();

                            // Восстанавливаем последнее действие при загрузке
                            if(id = Cookies.get('ClientActionEdit')) Notebook.Edit(id);
                        }
                    );
            }
            /* Обработка на стороне клиента */
            else
            {
                // Загрузка данных из кукиса
                if(data = Cookies.get("data"))
                {
                    this.data = JSON.parse(data);
                }

                this.Load();

                // Восстанавливаем последнее действие при загрузке
                if(id = Cookies.get('ClientActionEdit')) this.Edit(id);
            }
        }
        /* Выбор места хранения данных */
        else
        {
            $("form[name='init']").removeAttr("hidden").on("submit", function()
            {
                var type;

                if(type = $(this).find("input:checked").val())
                {
                    $(this).attr("hidden", 1);
                    Cookies.set('ClientType', type, Notebook.cookies);

                    Notebook.Init();
                }
                else alert("Выберите место для хранения данных записной книжки!");

                return false;
            });
        }
    },
    /*
     * Генерация записной книжки на странице
     */
    Load: function()
    {
        $("main").removeAttr("hidden");

        /* Отображение данных на странице */
        if(this.data.length)
        {
            $("main > div.empty").attr("hidden", 1);
            $("main > ul").removeAttr("hidden").html("");

            $.each(this.data, function(id, obj)
            {
                if(obj.title == "")
                {
                    obj.title = "[ нет названия ]";
                }

                var li = $("<li></li>")
                    .append(
                        $("<u></u>")
                            .text(Notebook.Date(obj.dateUpdate))
                    )
                    .append(
                        $("<a></a>")
                            .attr("href", "#").addClass("fa fa-trash")
                            .attr("title", "Удалить запись")
                            .on("click", function()
                            {
                                Notebook.Delete(id);
                                return false;
                            })
                    )
                    .append(
                        $("<a></a>")
                            .attr("href", "#").addClass("fa fa-wrench")
                            .attr("title", "Редактировать запись")
                            .on("click", function()
                            {
                                Notebook.Edit(id);
                                return false;
                            })
                    )
                    .append(
                        $("<span></span>")
                            .text(obj.title)
                            .attr("title", obj.title)
                    )
                    .append(
                        $("<p></p>")
                            .text(obj.description)
                    )
                    .attr("title", "Создано: " + Notebook.Date(obj.dateCreate))
                    .on("click", function()
                    {
                        $(this).find("p").toggleClass("show");
                    });

                // Дополнительные отметки
                if(obj.important)
                {
                    li.append(
                        $("<i></i>")
                            .addClass("fa fa-paperclip")
                            .attr("title", "Задача отмечена как важная")
                    );
                }

                $("main > ul").append(li);
            });
        }
        /* Данных для отображения нет */
        else
        {
            $("main > div.empty").removeAttr("hidden");
            $("main > ul").attr("hidden", 1);
        }
    },
    /*
     * Сохранение данных при добавлении/редактировании
     */
    Save: function(id, data)
    {
        // В случае добавления - ищем новый ID для записи
        if(id == -1)
        {
            if(id = Cookies.get('ClientActionEdit')) { }
            else
            {
                id = 0;
                while(this.data[id]) id++;

                Cookies.set('ClientActionEdit', id, this.cookies);
            }
        }

        // Удаление записи
        if(data == "delete")
        {
            this.data.splice(id, 1);
            console.log("delete: " + id);
        }
        // Редактирование записи
        else
        {
            data.dateUpdate = new Date().getTime();
            data.dateCreate = this.data[id] ? this.data[id].dateCreate : new Date().getTime();

            this.data[id] = data;
            console.log("update: " + id);
        }

        // Сохранение на стороне клиента
        if(this.type == 1)
        {
            Cookies.set('data', JSON.stringify(this.data), this.cookies);
        }
        // Сохранение на стороне сервера
        else
        {
            if(data == "delete")
            {
                $.ajax(
                {
                    data:
                    {
                        action : "delete",
                        id     : id,
                    }
                });
            }
            else
            {
                window.clearTimeout(this.ajax);

                // Задержка перед отправкой данных
                this.ajax = window.setTimeout(function()
                {
                    $.ajax(
                    {
                        data:
                        {
                            action : "update",
                            id     : id,
                            data   : JSON.stringify(Notebook.data[id])
                        }
                    });

                    console.log("synchronized: " + id);

                }, this.ajax_wait);
            }
        }
    },
    /*
     * Удаление записи
     */
    Delete: function(id)
    {
        this.Save(id, "delete");
        Notebook.Load();
    },
    /*
     * Редактирование/добавление записи записи
     * 1. Подстановка значений (при редактировании)
     * 2. Отображение формы для редактирования
     */
    Edit: function(id)
    {
        $("main").attr("hidden", 1);

        // Редактирование существущей записи
        if(this.data[id])
        {
            $("form[name='edit'] [name='id']")         .val(id);
            $("form[name='edit'] [name='title']")      .val(this.data[id].title);
            $("form[name='edit'] [name='description']").val(this.data[id].description);

            // Отметка для важных задач
            if(this.data[id].important) $("form[name='edit'] [name='important']").prop("checked", true);

            Cookies.set('ClientActionEdit', id, this.cookies);
        }

        // Отображение формы для редактирования
        $("form[name='edit']").removeAttr("hidden")
            .on("keyup change", function()
            {
                var data =
                {
                    title:       $(this).find("[name='title']").val(),
                    description: $(this).find("[name='description']").val(),
                    important:   $(this).find("[name='important']").prop('checked') ? 1 : 0
                };

                Notebook.Save(id, data);
                return false;
            })
            .on("submit", function()
            {
                $(this).off("keyup change submit").attr("hidden", 1);

                // Очистка формы и удаление отметки о состоянии
                Cookies.remove('ClientActionEdit', Notebook.cookies);
                $(this)[0].reset();

                Notebook.Load();
                return false;
            });
    },
    /*
     * Очистка данных для смены места хранения
     */
    Clear: function()
    {
        $("main").attr("hidden", 1);

        Cookies.remove('data',             this.cookies);
        Cookies.remove('ClientType',       this.cookies);
        Cookies.remove('ClientActionEdit', this.cookies);

        this.data = [];
        this.type = null;

        this.Init();
    }
}