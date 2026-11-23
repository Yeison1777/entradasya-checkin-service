# checkin-service

Valida entradas y registra el ingreso al evento. Es propietario de `checkin_db` y consulta los códigos exclusivamente mediante HTTP a `tickets-service`.

## Resultados del escaneo

- `ADMITTED`: primer ingreso registrado correctamente.
- `INVALID_CODE`: código inexistente o entrada cancelada.
- `WRONG_EVENT`: la entrada pertenece a otro evento.
- `ALREADY_USED`: ya existe un ingreso; incluye la hora original.
- `VALIDATION_UNAVAILABLE`: no fue posible consultar `tickets-service`.

La restricción única de PostgreSQL sobre `ticket_id` decide cuál solicitud gana si dos dispositivos escanean simultáneamente la última entrada. El segundo recibe `ALREADY_USED`.

## Endpoints

| Método | Ruta | Acceso | Uso |
|---|---|---|---|
| `POST` | `/checkins` | Portero | Validar y registrar ingreso |
| `GET` | `/checkins/events/:eventId/summary` | Portero u organizador propietario | Total admitido |
| `GET` | `/checkins/events/:eventId/recent` | Portero u organizador propietario | Últimos 20 ingresos |
| `GET` | `/health/live` | Público local | Estado del proceso |
| `GET` | `/health/ready` | Público local | Disponibilidad de PostgreSQL |

El registro requiere rol `DOOR_STAFF`. Un organizador puede consultar reportes únicamente después de verificar la propiedad del evento en `events-service`.

Ejemplo:

```json
{
  "eventId": "UUID",
  "code": "codigo_obtenido_del_qr"
}
```

Los listados recientes no devuelven el código completo, solamente los últimos seis caracteres.

## Base local

```bash
pnpm db:checkin:deploy
```

## Desarrollo

```bash
pnpm --filter checkin-service dev
pnpm --filter checkin-service test
pnpm --filter checkin-service test:e2e
pnpm --filter checkin-service build
```
