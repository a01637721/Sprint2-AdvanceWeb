package com.interfazgrafica.version1.controllers;

import com.google.firebase.cloud.FirestoreClient;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.DocumentReference;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class TaskAssignmentController {

    // Lista de miembros del equipo con su carga de trabajo (por ejemplo, número de tareas asignadas)
    private static List<Member> members = new ArrayList<>();

    static {
        members.add(new Member("Alice", 1, "Developer"));
        members.add(new Member("Bob", 2, "Developer"));
        members.add(new Member("Charlie", 0, "Developer"));
    }

    @MessageMapping("/assignTask") // Ruta para recibir mensajes del cliente
    @SendTo("/topic/tasks") // Ruta para enviar mensajes a los clientes suscritos
    public Map<String, Object> assignTask(Map<String, String> taskData) throws Exception {
        String taskPriority = taskData.get("taskPriority");
        String taskType = taskData.get("taskType");

        // Seleccionar un miembro para asignar la tarea
        Member selectedMember = selectMember(taskPriority, taskType);
        if (selectedMember == null) {
            throw new Exception("No hay miembros disponibles para asignar la tarea.");
        }

        selectedMember.addTask(); // Incrementa la carga de trabajo del miembro asignado

        // Crear un objeto para guardar en Firebase
        Map<String, Object> task = new HashMap<>();
        task.put("priority", taskPriority);
        task.put("type", taskType);
        task.put("assignedMember", selectedMember.getName());
        task.put("role", selectedMember.getRole());

        // Guardar en Firebase
        Firestore db = FirestoreClient.getFirestore();
        DocumentReference docRef = db.collection("tasks").document();
        docRef.set(task);

        return task; // Este objeto será enviado a los clientes suscritos
    }

    private Member selectMember(String taskPriority, String taskType) {
        // Regla 1: Asignar tarea a la persona que no tenga tarea asignada
        for (Member member : members) {
            if (member.getTaskCount() == 0) {
                return member; // Asigna la tarea a la persona que no tiene tareas
            }
        }

        // Regla 2: Si todos tienen tareas asignadas, asigna una tarea a cualquiera que tenga menos de 4 tareas
        for (Member member : members) {
            if (member.getTaskCount() < 4) {
                return member; // Asigna una tarea a alguien que tiene menos de 4 tareas
            }
        }

        return null; // Si todos están ocupados con 4 o más tareas
    }

    // Clase interna para representar a los miembros del equipo
    static class Member {
        private String name;
        private int taskCount;
        private String role;

        public Member(String name, int taskCount, String role) {
            this.name = name;
            this.taskCount = taskCount;
            this.role = role;
        }

        public String getName() {
            return name;
        }

        public int getTaskCount() {
            return taskCount;
        }

        public String getRole() {
            return role;
        }

        public void addTask() {
            this.taskCount++;
        }
    }
}
