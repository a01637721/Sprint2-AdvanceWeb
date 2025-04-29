import React, { useEffect, useState } from "react";

function TaskTable() {
  const [tasks, setTasks] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [selectedDeveloper, setSelectedDeveloper] = useState("");

  useEffect(() => {
    // Llamada al backend para obtener todas las tareas
    fetch("http://localhost:8080/api/tasks")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al obtener las tareas");
        }
        return response.json();
      })
      .then((data) => {
        setTasks(data);

        // Extraer la lista de desarrolladores únicos
        const uniqueDevelopers = [...new Set(data.map((task) => task.assignedMember))];
        setDevelopers(uniqueDevelopers);
      })
      .catch((error) => console.error("Error:", error));
  }, []);

  // Filtrar las tareas según el desarrollador seleccionado
  const filteredTasks =
    selectedDeveloper === ""
      ? tasks
      : tasks.filter((task) => task.assignedMember === selectedDeveloper);

  // Función para marcar una tarea como completa
  const markAsComplete = (taskId) => {
    fetch(`http://localhost:8080/api/tasks/${taskId}/status?status=completed`, {
      method: "PUT",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al actualizar el estado de la tarea");
        }
        return response.text();
      })
      .then((message) => {
        console.log(message);

        // Actualizar el estado de la tarea en el frontend
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId ? { ...task, status: "completed" } : task
          )
        );
      })
      .catch((error) => console.error("Error:", error));
  };

  return (
    <div className="task-container">
      <h2>Todas las Tareas Creadas</h2>

      <div className="filter-container">
        <label htmlFor="developer-filter">Filtrar por Developer:</label>
        <select
          id="developer-filter"
          value={selectedDeveloper}
          onChange={(e) => setSelectedDeveloper(e.target.value)}
        >
          <option value="">Todos</option>
          {developers.map((developer, index) => (
            <option key={developer || index} value={developer}>
              {developer}
            </option>
          ))}
        </select>
      </div>

      <table className="task-table">
        <thead>
          <tr>
            <th className="table-header">ID</th>
            <th className="table-header">Prioridad</th>
            <th className="table-header">Tipo</th>
            <th className="table-header">Asignado a</th>
            <th className="table-header">Rol</th>
            <th className="table-header">Estado</th>
            <th className="table-header">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task, index) => (
              <tr key={task.id || index}>
                <td className="table-cell">{task.id || "N/A"}</td>
                <td className="table-cell">{task.priority || "N/A"}</td>
                <td className="table-cell">{task.type || "N/A"}</td>
                <td className="table-cell">{task.assignedMember || "N/A"}</td>
                <td className="table-cell">{task.role || "Sin Rol"}</td>
                <td className="table-cell">{task.status || "pending"}</td>
                <td className="table-cell">
                  {task.status !== "completed" && (
                    <button
                      className="complete-button"
                      onClick={() => markAsComplete(task.id)}
                    >
                      Marcar como Completa
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="table-cell">
                No hay tareas creadas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TaskTable;