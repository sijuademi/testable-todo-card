"use-strict";

let tasks = [
	{
		id: 1,
		title: "Testable Todo Item Card",
		desc: "Build a clean, modern Todo / Task Card component (or a small page containing one card)",
		priority: "High",
		status: "In Progress",
		due: "2026-04-16",
		tags: ["Work", "Urgent", "Task"],
		done: false,
	},
	{
		id: 2,
		title: "Write Q2 retrospective",
		desc: "Summarise wins, blockers, and action items for the engineering team.",
		priority: "Medium",
		status: "Pending",
		due: "2026-04-20",
		tags: ["Work"],
		done: false,
	},
];
let nextId = 3;
let pendingTags = [];

const titleEl = document.getElementById("f-title");
const addBtn = document.getElementById("add-btn");
const tagInput = document.getElementById("f-tag-input");
const tagChips = document.getElementById("tag-chips");

titleEl.addEventListener("input", () => {
	addBtn.disabled = titleEl.value.trim() === "";
});

titleEl.addEventListener("keydown", (e) => {
	if (e.key === "Enter") addTask();
});

tagInput.addEventListener("keydown", (e) => {
	if (e.key === "Enter" || e.key === ",") {
		e.preventDefault();
		const val = tagInput.value.trim().replace(/,/g, "");
		if (val && !pendingTags.includes(val) && pendingTags.length < 5) {
			pendingTags.push(val);
			renderPendingTags();
			tagInput.value = "";
		}
	}
	if (e.key === "Backspace" && tagInput.value === "" && pendingTags.length) {
		pendingTags.pop();
		renderPendingTags();
	}
});

function renderPendingTags() {
	tagChips.innerHTML = "";
	pendingTags.forEach((tag, i) => {
		const chip = document.createElement("span");
		chip.className = "tag-chip";
		chip.innerHTML = `${escHtml(tag)}<button type="button" aria-label="Remove tag ${escHtml(tag)}" onclick="removeTag(${i})"><svg viewBox="0 0 12 12" width="10" height="10" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round"><line x1="2" y1="2" x2="10" y2="10"/><line x1="10" y1="2" x2="2" y2="10"/></svg></button>`;
		tagChips.appendChild(chip);
	});
}

function removeTag(i) {
	pendingTags.splice(i, 1);
	renderPendingTags();
}

function addTask() {
	const title = titleEl.value.trim();
	if (!title) return;
	tasks.unshift({
		id: nextId++,
		title,
		desc: document.getElementById("f-desc").value.trim(),
		priority: document.getElementById("f-priority").value,
		status: document.getElementById("f-status").value,
		due: document.getElementById("f-due").value || null,
		tags: [...pendingTags],
		done: false,
	});
	resetForm();
	renderTasks();
}

function resetForm() {
	titleEl.value = "";
	document.getElementById("f-desc").value = "";
	document.getElementById("f-priority").value = "Medium";
	document.getElementById("f-status").value = "Pending";
	document.getElementById("f-due").value = "";
	pendingTags = [];
	renderPendingTags();
	addBtn.disabled = true;
	titleEl.focus();
}

function toggleDone(id) {
	const t = tasks.find((x) => x.id === id);
	if (!t) return;
	t.done = !t.done;
	t.status = t.done ? "Done" : "Pending";
	renderTasks();
}

function deleteTask(id) {
	if (!confirm("Delete this task?")) return;
	tasks = tasks.filter((x) => x.id !== id);
	renderTasks();
}

function friendlyTime(dateStr) {
	if (!dateStr) return null;
	const due = new Date(dateStr + "T23:59:00");
	const diff = due - Date.now();
	const abs = Math.abs(diff);
	const days = Math.round(abs / 86400000);
	const hrs = Math.round(abs / 3600000);
	const mins = Math.round(abs / 60000);
	if (diff < 0) {
		if (mins < 60)
			return {
				text: `Overdue by ${mins} min${mins !== 1 ? "s" : ""}`,
				cls: "overdue",
			};
		if (hrs < 24)
			return {
				text: `Overdue by ${hrs} hour${hrs !== 1 ? "s" : ""}`,
				cls: "overdue",
			};
		return {
			text: `Overdue by ${days} day${days !== 1 ? "s" : ""}`,
			cls: "overdue",
		};
	}
	if (days === 0) return { text: "Due today", cls: "soon" };
	if (days === 1) return { text: "Due tomorrow", cls: "soon" };
	if (days <= 3) return { text: `Due in ${days} days`, cls: "soon" };
	return { text: `Due in ${days} days`, cls: "" };
}

