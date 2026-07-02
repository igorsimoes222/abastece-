// Exemplo de uso no React Native / Expo
export const postoIcons = {
  petrobras: require('./assets/postos/png_128/petrobras.png'),
  shell: require('./assets/postos/png_128/shell.png'),
  ipiranga: require('./assets/postos/png_128/ipiranga.png'),
  sete_estrelas: require('./assets/postos/png_128/sete_estrelas.png'),
  generico: require('./assets/postos/png_128/generico.png'),
};

// <Marker coordinate={posto.coordinate}>
//   <Image source={postoIcons[posto.bandeira] || postoIcons.generico} style={{ width: 38, height: 38 }} />
// </Marker>
