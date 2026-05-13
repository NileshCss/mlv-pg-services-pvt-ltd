const fs = require('fs');
const files = [
  'components/sections/FacilitiesSection.tsx',
  'components/sections/Footer.tsx',
  'components/sections/HeroSection.tsx',
  'components/sections/RoomsSection.tsx',
  'components/sections/TestimonialsSection.tsx',
  'components/sections/AboutSection.tsx'
];
files.forEach(f => {
  if(fs.existsSync(f)) {
    let text = fs.readFileSync(f, 'utf8');
    text = text.replace(/ease:\s*\[([\d\.\s,]+)\](?! as any)/g, 'ease: [$1] as any');
    fs.writeFileSync(f, text);
  }
});
console.log('done');
