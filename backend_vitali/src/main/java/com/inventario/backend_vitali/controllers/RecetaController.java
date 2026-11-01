package com.inventario.backend_vitali.controllers;

import com.inventario.backend_vitali.models.*;
import com.inventario.backend_vitali.repositories.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@RestController
@RequestMapping("/api/recetas")
@CrossOrigin(origins = "http://localhost:3000")
public class RecetaController {
    private final RecetaRepository recetaRepository;
    private final DetalleRecetaRepository detalleRecetaRepository;
    private final UsuarioRepository usuarioRepository;
    private final PresentacionMedicamentoRepository presentacionRepository;
    private final ReglaDosisRepository reglaRepository;
    private final AlertaMedicamentoRepository alertaRepository;

    public RecetaController(RecetaRepository recetaRepository, DetalleRecetaRepository detalleRecetaRepository,
            UsuarioRepository usuarioRepository, PresentacionMedicamentoRepository presentacionRepository,
            ReglaDosisRepository reglaRepository, AlertaMedicamentoRepository alertaRepository) {
        this.recetaRepository = recetaRepository;
        this.detalleRecetaRepository = detalleRecetaRepository;
        this.usuarioRepository = usuarioRepository;
        this.presentacionRepository = presentacionRepository;
        this.reglaRepository = reglaRepository;
        this.alertaRepository = alertaRepository;
    }

    public static class RecetaRequest {
        public Long pacienteId;
        public Double edadAnios;
        public Double pesoKg;
        public List<MedicamentoRequest> medicamentos;
    }
    public static class MedicamentoRequest {
        public Long presentacionId;
        public Double cantidadPorToma;
        public Double intervaloHoras;
        public String unidadConsumo;
        public String indicacion;
        public Integer diasTratamiento;
        public String dosis;
    }
    public record MedicamentoDisponible(Long id, String medicamento, String forma, String via,
            Double concentrationValue, String concentrationUnit, String denominator,
            String saltOrRelease, String sourceLabel, List<String> indicaciones) {}
    public record ResultadoMedicamento(String medicamento, String estado, Double mgPorDia,
            Double maximoMgPorDia, String regla, List<String> advertencias) {}
    public record ResultadoAnalisis(Long recetaId, String estado, List<ResultadoMedicamento> medicamentos,
            List<String> advertencias) {}

    @GetMapping("/medicamentos")
    public List<MedicamentoDisponible> medicamentosDisponibles() {
        return presentacionRepository.findAll().stream()
                .map(p -> new MedicamentoDisponible(p.getId(), p.getMedicamento(), p.getForma(), p.getVia(),
                        p.getConcentrationValue(), p.getConcentrationUnit(), p.getDenominator(),
                        p.getSaltOrRelease(), p.getSourceLabel(), reglaRepository.findByMedicamentoIgnoreCase(p.getMedicamento())
                                .stream().map(ReglaDosis::getIndication).filter(Objects::nonNull).distinct().toList())).toList();
    }

    @PostMapping("/subir")
    @Transactional
    public ResponseEntity<?> subirRecetaYAnalizar(@RequestBody RecetaRequest request) {
        if (request == null || request.pacienteId == null || request.medicamentos == null || request.medicamentos.isEmpty())
            return ResponseEntity.badRequest().body(Map.of("error", "Indique paciente y al menos un medicamento."));
        Optional<Usuario> pacienteOpt = usuarioRepository.findById(request.pacienteId);
        if (pacienteOpt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "Paciente no encontrado."));
        if (request.edadAnios == null || request.edadAnios < 0 || (request.pesoKg != null && request.pesoKg <= 0))
            return ResponseEntity.badRequest().body(Map.of("error", "Edad y peso (si se informa) deben ser válidos."));
        for (MedicamentoRequest item : request.medicamentos) {
            if (item == null || item.presentacionId == null || item.cantidadPorToma == null || item.cantidadPorToma <= 0
                    || item.intervaloHoras == null || item.intervaloHoras <= 0 || item.intervaloHoras > 24
                    || item.diasTratamiento == null || item.diasTratamiento <= 0 || item.indicacion == null || item.indicacion.isBlank())
                return ResponseEntity.badRequest().body(Map.of("error", "Cada medicamento requiere presentación, cantidad diaria, indicación y duración válida."));
            if (!presentacionRepository.existsById(item.presentacionId))
                return ResponseEntity.badRequest().body(Map.of("error", "Presentación no encontrada: " + item.presentacionId));
            if (item.unidadConsumo == null || item.unidadConsumo.isBlank())
                return ResponseEntity.badRequest().body(Map.of("error", "Indique la unidad de consumo de cada medicamento."));
        }

