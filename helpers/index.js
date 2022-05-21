import fetch from 'node-fetch';

export const buildArgs = argv => argv.reduce((carr, arg) => {
  const [key, val] = arg.split(':');
  return { ...carr, [key]:val };
}, {});

export const fetchFigma = async (path, { apiKey }) => {
  const headers = { 'X-Figma-Token': apiKey };
  const BASE_PATH = 'https://api.figma.com/v1';
  const target = `${BASE_PATH}${path}`;

  console.log(target);
  const res = await fetch(target, { headers });
  const data = await res.json();

  return data;
};

export const rgbToHexa = ({ r, g, b}) =>  {
  const hexa = [
    (r * 255).toString(16),
    (g * 255).toString(16),
    (b * 255).toString(16),
  ];

  const normalized = hexa.map(v => {
    const res =  v === '0' ? '00' : v.split('.')[0];
    return res;
  });

  return `#${normalized.join('')}`;
};

export const applyOptionTokenName = (options, decision) => {
  const porcessedDecision = decision.map(token => {
    const { name } = options.find( opt => opt.value === token.value );
    return { ...token, value: name };
  });

  return [...options, ...porcessedDecision];
};

export const buildCssTokens = tokens => tokens.reduce((css, { category, name, value }) => {
  const cssValue = category === 'options' ? value : `var(${value})`;
  return `${css}
      ${name}: ${cssValue};`
}, ``);