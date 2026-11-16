package com.example.backend_vitali.medication;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Revisa los medicamentos de un paciente: dosis diaria frente a las reglas de
 * etiqueta (reglas_dosis), duplicidades, interacciones conocidas entre los
 * medicamentos del catálogo y duración del tratamiento. Es orientativo: no
 * reemplaza el criterio del médico.
 */
@Service
public class MedicationAnalysisService {

    public static final String DISCLAIMER =
            "Este análisis es orientativo y se basa en etiquetas de referencia (DailyMed). "
            + "No reemplaza el criterio de tu médico: no suspendas ni cambies un tratamiento sin consultarlo.";

    private final JdbcTemplate jdbc;

    public MedicationAnalysisService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // ------------------------------------------------------------------
    // Conocimiento curado sobre los 19 medicamentos del catálogo
    // ------------------------------------------------------------------

    private static final Set<String> NSAID = Set.of("Ibuprofen", "Naproxen", "Diclofenac");
    private static final Set<String> SSRI = Set.of("Fluoxetine", "Sertraline");
    private static final Set<String> CORTICOID = Set.of("Prednisone", "Dexamethasone");

    private record Rule(Set<String> a, Set<String> b, String severity, String title, String message) {}

    private static final List<Rule> INTERACTIONS = List.of(
            new Rule(NSAID, NSAID, "ALTA", "Dos antiinflamatorios (AINE) a la vez",
                    "Combinar AINE aumenta el riesgo de sangrado digestivo y daño renal sin mejorar el efecto."),
            new Rule(SSRI, SSRI, "ALTA", "Dos antidepresivos ISRS a la vez",
                    "Puede causar síndrome serotoninérgico (agitación, fiebre, temblor, taquicardia)."),
            new Rule(NSAID, SSRI, "MODERADA", "AINE + antidepresivo ISRS",
                    "La combinación aumenta el riesgo de sangrado, sobre todo digestivo."),
            new Rule(NSAID, CORTICOID, "MODERADA", "AINE + corticoide",
                    "Aumenta el riesgo de úlcera y sangrado gastrointestinal."),
            new Rule(NSAID, Set.of("Captopril"), "MODERADA", "AINE + captopril",
                    "El AINE puede disminuir el efecto sobre la presión arterial y afectar la función renal."),
            new Rule(NSAID, Set.of("Hydrochlorothiazide"), "MODERADA", "AINE + hidroclorotiazida",
                    "Puede reducir el efecto del diurético y aumentar el riesgo renal."),
            new Rule(Set.of("Hydrochlorothiazide"), CORTICOID, "MODERADA", "Hidroclorotiazida + corticoide",
                    "Ambos bajan el potasio; puede haber hipopotasemia (calambres, debilidad, arritmias)."),
            new Rule(Set.of("Captopril"), Set.of("Hydrochlorothiazide"), "LEVE", "Captopril + hidroclorotiazida",
                    "Combinación frecuente, pero puede bajar demasiado la presión al inicio. Vigila mareos."),
            new Rule(Set.of("Ciprofloxacin"), CORTICOID, "ALTA", "Ciprofloxacino + corticoide",
                    "Aumenta el riesgo de inflamación y ruptura de tendones (advertencia de la etiqueta)."),
            new Rule(Set.of("Ciprofloxacin"), Set.of("Metformin"), "MODERADA", "Ciprofloxacino + metformina",
                    "Puede alterar el azúcar en sangre (hipo o hiperglucemia). Controla tu glucosa."),
            new Rule(Set.of("Cephalexin"), Set.of("Metformin"), "MODERADA", "Cefalexina + metformina",
                    "La cefalexina aumenta los niveles de metformina; vigila signos de hipoglucemia."),
            new Rule(Set.of("Clonazepam"), SSRI, "LEVE", "Clonazepam + antidepresivo ISRS",
                    "Puede aumentar la somnolencia. Evita manejar o el alcohol hasta saber cómo te afecta.")
    );

