package com.interfazgrafica.version1.controllers;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.firebase.cloud.FirestoreClient;
import com.interfazgrafica.version1.model.Task;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

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
}