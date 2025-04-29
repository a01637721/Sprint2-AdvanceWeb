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
          </tr>
        </thead>
        <tbody>
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task, index) => (
              <tr key={task.id || index}> {/* Usa `task.id` si está disponible, de lo contrario usa el índice */}
                <td className="table-cell">{task.id || "N/A"}</td>
                <td className="table-cell">{task.priority || "N/A"}</td>
                <td className="table-cell">{task.type || "N/A"}</td>
                <td className="table-cell">{task.assignedMember || "N/A"}</td>
                <td className="table-cell">{task.role || "Sin Rol"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="table-cell">
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