    /** Nombres en español y otros alias para reconocer medicamentos en el texto de una receta. */
    private static final Map<String, List<String>> ALIASES = Map.ofEntries(
            Map.entry("Omeprazole", List.of("omeprazol", "omeprazole")),
            Map.entry("Prednisone", List.of("prednisona", "prednisone")),
            Map.entry("Ibuprofen", List.of("ibuprofeno", "ibuprofen")),
            Map.entry("Hydrochlorothiazide", List.of("hidroclorotiazida", "hydrochlorothiazide", "hctz")),
            Map.entry("Azithromycin", List.of("azitromicina", "azithromycin")),
            Map.entry("Acetaminophen", List.of("acetaminofen", "acetaminophen", "paracetamol")),
            Map.entry("Ciprofloxacin", List.of("ciprofloxacino", "ciprofloxacina", "ciprofloxacin")),
            Map.entry("Cephalexin", List.of("cefalexina", "cephalexin")),
            Map.entry("Loratadine", List.of("loratadina", "loratadine")),
            Map.entry("Naproxen", List.of("naproxeno", "naproxen")),
            Map.entry("Fluoxetine", List.of("fluoxetina", "fluoxetine")),
            Map.entry("Amoxicillin", List.of("amoxicilina", "amoxicillin")),
            Map.entry("Lovastatin", List.of("lovastatina", "lovastatin")),
            Map.entry("Diclofenac", List.of("diclofenaco", "diclofenac")),
            Map.entry("Dexamethasone", List.of("dexametasona", "dexamethasone")),
            Map.entry("Captopril", List.of("captopril")),
            Map.entry("Clonazepam", List.of("clonazepam")),
            Map.entry("Sertraline", List.of("sertralina", "sertraline")),
            Map.entry("Metformin", List.of("metformina", "metformin"))
    );

    private static final Map<String, String> SPANISH = Map.ofEntries(
            Map.entry("Omeprazole", "Omeprazol"), Map.entry("Prednisone", "Prednisona"),
            Map.entry("Ibuprofen", "Ibuprofeno"), Map.entry("Hydrochlorothiazide", "Hidroclorotiazida"),
            Map.entry("Azithromycin", "Azitromicina"), Map.entry("Acetaminophen", "Acetaminofén"),
            Map.entry("Ciprofloxacin", "Ciprofloxacino"), Map.entry("Cephalexin", "Cefalexina"),
            Map.entry("Loratadine", "Loratadina"), Map.entry("Naproxen", "Naproxeno"),
            Map.entry("Fluoxetine", "Fluoxetina"), Map.entry("Amoxicillin", "Amoxicilina"),
            Map.entry("Lovastatin", "Lovastatina"), Map.entry("Diclofenac", "Diclofenaco"),
            Map.entry("Dexamethasone", "Dexametasona"), Map.entry("Captopril", "Captopril"),
            Map.entry("Clonazepam", "Clonazepam"), Map.entry("Sertraline", "Sertralina"),
            Map.entry("Metformin", "Metformina")
    );

    public static String spanishName(String catalogName) {
        return catalogName == null ? null : SPANISH.getOrDefault(catalogName, catalogName);
    }

    // ------------------------------------------------------------------
    // Análisis
    // ------------------------------------------------------------------

