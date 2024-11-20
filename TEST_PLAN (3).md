# Тест-план

## 1. Объект тестирования

Тестируемым объектом является система веб-тестирования знаний, включающая следующие разделы:

- **Регистрация и авторизация** — регистрация преподавателей и студентов с использованием персонализированных ссылок, а
  также авторизация пользователей.
- **Управление организациями и пользователями** — создание организаций, добавление преподавателей и студентов.
- **Создание и управление тестами** — добавление тем, вопросов и тестов, назначение тестов группам студентов.
- **Прохождение тестов** — интерфейс для выполнения тестов студентами с фиксированным количеством попыток.
- **Статистика и история тестов** — просмотр преподавателями результатов тестов, истории попыток студентов.
- **Восстановление пароля** — механизм восстановления доступа через e-mail.

---

## 2. Стратегия тестирования

### Цель тестирования

Обеспечить соответствие системы требованиям, описанным в ТЗ, гарантировать её стабильность, функциональность и удобство.

### Подход к тестированию

- **Функциональное тестирование**: проверка работы всех функций, включая регистрацию, создание тестов, управление
  группами, прохождение тестов.
- **Тестирование пользовательского интерфейса (UI)**: проверка отображения элементов интерфейса и их взаимодействия с
  пользователем.
- **Тестирование безопасности**: проверка работы шифрования, восстановление пароля, проверка прав доступа.
- **End-to-End тестирование**: полное тестирование пользовательских сценариев, описанных в Use Cases.

### Методы тестирования

- Ручное тестирование — для UI, UX и пользовательских сценариев.
- Автоматизированное тестирование — для базовых сценариев использования приложения.

---

## 3. Тест-процедуры

### Настройка среды тестирования

- Установить и настроить окружение: Node.js, PostgreSQL, фронтенд-зависимости.
- Создать тестовую базу данных с учебными группами, студентами и преподавателями.
- Настроить систему CI/CD для автоматического запуска автотестов.

### Проведение тестирования

- Выполнить функциональные тесты по каждому модулю: регистрация, управление организациями, тестирование, просмотр
  статистики.
- Запустить автотесты для проверки ключевых пользовательских сценариев.

### Оценка результатов

- Сравнить результаты выполнения тестов с ожидаемыми.
- Все найденные дефекты отобразить в отдельном файле.

---

## 4. Критерии для начала и окончания тестирования

### Критерии начала тестирования

- Настроена тестовая среда (серверы, база данных).
- Созданы тестовые учетные записи, группы, вопросы и тесты.

### Критерии окончания тестирования

- Все тест-кейсы выполнены, результаты зарегистрированы.
- Все критические и высокоприоритетные дефекты устранены.
- Завершено регрессионное тестирование для подтверждения стабильности.

---

## 5. Необходимые ресурсы для тестирования

### Команда

- QA-инженер для ручного тестирования, написания и выполнения автотестов.

### Инфраструктура

- Локальная среда с установленным Node.js и PostgreSQL.
- CI/CD система (Github Actions) для автоматизации тестирования.

---

## 6. Тест-кейсы

# Полное покрытие функционала тестами, включая некорректное поведение

## 1. Регистрация и авторизация

### Ручные тесты

| **ID** | **Название**                                      | **Шаги**                                                        | **Ожидаемый результат**                                    |
|--------|---------------------------------------------------|-----------------------------------------------------------------|------------------------------------------------------------|
| RT001  | Регистрация студента по пригласительной ссылке    | Перейти по пригласительной ссылке, ввести e-mail, пароль, завершить регистрацию | Статус студента "активирован", отображается сообщение      |
| RT002  | Регистрация преподавателя по пригласительной ссылке              | Перейти по пригласительной ссылке, ввести e-mail, пароль, завершить регистрацию | Статус преподавателя "активирован", отображается сообщение |
| RT015  | Уведомление при неверной пригласительной ссылке       | Перейти по неверной пригласительной ссылке                          | Отображается сообщение об ошибке                           |
| RT016  | Регистрация с уже используемым e-mail             | Использовать e-mail, который уже зарегистрирован                | Отображается ошибка "E-mail уже используется"              |
| RT017  | Попытка авторизации с неверным паролем            | Ввести e-mail и неверный пароль                                 | Отображается сообщение об ошибке "Неверный пароль"         |
| RT018  | Успешная авторизация                              | Ввести e-mail и верный пароль                                   | Пользователь перенаправляется на главную страницу          |
| RT019  | Попытка авторизации с незарегистрированным e-mail | Ввести e-mail, который не существует в системе                  | Отображается ошибка "Пользователь не найден"               |

---

## 2. Управление организациями и пользователями

### Автотесты

| **ID** | **Название**                                   | **Шаги**                                                         | **Ожидаемый результат**                                      |
|--------|------------------------------------------------|------------------------------------------------------------------|--------------------------------------------------------------|
| AT005  | Добавление новой организации                   | Заполнить данные для добавления организации                      | Организация добавилась в список                              |
| AT006  | Добавление преподавателя                       | Ввести ФИО, выбрать организацию                                  | Преподаватель в статусе "неактивирован"                      |
| AT019  | Добавление организации с дублирующим названием | Создать организацию с названием, которое уже существует          | Отображается ошибка "Организация с таким названием уже есть" |
| AT020  | Добавление студента с неверными данными        | Попытаться добавить студента с пустыми или некорректными данными | Отображается ошибка "Некорректные данные"                    |

