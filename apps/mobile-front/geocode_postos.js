const https = require('https');

const postos = [
  { id:'sete_estrelas_001', cidade:'Aparecida do Norte', uf:'SP', endereco:'Av. Padroeira do Brasil, 444', bairro:'São Roque', cep:'12570-000' },
  { id:'sete_estrelas_002', cidade:'Bragança Paulista', uf:'SP', endereco:'Av. José Gomes da Rocha Leal, 914', bairro:'Centro', cep:'12900-301' },
  { id:'sete_estrelas_003', cidade:'Caçapava', uf:'SP', endereco:'Rua Prof. João Batista Ortiz Monteiro, 613', bairro:'', cep:'12287-310' },
  { id:'sete_estrelas_004', cidade:'Caçapava', uf:'SP', endereco:'Av. Brasil, 480', bairro:'', cep:'12287-020' },
  { id:'sete_estrelas_005', cidade:'Caçapava', uf:'SP', endereco:'Rod. Presidente Dutra, S/N KM 133', bairro:'Santa Luzia', cep:'12286-160' },
  { id:'sete_estrelas_006', cidade:'Caçapava', uf:'SP', endereco:'Rua Marques de Herval, 400', bairro:'Centro', cep:'12281-510' },
  { id:'sete_estrelas_007', cidade:'Campos do Jordão', uf:'SP', endereco:'Av. Frei Orestes Girardi, 2305', bairro:'Vila Jaguaribe', cep:'12460-000' },
  { id:'sete_estrelas_008', cidade:'Campos do Jordão', uf:'SP', endereco:'Rua Diva, 575', bairro:'Vila Inglesa', cep:'12460-000' },
  { id:'sete_estrelas_009', cidade:'Campos do Jordão', uf:'SP', endereco:'Av. Dr. Januário Miraglia, 3300', bairro:'Evereste', cep:'12460-000' },
  { id:'sete_estrelas_010', cidade:'Contagem', uf:'MG', endereco:'Avenida Londres, 700', bairro:'Bairro Cinco', cep:'' },
  { id:'sete_estrelas_011', cidade:'Cruzeiro', uf:'SP', endereco:'Av. Rotary Club, 768', bairro:'Jardim América', cep:'12702-010' },
  { id:'sete_estrelas_012', cidade:'Cruzeiro', uf:'SP', endereco:'Rua Dr. Celestino, 1307', bairro:'Vila Canevari', cep:'' },
  { id:'sete_estrelas_013', cidade:'Cruzeiro', uf:'SP', endereco:'Rua Eng. Antonio Penido', bairro:'', cep:'' },
  { id:'sete_estrelas_014', cidade:'Cruzeiro', uf:'SP', endereco:'Av. Gov. Janio Quadros, 389', bairro:'Dr. João Doria', cep:'' },
  { id:'sete_estrelas_015', cidade:'Cruzeiro', uf:'SP', endereco:'Rua Antonio José da Cruz, 923', bairro:'Vila Washinton Beleza', cep:'' },
  { id:'sete_estrelas_016', cidade:'Estiva', uf:'MG', endereco:'Rod. Fernão Dias - BR 381 - KM 885', bairro:'Lagoa', cep:'' },
  { id:'sete_estrelas_017', cidade:'Guaratinguetá', uf:'SP', endereco:'Av. Prefeito Aristeu Vieira Vilela, 1680', bairro:'Vila São José', cep:'12522-010' },
  { id:'sete_estrelas_018', cidade:'Itajubá', uf:'MG', endereco:'Av. Presidente Tancredo de Almeida Neves, 336', bairro:'São Judas Tadeu', cep:'37504-066' },
  { id:'sete_estrelas_019', cidade:'Itajubá', uf:'MG', endereco:'Av. Presidente Tancredo de Almeida Neves, 845', bairro:'São Judas Tadeu', cep:'37504-066' },
  { id:'sete_estrelas_020', cidade:'Lorena', uf:'SP', endereco:'Av. Targino Vilela Nunes, 789', bairro:'Vila Nunes', cep:'12603-000' },
  { id:'sete_estrelas_021', cidade:'Jacareí', uf:'SP', endereco:'Rua das Begônias, 13', bairro:'Jardim Primavera', cep:'12306-430' },
  { id:'sete_estrelas_022', cidade:'Jacareí', uf:'SP', endereco:'Av. São João, 173', bairro:'São João', cep:'12322-000' },
  { id:'sete_estrelas_023', cidade:'Jacareí', uf:'SP', endereco:'Rod. Geraldo Scavoni, 1475', bairro:'Jardim Califórnia', cep:'12305-490' },
  { id:'sete_estrelas_024', cidade:'Jacareí', uf:'SP', endereco:'Av. Pres. Humberto de Alencar C. Branco, 538', bairro:'Jardim Flórida', cep:'12321-150' },
  { id:'sete_estrelas_025', cidade:'Jacareí', uf:'SP', endereco:'Rua Barão de Jacareí, 300', bairro:'Centro', cep:'12308-001' },
  { id:'sete_estrelas_026', cidade:'Jacareí', uf:'SP', endereco:'Rua Chaquib S. Ahmed, 165', bairro:'Centro', cep:'12300-000' },
  { id:'sete_estrelas_027', cidade:'Jacareí', uf:'SP', endereco:'Av. Presidente Getúlio Vargas, 2700', bairro:'Córrego Seco', cep:'12300-000' },
  { id:'sete_estrelas_028', cidade:'Jacareí', uf:'SP', endereco:'Av. Malek Assad, 690', bairro:'Jardim Santa Maria', cep:'12328-080' },
  { id:'sete_estrelas_029', cidade:'Jacareí', uf:'SP', endereco:'Rod. Geraldo Scavone, 2486', bairro:'Vila Branca', cep:'12300-000' },
  { id:'sete_estrelas_030', cidade:'Mogi das Cruzes', uf:'SP', endereco:'Av. Lothar Waldemar Hoehnne, 1717', bairro:'Rodeio', cep:'08775-000' },
  { id:'sete_estrelas_031', cidade:'Mogi das Cruzes', uf:'SP', endereco:'Av. Doutor Deodato Wertheimer, 2680', bairro:'Vila Mogi Moderno', cep:'08775-000' },
  { id:'sete_estrelas_032', cidade:'Mogi das Cruzes', uf:'SP', endereco:'Rua Gonçalo Ferreira, 233', bairro:'Jardim Ponte Grande', cep:'08770-460' },
  { id:'sete_estrelas_033', cidade:'Monteiro Lobato', uf:'SP', endereco:'Largo Comendador Freire, 30', bairro:'Centro', cep:'' },
  { id:'sete_estrelas_034', cidade:'Paraisópolis', uf:'MG', endereco:'Rod. MG 295, 2005', bairro:'Centro', cep:'37660-000' },
  { id:'sete_estrelas_035', cidade:'Pindamonhangaba', uf:'SP', endereco:'Av. Nossa Senhora do Bom Sucesso, 1600', bairro:'Altos do Cardoso', cep:'12420-010' },
  { id:'sete_estrelas_036', cidade:'Pindamonhangaba', uf:'SP', endereco:'Rua das Andorinhas, 50', bairro:'Triângulo', cep:'12400-000' },
  { id:'sete_estrelas_037', cidade:'Pindamonhangaba', uf:'SP', endereco:'Estrada SP 62 Antiga SP-RJ, 2150', bairro:'Mombaça', cep:'12425-190' },
  { id:'sete_estrelas_038', cidade:'Pindamonhangaba', uf:'SP', endereco:'Av. Dr. Francisco Lessa Junior, 776', bairro:'Socorro', cep:'12425-190' },
  { id:'sete_estrelas_039', cidade:'Pindamonhangaba', uf:'SP', endereco:'Rua Major J. dos Santos Moreira, 1094', bairro:'Campo Alegre', cep:'12425-190' },
  { id:'sete_estrelas_040', cidade:'Pindamonhangaba', uf:'SP', endereco:'Rodovia SP-62, 5000', bairro:'Água Preta', cep:'12420-970' },
  { id:'sete_estrelas_041', cidade:'Pindamonhangaba', uf:'SP', endereco:'Av. Doutor Francisco Lessa Jr, 1205', bairro:'Chácara Galega', cep:'12422-010' },
  { id:'sete_estrelas_042', cidade:'Piracicaba', uf:'SP', endereco:'Av. Abel Francisco Pereira, 131', bairro:'Jaraguá', cep:'13406-016' },
  { id:'sete_estrelas_043', cidade:'Praia Grande', uf:'SP', endereco:'Avenida Presidente Kennedy, 17911', bairro:'Balneário Flórida', cep:'11702-020' },
  { id:'sete_estrelas_044', cidade:'Praia Grande', uf:'SP', endereco:'Avenida Dr. Roberto de Almeida Vinhas, 5723', bairro:'Vila Tupi', cep:'11703-500' },
  { id:'sete_estrelas_045', cidade:'Praia Grande', uf:'SP', endereco:'Avenida Guido Mandioca, 679', bairro:'Balneário Las Palmas', cep:'11705-490' },
  { id:'sete_estrelas_046', cidade:'Sapucaí Mirim', uf:'MG', endereco:'Avenida Presidente Vargas, 147', bairro:'Centro', cep:'' },
  { id:'sete_estrelas_047', cidade:'Sapucaí Mirim', uf:'MG', endereco:'Rod. MG 173 - KM 67', bairro:'Ponte Nova', cep:'' },
  { id:'sete_estrelas_048', cidade:'São José dos Campos', uf:'SP', endereco:'Av. Perseu, 752', bairro:'Jardim Satélite', cep:'12230-470' },
  { id:'sete_estrelas_049', cidade:'São José dos Campos', uf:'SP', endereco:'Rua Ceci, 215', bairro:'Jardim Paulista', cep:'12215-800' },
  { id:'sete_estrelas_050', cidade:'São José dos Campos', uf:'SP', endereco:'Rua Penedo, 1051', bairro:'Jardim Petrópolis', cep:'12237-071' },
  { id:'sete_estrelas_051', cidade:'São José dos Campos', uf:'SP', endereco:'Rua Itabaiana, 1199', bairro:'Parque Industrial', cep:'12237-540' },
  { id:'sete_estrelas_052', cidade:'São José dos Campos', uf:'SP', endereco:'Praça Antonio Prado, 16 e 26', bairro:'Santana', cep:'12211-210' },
  { id:'sete_estrelas_053', cidade:'São José dos Campos', uf:'SP', endereco:'Av. Perseu, 31', bairro:'Jardim Satélite', cep:'12230-470' },
  { id:'sete_estrelas_054', cidade:'São José dos Campos', uf:'SP', endereco:'Av. Senador Teotônio Vilela, 2001', bairro:'Vila Bethânia', cep:'12215-000' },
  { id:'sete_estrelas_055', cidade:'São José dos Campos', uf:'SP', endereco:'Rua José de Campos, 66', bairro:'Cidade Morumbi', cep:'12236-650' },
  { id:'sete_estrelas_056', cidade:'São José dos Campos', uf:'SP', endereco:'Rua Paraibuna, 1340', bairro:'Vila Sanches', cep:'12245-021' },
  { id:'sete_estrelas_057', cidade:'São José dos Campos', uf:'SP', endereco:'Praça Candido Dias Castejon, 59', bairro:'Centro', cep:'12245-720' },
  { id:'sete_estrelas_058', cidade:'São José dos Campos', uf:'SP', endereco:'Av. João Batista de Souza Soares, 2969', bairro:'Jardim Morumbi', cep:'12236-660' },
  { id:'sete_estrelas_059', cidade:'São José dos Campos', uf:'SP', endereco:'Av. Jorge Zarur, 1800', bairro:'Vila Betânia', cep:'12243-081' },
  { id:'sete_estrelas_060', cidade:'São José dos Campos', uf:'SP', endereco:'Av. Dr. João Batista de Souza Soares, 3423', bairro:'Jardim Morumbi', cep:'12236-660' },
  { id:'sete_estrelas_061', cidade:'São José dos Campos', uf:'SP', endereco:'Rua São Jorge, 21', bairro:'Santana', cep:'' },
  { id:'sete_estrelas_062', cidade:'São José dos Campos', uf:'SP', endereco:'Av. Sebastião H. C. Pontes, 5830', bairro:'Palmeiras de São José', cep:'12237-280' },
  { id:'sete_estrelas_063', cidade:'São José dos Campos', uf:'SP', endereco:'Av. Presidente Tancredo Neves, 1201', bairro:'Jd. Residencial Ana Maria', cep:'12225-000' },
  { id:'sete_estrelas_064', cidade:'São José dos Campos', uf:'SP', endereco:'Rua Benedito Julião Machado, 49', bairro:'Vila Tupi', cep:'12209-750' },
  { id:'sete_estrelas_065', cidade:'São José dos Campos', uf:'SP', endereco:'Av. Cassiano Ricardo, 1680', bairro:'Jardim Alvorada', cep:'' },
  { id:'sete_estrelas_066', cidade:'São José dos Campos', uf:'SP', endereco:'Av. Leonor de A Ribeiro Souto, 339', bairro:'Parque Residencial União', cep:'' },
  { id:'sete_estrelas_067', cidade:'São José dos Campos', uf:'SP', endereco:'Av. Feira de Santana, 10', bairro:'Jardim Vale do Sol', cep:'' },
  { id:'sete_estrelas_068', cidade:'São José dos Campos', uf:'SP', endereco:'Av. São João, 154', bairro:'Jardim América', cep:'' },
  { id:'sete_estrelas_069', cidade:'São José dos Campos', uf:'SP', endereco:'Rua Itabaiana, 844', bairro:'Parque Industrial', cep:'' },
  { id:'sete_estrelas_070', cidade:'São José dos Campos', uf:'SP', endereco:'Av. Presidente Tancredo Neves, 1030', bairro:'Jardim Três José', cep:'12225-000' },
  { id:'sete_estrelas_071', cidade:'Taubaté', uf:'SP', endereco:'Praça Félix Guisard, S/Nº', bairro:'Vila Progresso', cep:'12020-350' },
  { id:'sete_estrelas_072', cidade:'Taubaté', uf:'SP', endereco:'Av. Dr. Félix Guisard Filho, 355', bairro:'Belém', cep:'12090-600' },
  { id:'sete_estrelas_073', cidade:'Taubaté', uf:'SP', endereco:'Av. Charles Schneider, 1775', bairro:'Vila Progresso', cep:'12040-110' },
  { id:'sete_estrelas_074', cidade:'Taubaté', uf:'SP', endereco:'Av. José Olegário de Barros, 1462', bairro:'Areão', cep:'12060-400' },
  { id:'sete_estrelas_075', cidade:'Taubaté', uf:'SP', endereco:'Av. dos Bandeirantes, 5236', bairro:'Independência', cep:'12061-590' },
  { id:'sete_estrelas_076', cidade:'Taubaté', uf:'SP', endereco:'Rua Gabriel Ortiz Monteiro, 560', bairro:'Vila Nogueira', cep:'12060-300' },
  { id:'sete_estrelas_077', cidade:'Taubaté', uf:'SP', endereco:'Rua Padre Fischer, 1487', bairro:'Vila São Geraldo', cep:'12061-600' },
  { id:'sete_estrelas_078', cidade:'Taubaté', uf:'SP', endereco:'Av. Dom Pedro I, 5391', bairro:'Independência', cep:'12091-000' },
  { id:'sete_estrelas_079', cidade:'Taubaté', uf:'SP', endereco:'Rod. Oswaldo Cruz, 3900', bairro:'Baracéia', cep:'12093-520' },
  { id:'sete_estrelas_080', cidade:'Taubaté', uf:'SP', endereco:'Av. Dom Duarte Leopoldo e Silva, 501', bairro:'Vila São José', cep:'12070-590' },
  { id:'sete_estrelas_081', cidade:'Taubaté', uf:'SP', endereco:'Av. Voluntário Benedito Sérgio, 849', bairro:'Jardim Santa Catarina', cep:'' },
  { id:'sete_estrelas_082', cidade:'Ubatuba', uf:'SP', endereco:'Av. Leovigildo Dias Vieira, 590', bairro:'Itaguá', cep:'11680-000' },
  { id:'sete_estrelas_083', cidade:'Ubatuba', uf:'SP', endereco:'Av. Marginal, 323', bairro:'Saco da Ribeiro', cep:'11680-000' },
  { id:'sete_estrelas_084', cidade:'Ubatuba', uf:'SP', endereco:'Rua das Begônias, 223', bairro:'Jardim Carolina', cep:'' },
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function geocode(posto) {
  return new Promise((resolve) => {
    const q = encodeURIComponent(`${posto.endereco}, ${posto.cidade}, ${posto.uf}, Brasil`);
    const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&countrycodes=br`;
    const options = { headers: { 'User-Agent': 'AbasteceApp/1.0 geocoding' } };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.length > 0) {
            resolve({ ...posto, lat: parseFloat(json[0].lat), lng: parseFloat(json[0].lon), ok: true });
          } else {
            resolve({ ...posto, lat: null, lng: null, ok: false });
          }
        } catch { resolve({ ...posto, lat: null, lng: null, ok: false }); }
      });
    }).on('error', () => resolve({ ...posto, lat: null, lng: null, ok: false }));
  });
}

(async () => {
  const results = [];
  for (let i = 0; i < postos.length; i++) {
    const p = postos[i];
    process.stdout.write(`[${i+1}/${postos.length}] ${p.id}... `);
    const r = await geocode(p);
    console.log(r.ok ? `✓ ${r.lat},${r.lng}` : '✗ não encontrado');
    results.push(r);
    await sleep(1100);
  }

  const found = results.filter(r => r.ok);
  console.log(`\n✓ ${found.length}/${postos.length} geocodificados`);

  const output = `// Postos Sete Estrelas geocodificados\nexport const SETE_ESTRELAS = ${JSON.stringify(
    found.map(r => ({
      id: r.id,
      nome: 'Sete Estrelas',
      cidade: r.cidade,
      uf: r.uf,
      endereco: r.endereco,
      bairro: r.bairro,
      lat: r.lat,
      lng: r.lng,
    })),
    null, 2
  )};\n`;

  require('fs').writeFileSync('sete_estrelas_coords.js', output);
  console.log('Salvo em sete_estrelas_coords.js');
})();