    public Map<String, Object> analyze(Long patientId) {
        Map<String, Object> profile = jdbc.queryForList(
                "SELECT birth_date, weight, medications FROM patient_profiles WHERE user_id = ?", patientId)
                .stream().findFirst().orElse(Map.of());
        Integer age = ageFrom(profile.get("birth_date"));
        Double weight = profile.get("weight") instanceof Number n ? n.doubleValue() : null;

        List<Map<String, Object>> rows = jdbc.queryForList("""
            SELECT d.id AS item_id, d.id_receta, d.nombre_medicamento, d.dosis_indicada, d.unidades_por_dia,
                   d.unidad_consumo, d.indicacion, d.dias_tratamiento,
                   r.fecha_subida, r.estado_analisis, r.id_medico, u.full_name AS nombre_medico,
                   p.concentration_value, p.concentration_unit, p.denominator, p.forma
              FROM detalle_receta d
              JOIN receta r ON r.id = d.id_receta
              LEFT JOIN users u ON u.id = r.id_medico
              LEFT JOIN presentaciones_medicamento p ON p.id = d.presentacion_id
             WHERE r.id_paciente = ?
             ORDER BY r.id DESC, d.id
            """, patientId);

        Set<String> catalog = new HashSet<>(jdbc.queryForList("SELECT medicamento FROM alertas_medicamentos", String.class));

        List<Map<String, Object>> meds = new ArrayList<>();
        Map<String, List<Map<String, Object>>> activeByMed = new LinkedHashMap<>();

        for (Map<String, Object> r : rows) {
            String name = (String) r.get("nombre_medicamento");
            Double units = num(r.get("unidades_por_dia"));
            Integer days = r.get("dias_tratamiento") instanceof Number n ? n.intValue() : null;
            LocalDate start = dateFrom(r.get("fecha_subida"));
            LocalDate end = (start != null && days != null) ? start.plusDays(days) : null;
            String status = (String) r.get("estado_analisis");
            boolean active = !"FINALIZADA".equals(status) && !"SUSPENDIDA".equals(status)
                    && (end == null || !end.isBefore(LocalDate.now()));
            Double mgPerDay = mgPerDay(num(r.get("concentration_value")), (String) r.get("concentration_unit"),
                    (String) r.get("denominator"), (String) r.get("unidad_consumo"), units);

            Map<String, Object> m = new LinkedHashMap<>();
            m.put("itemId", r.get("item_id"));
            m.put("recipeId", r.get("id_receta"));
            m.put("medicine", name);
            m.put("medicineEs", spanishName(name));
            m.put("source", r.get("id_medico") != null ? "MEDICO" : "PACIENTE");
            m.put("doctorName", r.get("nombre_medico"));
            m.put("recipeStatus", status);
            m.put("dose", r.get("dosis_indicada"));
            m.put("unitsPerDay", units);
            m.put("unit", r.get("unidad_consumo"));
            m.put("indication", r.get("indicacion"));
            m.put("treatmentDays", days);
            m.put("startDate", start);
            m.put("endDate", end);
            m.put("active", active);
            m.put("mgPerDay", mgPerDay);
            meds.add(m);
            if (active && name != null) activeByMed.computeIfAbsent(name, k -> new ArrayList<>()).add(m);
        }

        // Medicamentos que el paciente dijo usar en su perfil (sin dosis).
        List<String> reported = new ArrayList<>();
        if (profile.get("medications") instanceof String txt) {
            for (String line : txt.split("[\\n,;]")) {
                String found = matchCatalog(line.trim(), catalog);
                if (found != null && !activeByMed.containsKey(found) && !reported.contains(found)) reported.add(found);
            }
        }

        List<Map<String, Object>> doseChecks = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();
        for (var e : activeByMed.entrySet()) {
            Map<String, Object> check = evaluateDose(e.getKey(), e.getValue(), age, weight);
            doseChecks.add(check);
            for (Map<String, Object> item : e.getValue()) item.put("doseStatus", check.get("status"));
        }

        Set<String> involved = new LinkedHashSet<>(activeByMed.keySet());
        involved.addAll(reported);
        List<Map<String, Object>> interactions = findInteractions(new ArrayList<>(involved));
        for (Map<String, Object> i : interactions) {
            i.put("aReportedOnly", reported.contains(i.get("a")));
            i.put("bReportedOnly", reported.contains(i.get("b")));
        }

        // Recomendaciones legibles para el paciente
        for (Map<String, Object> c : doseChecks) {
            if ("ALTA".equals(c.get("status")) || "REVISAR".equals(c.get("status"))) {
                recommendations.add((String) c.get("recommendation"));
            }
        }
        for (Map<String, Object> i : interactions) {
            String sev = (String) i.get("severity");
            String pair = i.get("aEs") + " y " + i.get("bEs");
            if ("ALTA".equals(sev)) recommendations.add("Consulta a tu médico antes de seguir tomando juntos " + pair + ": " + i.get("message"));
            else if ("MODERADA".equals(sev)) recommendations.add("Al tomar " + pair + ", " + lowerFirst((String) i.get("message")) + " Coméntalo con tu médico.");
        }
        long pendingReview = meds.stream().filter(m -> Boolean.TRUE.equals(m.get("active")) && "PACIENTE".equals(m.get("source"))
                && "PENDIENTE_REVISION_MEDICA".equals(m.get("recipeStatus"))).count();
        if (pendingReview > 0) recommendations.add(pendingReview + " medicamento(s) que registraste están pendientes de revisión médica.");
        for (String r : reported) {
            recommendations.add("Reportaste que usas " + spanishName(r) + " pero no registraste su dosis: agrégalo en una receta para poder revisarlo.");
        }
        if (age != null && age < 12) recommendations.add("Las dosis pediátricas dependen del peso y la edad; confirma cada dosis con el pediatra.");
        if (weight == null) recommendations.add("Registra tu peso en tu perfil: algunas dosis máximas dependen del peso.");

        String overall = "OK";
        for (Map<String, Object> c : doseChecks) overall = worst(overall, (String) c.get("status"));
        for (Map<String, Object> i : interactions) overall = worst(overall, "ALTA".equals(i.get("severity")) ? "ALTA" : "MODERADA".equals(i.get("severity")) ? "REVISAR" : "OK");
        long alerts = doseChecks.stream().filter(c -> !"OK".equals(c.get("status")) && !"SIN_DATOS".equals(c.get("status"))).count()
                + interactions.stream().filter(i -> !"LEVE".equals(i.get("severity"))).count();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("patient", mapOf("age", age, "weight", weight));
        result.put("summary", mapOf("status", overall, "alerts", alerts, "activeMedications", activeByMed.size()));
        result.put("medications", meds);
        result.put("reportedWithoutDose", reported.stream().map(r -> mapOf("medicine", r, "medicineEs", spanishName(r))).toList());
        result.put("doseChecks", doseChecks);
        result.put("interactions", interactions);
        result.put("recommendations", recommendations);
        result.put("disclaimer", DISCLAIMER);
        return result;
    }

