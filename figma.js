import fetch from 'node-fetch';
import { exit } from 'process';

const FIGMA_API_TOKEN = "386950-5e226a7b-1748-4302-87cd-1eb7ee285487";
const REQUIRED_ARGS = ['file'];

const argv = process.argv.slice(2);
const args = {};
argv.forEach(arg => {
  console.log(arg);
  const [key, val] = arg.split(':');

  args[key] = val;
});

if (!args.file) { 
  exit(1);
}

const callFigma = async path => {
  const headers = { 'X-Figma-Token': FIGMA_API_TOKEN };
  const BASE_PATH = 'https://api.figma.com/v1';
  const target = `${BASE_PATH}${path}`;

  console.log(target);
  const res = await fetch(target, { headers });
  const data = await res.json();

  return data;
}

const rgbToHexa = ({ r, g, b}) =>  {
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
}

const rawStyles = await callFigma(`/files/${args.file}/styles`);
const styles = rawStyles.meta.styles.map(({ key, node_id, name }) => ({
  key,
  name,
  nodeId: node_id,
}));

const nodeIds = styles.map(stl => stl.nodeId).join(',');
const rawNodes = await callFigma(`/files/${args.file}/nodes?ids=${nodeIds}`);

const { Decision, Options } = Object.entries(rawNodes.nodes)
  .reduce((carr, [, { document: { fills, name } }]) => {
    const { r, g, b } = fills[0].color;
    const [category, ...rest] = name.split('/');
  
    const token = { name: rest[rest.length - 1], value: rgbToHexa({ r, g, b }) };
    return  { ...carr, [category]: [...carr[category], token] }
  },
  { 'Decision': [], 'Options': [] },
  );

  const processedDecision = Decision.map(token => {
    const { name } = Options.find( opt => opt.value === token.value );
    return { ...token, value: name };
  });

  const TOKENS = [...Options, ...processedDecision];
  console.log(TOKENS);

 

