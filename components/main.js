const newTask = document.querySelector(".newTaskForm");
const taskInput = document.querySelector(".newTaskText");
const taskData = document.querySelector(".newTaskBeforeData");
const taskTime = document.querySelector(".newTaskBeforeTime");
const settingsSelect = document.querySelectorAll(".optionSelest");

const taskList = document.querySelector(".taskList");
let interval;

let storage = localStorage.getItem("tasks")
  ? JSON.parse(localStorage.getItem("tasks"))
  : [];

const FescapeHtml = (text) => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/`/g, "&#96;");
};

const FtimeСheck = (classTask = "task") => {
  interval = setInterval(() => {
    const date = new Date();
    const tasks = taskList.querySelectorAll(`.${classTask}`);

    for (const task of tasks) {
      if (task.classList.contains("complite")) continue;
      const taskData = task.querySelector(".taskData")?.textContent;
      const taskTime = task.querySelector(".taskTime")?.textContent;
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
  }, 1000);

  return true;
};

const FgenerateTask = (text, data, time, compliting = false) => {
  const task = document.createElement("div");
  task.classList.add("task");
  if (compliting) {
    task.classList.add("taskComplite");
  }
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

  task.querySelector(".taskCompliteBTN").addEventListener("click", () => {
    task.classList.toggle("taskComplite");
    FsaveTaskInStorage(
      text,
      data,
      time,
      task.classList.contains("taskComplite")
    );
  });

  task.querySelector(".taskDeleteBTN").addEventListener("click", () => {
    task.remove();
  });

  return true;
};

const FsortedTask = (data, value) => {
  let settings = taskList.dataset.settings
    ? JSON.parse(taskList.dataset.settings)
    : {};
  settings[data] = value;
  taskList.dataset.settings = JSON.stringify(settings);
};

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

newTask.addEventListener("submit", (e) => {
  e.preventDefault();
  const task = taskInput.value.trim();
  const beforeDate = taskData.value;
  const beforeTime = taskTime.value;

  if (!task || !beforeDate || !beforeTime) return;
  FgenerateTask(task, beforeDate, beforeTime);
  FsaveTaskInStorage(task, beforeDate, beforeTime, false);

  task.textContent = "";
  taskData.value = "";
  taskTime.value = "";
});

settingsSelect.forEach((select) => {
  select.addEventListener("change", () => {
    const selected = select.value;
    FsortedTask(select.dataset.value, selected);
  });
});

storage.forEach((task) => {
  FgenerateTask(task.task, task.beforeDate, task.beforeTime, task.complite);
});

document.querySelectorAll("textarea").forEach((textarea) => {
  textarea.addEventListener("input", (e) => {
    textarea.style.height = "auto";
    textarea.style.height = `${
      textarea.scrollHeight < 100 ? textarea.scrollHeight : 100
    }px`;
  });
});
