import * as fs from 'fs';

const targetPath = './src/environments/environment.ts';

const envConfigFile = `
export const environment = {
  apiUrl: '${process.env.API_URL || ''}'
};
`;

fs.mkdirSync('./src/environments', { recursive: true });
fs.writeFileSync(targetPath, envConfigFile);

console.log(`Environment file generated at ${targetPath}.`);
