package com.inventario.backend_vitali.controllers;

import com.inventario.backend_vitali.models.Usuario;
import com.inventario.backend_vitali.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:3000") // Permite que tu frontend se conecte
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping("/registro")
    public ResponseEntity<String> registrarUsuario(@RequestBody Usuario nuevoUsuario) {
        // Verificar si la cédula ya existe en la base de datos
        if (usuarioRepository.findByCedula(nuevoUsuario.getCedula()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: La cédula ya está registrada.");
        }

        // Guardar el usuario en SQLite
        usuarioRepository.save(nuevoUsuario);
        return ResponseEntity.ok("¡Usuario registrado con éxito!");
    }

    // Ruta 2: Para consultar datos
    @GetMapping("/todos")
    public ResponseEntity<List<Usuario>> obtenerUsuarios() {
        return ResponseEntity.ok(usuarioRepository.findAll());
    }
}