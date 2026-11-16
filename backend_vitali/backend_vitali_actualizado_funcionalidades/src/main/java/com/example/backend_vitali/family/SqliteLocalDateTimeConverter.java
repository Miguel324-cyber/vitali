package com.example.backend_vitali.family;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

@Converter
public class SqliteLocalDateTimeConverter
        implements AttributeConverter<LocalDateTime, String> {

    private static final DateTimeFormatter DB_FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Override
    public String convertToDatabaseColumn(LocalDateTime attribute) {
        if (attribute == null) {
            return null;
        }

        return attribute.format(DB_FORMAT);
    }

    @Override
    public LocalDateTime convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return null;
        }

        String value = dbData.trim();

        // ISO normal:
        // 2026-11-12T19:30:00
        try {
            return LocalDateTime.parse(value);
        } catch (DateTimeParseException ignored) {
        }

        // ISO con offset:
        // 2026-11-12T19:30:00-05:00
        try {
            return OffsetDateTime.parse(value).toLocalDateTime();
        } catch (DateTimeParseException ignored) {
        }

        // Formato típico SQLite:
        // 2026-11-12 19:30:00
        try {
            return LocalDateTime.parse(value, DB_FORMAT);
        } catch (DateTimeParseException ignored) {
        }

        // Timestamp con milisegundos:
        // 2026-11-12 19:30:00.123
        try {
            return LocalDateTime.parse(
                    value,
                    DateTimeFormatter.ofPattern(
                            "yyyy-MM-dd HH:mm:ss.SSS"
                    )
            );
        } catch (DateTimeParseException ignored) {
        }

        // Timestamp numérico en milisegundos
        try {
            long number = Long.parseLong(value);

            if (value.length() >= 13) {
                return Instant.ofEpochMilli(number)
                        .atZone(ZoneId.systemDefault())
                        .toLocalDateTime();
            }

            return Instant.ofEpochSecond(number)
                    .atZone(ZoneId.systemDefault())
                    .toLocalDateTime();

        } catch (NumberFormatException ignored) {
        }

        throw new IllegalArgumentException(
                "Formato de fecha SQLite no soportado: " + value
        );
    }
}