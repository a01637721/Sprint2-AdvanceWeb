package com.interfazgrafica.version1.model;

public class Member {
    private String name; // Nombre del trabajador
    private int taskCount; // Número de tareas asignadas
    private String role; // Rol del trabajador (por ejemplo, "Developer", "Tester")

    // Constructor
    public Member(String name, int taskCount, String role) {
        this.name = name;
        this.taskCount = taskCount;
        this.role = role;
    }

    // Getters y setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getTaskCount() {
        return taskCount;
    }

    public void setTaskCount(int taskCount) {
        this.taskCount = taskCount;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    // Método para incrementar el número de tareas asignadas
    public void addTask() {
        this.taskCount++;
    }

    // Método para decrementar el número de tareas asignadas
    public void removeTask() {
        if (this.taskCount > 0) {
            this.taskCount--;
        }
    }
}