package com.example.backend_vitali.common;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;

/**
 * Guarda LocalDate como texto ISO (yyyy-MM-dd) y lee tanto ese formato como
 * los milisegundos que el driver de SQLite escribía antes (p. ej. "644562000000").
 * Sin esto, leer una columna TEXT con milisegundos lanzaba un error 500.
 */
@Converter
public class SqliteLocalDateConverter implements AttributeConverter<LocalDate, String> {

    @Override
    public String convertToDatabaseColumn(LocalDate attribute) {
        return attribute == null ? null : attribute.toString();
    }

    @Override
    public LocalDate convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return null;
        }
        String value = dbData.trim();

        try {
            return LocalDate.parse(value.length() > 10 ? value.substring(0, 10) : value);
        } catch (DateTimeParseException ignored) {
        }

        try {
            return Instant.ofEpochMilli(Long.parseLong(value))
                    .atZone(ZoneId.systemDefault())
                    .toLocalDate();
        } catch (NumberFormatException ignored) {
        }

        return null; // formato desconocido: no se rompe el listado por una fecha
    }
}
