# u

Muestra cuánto te queda del límite de 5 horas y del semanal de Claude, y cuánto falta para que se renueven.

Escribe `/u` y te contesta así (la respuesta no se le manda a Claude ni gasta de tu límite):

```
u: 🟢 88 % - 2h 15m -- 🟢 84 % - 2d 03h 20m
```

- Primero va el límite de 5 horas y el tiempo que falta para que se renueve.
- Después va el límite semanal y el tiempo que falta (días, horas, minutos).
- 🟢 60 % o más · 🟡 40-55 % · 🟠 20-35 % · 🔴 menos de 20 %.
- Si el límite ya se renovó, sale solo el porcentaje hasta tu siguiente mensaje a Claude.
- En las sesiones locales también sale una franja con baterías de colores encima de la caja de texto.
- Solo funciona con una suscripción de Claude (Pro o Max).
