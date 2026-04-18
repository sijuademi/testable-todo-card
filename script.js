"use strict";

const DESCRIPTION_COLLAPSE_THRESHOLD = 120;
const TIME_REFRESH_INTERVAL_MS = 30000;

let tasks = [
	{
		id: 1,
		title: "Complete Stage 1 Integration",
		desc: "Ensure all test-ids are present, the priority bar changes color, and the status dropdown syncs perfectly with the checkbox. This description is long enough to trigger the expand/collapse behavior to ensure accessibility requirements are met.",
		priority: "High",
		status: "In Progress",
		due: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Due tomorrow
		tags: ["Work", "Stage 1"],
		done: false,
		expanded: false,
	},
];

let currentlyEditingTaskId = null;
let currentFilter = "all";

function setActiveFilter(filter, element) {
	currentFilter = filter;
	document.querySelectorAll(".filter-button").forEach((btn) => {
		btn.classList.remove("filter-button--active");
	});
	element.classList.add("filter-button--active");
	renderTaskList();
}

function toggleTaskCompletion(taskId, isChecked) {
	const task = tasks.find((t) => t.id === taskId);
	if (!task) return;
	task.done = isChecked;
	task.status = isChecked ? "Done" : "Pending";
	renderTaskList();
}

function updateTaskStatus(taskId, newStatus) {
	const task = tasks.find((t) => t.id === taskId);
	if (!task) return;
	task.status = newStatus;
	task.done = newStatus === "Done";
	renderTaskList();
}

function openEditForm(taskId) {
	currentlyEditingTaskId = taskId;
	renderTaskList();
	// Move focus to first input
	setTimeout(() => {
		const input = document.getElementById(`edit-input-title-${taskId}`);
		if (input) input.focus();
	}, 0);
}

function saveTaskEdits(taskId) {
	const task = tasks.find((t) => t.id === taskId);
	const newTitle = document
		.getElementById(`edit-input-title-${taskId}`)
		.value.trim();

	if (!newTitle) return;

	task.title = newTitle;
	task.desc = document.getElementById(`edit-input-description-${taskId}`).value;
	task.priority = document.getElementById(
		`edit-input-priority-${taskId}`,
	).value;
	task.due =
		document.getElementById(`edit-input-due-date-${taskId}`).value || null;

	currentlyEditingTaskId = null;
	renderTaskList();
}

function deleteTask(taskId) {
	tasks = tasks.filter((t) => t.id !== taskId);
	currentlyEditingTaskId = null;
	renderTaskList();
}

function cancelTaskEdit() {
	currentlyEditingTaskId = null;
	renderTaskList();
}

document.addEventListener("keydown", (e) => {
	if (currentlyEditingTaskId === null) return;

	if (e.key === "Escape") cancelTaskEdit();

	if (e.key === "Tab") {
		const form = document.querySelector('[data-testid="test-todo-edit-form"]');
		const focusables = form.querySelectorAll("input, textarea, select, button");
		const first = focusables[0];
		const last = focusables[focusables.length - 1];

		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first.focus();
		}
	}
});

function getTimeRemainingInfo(isoDateString, isTaskDone) {
	if (isTaskDone)
		return { text: "Completed", cssClass: "meta-item--done", isOverdue: false };
	if (!isoDateString) return null;

	const dueDate = new Date(isoDateString + "T23:59:00");
	const diff = dueDate - Date.now();
	const absDiff = Math.abs(diff);

	const mins = Math.floor(absDiff / 60000);
	const hours = Math.floor(absDiff / 3600000);
	const days = Math.floor(absDiff / 86400000);

	if (diff > 0) {
		let timeStr =
			days > 0
				? `${days} day${days > 1 ? "s" : ""}`
				: hours > 0
					? `${hours} hour${hours > 1 ? "s" : ""}`
					: `${mins} minute${mins > 1 ? "s" : ""}`;
		return {
			text: `Due in ${timeStr}`,
			cssClass: "meta-item--soon",
			isOverdue: false,
		};
	} else {
		let timeStr =
			days > 0
				? `${days} day${days > 1 ? "s" : ""}`
				: hours > 0
					? `${hours} hour${hours > 1 ? "s" : ""}`
					: `${mins} minute${mins > 1 ? "s" : ""}`;
		return {
			text: `Overdue by ${timeStr}`,
			cssClass: "meta-item--overdue",
			isOverdue: true,
		};
	}
}

