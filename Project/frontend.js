



async function postData(url = '', data = {}) {
    // Опции запроса
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    // Отправка запроса и обработка ответа
    try {
        const response = await fetch(url, requestOptions);
        const responseData = await response.json();

        if (response.status >= 400) {
            throw new Error(responseData?.message);
        }

        return responseData;
    } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
        throw error;
    }
}

async function putData(url = '', data = {}) {
    // Опции запроса
    const requestOptions = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    // Отправка запроса и обработка ответа
    try {
        console.log("Привет");
        const response = await fetch(url, requestOptions);
        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
        throw error;
    }
}

function printError(flag) {
    const errorText = document.querySelector('.errorRegText'); // Выбираем элемент по классу

    if (errorText) {
        // Элемент найден, устанавливаем сообщение об ошибке и стили
        switch (flag) {
            case 1:
                errorText.innerHTML = "Заполните все данные в соответствующих полях";
                break;
            case 2:
                errorText.innerHTML = "Введена некорректная почта";
                break;
            case 3:
                errorText.innerHTML = "Пароли не совпадают";
                break;
            case 4:
                errorText.innerHTML = "Ошибка при регистрации";
                break;
            case 5:
                errorText.innerHTML = "Данный пользователь не найден";
                break;
            default:
                errorText.innerHTML = "Неизвестная ошибка";
        }
        errorText.style.color = "red"; // Устанавливаем цвет текста
    } else {
        console.error("Элемент с классом 'errorRegText' не найден");
    }
}

function clearError() {
    const errorText = document.querySelector('.errorRegText'); // Выбираем элемент по классу
    if (errorText) {
        errorText.innerHTML = "";
    } else {
        console.log("Элемент с классом 'errorRegText' не найден")
    }
}


/* ДЛЯ РЕГИСТРАЦИИ ПОЛЬЗОВАТЕЛЯ  */
async function registerUser() {
    const email = document.getElementById('emailReg').value;
    const fullName = document.getElementById('nameReg').value;
    const password = document.getElementById('passReg').value;
    const conPassword = document.getElementById('passConReg').value;

    // sessionStorage.removeItem('token');
    // sessionStorage.removeItem('id_student');

    if (!email || !fullName || !password || !conPassword) {
        console.log("Не все данные заполнены");
        printError(1);

        return;
    }

    if (!email.includes('@')) {
        console.log('Некоректная почта');
        printError(2);

        return;
    }

    if (password !== conPassword) {
        console.log("Пароли не совпадают");
        printError(3);

        return;
    }

    const data = { email, fullName, password };

    try {
        const response = await postData('/register', data);

        console.log(response);
        console.log('Регистрация успешна, токен:', response.token);

        clearError();

        sessionStorage.setItem('token', response.token);
        sessionStorage.setItem('id_student', response.id_student);

        window.location.href = "Start.html";
    } catch (error) {
        console.error('Ошибка при регистрации:', error.message);
        printError(4);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const registerform = document.getElementById('register_form');

    registerform.addEventListener('submit', async (event) => {
        event.preventDefault();

        await registerUser();
    });
});

// АВТОРИЗАЦИЯ ПОЛЬЗОВАТЕЛЯ
async function loginUser() {
    const email = document.getElementById('emailLogin').value;
    const password = document.getElementById('passwordLogin').value;

    sessionStorage.removeItem('token');
    sessionStorage.removeItem('id_student');
    // const email = "ars@mail.ru";
    // const password = "123";

    if (email && password) {
        if (email.includes('@')) {
            const data = { email, password };

            try {
                const response = await postData('/login', data);
                if (response.error == 404) {
                    console.log("Такого пользователя не существует");
                    printError(5);
                }
                else {
                    console.log('Авторизация успешна, токен:', response);

                    clearError();

                    sessionStorage.setItem('token', response.token);
                    sessionStorage.setItem('id_student', response.idStudent);

                    window.location.href = "Start.html";
                }

            } catch (error) {
                console.error('Ошибка при авторизации:', error);
                printError(4);
            }
        } else {
            console.log("Неккоректный email");
            printError(2);
        }
    }
    else {
        console.log("Данные не спарсились");
        printError(1);
    }
}
// loginUser();

// Дожидаемся полной загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('signBtn');
    // Назначаем обработчик события клика на кнопку регистрации
    loginBtn.addEventListener('click', async (event) => {
        event.preventDefault(); // Предотвращаем стандартное действие кнопки (отправку формы)

        // Вызываем функцию регистрации
        await loginUser();
    });
});

let isRequestPending = false; // Флаг для отслеживания состояния активного запроса