        Receta receta = new Receta();
        receta.setPaciente(pacienteOpt.get());
        receta.setEstadoAnalisis("PENDIENTE");
        recetaRepository.save(receta);

        List<ResultadoMedicamento> resultados = new ArrayList<>();
        Map<String, Double> dosisPorPrincipioActivo = new HashMap<>();
        Map<String, Double> limitesPorPrincipioActivo = new HashMap<>();
        Map<String, List<Integer>> indicesPorPrincipioActivo = new HashMap<>();
        boolean exceso = false, revision = false;
        for (MedicamentoRequest item : request.medicamentos) {
            Optional<PresentacionMedicamento> pOpt = presentacionRepository.findById(item.presentacionId);
            if (pOpt.isEmpty()) throw new IllegalStateException("La presentación dejó de estar disponible durante el análisis.");
            PresentacionMedicamento p = pOpt.get();
            DetalleReceta detail = new DetalleReceta();
            double administrationsPerDay = 24.0 / item.intervaloHoras;
            double unitsPerDay = item.cantidadPorToma * administrationsPerDay;
            detail.setReceta(receta);
            detail.setNombreMedicamento(p.getMedicamento());
            detail.setDosisIndicada(item.dosis == null ? item.cantidadPorToma + " " + item.unidadConsumo + " cada " + item.intervaloHoras + " horas" : item.dosis);
            detail.setPresentacionId(p.getId());
            detail.setUnidadesPorDia(unitsPerDay);
            detail.setAdministracionesPorDia(administrationsPerDay);
            detail.setUnidadConsumo(item.unidadConsumo);
            detail.setIndicacion(item.indicacion.trim());
            detail.setDiasTratamiento(item.diasTratamiento);
            detalleRecetaRepository.save(detail);

            List<String> warnings = new ArrayList<>();
            Double mgPerDay = convertToMgPerDay(p, item, unitsPerDay, warnings);
            List<ReglaDosis> rules = reglaRepository.findByMedicamentoIgnoreCase(p.getMedicamento());
            List<ReglaDosis> indicationRules = rules.stream().filter(r -> applies(r, item.indicacion, request.edadAnios)).toList();
            ReglaDosis rule = indicationRules.size() == 1 ? indicationRules.get(0) : null;
            Double limit = rule == null ? null : applicableDailyLimit(rule, request.pesoKg);

            String status;
            if (rule == null || mgPerDay == null || limit == null) {
                status = "REVISION";
                revision = true;
                if (rule == null) warnings.add("No hay una única regla estructurada aplicable a esta indicación y población.");
                if (mgPerDay == null) warnings.add("No se pudo convertir la presentación y unidad a mg/día.");
                if (rule != null && limit == null) warnings.add("La regla no contiene un límite diario numérico aplicable.");
            } else if (mgPerDay > limit) {
                status = "SOBREMEDICADO";
                exceso = true;
                warnings.add("La cantidad calculada supera el límite diario de referencia de " + limit + " mg.");
            } else {
                status = "SEGURO";
                warnings.add("La cantidad diaria calculada no supera el límite disponible en la base de datos.");
            }
            alertaRepository.findById(p.getMedicamento()).ifPresent(a -> {
                if (a.getWarnings() != null && !a.getWarnings().isBlank()) warnings.add("Advertencias de etiqueta: " + a.getWarnings());
                if (a.getDrugInteractions() != null && !a.getDrugInteractions().isBlank())
                    warnings.add("La etiqueta contiene texto sobre interacciones; no hay datos estructurados para confirmar si aplica a los otros medicamentos ingresados.");
            });
            resultados.add(new ResultadoMedicamento(p.getMedicamento(), status, mgPerDay, limit,
                    rule == null ? null : rule.getIndication(), warnings));
            String activeIngredient = alertaRepository.findById(p.getMedicamento())
                    .map(AlertaMedicamento::getActiveIngredient).filter(s -> !s.isBlank())
                    .map(this::norm).orElse(norm(p.getMedicamento()));
            indicesPorPrincipioActivo.computeIfAbsent(activeIngredient, k -> new ArrayList<>()).add(resultados.size() - 1);
            if (mgPerDay != null) dosisPorPrincipioActivo.merge(activeIngredient, mgPerDay, Double::sum);
            if (limit != null) limitesPorPrincipioActivo.merge(activeIngredient, limit, Math::min);
        }

