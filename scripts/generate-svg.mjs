import fs from "node:fs";
import sharp from "sharp";

async function makeSvg() {
  const meta = await sharp("public/images/maas-logo-white.png").metadata();
  const base64White = (await sharp("public/images/maas-logo-white.png").toBuffer()).toString("base64");
  const base64Dark = (await sharp("public/images/maas-logo-dark.png").toBuffer()).toString("base64");
  const base64Gold = (await sharp("public/images/maas-logo-gold.png").toBuffer()).toString("base64");
  const w = meta.width;
  const h = meta.height;

  // 1. CurrentColor adaptive SVG with mask
  const adaptiveSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
  <defs>
    <mask id="maas-logo-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}">
      <image href="data:image/png;base64,${base64White}" width="${w}" height="${h}" />
    </mask>
  </defs>
  <rect width="${w}" height="${h}" fill="currentColor" mask="url(#maas-logo-mask)" />
</svg>`;
  fs.writeFileSync("public/images/maas-logo.svg", adaptiveSvg);

  // 2. White SVG
  const whiteSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
  <image href="data:image/png;base64,${base64White}" width="${w}" height="${h}" />
</svg>`;
  fs.writeFileSync("public/images/maas-logo-white.svg", whiteSvg);

  // 3. Dark SVG
  const darkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
  <image href="data:image/png;base64,${base64Dark}" width="${w}" height="${h}" />
</svg>`;
  fs.writeFileSync("public/images/maas-logo-dark.svg", darkSvg);

  // 4. Gold SVG
  const goldSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
  <image href="data:image/png;base64,${base64Gold}" width="${w}" height="${h}" />
</svg>`;
  fs.writeFileSync("public/images/maas-logo-gold.svg", goldSvg);

  console.log("Generated all SVG variations successfully!", { w, h });
}

makeSvg();