// ИЗМЕНЕНИЕ ПРОФИЛЯ СТУДЕНТА
async function changeProfile() {
    if (isRequestPending) {
        console.log('Запрос уже выполняется, подождите...');
        return;
    }

    const token = sessionStorage.getItem('token');

    if (!token) {
        console.error('Токен не найден в sessionStorage');
        return;
    }


    // const idStudents = "1";
    const firstName = document.getElementById('changeFirstname').value;
    const secondName = document.getElementById('changeSecondname').value;
    const thirdName = document.getElementById('changeThirdname').value;
    const schoolName = document.getElementById('changeShoolName').value;
    const schoolClass = document.getElementById('changeClass').value;
    const schoolLetter = document.getElementById('changeLetterClass').value;
    const country = document.getElementById('changeCountry').value;
    const city = document.getElementById('changeCity').value;

    const data = { token, firstName, secondName, thirdName, schoolName, schoolClass, schoolLetter, country, city };

    try {
        isRequestPending = true;
        const response = await putData('/students/me', data);
        console.log('Данные успешно обновлены:', response);

        sessionStorage.setItem('profileData', JSON.stringify(response));

        window.location.href = "Profile.html";

    } catch (error) {
        console.error('Ошибка при обновлении данных:', error);
        // Ваш код для обработки ошибки
    } finally {
        isRequestPending = false;
    }

}

