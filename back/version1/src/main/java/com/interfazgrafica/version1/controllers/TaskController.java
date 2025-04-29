package com.interfazgrafica.version1.controllers;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.firebase.cloud.FirestoreClient;
import com.interfazgrafica.version1.model.Task;
import com.interfazgrafica.version1.model.Member; // Importar el modelo de trabajadores
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final SimpMessagingTemplate messagingTemplate;

    public TaskController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @GetMapping
    public List<Task> getTasks() {
        try {
            Firestore db = FirestoreClient.getFirestore();
            ApiFuture<QuerySnapshot> future = db.collection("tasks").get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();

            List<Task> taskList = new ArrayList<>();
            for (QueryDocumentSnapshot document : documents) {
                Task task = document.toObject(Task.class);
                task.setId(document.getId()); // Asignar el ID del documento como String
                taskList.add(task);
            }
            return taskList;
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @PostMapping
    public Task createTask(@RequestBody Task task) {
        try {
            Firestore db = FirestoreClient.getFirestore();
            DocumentReference docRef = db.collection("tasks").document();
            task.setId(docRef.getId()); // Asignar el ID generado por Firebase como String
            docRef.set(task); // Guardar la tarea en Firebase

            // Enviar la tarea a través de WebSocket
            messagingTemplate.convertAndSend("/topic/tasks", task);

            return task;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @PutMapping("/{taskId}/status")
    public String updateTaskStatus(@PathVariable String taskId, @RequestParam String status) {
        try {
            Firestore db = FirestoreClient.getFirestore();

            // Buscar la tarea en Firebase por su ID
            DocumentReference docRef = db.collection("tasks").document(taskId);
            ApiFuture<com.google.cloud.firestore.DocumentSnapshot> future = docRef.get();
            com.google.cloud.firestore.DocumentSnapshot document = future.get();

            if (!document.exists()) {
                return "Task not found!";
            }

            // Actualizar el estado de la tarea
            docRef.update("status", status);

            // Enviar la actualización a través de WebSocket
            Task updatedTask = document.toObject(Task.class);
            if (updatedTask != null) {
                updatedTask.setStatus(status);
                messagingTemplate.convertAndSend("/topic/tasks", updatedTask);
            }

            return "Task status updated successfully!";
        } catch (Exception e) {
            e.printStackTrace();
            return "Failed to update task status!";
        }
    }

    // Endpoint para obtener trabajadores disponibles desde Firebase
    @GetMapping("/workers/available")
    public List<Member> getAvailableWorkers() {
        try {
            Firestore db = FirestoreClient.getFirestore();
            ApiFuture<QuerySnapshot> future = db.collection("workers").get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();

            List<Member> workers = new ArrayList<>();
            for (QueryDocumentSnapshot document : documents) {
                Member worker = document.toObject(Member.class);
                if (worker.getTaskCount() < 4) { // Filtrar trabajadores con menos de 4 tareas asignadas
                    workers.add(worker);
                }
            }
            return workers;
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
}