function buildTaskCardHTML(task) {
	const isEditing = currentlyEditingTaskId === task.id;
	const timeInfo = getTimeRemainingInfo(task.due, task.done);
	const isLong = task.desc.length > DESCRIPTION_COLLAPSE_THRESHOLD;
	const priorityClass = `priority-bar--${task.priority.toLowerCase()}`;

	if (isEditing) {
		return `
        <article class="task-card" data-testid="test-todo-card">
            <div class="card-layout">
                <div class="priority-bar ${priorityClass}" data-testid="test-todo-priority-indicator"></div>
                <div class="card-body" data-testid="test-todo-edit-form">
                    <div class="edit-form-field">
                        <label for="edit-input-title-${task.id}">Title</label>
                        <input id="edit-input-title-${task.id}" data-testid="test-todo-edit-title-input" type="text" value="${task.title}">
                    </div>
                    <div class="edit-form-field">
                        <label for="edit-input-description-${task.id}">Description</label>
                        <textarea id="edit-input-description-${task.id}" data-testid="test-todo-edit-description-input">${task.desc}</textarea>
                    </div>
                    <div class="edit-form-row">
                        <div class="edit-form-field">
                            <label for="edit-input-priority-${task.id}">Priority</label>
                            <select id="edit-input-priority-${task.id}" data-testid="test-todo-edit-priority-select">
                                <option value="Low" ${task.priority === "Low" ? "selected" : ""}>Low</option>
                                <option value="Medium" ${task.priority === "Medium" ? "selected" : ""}>Medium</option>
                                <option value="High" ${task.priority === "High" ? "selected" : ""}>High</option>
                            </select>
                        </div>
                        <div class="edit-form-field">
                            <label for="edit-input-due-date-${task.id}">Due Date</label>
                            <input id="edit-input-due-date-${task.id}" data-testid="test-todo-edit-due-date-input" type="date" value="${task.due || ""}">
                        </div>
                    </div>
                    <div class="edit-form-actions">
                        <button class="button" data-testid="test-todo-cancel-button" onclick="cancelTaskEdit()">Cancel</button>
                        <button class="button button--primary" data-testid="test-todo-save-button" onclick="saveTaskEdits(${task.id})">Save Changes</button>
                    </div>
                </div>
            </div>
        </article>`;
	}

	return `
    <article class="task-card ${task.done ? "task-card--completed" : ""}" data-testid="test-todo-card">
        <div class="card-layout">
            <div class="priority-bar ${priorityClass}" data-testid="test-todo-priority-indicator"></div>
            <div class="card-body">
                <div class="card-header">
                    <input type="checkbox" data-testid="test-todo-complete-toggle" aria-label="Toggle Complete" ${task.done ? "checked" : ""} onchange="toggleTaskCompletion(${task.id}, this.checked)">
                    <div>
                        <h2 class="task-title ${task.done ? "task-title--completed" : ""}" data-testid="test-todo-title">${task.title}</h2>
                        <span class="priority-badge priority-badge--${task.priority.toLowerCase()}" data-testid="test-todo-priority-badge">${task.priority}</span>
                    </div>
                    <div class="card-actions">
                        <button class="icon-button" data-testid="test-todo-edit-button" onclick="openEditForm(${task.id})" aria-label="Edit task">
                            <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        </button>
                        <button class="icon-button icon-button--danger" data-testid="test-todo-delete-button" onclick="deleteTask(${task.id})" aria-label="Delete task">
                            <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                        </button>
                    </div>
                </div>
                
                <div class="status-row">
                    <label class="status-label" for="status-ctrl-${task.id}">Status</label>
                    <select id="status-ctrl-${task.id}" class="status-select" data-testid="test-todo-status-control" onchange="updateTaskStatus(${task.id}, this.value)">
                        <option value="Pending" ${task.status === "Pending" ? "selected" : ""}>Pending</option>
                        <option value="In Progress" ${task.status === "In Progress" ? "selected" : ""}>In Progress</option>
                        <option value="Done" ${task.status === "Done" ? "selected" : ""}>Done</option>
                    </select>
                </div>

                <div class="description-area">
                    <div id="collapsible-${task.id}" class="${isLong && !task.expanded ? "description-text--clamped" : ""}" data-testid="test-todo-collapsible-section">
                        <p class="description-text" data-testid="test-todo-description">${task.desc}</p>
                    </div>
                    ${
											isLong
												? `
                        <button class="expand-button" data-testid="test-todo-expand-toggle" aria-expanded="${task.expanded}" aria-controls="collapsible-${task.id}" onclick="toggleDescriptionExpanded(${task.id})">
                            ${task.expanded ? "Show Less" : "Show More"}
                        </button>`
												: ""
										}
                </div>

                <div class="meta-row">
                    <div class="meta-item ${timeInfo?.cssClass || ""}" aria-live="polite">
                        <span data-testid="test-todo-time-remaining">${timeInfo?.text || "No deadline"}</span>
                    </div>
                    ${timeInfo?.isOverdue ? `<span class="overdue-badge" data-testid="test-todo-overdue-indicator">Overdue</span>` : '<span data-testid="test-todo-overdue-indicator" style="display:none"></span>'}
                </div>
            </div>
        </div>
    </article>`;
}