document.addEventListener('DOMContentLoaded', () => {
    const saveChangeBtn = document.getElementById('savingChange');
    // Назначаем обработчик события клика на кнопку регистрации
    saveChangeBtn.addEventListener('click', async (event) => {
        event.preventDefault(); // Предотвращаем стандартное действие кнопки (отправку формы)

        // Вызываем функцию регистрации
        await changeProfile();
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Получаем данные из sessionStorage
    const serialized = sessionStorage.getItem('profileData');

    if (!serialized) {
        return;
    }
    
    try {
        JSON.parse(serialized);
    } catch (e) {
        return;
    }

    const profileData = JSON.parse(serialized);

    if (profileData) {
        // Обновляем контент на странице
        const changeStudentProfile = document.getElementById('studentNameProfile');
        const changeSchoolProfile = document.getElementById('schoolNameProfile');
        const classNameProfile = document.getElementById('classNameProfile');
        const countryAndCityProfile = document.getElementById('countryCityProfile');

        changeStudentProfile.innerHTML = `${profileData.first_name} ${profileData.second_name} ${profileData.third_name}`;
        changeSchoolProfile.innerHTML = `${profileData.school_name}`;
        classNameProfile.innerHTML = `${profileData.school_class}${profileData.school_letter}`;
        countryAndCityProfile.innerHTML = `${profileData.country} - ${profileData.city}`;

        // Очищаем данные из sessionStorage после использования, если нужно
        sessionStorage.removeItem('profileData');
    } else {
        console.error('Данные профиля не найдены в sessionStorage');
    }
});

async function getProfileData() {
    const token = sessionStorage.getItem('token');

    if (!token) {
        console.error('Токен не найден в sessionStorage');
        return;
    }

    try {
        const response = await fetch('/students/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        const STUDENT_DATA = data.DATA;
        const FIRST_NAME = STUDENT_DATA.first_name.charAt(0).toUpperCase() + STUDENT_DATA.first_name.slice(1);
        const SECOND_NAME = STUDENT_DATA.last_name.charAt(0).toUpperCase() + STUDENT_DATA.last_name.slice(1);
        const THIRD_NAME = STUDENT_DATA.third_name.charAt(0).toUpperCase() + STUDENT_DATA.third_name.slice(1);
        const NAME_SCHOOL = STUDENT_DATA.name_school;
        const CLASS = STUDENT_DATA.class;
        const city = STUDENT_DATA.city;
        const country = STUDENT_DATA.country;

        let nameOfStudent = document.getElementById('studentNameProfile');
        nameOfStudent.innerHTML = `${FIRST_NAME} ${SECOND_NAME} ${THIRD_NAME}`;

        let schoolNameProfile = document.getElementById('schoolNameProfile');
        let classNameProfile = document.getElementById('classNameProfile');
        let countryCityProfile = document.getElementById('countryCityProfile');

        schoolNameProfile.innerHTML = `${NAME_SCHOOL}`;
        classNameProfile.innerHTML = `${CLASS}`;
        if (city == 'Не указано!!' || country == 'Не указано!!') { 
            countryCityProfile.innerHTML = "Не указано!!"
        }
        else {
            countryCityProfile.innerHTML = `${country} - ${city}`;
        }


    } catch (error) {
        console.error('Error:', error.message);
    }
}
// getProfileData();
document.addEventListener('DOMContentLoaded', () => {
    getProfileData();
});

// СОЗДАНИЕ ПРОЕКТА
async function createProject(project) {
    const token = sessionStorage.getItem('token');
    const idStudent = sessionStorage.getItem('id_student');
    const payload = { idStudent, token, project };
    const url = '/projects';

    try {
        const body = await postData(url, payload);
        const { projectId } = body;

        return projectId;
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// ОБНОВЛЕНИЕ ПРОЕКТА
async function updateProject(project, projectId) {
    const token = sessionStorage.getItem('token');
    const studentId = sessionStorage.getItem('id_student');
    const UpdateData = { token, projectId, studentId, project };
    const url = `/projects/${projectId}`;

    try {
        await putData(url, UpdateData);

        return projectId;
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// ПОЛУЧЕНИЕ ПРОЕКТА СТУДЕНТА ПО ЕГО ID
async function getProjectData() {
    const token = sessionStorage.getItem('token');
    const projectId = '1';
    const url = `/projects/${projectId}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const projectData = await response.json();
        console.log("Данные проекта:", projectData);
        // Обработка полученных данных, если необходимо
    } catch (error) {
        console.error('Error:', error.message);
    }
}
// getProjectData();

document.addEventListener('DOMContentLoaded', async () => {
    if (location.pathname.endsWith("Profile.html")) {
        const info = await getStudentProjectsInfo();
        const {ID_STUDENT, PROJECTS} = info;
        const listElement = document.getElementById("project-list");
        const cardElement = listElement.querySelector(".card");

        if(!PROJECTS?.length) {
            return;
        }

        listElement.addEventListener('click', async (event) => {
            const target = event.target;
            const isChange = target.classList.contains("button-change");
            const isDownload = target.classList.contains("button-download");
            const isDelete = target.classList.contains("button-delete");

            if (!(isChange || isDownload || isDelete)) {
                return;
            }

            const body = target.parentElement;
            const card = body.parentElement;
            const projectId = body.dataset.projectId;

            if (isChange) {
                const success = await requestChange(projectId);

                if (success) {
                    location.href = `${location.origin}/html/tmp.html?id=${projectId}&p=1`;
                }

                return;
            }

            if (isDownload) {
                const location = await downloadProject(projectId);

                if (!location) {
                    return;
                }

                immitateClick(location);

                return;
            }

            if (isDelete) {
                await deleteProject(projectId);
                listElement.removeChild(card);

                return;
            }
        });

        for (const project of PROJECTS) {
            const {PROJECT_ID, projects_name} = project;
            const clone = cardElement.cloneNode(true);
            const bodyElement = clone.querySelector(".card-body");
            const titleElement = clone.querySelector(".card-title");

            titleElement.innerHTML = projects_name;
            bodyElement.dataset.projectId = PROJECT_ID;
            bodyElement.dataset.studentId = ID_STUDENT;

            listElement.append(clone);

            clone.classList.remove("d-none");
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const logoutElement = document.getElementById("logout");

    if (logoutElement) {
        logoutElement.addEventListener("click", () => {
            sessionStorage.setItem('token', '');
            sessionStorage.setItem('id_student', '');
            sessionStorage.setItem('profileData', '');
        })
    }
});

function getCurrentParagraph() {
    const search = new URLSearchParams(location.search);
    let searchParagraph = search.get("p");
    let currentParagraph = 1;

    if (searchParagraph) {
        currentParagraph = Number(searchParagraph);
    }

    return currentParagraph;
}

async function storeProject(data, id) {
    if (id) {
        return await updateProject(data, id);
    } 

    return await createProject(data);
}

async function fetchParagraph(id) {
    const token = sessionStorage.getItem('token');

    if (!token) {
        return;
    }

    const url = `/stored/${id}`;
    const params = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    };

    try {
        const response = await fetch(url, params);
        const { status } = response;

        if (status === 404) {
            return;
        }

        const parsed = await response.json();
        const { text } = parsed;

        return text;
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function storeParagraph(text, id) {
    const token = sessionStorage.getItem('token');

    if (!token) {
        return;
    }

    const url = `/stored/${id}`;
    const params = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
    };

    try {
        const response = await fetch(url, params);
        const { status } = response;

        return status === 301;
    } catch (error) {
        console.error('Error:', error.message);
    }

    return false;
}

async function fetchParagraphs() {
    const token = sessionStorage.getItem('token');

    if (!token) {
        return;
    }

    const url = `/stored`;
    const params = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    };

    try {
        const response = await fetch(url, params);
        const { status } = response;

        if (status === 404) {
            return;
        }

        const body = await response.json();

        return body?.texts;
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function handleNextParagraph(event) {
    event.preventDefault();

    const search = new URLSearchParams(location.search);
    const text = tinymce.activeEditor.getContent();
    const projectId = search.get("id");
    const currentParagraph = getCurrentParagraph();
    const nextParagraph = currentParagraph + 1;

    await storeParagraph(text, currentParagraph);

    if (currentParagraph === 15) {
        const text = await fetchParagraphs();
        const id = await storeProject({
            projectName: "Проект",
            text,
        }, projectId);

        if (id === undefined) {
            return;
        }

        const location = await downloadProject(id);

        if (!location) {
            return;
        }

        immitateClick(location);

        return;
    }

    search.set("p", `${nextParagraph}`);
    location.search = `?${search.toString()}`;
}

document.addEventListener('DOMContentLoaded', async () => {
    const nextPElement = document.getElementById("next-paragraph");
    const paragraphElement = document.getElementById("paragraph-textarea");

    if (nextPElement) {
        nextPElement.addEventListener('click', handleNextParagraph);
    }

    if (paragraphElement) {
        const search = new URLSearchParams(location.search);
        const isEditing = search.has("id");

        if (isEditing) {
            const paragraph = getCurrentParagraph();
            const text = await fetchParagraph(paragraph);
    
            if (text) {
                setTimeout(() => tinymce.activeEditor.setContent(text), 1000);
            }
        }
    }
});

function immitateClick(location) {
    const a = document.createElement('a');
    a.href = location;
    a.classList.add("d-none");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}


// ПОЛУЧЕНИЕ ВСЕХ ПРОЕКТОВ СТУДЕНТА
async function getStudentProjectsInfo() {
    const token = sessionStorage.getItem('token');

    if (!token) {
        return;
    }

    const url = '/projects'; // Укажите правильный URL для получения проектов студента
    const params = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };

    try {
        const response = await fetch(url, params);
        const studentProjects = await response.json();

        return studentProjects.info;
    } catch (error) {
        console.error('Error:', error.message);
    }

    return [];
}
// getStudentProjects();



// const token = 'YOUR_ACCESS_TOKEN'; // Замените на ваш токен доступа
// const projectId = 'YOUR_PROJECT_ID'; // Замените на идентификатор проекта, который вы хотите удалить
// const url = `/students/me/projects/${projectId}`;

async function deleteProject(projectId) {
    const token = sessionStorage.getItem('token');
    const url = `/projects/${projectId}`; // Укажите правильный URL для получения проектов студента

    try {
        await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error('Ошибка:', error.message);
    }
}
// deleteProject();

async function requestChange(projectId) {
    const token = sessionStorage.getItem('token');
    const url = `/projects/${projectId}/edit`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });

        return response.status === 200;
    } catch (error) {
        console.error('Ошибка:', error.message);
    }

    return false;
}

async function downloadProject(projectId) {
    const token = sessionStorage.getItem('token');
    const url = `/projects/${projectId}/download`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            redirect: "manual",
        });

        const body = await response.json();
        const { location } = body;

        if (location) {
            return location;
        }
    } catch (error) {
        console.error('Ошибка:', error.message);
    }
}


// // Login user - пон надатию на кнопку выполняется функция loginUser();
// document.addEventListener('DOMContentLoaded', function () {
//     const signBtn = document.getElementById('signBtn');
//     if (signBtn) {
//         signBtn.addEventListener('click', function (event) {
//             event.preventDefault(); // Предотвращаем стандартное действие кнопки submit
//             console.log("login");
//             loginUser();
//         });
//     }
// });


// // Register User - по нажатию на кнопку выполняется функция resterUser();
// document.addEventListener('DOMContentLoaded', function () {
//     const registerBtn = document.getElementById('registerBtn');
//     if (registerBtn) {
//         registerBtn.addEventListener('click', function (event) {
//             event.preventDefault(); // Предотвращаем стандартное действие кнопки submit
//             console.log("reg");
//             registerUser();
//         });
//     }
// });


// // Change user - обновление данных по нажатию на кнопку изменить
// document.addEventListener('DOMContentLoaded', function () {
//     const savinBtn = document.getElementById('savingChange');
//     if (savinBtn) {
//         savinBtn.addEventListener('click', function (event) {
//             event.preventDefault(); // Предотвращаем стандартное действие кнопки submit
//             console.log("change info");
//             changeProfile();
//         });
//     }
// });