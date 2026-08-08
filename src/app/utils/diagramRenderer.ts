export interface IDiagramShape {
  id: string;
  // All coordinates are percentages (0-100) of the canvas, so the AI never
  // has to know real pixel dimensions.
  x: number;
  y: number;
  width: number;
  height: number;
  // A pre-printed label (helps the user orient themselves), OR a blank
  // number the user must identify from the passage/script. A shape should
  // have exactly one of these.
  label?: string;
  blankNumber?: number;
}

export interface IDiagramConnection {
  fromId: string;
  toId: string;
}

export interface IDiagramSpec {
  type: 'floorplan' | 'process';
  title: string;
  shapes: IDiagramShape[];
  connections?: IDiagramConnection[];
}

const VIEWBOX_WIDTH = 600;
const VIEWBOX_HEIGHT = 400;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const escapeXml = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const toPx = (percent: number, dimension: number) => (clamp(percent, 0, 100) / 100) * dimension;

const shapeRect = (shape: IDiagramShape) => {
  const x = toPx(shape.x, VIEWBOX_WIDTH);
  const y = toPx(shape.y, VIEWBOX_HEIGHT);
  const width = toPx(Math.max(shape.width, 4), VIEWBOX_WIDTH);
  const height = toPx(Math.max(shape.height, 4), VIEWBOX_HEIGHT);
  return { x, y, width, height, centerX: x + width / 2, centerY: y + height / 2 };
};

const renderShape = (shape: IDiagramShape, rounded: boolean) => {
  const { x, y, width, height, centerX, centerY } = shapeRect(shape);
  const rectEl = `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rounded ? 10 : 2}"
    fill="#f1f5f9" stroke="#334155" stroke-width="1.5" />`;

  if (shape.blankNumber != null) {
    return `${rectEl}
      <circle cx="${centerX}" cy="${centerY}" r="14" fill="#fff" stroke="#334155" stroke-width="1.5" />
      <text x="${centerX}" y="${centerY + 5}" text-anchor="middle" font-size="14" font-weight="700" fill="#0f172a">${shape.blankNumber}</text>`;
  }

  return `${rectEl}
    <text x="${centerX}" y="${centerY + 4}" text-anchor="middle" font-size="12" fill="#0f172a">${escapeXml(shape.label ?? '')}</text>`;
};

const renderConnections = (spec: IDiagramSpec) => {
  if (!spec.connections?.length) return '';
  const shapeMap = new Map(spec.shapes.map((s) => [s.id, shapeRect(s)]));

  return spec.connections
    .map((conn) => {
      const from = shapeMap.get(conn.fromId);
      const to = shapeMap.get(conn.toId);
      if (!from || !to) return '';
      const x1 = from.x + from.width;
      const y1 = from.centerY;
      const x2 = to.x;
      const y2 = to.centerY;
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)" />`;
    })
    .join('\n');
};

export const renderDiagramSvg = (spec: IDiagramSpec): string => {
  const rounded = spec.type === 'process';
  const shapes = spec.shapes.map((s) => renderShape(s, rounded)).join('\n');
  const connections = renderConnections(spec);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}" width="${VIEWBOX_WIDTH}" height="${VIEWBOX_HEIGHT}">
    <defs>
      <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L0,6 L9,3 z" fill="#64748b" />
      </marker>
    </defs>
    <rect x="0" y="0" width="${VIEWBOX_WIDTH}" height="${VIEWBOX_HEIGHT}" fill="#ffffff" />
    <text x="${VIEWBOX_WIDTH / 2}" y="24" text-anchor="middle" font-size="15" font-weight="700" fill="#0f172a">${escapeXml(spec.title)}</text>
    ${connections}
    ${shapes}
  </svg>`;
};

// A data: URI avoids any dependency on Cloudinary's SVG delivery policy (some
// accounts restrict serving inline SVG for XSS reasons) and needs no network
// round-trip — these diagrams are small (a handful of shapes/text).
export const diagramSpecToImageUrl = (spec: IDiagramSpec): string => {
  const svg = renderDiagramSvg(spec);
  const base64 = Buffer.from(svg, 'utf-8').toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
};