function toggleDescriptionExpanded(taskId) {
	const task = tasks.find((t) => t.id === taskId);
	if (task) {
		task.expanded = !task.expanded;
		renderTaskList();
	}
}

function renderTaskList() {
	const list = document.getElementById("task-list");

	let filteredTasks = tasks;
	if (currentFilter === "active") {
		filteredTasks = tasks.filter((t) => !t.done);
	} else if (currentFilter === "done") {
		filteredTasks = tasks.filter((t) => t.done);
	} else if (currentFilter === "overdue") {
		filteredTasks = tasks.filter((t) => {
			if (t.done) return false;
			if (!t.due) return false;
			const dueDate = new Date(t.due + "T23:59:00");
			return dueDate < Date.now();
		});
	}

	const totalCount = tasks.length;
	const overdueCount = tasks.filter((t) => {
		if (t.done) return false;
		if (!t.due) return false;
		const dueDate = new Date(t.due + "T23:59:00");
		return dueDate < Date.now();
	}).length;
	const doneCount = tasks.filter((t) => t.done).length;

	document.getElementById("stat-total").textContent =
		`${totalCount} ${totalCount === 1 ? "task" : "tasks"}`;
	const overdueBadge = document.getElementById("stat-overdue");
	const doneBadge = document.getElementById("stat-done");

	if (overdueCount > 0) {
		overdueBadge.textContent = `${overdueCount} ${overdueCount === 1 ? "overdue" : "overdue"}`;
		overdueBadge.hidden = false;
	} else {
		overdueBadge.hidden = true;
	}

	if (doneCount > 0) {
		doneBadge.textContent = `${doneCount} ${doneCount === 1 ? "done" : "done"}`;
		doneBadge.hidden = false;
	} else {
		doneBadge.hidden = true;
	}

	if (filteredTasks.length === 0) {
		list.innerHTML = `<div class="empty-state">No tasks to display</div>`;
	} else {
		list.innerHTML = filteredTasks.map(buildTaskCardHTML).join("");
	}
}

renderTaskList();
setInterval(renderTaskList, TIME_REFRESH_INTERVAL_MS);
