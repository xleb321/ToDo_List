const newTask = document.querySelector(".newTaskForm");
const taskInput = document.querySelector(".newTaskText");
const taskData = document.querySelector(".newTaskBeforeData");
const taskTime = document.querySelector(".newTaskBeforeTime");
const settingsSelect = document.querySelectorAll(".optionSelest");

const taskList = document.querySelector(".taskList");
let interval;

// Сохранение в localStorage
let storage = localStorage.getItem("tasks")
  ? JSON.parse(localStorage.getItem("tasks"))
  : [];

// Защита
const FescapeHtml = (text) => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/`/g, "&#96;");
};

// Сколько осталось до конца задачи
const FtimeСheck = (classTask = "task") => {
  const date = new Date();
  const tasks = taskList.querySelectorAll(`.${classTask}`);

  for (const task of tasks) {
    if (task.classList.contains("complite")) continue;
    const taskData = task.querySelector(".taskData")?.textContent;
    const taskTime = task.querySelector(".taskTime")?.textContent;
    // Сколько до конечного срока задачи дней
    const time =
      new Date(`${taskData}T${taskTime}:00`).getTime() - date.getTime();

    const daysRemaining = Math.ceil(time / (1000 * 60 * 60 * 24));

    if (daysRemaining <= 0) {
      task.classList.add("taskOverdue");
    } else if (daysRemaining < 3) {
      task.classList.add("taskSoon");
    } else if (daysRemaining < 8) {
      task.classList.add("taskMake");
    }
  }

  return true;
};

// Генерация задач
const FgenerateTask = (text, data, time, compliting = false) => {
  const task = document.createElement("div");
  task.classList.add("task");
  if (compliting) {
    task.classList.add("taskComplite");
  }
  // Заполнение информацией
  task.innerHTML = `
    <div class="taskText">
      ${FescapeHtml(text)}
    </div>
    <div class='taskNoun'>
      <div class="taskData">${data}</div>
      <div class="taskTime">${time}</div>
    </div>
    <div class='taskButtons'>
      <button class="taskCompliteBTN">
        <i class='bx bxs-comment' ></i>
        <i class='bx bxs-comment-check' ></i>
      </button>
      <button class="taskDeleteBTN">
        <i class='bx bxs-trash' ></i>
        <i class='bx bxs-trash bx-tada' ></i>
      </button>
    </div>
    
  `;
  taskList.appendChild(task);

  if (!interval) {
    FtimeСheck("task");
  }

  // Выполнено
  task.querySelector(".taskCompliteBTN").addEventListener("click", () => {
    task.classList.toggle("taskComplite");
    FsaveTaskInStorage(
      text,
      data,
      time,
      task.classList.contains("taskComplite")
    );
  });

  // Удалить задачу
  task.querySelector(".taskDeleteBTN").addEventListener("click", () => {
    task.remove();
  });

  return true;
};

// Флаги сортировки
const FsortedTask = (data, value) => {
  let settings = taskList.dataset.settings
    ? JSON.parse(taskList.dataset.settings)
    : {};
  settings[data] = value;
  taskList.dataset.settings = JSON.stringify(settings);
};

// Перезапись и сохранение задачи
const FsaveTaskInStorage = (text, data, time, compliting = false) => {
  storage = localStorage.getItem("tasks")
    ? JSON.parse(localStorage.getItem("tasks"))
    : [];

  const searchTask = storage.find((task) => task.task == text);

  if (searchTask) {
    searchTask.complite = compliting;
  } else {
    storage.push({
      task: text,
      beforeDate: data,
      beforeTime: time,
      complite: compliting,
    });
  }

  localStorage.setItem("tasks", JSON.stringify(storage));
};

// Сбор данных о задаче
newTask.addEventListener("submit", (e) => {
  e.preventDefault();
  const task = taskInput.value.trim();
  const beforeDate = taskData.value;
  const beforeTime = taskTime.value;

  if (!task || !beforeDate || !beforeTime) return;
  FgenerateTask(task, beforeDate, beforeTime);
  FsaveTaskInStorage(task, beforeDate, beforeTime, false);

  taskInput.value = "";
  taskData.value = "";
  taskTime.value = "";
});

// Сортировка задач
settingsSelect.forEach((select) => {
  select.addEventListener("change", () => {
    const selected = select.value;
    FsortedTask(select.dataset.value, selected);
  });
});

// Автогенерация сохранённых задач
storage.forEach((task) => {
  FgenerateTask(task.task, task.beforeDate, task.beforeTime, task.complite);
});

// Автоизменение высоты textarea
document.querySelectorAll("textarea").forEach((textarea) => {
  textarea.addEventListener("input", (e) => {
    textarea.style.height = "auto";
    textarea.style.height = `${
      textarea.scrollHeight < 100 ? textarea.scrollHeight : 100
    }px`;
  });
});

interval = setInterval(() => {
  FtimeСheck();
}, 10000);
