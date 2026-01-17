import { invoke } from "@tauri-apps/api/core";

// الحالة الحالية
let currentGoalId: number | null = null;

// عناصر الواجهة (تأكد أنها مطابقة للـ HTML الجديد)
const homePage = document.getElementById('home')!;
const detailPage = document.getElementById('detail')!;
const goalsList = document.getElementById('goals-list')!;
const todosList = document.getElementById('todos-list')!;
const goalModal = document.getElementById('goal-modal')!;

// 1. تحديث قائمة الأهداف
async function renderGoals() {
    const goals: any[] = await invoke("get_goals");
    goalsList.innerHTML = goals.map(g => {
        const total = g.todos.length;
        const done = g.todos.filter((t: any) => t.completed).length;
        const progress = total === 0 ? 0 : (done / total) * 100;
        return `
            <div onclick="openGoal(${g.id})" class="bg-slate-900 p-5 rounded-2xl border border-slate-800 cursor-pointer hover:border-purple-500 transition-all group relative">
                <div class="flex justify-between items-center mb-3">
                    <span class="font-bold text-lg group-hover:text-purple-400 transition-colors">${g.title}</span>
                    <div class="flex items-center gap-3">
                        <button onclick="deleteGoal(event, ${g.id})" 
                                class="text-slate-500 hover:text-red-500 transition-colors p-1" 
                                title="حذف الهدف">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                        <span class="text-sm text-slate-500 bg-slate-800 px-2 py-1 rounded-md">${done}/${total} مهام</span>
                    </div>
                </div>
                <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div style="width: ${progress}%" class="bg-gradient-to-l from-purple-500 to-pink-500 h-full transition-all duration-500"></div>
                </div>
            </div>
        `;
    }).join('');
}

// 2. تحديث قائمة المهام داخل الهدف
async function renderTodos() {
    const goals: any[] = await invoke("get_goals");
    const goal = goals.find(g => g.id === currentGoalId);
    if (!goal) return;

    document.getElementById('goal-title')!.innerText = goal.title;
    todosList.innerHTML = goal.todos.map((t: any) => `
        <div class="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div class="flex items-center gap-3">
                <input type="checkbox" ${t.completed ? 'checked' : ''} 
                       onchange="toggleTodo(${t.id})" 
                       class="w-5 h-5 accent-purple-600 rounded cursor-pointer">
                <span class="${t.completed ? 'line-through text-slate-500' : 'text-slate-200'}">${t.task}</span>
            </div>
            <button onclick="deleteTodo(${t.id})" class="text-red-400 hover:text-red-300 transition-colors text-sm">حذف</button>
        </div>
    `).join('');
}

// --- ربط الدوال بـ Window ليراها الـ HTML ---

(window as any).openGoal = (id: number) => {
    currentGoalId = id;
    homePage.classList.add('hidden');
    detailPage.classList.remove('hidden');
    renderTodos();
};

(window as any).goHome = () => {
    currentGoalId = null;
    detailPage.classList.add('hidden');
    homePage.classList.remove('hidden');
    renderGoals();
};

(window as any).toggleTodo = async (todoId: number) => {
    await invoke("toggle_todo", { goalId: currentGoalId, todoId });
    renderTodos();
};

(window as any).deleteTodo = async (todoId: number) => {
    if (confirm("هل أنت متأكد من حذف هذه المهمة؟")) {
        await invoke("delete_todo", { goalId: currentGoalId, todoId });
        renderTodos();
    }
};

// --- أزرار التحكم ---

// فتح وإغلاق المودال (باستخدام الكلاس active الذي أضفناه في CSS)
(window as any).closeGoalModal = () => goalModal.classList.remove('active');

document.getElementById('add-goal-btn')!.onclick = async () => {
    const input = document.getElementById('goal-input') as HTMLInputElement;
    if (input.value.trim()) {
        await invoke("add_goal", { title: input.value });
        input.value = "";
        goalModal.classList.remove('active');
        renderGoals();
    }
};

document.getElementById('add-todo-btn')!.onclick = async () => {
    const task = prompt("ما هي المهمة الجديدة؟");
    if (task && task.trim()) {
        await invoke("add_todo", { goalId: currentGoalId, task });
        renderTodos();
    }
};

// أضف هذه الوظيفة العالمية
(window as any).deleteGoal = async (e: Event, id: number) => {
    e.stopPropagation(); // لمنع فتح صفحة التفاصيل عند الضغط على حذف
    if (confirm("هل تريد حذف هذا الهدف نهائياً؟")) {
        await invoke("delete_goal", { goalId: id });
        renderGoals();
    }
};

// وتعديل بسيط في HTML الخاص بالبطاقة داخل renderGoals:
// أضف هذا الزر داخل الـ div الخاص بـ card
// <button onclick="deleteGoal(event, ${g.id})" class="text-red-500 hover:text-red-400 text-xs px-2">حذف</button>
// تشغيل العرض الأول
renderGoals();