        for (String ingredient : dosisPorPrincipioActivo.keySet()) {
            Double total = dosisPorPrincipioActivo.get(ingredient), limit = limitesPorPrincipioActivo.get(ingredient);
            if (limit != null && total > limit) {
                exceso = true;
                for (Integer index : indicesPorPrincipioActivo.getOrDefault(ingredient, List.of())) {
                    ResultadoMedicamento r = resultados.get(index);
                    List<String> warnings = new ArrayList<>(r.advertencias());
                    warnings.add("La suma de presentaciones con el mismo principio activo es " + total + " mg/día y supera el límite de referencia de " + limit + " mg/día.");
                    resultados.set(index, new ResultadoMedicamento(r.medicamento(), "SOBREMEDICADO", r.mgPorDia(), r.maximoMgPorDia(), r.regla(), warnings));
                }
            }
        }
        if (request.medicamentos.size() > 1) {
            for (int i = 0; i < resultados.size(); i++) {
                ResultadoMedicamento r = resultados.get(i);
                List<String> warnings = new ArrayList<>(r.advertencias());
                warnings.add("El catálogo solo guarda interacciones como texto de etiqueta; no se pudo confirmar ni descartar una interacción entre este medicamento y los demás.");
                resultados.set(i, new ResultadoMedicamento(r.medicamento(), r.estado(), r.mgPorDia(), r.maximoMgPorDia(), r.regla(), warnings));
            }
        }
        String estado = exceso ? "SOBREMEDICADO" : revision ? "REVISION" : "SEGURO";
        receta.setEstadoAnalisis(estado);
        recetaRepository.save(receta);
        return ResponseEntity.ok(new ResultadoAnalisis(receta.getId(), estado, resultados,
                List.of("Evaluación basada en reglas de referencia disponibles; no sustituye la valoración de un profesional.")));
    }

    private boolean applies(ReglaDosis r, String indication, Double age) {
        if (r.getIndication() != null && !r.getIndication().isBlank()
                && !indication.toLowerCase(Locale.ROOT).contains(r.getIndication().toLowerCase(Locale.ROOT))
                && !r.getIndication().toLowerCase(Locale.ROOT).contains(indication.toLowerCase(Locale.ROOT))) return false;
        String population = r.getTargetPopulation() == null ? "" : r.getTargetPopulation().toLowerCase(Locale.ROOT);
        boolean hasPediatricGroup = population.contains("pediatric") || population.contains("pediátric") || population.contains("child") || population.contains("niño") || population.contains("infant");
        boolean hasAdultGroup = population.contains("adult");
        boolean pediatricOnly = hasPediatricGroup && !hasAdultGroup && !population.contains("all ages");
        boolean adultOnly = hasAdultGroup && !hasPediatricGroup && !population.contains("all ages");
        if (pediatricOnly && age >= 18) return false;
        if (adultOnly && age < 18) return false;
        java.util.regex.Matcher range = java.util.regex.Pattern.compile("(\\d+)\\s*[-–]\\s*(\\d+)\\s*years?").matcher(population);
        if (range.find()) return age >= Integer.parseInt(range.group(1)) && age <= Integer.parseInt(range.group(2));
        java.util.regex.Matcher monthsUnder = java.util.regex.Pattern.compile("(?:under|<=|≤)\\s*(\\d+)\\s*months?").matcher(population);
        if (monthsUnder.find()) return age <= Integer.parseInt(monthsUnder.group(1)) / 12.0;
        java.util.regex.Matcher yearsUnder = java.util.regex.Pattern.compile("under\\s*(\\d+)\\s*years?").matcher(population);
        if (yearsUnder.find()) return age < Integer.parseInt(yearsUnder.group(1));
        java.util.regex.Matcher yearsOver = java.util.regex.Pattern.compile("over\\s*(\\d+)\\s*years?").matcher(population);
        if (yearsOver.find()) return age > Integer.parseInt(yearsOver.group(1));
        java.util.regex.Matcher monthsOver = java.util.regex.Pattern.compile("(\\d+)\\s*months?\\s+and\\s+older").matcher(population);
        if (monthsOver.find()) return age >= Integer.parseInt(monthsOver.group(1)) / 12.0;
        java.util.regex.Matcher yearsOverOrEqual = java.util.regex.Pattern.compile("(?:age\\s*)?(\\d+)\\s*\\+|(\\d+)\\s*years?\\s+and\\s+older").matcher(population);
        if (yearsOverOrEqual.find()) {
            String n = yearsOverOrEqual.group(1) != null ? yearsOverOrEqual.group(1) : yearsOverOrEqual.group(2);
            return age >= Integer.parseInt(n);
        }
        return true;
    }
    private Double applicableDailyLimit(ReglaDosis r, Double weightKg) {
        Double limit = r.getMaxDailyDoseMg();
        if (r.getDoseMaxMgPerDay() != null) limit = limit == null ? r.getDoseMaxMgPerDay() : Math.min(limit, r.getDoseMaxMgPerDay());
        if (r.getMaxDailyDoseMgPerKg() != null) {
            if (weightKg == null) return null;
            double weightLimit = r.getMaxDailyDoseMgPerKg() * weightKg;
            limit = limit == null ? weightLimit : Math.min(limit, weightLimit);
        }
        return limit;
    }
    private boolean durationWithinRule(int days, ReglaDosis r) {
        if (r.getMaxDurationDays() != null) return days <= r.getMaxDurationDays();
        return r.getDurationLimitText() == null || r.getDurationLimitText().isBlank();
    }
    private Double convertToMgPerDay(PresentacionMedicamento p, MedicamentoRequest item, Double unitsPerDay, List<String> warnings) {
        if (p.getConcentrationValue() == null || !"mg".equalsIgnoreCase(p.getConcentrationUnit()) || item.unidadConsumo == null) return null;
        String denominator = norm(p.getDenominator()), unit = norm(item.unidadConsumo);
        if ((denominator.equals("tableta") || denominator.equals("capsula") || denominator.equals("supositorio")) && denominator.equals(unit))
            return p.getConcentrationValue() * unitsPerDay;
        if (denominator.equals("5 ml") && unit.equals("ml")) return p.getConcentrationValue() * unitsPerDay / 5.0;
        warnings.add("La unidad de consumo no coincide con la concentración registrada.");
        return null;
    }
    private String norm(String value) { return value == null ? "" : java.text.Normalizer.normalize(value.trim().toLowerCase(Locale.ROOT), java.text.Normalizer.Form.NFD).replaceAll("\\p{M}", ""); }
}
