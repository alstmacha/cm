# bateria

Muestra, encima de la caja donde escribes en Claude Code, dos baterías de colores:

```
[███████░░░]▌ 72 % - 15:40 -- [██████░░░░]▌ 60 % - 23/11 - 09:00
```

- La primera es lo que te queda del límite de 5 horas y la hora en que se recarga.
- La segunda es lo que te queda del límite semanal y el día y la hora en que se recarga.
- El color cambia cada 5 %: verde cuando está llena, amarillo a la mitad y rojo cuando se acaba.
- Las horas van en hora de Ecuador (UTC−5).
- Solo funciona con una suscripción de Claude (Pro o Max); el dato llega después de la primera respuesta de la sesión.

## Comando /bateria (sirve también en las sesiones en la nube)

Escribe `/bateria` y te contesta en el chat, sin gastar de tu límite:

```
🟢 88 % - 03:00 -- 🟢 84 % - 19/11 - 10:00
```

🟢 60 % o más · 🟡 40-55 % · 🟠 20-35 % · 🔴 menos de 20 %.
