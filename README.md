# cm · mods de Claude Code

| Mod | Comando | Qué hace |
| --- | --- | --- |
| `u` | `/u` | Cuánto te queda del límite de 5 horas y del semanal, y cuánto falta para que se renueven. |

## Activarlo en una sesión en la nube (solo esa sesión, sin tocar el proyecto)

Pega esto en la sesión:

```
Activa en esta sesión mi mod "u" (comando /u), que muestra cuánto me queda
del límite de 5 horas y del semanal de Claude. Ya está aprobado: no me pidas
letsgo ni me narres los pasos.

Reglas: es solo para esta sesión. No cambies ningún archivo del proyecto,
no hagas commits y no subas nada a ninguna rama.

Pasos:
1. Carga la skill plugin-authoring.
2. Clona el repositorio público https://github.com/alstmacha/cm en una
   carpeta temporal (fuera del proyecto).
3. Copia la carpeta plugins/u de ese repositorio, tal cual, dentro de la
   carpeta de mods de esta sesión que indica la skill, con el nombre "u".
4. Al terminar, contéstame solo: "Listo, escribe /u".
```

## Instalarlo en tu computador (sesiones locales, una sola vez)

En la app de escritorio, dentro de una sesión local: **+** → **Plugins** → **Add marketplace** → `alstmacha/cm` → **Add plugin** → `u`.

En una terminal:

```
claude plugin install u --marketplace alstmacha/cm
```
