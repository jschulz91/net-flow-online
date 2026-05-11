# net-flow-online — JSON Import/Export Schema v2.0

Dieses Dokument beschreibt das vollständige JSON-Format für den Import und Export von Diagrammen.

---

## Wurzelstruktur

```json
{
  "version": "2.0",
  "exportedAt": "2026-05-09T10:00:00.000Z",
  "meta": { ... },
  "swimlane": { "IST": { ... }, "SOLL": { ... } },
  "sequence": { "IST": { ... }, "SOLL": { ... } }
}
```

| Feld | Typ | Beschreibung |
|---|---|---|
| `version` | `"2.0"` | Immer der String `"2.0"` |
| `exportedAt` | ISO-8601 | Exportzeitpunkt |
| `meta` | `Meta` | Projektinformationen |
| `swimlane.IST` / `swimlane.SOLL` | `SwimlaneCanvas` | Swimlane-Diagramm je Modus |
| `sequence.IST` / `sequence.SOLL` | `SequenceCanvas` | Sequenzdiagramm je Modus |

---

## Meta

```json
"meta": {
  "title": "Auftragsabwicklung MES",
  "creator": "J. Schulz",
  "version": "1.2",
  "createdAt": "2026-05-01T08:00:00.000Z",
  "updatedAt": "2026-05-09T10:00:00.000Z",
  "description": "IST-Ablauf Fertigungsauftrag"
}
```

---

## SwimlaneCanvas

```json
{
  "lanes": [ ... ],
  "nodes": [ ... ],
  "edges": [ ... ],
  "viewport": { "x": 0, "y": 0, "zoom": 1 }
}
```

### Lane

```json
{
  "id": "abc123",
  "label": "MES",
  "color": "rgba(59,130,246,0.12)",
  "order": 0,
  "height": 160,
  "collapsed": false
}
```

| Feld | Typ | Beschreibung |
|---|---|---|
| `order` | int | Vertikale Reihenfolge, 0-basiert |
| `height` | int px | Mindesthöhe 80 |
| `color` | CSS-Farbe | Hintergrundfarbe der Lane |

### Node (React Flow)

```json
{
  "id": "n1",
  "type": "process",
  "position": { "x": 300, "y": 50 },
  "data": {
    "label": "Auftrag anlegen",
    "description": "Tooltip-Text",
    "stepNumber": 1,
    "color": "#dbeafe",
    "borderColor": "#3b82f6",
    "laneId": "abc123",
    "nodeType": "process"
  }
}
```

**`type` / `nodeType`** — beide müssen identisch sein:

| Wert | Form |
|---|---|
| `process` | Rechteck |
| `decision` | Raute |
| `startEnd` | Oval |
| `externalSystem` | Gestrichelter Rahmen |
| `database` | Zylinder |
| `event` | Pfeilform |
| `document` | Rechteck + gefaltete Ecke |
| `custom` | Freie Farbe |

`stepNumber` ist optional. `position` sind SVG-Pixelkoordinaten relativ zur Lane (y=0 = Lane-Oberkante).

### Edge (React Flow)

```json
{
  "id": "e1",
  "source": "n1",
  "target": "n2",
  "type": "flowEdge",
  "data": {
    "label": "REST POST /orders",
    "lineStyle": "solid",
    "arrowDirection": "forward",
    "color": "#64748b"
  }
}
```

| `lineStyle` | Bedeutung |
|---|---|
| `solid` | Synchron |
| `dashed` | Asynchron |
| `dotted` | Event-getrieben |

| `arrowDirection` | Pfeil |
|---|---|
| `forward` | → |
| `back` | ← |
| `both` | ↔ |
| `none` | kein Pfeil |

---

## SequenceCanvas

```json
{
  "lifelines": [ ... ],
  "messages": [ ... ],
  "activationBars": [ ... ],
  "fragments": [ ... ],
  "zones": [ ... ]
}
```

### Lifeline

```json
{
  "id": "ll1",
  "label": "MES",
  "description": "",
  "type": "system",
  "color": "#10b981",
  "order": 0,
  "icon": null
}
```

| `type` | Symbol |
|---|---|
| `actor` | Menschlicher Akteur |
| `system` | Software-Komponente |
| `database` | Datenbank |
| `boundary` | UI / Interface |
| `control` | Controller / Prozess |
| `entity` | Datenentität |
| `custom` | Frei (mit optionalem `icon`-Emoji) |

`order` bestimmt die horizontale Position (0 = ganz links). Reihenfolge muss lückenlos 0,1,2,… sein.

### SequenceMessage

```json
{
  "id": "m1",
  "order": 0,
  "fromLifelineId": "ll1",
  "toLifelineId": "ll2",
  "label": "createOrder(id, qty)",
  "type": "sync",
  "note": ""
}
```

`order` bestimmt die vertikale Reihenfolge (0 = oben). Muss lückenlos 0,1,2,… sein.