    private Map<String, Object> evaluateDose(String med, List<Map<String, Object>> items, Integer age, Double weight) {
        String es = spanishName(med);
        Double total = 0.0;
        boolean unknown = false;
        for (Map<String, Object> i : items) {
            Double mg = (Double) i.get("mgPerDay");
            if (mg == null) unknown = true; else total += mg;
        }
        Map<String, Object> c = new LinkedHashMap<>();
        c.put("medicine", med);
        c.put("medicineEs", es);
        c.put("items", items.size());
        c.put("totalMgPerDay", unknown && total == 0 ? null : round(total));

        List<Map<String, Object>> rules = jdbc.queryForList("""
            SELECT max_daily_dose_mg, max_daily_dose_mg_per_kg, max_duration_days, target_population, indication, rule_kind
              FROM reglas_dosis WHERE medicamento = ?""", med);

        // Duración
        Integer maxDays = rules.stream().map(r -> r.get("max_duration_days")).filter(Objects::nonNull)
                .map(v -> ((Number) v).intValue()).max(Integer::compare).orElse(null);
        Integer longest = items.stream().map(i -> (Integer) i.get("treatmentDays")).filter(Objects::nonNull).max(Integer::compare).orElse(null);
        String durationNote = (maxDays != null && longest != null && longest > maxDays)
                ? "La duración registrada (" + longest + " días) supera la recomendada en la etiqueta (" + maxDays + " días)." : null;

        if (unknown && total == 0) {
            c.put("status", durationNote != null ? "REVISAR" : "SIN_DATOS");
            c.put("message", "No se pudo calcular la dosis en mg/día (falta la presentación o la unidad no coincide)."
                    + (durationNote != null ? " " + durationNote : ""));
            c.put("recommendation", durationNote != null ? es + ": " + durationNote + " Confírmalo con tu médico." : null);
            return c;
        }

        // El límite sale exclusivamente de max_daily_dose_mg del medicamento.
        Double adultLimit = null; String adultSource = null;
        for (Map<String, Object> r : rules) {
            Double max = num(r.get("max_daily_dose_mg"));
            if (max == null) continue;
            if (adultLimit == null || max > adultLimit) { adultLimit = max; adultSource = (String) r.get("target_population"); }
        }

        boolean child = age != null && age < 12;
        Double limit, softLimit; String limitSource;
        if (child) {
            Double childLimit = null; String childSource = null;
            for (Map<String, Object> r : rules) {
                Double perKg = num(r.get("max_daily_dose_mg_per_kg"));
                if (perKg == null || weight == null) continue;
                double l = perKg * weight;
                Double cap = num(r.get("max_daily_dose_mg"));
                if (cap != null) l = Math.min(l, cap);
                if (childLimit == null || l > childLimit) { childLimit = l; childSource = (String) r.get("target_population"); }
            }
            limit = childLimit; limitSource = childSource; softLimit = null;
            // Sin regla pediátrica aplicable: si supera incluso el límite más bajo para adultos, es una alerta clara.
            Double adultFloor = adultLimit;
            if (limit == null && adultFloor != null && total > adultFloor) {
                limit = adultFloor; limitSource = "Límite para adultos (en niños el límite es menor)";
            }
        } else {
            limit = adultLimit; softLimit = null; limitSource = adultSource;
        }

        c.put("limitMgPerDay", limit == null ? null : round(limit));
        c.put("limitSource", limitSource);
        String totalTxt = fmt(total) + " mg/día" + (unknown ? " (sin contar dosis no calculables)" : "");
        String dup = items.size() > 1 ? " Está registrado en " + items.size() + " recetas activas; las dosis se suman." : "";

        if (limit != null && total > limit) {
            c.put("status", "ALTA");
            c.put("message", "Dosis total " + totalTxt + ", supera el máximo de referencia de " + fmt(limit) + " mg/día." + dup);
            c.put("recommendation", "No aumentes la dosis de " + es + ": sumas " + totalTxt + " y el máximo de referencia es "
                    + fmt(limit) + " mg/día. Consulta a tu médico cuanto antes." + dup);
        } else if (softLimit != null && total > softLimit) {
            c.put("status", "REVISAR");
            c.put("message", "Dosis total " + totalTxt + ", por encima del límite de algunas indicaciones (" + fmt(softLimit)
                    + " mg/día). Puede ser correcto si tu médico lo indicó." + dup);
            c.put("recommendation", es + ": tomas " + totalTxt + ", por encima de " + fmt(softLimit)
                    + " mg/día que indica la etiqueta para algunos usos. Confirma con tu médico que es la dosis correcta." + dup);
        } else if (limit == null) {
            c.put("status", durationNote != null ? "REVISAR" : "SIN_DATOS");
            c.put("message", "Dosis total " + totalTxt + ". La etiqueta no define un máximo universal"
                    + (child ? " para niños con los datos registrados" : "") + "; lo decide tu médico.");
            c.put("recommendation", null);
        } else {
            c.put("status", items.size() > 1 ? "REVISAR" : "OK");
            c.put("message", "Dosis total " + totalTxt + ", dentro del máximo de referencia (" + fmt(limit) + " mg/día)." + dup);
            c.put("recommendation", items.size() > 1 ? es + " aparece en varias recetas activas; verifica con tu médico que no lo estés tomando por duplicado." : null);
        }
        if (durationNote != null) {
            c.put("message", c.get("message") + " " + durationNote);
            if ("OK".equals(c.get("status"))) {
                c.put("status", "REVISAR");
                c.put("recommendation", es + ": " + durationNote + " Confírmalo con tu médico.");
            }
        }
        return c;
    }