function fmtDate(dateStr) {
	if (!dateStr) return null;
	return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function priorityCls(p) {
	return p === "High" ? "p-high" : p === "Low" ? "p-low" : "p-medium";
}

function statusCls(s) {
	return s === "Done"
		? "s-done"
		: s === "In Progress"
			? "s-progress"
			: "s-pending";
}

function escHtml(s) {
	return String(s)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

function renderTasks() {
	const list = document.getElementById("task-list");
	const badge = document.getElementById("count-badge");
	const total = tasks.length;
	badge.textContent = `${total} task${total !== 1 ? "s" : ""}`;

	if (!total) {
		list.innerHTML =
			'<div class="empty" role="status">No tasks yet — add one above</div>';
		return;
	}

	list.innerHTML = tasks
		.map((t) => {
			const tr = friendlyTime(t.due);
			const dueFmt = fmtDate(t.due);

			const tagsHtml = t.tags.length
				? `<div class="tags-row" data-testid="test-todo-tags" role="list" aria-label="Tags">${t.tags
						.map(
							(tag) =>
								`<span class="tag" data-testid="test-todo-tag-${escHtml(tag.toLowerCase())}" role="listitem">${escHtml(tag)}</span>`,
						)
						.join("")}</div>`
				: `<div data-testid="test-todo-tags" style="display:none"></div>`;

			const dateHtml = dueFmt
				? `<span class="meta">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <time data-testid="test-todo-due-date" datetime="${escHtml(t.due)}">Due ${escHtml(dueFmt)}</time>
          </span>`
				: "";

			const timeHtml = tr
				? `<span class="meta ${tr.cls}" aria-live="polite">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <time data-testid="test-todo-time-remaining" aria-label="${escHtml(tr.text)}">${escHtml(tr.text)}</time>
          </span>`
				: `<time data-testid="test-todo-time-remaining" style="display:none"></time>`;

			return `
        <article
          class="todo-card${t.done ? " is-done" : ""}"
          data-testid="test-todo-card"
          role="listitem"
          aria-label="Task: ${escHtml(t.title)}"
        >
          <div class="card-header">
            <div class="cb-wrap">
              <label for="cb-${t.id}" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">
                Mark "${escHtml(t.title)}" as complete
              </label>
              <input
                type="checkbox"
                id="cb-${t.id}"
                data-testid="test-todo-complete-toggle"
                ${t.done ? "checked" : ""}
                aria-label="Mark task as complete"
                onchange="toggleDone(${t.id})"
              />
            </div>

            <div class="title-block">
              <h2 class="todo-title${t.done ? " done" : ""}" data-testid="test-todo-title">
                ${escHtml(t.title)}
              </h2>
              <div class="badge-row">
                <span
                  class="badge ${priorityCls(t.priority)}"
                  data-testid="test-todo-priority"
                  role="status"
                  aria-label="Priority: ${escHtml(t.priority)}"
                >${escHtml(t.priority)}</span>
                <span
                  class="badge ${statusCls(t.status)}"
                  data-testid="test-todo-status"
                  role="status"
                  aria-label="Status: ${escHtml(t.status)}"
                >${escHtml(t.status)}</span>
              </div>
            </div>

            <div class="action-btns">
              <button
                class="icon-btn"
                data-testid="test-todo-edit-button"
                aria-label="Edit task"
                onclick="console.log('edit clicked', ${t.id})"
                tabindex="0"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/>
                </svg>
              </button>
              <button
                class="icon-btn del"
                data-testid="test-todo-delete-button"
                aria-label="Delete task"
                onclick="deleteTask(${t.id})"
                tabindex="0"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6"/><path d="M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </button>
            </div>
          </div>

          <p class="todo-desc" data-testid="test-todo-description" ${!t.desc ? 'style="display:none"' : ""}>
            ${escHtml(t.desc)}
          </p>

          ${
						dateHtml || timeHtml
							? `<div class="meta-row">${dateHtml}${timeHtml}</div>`
							: ""
					}

          ${tagsHtml}
        </article>
      `;
		})
		.join("");
}

renderTasks();
setInterval(renderTasks, 60000);
