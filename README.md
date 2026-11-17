# cm · mods de Claude Code

Mis mods (plugins) para Claude Code.

| Mod | Qué hace |
| --- | --- |
| `bateria` | Batería de colores con lo que te queda del límite de 5 horas y del semanal, con la hora de recarga (hora de Ecuador). En las sesiones en la nube se usa con el comando `/bateria`. |

## Instalar en tu computador (una sola vez)

En una terminal de Claude Code:

```
/plugin install bateria --marketplace alstmacha/cm
```

Responde `y` para agregar el catálogo y elige el alcance de usuario (el primero) con Enter.

En la app de escritorio: botón **+** junto a la caja de texto → **Plugins** → **Add marketplace** → `alstmacha/cm` → **Add plugin** → `bateria`.

## Activarlo en las sesiones en la nube de un repositorio

Agrega esto en `.claude/settings.json` del repositorio:

```json
{
  "extraKnownMarketplaces": {
    "cm": { "source": { "source": "github", "repo": "alstmacha/cm" } }
  },
  "enabledPlugins": { "bateria@cm": true }
}
```