    private List<Map<String, Object>> findInteractions(List<String> meds) {
        List<Map<String, Object>> out = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        for (int i = 0; i < meds.size(); i++) {
            for (int j = i + 1; j < meds.size(); j++) {
                String a = meds.get(i), b = meds.get(j);
                for (Rule r : INTERACTIONS) {
                    if ((r.a().contains(a) && r.b().contains(b)) || (r.a().contains(b) && r.b().contains(a))) {
                        seen.add(a + "|" + b);
                        out.add(interaction(a, b, r.severity(), r.title(), r.message(), "REGLA"));
                        break;
                    }
                }
            }
        }
        // Menciones en el texto de interacciones de la etiqueta (DailyMed).
        for (String a : meds) {
            String text = jdbc.queryForList("SELECT drug_interactions FROM alertas_medicamentos WHERE medicamento = ?", String.class, a)
                    .stream().findFirst().orElse("");
            String norm = normalize(text);
            for (String b : meds) {
                if (a.equals(b) || seen.contains(a + "|" + b) || seen.contains(b + "|" + a)) continue;
                if (norm.contains(normalize(b))) {
                    seen.add(a + "|" + b);
                    out.add(interaction(a, b, "LEVE", "Mencionado en la etiqueta",
                            "La etiqueta de " + spanishName(a) + " menciona a " + spanishName(b)
                                    + " en su sección de interacciones. Pregunta a tu médico si debes tomar alguna precaución.", "ETIQUETA"));
                }
            }
        }
        out.sort(Comparator.comparingInt(m -> severityRank((String) m.get("severity"))));
        return out;
    }

    private static Map<String, Object> interaction(String a, String b, String sev, String title, String msg, String source) {
        return mapOf("a", a, "b", b, "aEs", spanishName(a), "bEs", spanishName(b),
                "severity", sev, "title", title, "message", msg, "source", source);
    }

    // ------------------------------------------------------------------
    // Detección de medicamentos en el texto de una receta (OCR o escrito)
    // ------------------------------------------------------------------

