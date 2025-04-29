import React, { useState, useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import "./TaskAssignment.css"; // Importa el archivo CSS

const TaskAssignment = () => {
  const [taskPriority, setTaskPriority] = useState("");
  const [taskType, setTaskType] = useState("");
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [availableWorkers, setAvailableWorkers] = useState([]); // Trabajadores disponibles
  const [pendingTasks, setPendingTasks] = useState([]); // Tareas pendientes
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

  useEffect(() => {
    // Obtener trabajadores disponibles desde el backend
    fetch("http://localhost:8080/api/workers/available")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al obtener los trabajadores disponibles");
        }
        return response.json();
      })
      .then((data) => setAvailableWorkers(data))
      .catch((error) => console.error("Error:", error));

    // Obtener tareas pendientes desde el backend
    fetch("http://localhost:8080/api/tasks?status=pending")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al obtener las tareas pendientes");
        }
        return response.json();
      })
      .then((data) => setPendingTasks(data))
      .catch((error) => console.error("Error:", error));
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

      {/* Tabla de trabajadores disponibles */}
      <h2 className="table-heading">Trabajadores Disponibles</h2>
      <table className="task-table">
        <thead>
          <tr>
            <th className="table-header">Nombre</th>
            <th className="table-header">Rol</th>
            <th className="table-header">Tareas Asignadas</th>
          </tr>
        </thead>
        <tbody>
          {availableWorkers.length > 0 ? (
            availableWorkers.map((worker, index) => (
              <tr key={index}>
                <td className="table-cell">{worker.name}</td>
                <td className="table-cell">{worker.role}</td>
                <td className="table-cell">{worker.taskCount}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="table-cell">
                No hay trabajadores disponibles
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Tabla de tareas pendientes */}
      <h2 className="table-heading">Tareas Pendientes</h2>
      <table className="task-table">
        <thead>
          <tr>
            <th className="table-header">ID</th>
            <th className="table-header">Prioridad</th>
            <th className="table-header">Tipo</th>
            <th className="table-header">Asignado a</th>
          </tr>
        </thead>
        <tbody>
          {pendingTasks.length > 0 ? (
            pendingTasks.map((task, index) => (
              <tr key={index}>
                <td className="table-cell">{task.id}</td>
                <td className="table-cell">{task.priority}</td>
                <td className="table-cell">{task.type}</td>
                <td className="table-cell">{task.assignedMember || "Sin asignar"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="table-cell">
                No hay tareas pendientes
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TaskAssignment;
