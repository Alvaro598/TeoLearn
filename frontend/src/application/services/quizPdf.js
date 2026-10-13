const NOMBRE_MODULO = { ritmo: "Ritmo", melodia: "Melodía", armonia: "Armonía" };

export function generarPDF({ moduloSlug, preguntas, respuestas, nombreUsuario }) {
  const total = preguntas.length;
  const aciertos = preguntas.filter((p) => respuestas[p.id] === p.respuesta).length;
  const errores = total - aciertos;
  const pct = total ? Math.round((aciertos / total) * 100) : 0;
  const modulo = NOMBRE_MODULO[moduloSlug] || moduloSlug;
  const fecha = new Date().toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const radio = 60;
  const circum = 2 * Math.PI * radio;
  const offset = circum * (1 - (total ? aciertos / total : 0));
  const svgDonut = `
    <svg width="160" height="160" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
      <circle cx="80" cy="80" r="${radio}" fill="none" stroke="#fee2e2" stroke-width="22"/>
      <circle cx="80" cy="80" r="${radio}" fill="none" stroke="#22c55e" stroke-width="22"
        stroke-dasharray="${circum}" stroke-dashoffset="${offset}"
        transform="rotate(-90 80 80)"/>
      <text x="80" y="76" text-anchor="middle" font-size="26" font-weight="800" fill="#111">${pct}%</text>
      <text x="80" y="97" text-anchor="middle" font-size="11" fill="#555">correcto</text>
    </svg>`;

  const barW = 28;
  const barGap = 8;
  const maxH = 80;
  const svgBars = `
    <svg width="${total * (barW + barGap)}" height="120" xmlns="http://www.w3.org/2000/svg">
      ${preguntas.map((p, i) => {
        const correcto = respuestas[p.id] === p.respuesta;
        const x = i * (barW + barGap);
        return `
          <rect x="${x}" y="${maxH - (correcto ? maxH : 30)}" width="${barW}" height="${correcto ? maxH : 30}"
            fill="${correcto ? "#22c55e" : "#ef4444"}" rx="4"/>
          <text x="${x + barW / 2}" y="112" text-anchor="middle" font-size="10" fill="#444">P${i + 1}</text>`;
      }).join("")}
    </svg>`;

  const filas = preguntas.map((p) => {
    const correcto = respuestas[p.id] === p.respuesta;
    return `
      <tr style="background:${correcto ? "#f0fdf4" : "#fef2f2"}">
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${p.id}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${p.pregunta}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${respuestas[p.id] || "-"}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${p.respuesta}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;font-weight:bold;color:${correcto ? "#16a34a" : "#dc2626"}">${correcto ? "OK" : "X"}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${p.explicacion || ""}</td>
      </tr>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Quiz ${modulo} - TeoLearn</title>
  <style>
    @page { size: A4; margin: 20mm; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #111; font-size: 13px; }
    h1 { font-size: 24px; margin: 0 0 4px; }
    h2 { font-size: 16px; color: #555; margin: 0 0 16px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #3b82f6; padding-bottom: 12px; margin-bottom: 24px; }
    .brand { font-size: 11px; color: #3b82f6; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
    .charts { display: flex; align-items: center; gap: 40px; margin-bottom: 28px; }
    .legend { font-size: 13px; line-height: 2; }
    .dot { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 6px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #1e3a5f; color: #fff; padding: 8px 10px; text-align: left; }
    td { vertical-align: top; }
    .footer { margin-top: 28px; font-size: 10px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 10px; }
    .score-box { background: #eff6ff; border: 2px solid #3b82f6; border-radius: 12px; padding: 16px 24px; display: inline-block; margin-bottom: 24px; }
    .score-big { font-size: 36px; font-weight: 900; color: #1d4ed8; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">TeoLearn - Evaluación musical</div>
      <h1>Quiz de evaluación: ${modulo}</h1>
      <h2>${nombreUsuario || "Estudiante"} · ${fecha}</h2>
    </div>
    <div class="score-box">
      <div class="score-big">${pct}%</div>
      <div style="font-size:13px;color:#555">${aciertos} / ${total} correctas</div>
    </div>
  </div>

  <div class="charts">
    <div>${svgDonut}</div>
    <div>
      <div class="legend">
        <span class="dot" style="background:#22c55e"></span> Aciertos: <strong>${aciertos}</strong><br/>
        <span class="dot" style="background:#ef4444"></span> Errores: <strong>${errores}</strong><br/>
        <span class="dot" style="background:#3b82f6"></span> Total: <strong>${total}</strong>
      </div>
    </div>
    <div>
      <div style="font-size:11px;color:#777;margin-bottom:6px">Resultado por pregunta</div>
      ${svgBars}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Pregunta</th>
        <th>Respuesta del estudiante</th>
        <th>Respuesta correcta</th>
        <th>Resultado</th>
        <th>Explicación</th>
      </tr>
    </thead>
    <tbody>${filas}</tbody>
  </table>

  <div class="footer">
    Generado por TeoLearn · Módulo: ${modulo} · ${fecha}
  </div>

  <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }</script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return;
  win.document.write(html);
  win.document.close();
}