### Ручные тесты

| **ID** | **Название**                                   | **Шаги**                                        | **Ожидаемый результат**                        |
|--------|------------------------------------------------|-------------------------------------------------|------------------------------------------------|
| RT003  | Проверка отображения списка организаций        | Перейти в раздел организаций                    | Отображаются корректные данные                 |
| RT004  | Проверка добавления студентов и преподавателей | Добавить студентов и преподавателей через форму | Все студенты и преподаватели успешно добавлены |

---

## 3. Создание и управление тестами

### Автотесты

| **ID** | **Название**                | **Шаги**                                                                         | **Ожидаемый результат**               |
|--------|-----------------------------|----------------------------------------------------------------------------------|---------------------------------------|
| AT008  | Создание темы               | Ввести название темы и добавить                                                  | Тема добавилась в список              |
| AT009  | Добавление вопросов к теме  | Создать вопрос с текстом и вариантами ответов и добавить                         | Вопрос добавлен к теме                |
| AT010  | Назначение теста группе     | Выбрать тему, указать количество вопросов, количество попыток и назначить группе | Тест прикрепляется к выбранной группе |
| AT021  | Добавление пустого вопроса  | Попытаться сохранить вопрос без текста или вариантов ответа                      | Получение ошибки                      |
| AT022  | Назначение теста без группы | Попытаться назначить тест без указания группы                                    | Получение ошибки                      |

### Ручные тесты

| **ID** | **Название**                               | **Шаги**                                            | **Ожидаемый результат**                                           |
|--------|--------------------------------------------|-----------------------------------------------------|-------------------------------------------------------------------|
| RT005  | Проверка валидаторов при создании вопросов | Оставить пустыми поля вопроса, попытаться сохранить | Отображается сообщение об ошибке                                  |
| RT006  | Проверка создания теста                    | Создать тест через интерфейс, добавить 10+ вопросов | Данные корректно сохраняются, функционал теста работает корректно |

---

## 4. Прохождение тестов

### Автотесты

| **ID** | **Название**                                             | **Шаги**                                                   | **Ожидаемый результат**                 |
|--------|----------------------------------------------------------|------------------------------------------------------------|-----------------------------------------|
| AT011  | Получение активных тестов для преподавателей и студентов | Получить все тесты в разделе "Активные тесты"              | Список доступных тестов не пуст         |
| AT023  | Попытка начать тест после лимита попыток                 | Пройти тест до исчерпания попыток, попытаться начать снова | Тест недоступен, отображается сообщение |

### Ручные тесты

| **ID** | **Название**                        | **Шаги**                                         | **Ожидаемый результат**                          |
|--------|-------------------------------------|--------------------------------------------------|--------------------------------------------------|
| RT007  | Проверка случайного выбора вопросов | Запустить тест для одного студента несколько раз | Каждый раз порядок вопросов разный               |
| RT008  | Завершение теста                    | Пройти все вопросы теста, завершить тест         | Результат отображается, сохраняется в статистике |                                                          |

---

## 5. Статистика и история тестов

### Автотесты

| **ID** | **Название**                  | **Шаги**                                   | **Ожидаемый результат**                        |
|--------|-------------------------------|--------------------------------------------|------------------------------------------------|
| AT013  | Получение статистики по тесту | В разделе "Статистика тестов" выбрать тест | Отображается список студентов и их результатов |

### Ручные тесты

| **ID** | **Название**                              | **Шаги**                                                                                  | **Ожидаемый результат**                 |
|--------|-------------------------------------------|-------------------------------------------------------------------------------------------|-----------------------------------------|
| RT009  | Проверка отображения статистики           | Открыть статистику по нескольким тестам с прохождением нескольких пользователей попытками | Статистика отображает корректные данные |
| RT011  | Попытка просмотра статистики чужого теста | Зайти под преподавателем, который не назначал тест                                        | Не отображается                         |

---

## 6. Восстановление пароля

### Ручные тесты

| **ID** | **Название**                                                | **Шаги**                                                    | **Ожидаемый результат**                      |
|--------|-------------------------------------------------------------|-------------------------------------------------------------|----------------------------------------------|
| RT010  | Попытка восстановления пароля с незарегистрированным e-mail | Ввести e-mail, который не зарегистрирован                   | Письмо не получено                           |
| RT012  | Запрос ссылки восстановления пароля                         | Ввести e-mail на странице восстановления пароля             | Письмо со ссылкой приходит                   |
| RT013  | Проверка работы письма с восстановлением                    | Запросить восстановление пароля на разных почтовых сервисах | Письмо содержит корректную ссылку            |
| RT014  | Смена пароля через восстановительную ссылку                 | Перейти по ссылке из письма, ввести новый пароль            | Пароль успешно обновлен, доступ восстановлен |