    private static final Pattern STRENGTH = Pattern.compile("(\\d+(?:[.,]\\d+)?)\\s*mg");
    private static final Pattern EVERY_HOURS = Pattern.compile("cada\\s*(\\d{1,2})\\s*(?:h\\b|hr|hora)");
    private static final Pattern TIMES_DAY = Pattern.compile("(\\d)\\s*(?:veces|vez)\\s*(?:al|por|en el)\\s*dia");
    private static final Pattern DAYS = Pattern.compile("(?:por|durante|x)\\s*(\\d{1,3})\\s*dias");
    private static final Pattern UNITS_PER_DOSE = Pattern.compile("(\\d+(?:[.,]\\d+)?|una|un|media|dos|tres)\\s*(tableta|tabletas|tab|capsula|capsulas|cap|ml|cc|supositorio)");

    public List<Map<String, Object>> detect(String rawText) {
        String text = normalize(rawText == null ? "" : rawText);
        List<Map<String, Object>> out = new ArrayList<>();
        for (var e : ALIASES.entrySet()) {
            int idx = -1; String alias = null;
            for (String a : e.getValue()) {
                Matcher m = Pattern.compile("\\b" + Pattern.quote(a) + "\\b").matcher(text);
                if (m.find() && (idx < 0 || m.start() < idx)) { idx = m.start(); alias = a; }
            }
            if (idx < 0) continue;
            String med = e.getKey();
            int endWindow = Math.min(text.length(), idx + 160);
            int nextMed = nextMedicineIndex(text, idx + alias.length());
            if (nextMed > 0) endWindow = Math.min(endWindow, nextMed);
            String window = text.substring(idx, endWindow);

            Double strength = null;
            Matcher sm = STRENGTH.matcher(window);
            if (sm.find()) strength = Double.parseDouble(sm.group(1).replace(',', '.'));

            List<Map<String, Object>> pres = jdbc.queryForList(
                    "SELECT id, forma, via, concentration_value, concentration_unit, denominator FROM presentaciones_medicamento WHERE medicamento = ? ORDER BY id",
                    med);
            Map<String, Object> chosen = null;
            if (strength != null) {
                for (Map<String, Object> p : pres) {
                    Double v = num(p.get("concentration_value"));
                    if (v != null && Math.abs(v - strength) < 0.001 && "mg".equals(p.get("concentration_unit"))) { chosen = p; break; }
                }
            }
            if (chosen == null) chosen = pres.stream().filter(p -> "tableta".equals(p.get("denominator")) || "cápsula".equals(p.get("denominator")))
                    .findFirst().orElse(pres.isEmpty() ? null : pres.get(0));

            Double perDay = null;
            Matcher hm = EVERY_HOURS.matcher(window);
            Matcher tm = TIMES_DAY.matcher(window);
            if (hm.find()) { int h = Integer.parseInt(hm.group(1)); if (h > 0 && h <= 24) perDay = 24.0 / h; }
            else if (tm.find()) perDay = Double.parseDouble(tm.group(1));
            else if (window.contains("una vez al dia") || window.contains("diario") || window.contains("cada dia")) perDay = 1.0;
            else if (window.contains("dos veces")) perDay = 2.0;
            else if (window.contains("tres veces")) perDay = 3.0;

            Double perDose = 1.0;
            Matcher um = UNITS_PER_DOSE.matcher(window);
            if (um.find()) perDose = wordNumber(um.group(1));

            Integer days = null;
            Matcher dm = DAYS.matcher(window);
            if (dm.find()) days = Integer.parseInt(dm.group(1));

            String unit = "tableta";
            if (chosen != null) {
                String den = String.valueOf(chosen.get("denominator"));
                unit = den.equals("5 mL") ? "mL" : den;
            }

            Map<String, Object> s = new LinkedHashMap<>();
            s.put("medicine", med);
            s.put("medicineEs", spanishName(med));
            s.put("presentationId", chosen == null ? null : chosen.get("id"));
            s.put("presentationLabel", chosen == null ? null : chosen.get("forma") + " · " + fmt(num(chosen.get("concentration_value")))
                    + " " + chosen.get("concentration_unit") + " / " + chosen.get("denominator"));
            s.put("strengthFound", strength);
            s.put("unitsPerDay", perDay == null ? null : round(perDay * perDose));
            s.put("consumptionUnit", unit);
            s.put("treatmentDays", days);
            s.put("matchedText", rawSnippet(rawText, window));
            s.put("position", idx);
            out.add(s);
        }
        out.sort(Comparator.comparingInt(s -> (Integer) s.get("position")));
        return out;
    }

