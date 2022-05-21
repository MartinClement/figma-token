import { exit } from 'process';
import {
  fetchFigma,
  rgbToHexa,
  buildArgs,
  applyOptionTokenName,
  buildCssTokens,
} from './helpers/index.js';

import fs from 'fs';

// const FIGMA_API_TOKEN = "386950-5e226a7b-1748-4302-87cd-1eb7ee285487";
const REQUIRED_ARGS = ['apiKey', 'file'];

const argv = process.argv.slice(2);
const args = buildArgs(argv);

if (args.length < REQUIRED_ARGS.length) {
  console.log(`Require at least those two args:
    - file:<figma_file>
    - apiKey:<figma_api_key>
  `);
  exit(1);
}


const { meta: { styles }} = await fetchFigma(`/files/${args.file}/styles`, args);
const styleNodeIds = styles.map(({ node_id }) => node_id).join(',');

const { nodes } = await fetchFigma(`/files/${args.file}/nodes?ids=${styleNodeIds}`, args);
const { decision, options } = Object.entries(nodes)
  .reduce((carr, [, { document: { fills, name } }]) => {
    const { r, g, b } = fills[0].color;
    const [category, ...rest] = name.split('/');
  
    const token = { category: category.toLowerCase(), name: rest[rest.length - 1], value: rgbToHexa({ r, g, b }) };
    return  { ...carr, [category.toLowerCase()]: [...carr[category.toLowerCase()], token] }
  },
  { decision: [], options: [] },
  );

const DESIGN_TOKENS = applyOptionTokenName(options, decision);

if (args.export === 'css') {
  const cssTokens = buildCssTokens(DESIGN_TOKENS);
  const cssExportFileContent = `:root {
    ${cssTokens}
  }`

  fs.writeFile('./build/css/design_tokens.css', cssExportFileContent, function (err) {
    if (err) throw err;
    console.log('CSS TOken exported to ./build/css');
 });
}



 