| `type` | Linie | Pfeilspitze |
|---|---|---|
| `sync` | durchgezogen | ausgefülltes Dreieck ▶ |
| `async` | durchgezogen | offene Spitze › |
| `return` | gestrichelt | offene Spitze › |
| `self` | durchgezogen | ausgefülltes Dreieck (Schleife) |
| `create` | gestrichelt | offene Spitze › |
| `destroy` | durchgezogen | × |

### ActivationBar

```json
{
  "id": "bar1",
  "lifelineId": "ll1",
  "y": 200,
  "height": 120
}
```

`y` und `height` sind SVG-Pixelkoordinaten. Der Balken liegt immer auf der Lebenslauflinie der zugehörigen Lifeline. Mindesthöhe: 20.

### SequenceFragment

```json
{
  "id": "f1",
  "type": "loop",
  "label": "i < Positionen",
  "startMessageOrder": 2,
  "endMessageOrder": 5,
  "lifelineIds": ["ll1", "ll2"]
}
```

| `type` | Bedeutung |
|---|---|
| `alt` | Alternative (if/else) |
| `opt` | Optional |
| `loop` | Schleife |
| `par` | Parallel |
| `ref` | Referenz auf anderes Diagramm |

`startMessageOrder` / `endMessageOrder` referenzieren `order`-Werte von Nachrichten.

### SequenceZone

```json
{
  "id": "z1",
  "label": "OT-Netz",
  "lifelineIds": ["ll1", "ll2"],
  "x": 40,
  "width": 520,
  "fillColor": "rgba(59,130,246,0.12)",
  "borderColor": "#93c5fd"
}
```

`x` und `width` sind SVG-Pixelkoordinaten. Lebenslinienpositionen: `x = 80 + order × 240`. Eine Zone um Lifeline 0 und 1 wäre also etwa `x=−40, width=520` — oder einfacher berechnet: `x = leftMargin + minOrder × spacing − spacing/2`.

Faustregel für `x`-Berechnung:
```
leftMargin = 80
spacing    = 240
x     = leftMargin + minOrder × spacing − spacing/2
width = (maxOrder − minOrder) × spacing + spacing
```

`lifelineIds` ist informell (für die Properties-Anzeige) und hat keinen Einfluss auf die visuelle Position.

---

## Vollständiges Minimalbeispiel

```json
{
  "version": "2.0",
  "exportedAt": "2026-05-09T10:00:00.000Z",
  "meta": {
    "title": "Auftragsanlage",
    "creator": "J. Schulz",
    "version": "1.0",
    "createdAt": "2026-05-09T10:00:00.000Z",
    "updatedAt": "2026-05-09T10:00:00.000Z",
    "description": ""
  },
  "swimlane": {
    "IST": {
      "lanes": [
        { "id": "l1", "label": "Operator", "color": "rgba(59,130,246,0.12)", "order": 0, "height": 160, "collapsed": false },
        { "id": "l2", "label": "MES",      "color": "rgba(16,185,129,0.12)", "order": 1, "height": 160, "collapsed": false }
      ],
      "nodes": [
        { "id": "n1", "type": "startEnd",  "position": { "x": 100, "y": 60 }, "data": { "label": "Start",          "description": "", "color": "#d1fae5", "borderColor": "#10b981", "laneId": "l1", "nodeType": "startEnd" } },
        { "id": "n2", "type": "process",   "position": { "x": 300, "y": 60 }, "data": { "label": "Auftrag anlegen","description": "", "color": "#dbeafe", "borderColor": "#3b82f6", "laneId": "l2", "nodeType": "process", "stepNumber": 1 } }
      ],
      "edges": [
        { "id": "e1", "source": "n1", "target": "n2", "type": "flowEdge", "data": { "label": "", "lineStyle": "solid", "arrowDirection": "forward", "color": "#64748b" } }
      ],
      "viewport": { "x": 0, "y": 0, "zoom": 1 }
    },
    "SOLL": { "lanes": [], "nodes": [], "edges": [], "viewport": { "x": 0, "y": 0, "zoom": 1 } }
  },
  "sequence": {
    "IST": {
      "lifelines": [
        { "id": "ll1", "label": "Operator", "description": "", "type": "actor",  "color": "#3b82f6", "order": 0 },
        { "id": "ll2", "label": "MES",      "description": "", "type": "system", "color": "#10b981", "order": 1 }
      ],
      "messages": [
        { "id": "m1", "order": 0, "fromLifelineId": "ll1", "toLifelineId": "ll2", "label": "createOrder()", "type": "sync",   "note": "" },
        { "id": "m2", "order": 1, "fromLifelineId": "ll2", "toLifelineId": "ll1", "label": "orderId",       "type": "return", "note": "" }
      ],
      "activationBars": [
        { "id": "bar1", "lifelineId": "ll2", "y": 192, "height": 72 }
      ],
      "fragments": [],
      "zones": []
    },
    "SOLL": { "lifelines": [], "messages": [], "activationBars": [], "fragments": [], "zones": [] }
  }
}
```
