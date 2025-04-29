package com.interfazgrafica.version1.model;

import javax.persistence.Entity;
import javax.persistence.Id;

@Entity
public class Task {
    @Id
    private String id; // Cambiado de Long a String para trabajar con Firebase

    private String name; // Nombre de la tarea
    private String priority; // Prioridad de la tarea
    private String status = "pending"; // Estado de la tarea con valor predeterminado
    private Long workerId; // ID del trabajador asignado

    // Campos adicionales necesarios
    private String assignedMember; // Miembro asignado a la tarea
    private String type; // Tipo de tarea (por ejemplo, "Desarrollo")
    private String role; // Rol del miembro asignado (por ejemplo, "Developer")

    // Getters y setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getWorkerId() {
        return workerId;
    }

    public void setWorkerId(Long workerId) {
        this.workerId = workerId;
    }

    public String getAssignedMember() {
        return assignedMember;
    }

    public void setAssignedMember(String assignedMember) {
        this.assignedMember = assignedMember;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}