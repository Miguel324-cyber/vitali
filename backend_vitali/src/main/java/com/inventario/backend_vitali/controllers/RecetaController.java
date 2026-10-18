package com.inventario.backend_vitali.controllers;

import com.inventario.backend_vitali.models.AlertaMedicamento;
import com.inventario.backend_vitali.models.DetalleReceta;
import com.inventario.backend_vitali.models.Receta;
import com.inventario.backend_vitali.models.Usuario;
import com.inventario.backend_vitali.repositories.AlertaMedicamentoRepository;
import com.inventario.backend_vitali.repositories.DetalleRecetaRepository;
import com.inventario.backend_vitali.repositories.RecetaRepository;
import com.inventario.backend_vitali.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/recetas")
@CrossOrigin(origins = "http://localhost:3000")
public class RecetaController {

    @Autowired
    private RecetaRepository recetaRepository;

    @Autowired
    private DetalleRecetaRepository detalleRecetaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private AlertaMedicamentoRepository alertaMedicamentoRepository;

    // Clase auxiliar (DTO) para recibir los datos del Frontend
    public static class RecetaRequest {
        public Long pacienteId;
        public List<MedicamentoRequest> medicamentos;
    }

    public static class MedicamentoRequest {
        public String nombre;
        public String dosis;
    }

    @PostMapping("/subir")
    public ResponseEntity<String> subirRecetaYAnalizar(@RequestBody RecetaRequest request) {

        // 1. Buscar al paciente
        Optional<Usuario> pacienteOpt = usuarioRepository.findById(request.pacienteId);
        if (pacienteOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Error: Paciente no encontrado.");
        }

        // 2. Crear la Receta principal
        Receta nuevaReceta = new Receta();
        nuevaReceta.setPaciente(pacienteOpt.get());
        nuevaReceta.setEstadoAnalisis("PENDIENTE");
        recetaRepository.save(nuevaReceta);

        boolean hayAlerta = false;
        List<String> advertencias = new ArrayList<>();

        // 3. Guardar cada medicamento y analizarlo contra la base de datos de la FDA
        for (MedicamentoRequest medRequest : request.medicamentos) {
            DetalleReceta detalle = new DetalleReceta();
            detalle.setReceta(nuevaReceta);
            detalle.setNombreMedicamento(medRequest.nombre);
            detalle.setDosisIndicada(medRequest.dosis);
            detalleRecetaRepository.save(detalle);

            // Buscar el medicamento en la tabla de Alertas (ignorar mayúsculas/minúsculas)
            Optional<AlertaMedicamento> alertaOpt = alertaMedicamentoRepository.findById(medRequest.nombre.toLowerCase());

            if (alertaOpt.isPresent()) {
                hayAlerta = true;
                advertencias.add("Precaución con " + medRequest.nombre + ": " + alertaOpt.get().getWarnings());
            }
        }

        // 4. Actualizar el estado de la receta según el análisis
        if (hayAlerta) {
            nuevaReceta.setEstadoAnalisis("SOBREMEDICADO");
            recetaRepository.save(nuevaReceta);
            return ResponseEntity.ok("Receta subida. ALERTA DE RIESGO: " + String.join(" | ", advertencias));
        } else {
            nuevaReceta.setEstadoAnalisis("SEGURO");
            recetaRepository.save(nuevaReceta);
            return ResponseEntity.ok("Receta subida exitosamente. Análisis: SEGURO.");
        }
    }
}