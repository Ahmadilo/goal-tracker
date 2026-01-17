use serde::{Serialize, Deserialize};
use std::fs;
use std::sync::Mutex;
use tauri::{AppHandle, Manager, State};
use tauri::path::BaseDirectory;

// تعريف المهمة
#[derive(Serialize, Deserialize, Clone, Debug)]
struct Todo {
    id: u32,
    task: String,
    completed: bool,
}

// تعريف الهدف
#[derive(Serialize, Deserialize, Clone, Debug)]
struct Goal {
    id: u32,
    title: String,
    todos: Vec<Todo>,
}

// مدير البيانات (State)
struct AppData(Mutex<Vec<Goal>>);

// دالة مساعدة لحفظ البيانات في ملف JSON
 // تأكد من إضافة هذا السطر في الأعلى

fn save_to_json(app_handle: &AppHandle, goals: &Vec<Goal>) {
    // الطريقة الصحيحة في Tauri 2.0 للوصول للمسارات
    let path = app_handle.path().resolve("data.json", BaseDirectory::AppData).unwrap();
    
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).ok();
    }
    let json = serde_json::to_string_pretty(goals).unwrap();
    fs::write(path, json).ok();
}

// دالة مساعدة لتحميل البيانات
fn load_from_json(app_handle: &AppHandle) -> Vec<Goal> {
    let path = app_handle.path().app_data_dir().unwrap().join("data.json");
    if let Ok(data) = fs::read_to_string(path) {
        serde_json::from_str(&data).unwrap_or_else(|_| vec![])
    } else {
        vec![]
    }
}

// --- الـ Commands المطلوبة ---

#[tauri::command]
fn get_goals(state: State<AppData>) -> Vec<Goal> {
    state.0.lock().unwrap().clone()
}

#[tauri::command]
fn add_goal(state: State<AppData>, handle: AppHandle, title: String) {
    let mut goals = state.0.lock().unwrap();
    let new_id = (goals.len() as u32) + 1;
    goals.push(Goal { id: new_id, title, todos: vec![] });
    save_to_json(&handle, &goals);
}

#[tauri::command]
fn add_todo(state: State<AppData>, handle: AppHandle, goal_id: u32, task: String) {
    let mut goals = state.0.lock().unwrap();
    if let Some(goal) = goals.iter_mut().find(|g| g.id == goal_id) {
        let new_id = (goal.todos.len() as u32) + 1;
        goal.todos.push(Todo { id: new_id, task, completed: false });
    }
    save_to_json(&handle, &goals);
}

#[tauri::command]
fn toggle_todo(state: State<AppData>, handle: AppHandle, goal_id: u32, todo_id: u32) {
    let mut goals = state.0.lock().unwrap();
    if let Some(goal) = goals.iter_mut().find(|g| g.id == goal_id) {
        if let Some(todo) = goal.todos.iter_mut().find(|t| t.id == todo_id) {
            todo.completed = !todo.completed;
        }
    }
    save_to_json(&handle, &goals);
}

#[tauri::command]
fn delete_todo(state: State<AppData>, handle: AppHandle, goal_id: u32, todo_id: u32) {
    let mut goals = state.0.lock().unwrap();
    if let Some(goal) = goals.iter_mut().find(|g| g.id == goal_id) {
        goal.todos.retain(|t| t.id != todo_id);
    }
    save_to_json(&handle, &goals);
}

#[tauri::command]
fn delete_goal(state: State<AppData>, handle: AppHandle, goal_id: u32) {
    let mut goals = state.0.lock().unwrap();
    goals.retain(|g| g.id != goal_id); // حذف الهدف الذي يحمل هذا الـ ID
    save_to_json(&handle, &goals);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let initial_data = load_from_json(&app.handle());
            app.manage(AppData(Mutex::new(initial_data)));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_goals, add_goal, add_todo, toggle_todo, delete_todo, delete_goal
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}