    private int nextMedicineIndex(String text, int from) {
        int best = -1;
        for (List<String> aliases : ALIASES.values()) {
            for (String a : aliases) {
                int i = text.indexOf(a, from);
                if (i > 0 && (best < 0 || i < best)) best = i;
            }
        }
        return best;
    }

    private static String rawSnippet(String raw, String window) {
        String w = window.length() > 120 ? window.substring(0, 120) : window;
        return w.replaceAll("\\s+", " ").trim();
    }

    private static double wordNumber(String w) {
        return switch (w) {
            case "una", "un" -> 1; case "media" -> 0.5; case "dos" -> 2; case "tres" -> 3;
            default -> Double.parseDouble(w.replace(',', '.'));
        };
    }

    // ------------------------------------------------------------------
    // Utilidades
    // ------------------------------------------------------------------

    private String matchCatalog(String text, Set<String> catalog) {
        if (text.isBlank()) return null;
        String n = normalize(text);
        for (String c : catalog) if (normalize(c).equals(n)) return c;
        for (var e : ALIASES.entrySet()) for (String a : e.getValue()) if (n.contains(a)) return e.getKey();
        return null;
    }

    /** mg/día a partir de la presentación y las unidades por día (misma lógica que vw_detalle_receta_dosis). */
    static Double mgPerDay(Double concentration, String concUnit, String denominator, String unit, Double unitsPerDay) {
        if (concentration == null || unitsPerDay == null || !"mg".equals(concUnit) || denominator == null || unit == null) return null;
        String den = normalize(denominator), u = normalize(unit).replaceAll("s$", "");
        if ((den.equals("tableta") || den.equals("capsula") || den.equals("supositorio")) && (u.equals(den) || u.equals("tab") || u.equals("cap"))) {
            return concentration * unitsPerDay;
        }
        if (den.equals("5 ml") && (u.equals("ml") || u.equals("cc"))) return concentration * unitsPerDay / 5.0;
        return null;
    }

    static String normalize(String s) {
        if (s == null) return "";
        return Normalizer.normalize(s, Normalizer.Form.NFD).replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT);
    }

    private static Integer ageFrom(Object birth) {
        LocalDate d = dateFrom(birth);
        if (d == null) return null;
        int years = Period.between(d, LocalDate.now()).getYears();
        return years >= 0 && years < 130 ? years : null;
    }

    /** Fechas guardadas como ISO (texto) o como milisegundos. */
    static LocalDate dateFrom(Object v) {
        if (v == null) return null;
        if (v instanceof Number n) {
            return java.time.Instant.ofEpochMilli(n.longValue()).atZone(java.time.ZoneId.systemDefault()).toLocalDate();
        }
        String s = v.toString().trim();
        if (s.isEmpty()) return null;
        try { return LocalDateTime.parse(s).toLocalDate(); } catch (DateTimeParseException ignored) { }
        try { return LocalDate.parse(s.length() > 10 ? s.substring(0, 10) : s); } catch (DateTimeParseException ignored) { }
        try { return dateFrom(Long.parseLong(s)); } catch (NumberFormatException ignored) { }
        return null;
    }

    private static Double num(Object o) {
        return o instanceof Number n ? n.doubleValue() : null;
    }

    private static double round(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    private static String fmt(Double v) {
        if (v == null) return "?";
        return v == Math.floor(v) ? String.valueOf(v.longValue()) : String.valueOf(round(v));
    }

    private static String lowerFirst(String s) {
        return s == null || s.isEmpty() ? s : Character.toLowerCase(s.charAt(0)) + s.substring(1);
    }

    private static int severityRank(String s) {
        return switch (s) { case "ALTA" -> 0; case "MODERADA" -> 1; default -> 2; };
    }

    private static String worst(String a, String b) {
        List<String> order = List.of("OK", "SIN_DATOS", "REVISAR", "ALTA");
        int ia = order.indexOf(a), ib = order.indexOf(b);
        return ib > ia ? b : a;
    }

    private static Map<String, Object> mapOf(Object... kv) {
        Map<String, Object> m = new LinkedHashMap<>();
        for (int i = 0; i < kv.length; i += 2) m.put((String) kv[i], kv[i + 1]);
        return m;
    }
}
