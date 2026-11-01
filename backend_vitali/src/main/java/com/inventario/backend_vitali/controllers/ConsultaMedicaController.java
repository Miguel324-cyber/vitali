package com.inventario.backend_vitali.controllers;

import com.inventario.backend_vitali.models.ConsultaMedica;
import com.inventario.backend_vitali.models.Receta;
import com.inventario.backend_vitali.models.Usuario;
import com.inventario.backend_vitali.repositories.ConsultaMedicaRepository;
import com.inventario.backend_vitali.repositories.RecetaRepository;
import com.inventario.backend_vitali.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/consultas")
@CrossOrigin(origins = "http://localhost:3000")
public class ConsultaMedicaController {

    @Autowired
    private ConsultaMedicaRepository consultaRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private RecetaRepository recetaRepository;

    // 1. El paciente envía una duda
    @PostMapping("/crear")
    public ResponseEntity<String> crearConsulta(@RequestParam Long pacienteId, @RequestParam Long recetaId, @RequestBody Map<String, String> body) {
        Optional<Usuario> paciente = usuarioRepository.findById(pacienteId);
        Optional<Receta> receta = recetaRepository.findById(recetaId);

        if (paciente.isEmpty() || receta.isEmpty()) {
            return ResponseEntity.badRequest().body("Paciente o Receta no encontrados");
        }

        ConsultaMedica nuevaConsulta = new ConsultaMedica();
        nuevaConsulta.setPaciente(paciente.get());
        nuevaConsulta.setReceta(receta.get());
        nuevaConsulta.setMensajeDuda(body.get("mensaje"));

        consultaRepository.save(nuevaConsulta);
        return ResponseEntity.ok("Duda enviada al médico exitosamente.");
    }

    // 2. El médico responde
    @PostMapping("/responder/{consultaId}")
    public ResponseEntity<String> responderConsulta(@PathVariable Long consultaId, @RequestParam Long medicoId, @RequestBody Map<String, String> body) {
        Optional<ConsultaMedica> consultaOpt = consultaRepository.findById(consultaId);
        Optional<Usuario> medicoOpt = usuarioRepository.findById(medicoId);

        if (consultaOpt.isEmpty() || medicoOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Consulta o Médico no encontrados");
        }

        ConsultaMedica consulta = consultaOpt.get();
        consulta.setMedico(medicoOpt.get());
        consulta.setRespuestaMedico(body.get("respuesta"));
        consulta.setEstado("ATENDIDA");

        consultaRepository.save(consulta);
        return ResponseEntity.ok("Respuesta enviada al paciente.");
    }

    // 3. Ver todas las consultas de un paciente (para su historial)
    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<List<ConsultaMedica>> verConsultasPaciente(@PathVariable Long pacienteId) {
        return ResponseEntity.ok(consultaRepository.findByPacienteId(pacienteId));
    }
}