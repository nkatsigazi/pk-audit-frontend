import { useEffect, useState } from 'react';
import axios from 'axios';

// 1. Define the shape of a Task
interface Task {
  id: number;
  description: string;
  completed: boolean;
}

export default function Tasks() {
  // 2. Tell useState to expect an array of Tasks
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>('');

  useEffect(() => {
    axios.get<Task[]>('https://pk-audit-frontend.onrender.com/tasks')
      .then(res => setTasks(res.data))
      .catch(err => console.error(err));
  }, []);

  const addTask = async () => {
    if (!newTask.trim()) return;
    try {
      // 3. Axios can also take a generic type for the response data
      const res = await axios.post<Task>('https://pk-audit-frontend.onrender.com/tasks', { description: newTask });
      setTasks([...tasks, res.data]);
      setNewTask('');
    } catch (err) {
      console.error(err);
    }
  };

  // 4. Annotate parameters to avoid 'any' implicit errors
  const toggleComplete = async (id: number, completed: boolean) => {
    try {
      await axios.patch(`https://pk-audit-frontend.onrender.com/tasks/${id}`, { completed: !completed });
      setTasks(tasks.map(t => t.id === id ? { ...t, completed: !completed } : t));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h3>Tasks</h3>
      <div className="input-group mb-3">
        <input 
          type="text" 
          className="form-control" 
          value={newTask} 
          onChange={e => setNewTask(e.target.value)} 
          placeholder="New task description" 
        />
        <button className="btn btn-primary" onClick={addTask}>Add</button>
      </div>
      <ul className="list-group">
        {tasks.map(task => (
          <li key={task.id} className="list-group-item d-flex justify-content-between">
            <span className={task.completed ? 'text-decoration-line-through' : ''}>
                {task.description}
            </span>
            <input 
                type="checkbox" 
                checked={task.completed} 
                onChange={() => toggleComplete(task.id, task.completed)} 
            />
          </li>
        ))}
      </ul>
    </div>
  );
}