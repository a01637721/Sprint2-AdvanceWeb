package com.interfazgrafica.version1.services;

import com.google.cloud.firestore.*;
import com.google.firebase.FirebaseApp;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;

@Service
public class FirestoreListenerService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate; // Para enviar mensajes a través de WebSocket

    @Autowired
    private FirebaseApp firebaseApp; // Inyectamos FirebaseApp

    @PostConstruct
    public void listenForChanges() {
        // Verificamos que FirebaseApp esté inicializado
        if (firebaseApp == null) {
            throw new IllegalStateException("FirebaseApp no ha sido inicializado.");
        }

        Firestore db = FirestoreClient.getFirestore(); // Obtiene la instancia de Firestore

        // Referencia a la colección "users"
        CollectionReference collection = db.collection("users");

        // Escucha cambios en la colección
        collection.addSnapshotListener((snapshots, e) -> {
            if (e != null) {
                System.err.println("Error al escuchar cambios: " + e.getMessage());
                return;
            }

            for (DocumentChange dc : snapshots.getDocumentChanges()) {
                if (dc.getType() == DocumentChange.Type.ADDED) {
                    // Imprime los datos del nuevo documento en la consola
                    System.out.println("Nuevo documento: " + dc.getDocument().getData());

                    // Envía los datos del nuevo documento a través de WebSocket
                    messagingTemplate.convertAndSend("/topic/users", dc.getDocument().getData());
                } else if (dc.getType() == DocumentChange.Type.MODIFIED) {
                    // Imprime los datos del documento modificado en la consola
                    System.out.println("Documento modificado: " + dc.getDocument().getData());

                    // Envía los datos del documento modificado a través de WebSocket
                    messagingTemplate.convertAndSend("/topic/users", dc.getDocument().getData());
                } else if (dc.getType() == DocumentChange.Type.REMOVED) {
                    // Imprime el ID del documento eliminado en la consola
                    System.out.println("Documento eliminado: " + dc.getDocument().getId());

                    // Envía el ID del documento eliminado a través de WebSocket
                    messagingTemplate.convertAndSend("/topic/users", "Documento eliminado: " + dc.getDocument().getId());
                } else {
                    // Imprime un mensaje si el tipo de cambio no es reconocido
                    System.out.println("Tipo de cambio no reconocido: " + dc.getType());

                    
                }
            }
        });
    }
}