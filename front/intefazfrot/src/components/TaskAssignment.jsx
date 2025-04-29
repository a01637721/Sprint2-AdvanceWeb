import React, { useState, useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import "./TaskAssignment.css"; // Importa el archivo CSS

const TaskAssignment = () => {
  const [taskPriority, setTaskPriority] = useState("");
  const [taskType, setTaskType] = useState("");
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [message, setMessage] = useState("");
  const [stompClient, setStompClient] = useState(null);

  useEffect(() => {
    // Configurar el cliente STOMP
    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str), // Opcional: para depuración
      reconnectDelay: 5000, // Intentar reconectar cada 5 segundos
      heartbeatIncoming: 4000, // Tiempo de espera para mensajes entrantes
      heartbeatOutgoing: 4000, // Tiempo de espera para mensajes salientes
    });

    client.onConnect = () => {
      console.log("Conectado al servidor WebSocket");
      client.subscribe("/topic/tasks", (message) => {
        const task = JSON.parse(message.body);
        setAssignedTasks((prevTasks) => [...prevTasks, task]);
      });
    };

    client.onStompError = (frame) => {
      console.error("Error en STOMP:", frame.headers["message"]);
    };

    client.activate();
    setStompClient(client);

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, []);

  const handleAssignTask = () => {
    if (!taskPriority || !taskType) {
      setMessage("Por favor selecciona una prioridad y un tipo de tarea.");
      return;
    }

    const taskData = {
      taskPriority,
      taskType,
    };

    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: "/app/assignTask",
        body: JSON.stringify(taskData),
      });
      setMessage("Tarea enviada para asignación.");
    } else {
      setMessage("Error al conectar con el servidor WebSocket.");
    }
  };

  return (
    <div className="task-container">
      <h1 className="heading">Asignación de Tareas al Equipo</h1>

      <div className="form-group">
        <label className="label">
          Prioridad de la tarea:
          <select
            className="select"
            onChange={(e) => setTaskPriority(e.target.value)}
            value={taskPriority}
          >
            <option value="">Seleccionar</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
        </label>
      </div>

      <div className="form-group">
        <label className="label">
          Tipo de tarea:
          <select
            className="select"
            onChange={(e) => setTaskType(e.target.value)}
            value={taskType}
          >
            <option value="">Seleccionar</option>
            <option value="Desarrollo">Desarrollo</option>
            <option value="Pruebas">Pruebas</option>
            <option value="Documentación">Documentación</option>
          </select>
        </label>
      </div>

      <button className="button" onClick={handleAssignTask}>
        Asignar Tarea
      </button>

      <p className="message">{message}</p>

      {/* Tabla de tareas asignadas */}
      <h2 className="table-heading">Tareas Asignadas</h2>
      <table className="task-table">
        <thead>
          <tr>
            <th className="table-header">Empleado</th>
            <th className="table-header">Rol</th>
            <th className="table-header">Prioridad</th>
            <th className="table-header">Tipo de Tarea</th>
          </tr>
        </thead>
        <tbody>
          {assignedTasks.length > 0 ? (
            assignedTasks.map((task, index) => (
              <tr key={index}>
                <td className="table-cell">{task.assignedMember}</td>
                <td className="table-cell">{task.role || "N/A"}</td>
                <td className="table-cell">{task.priority}</td>
                <td className="table-cell">{task.type}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="table-cell">
                No hay tareas asignadas
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TaskAssignment;
