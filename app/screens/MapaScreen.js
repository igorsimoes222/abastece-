import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Image, Modal, ScrollView, FlatList, Dimensions,
} from 'react-native';
import { avatarService } from '../services/avatarService';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { colors, radius, spacing } from '../../components/theme';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const SETE_ESTRELAS = [
  { id:'sete_estrelas_001', nome:'Sete Estrelas', cidade:'Aparecida do Norte', uf:'SP', endereco:'Av. Padroeira do Brasil, 444', bairro:'São Roque', lat:-22.8244302, lng:-45.207314 },
  { id:'sete_estrelas_002', nome:'Sete Estrelas', cidade:'Bragança Paulista', uf:'SP', endereco:'Av. José Gomes da Rocha Leal, 914', bairro:'Centro', lat:-22.9510211, lng:-46.5451175 },
  { id:'sete_estrelas_003', nome:'Sete Estrelas', cidade:'Caçapava', uf:'SP', endereco:'Rua Prof. João Batista Ortiz Monteiro, 613', bairro:'', lat:-23.110574, lng:-45.7113064 },
  { id:'sete_estrelas_004', nome:'Sete Estrelas', cidade:'Caçapava', uf:'SP', endereco:'Av. Brasil, 480', bairro:'', lat:-23.1015171, lng:-45.710628 },
  { id:'sete_estrelas_006', nome:'Sete Estrelas', cidade:'Caçapava', uf:'SP', endereco:'Rua Marques de Herval, 400', bairro:'Centro', lat:-23.1022045, lng:-45.708169 },
  { id:'sete_estrelas_007', nome:'Sete Estrelas', cidade:'Campos do Jordão', uf:'SP', endereco:'Av. Frei Orestes Girardi, 2305', bairro:'Vila Jaguaribe', lat:-22.7330805, lng:-45.5849028 },
  { id:'sete_estrelas_009', nome:'Sete Estrelas', cidade:'Campos do Jordão', uf:'SP', endereco:'Av. Dr. Januário Miraglia, 3300', bairro:'Evereste', lat:-22.7341646, lng:-45.5859514 },
  { id:'sete_estrelas_010', nome:'Sete Estrelas', cidade:'Contagem', uf:'MG', endereco:'Avenida Londres, 700', bairro:'Bairro Cinco', lat:-19.9405603, lng:-44.0588357 },
  { id:'sete_estrelas_011', nome:'Sete Estrelas', cidade:'Cruzeiro', uf:'SP', endereco:'Av. Rotary Club, 768', bairro:'Jardim América', lat:-22.5918897, lng:-44.9636571 },
  { id:'sete_estrelas_012', nome:'Sete Estrelas', cidade:'Cruzeiro', uf:'SP', endereco:'Rua Dr. Celestino, 1307', bairro:'Vila Canevari', lat:-22.5739527, lng:-44.9613529 },
  { id:'sete_estrelas_013', nome:'Sete Estrelas', cidade:'Cruzeiro', uf:'SP', endereco:'Rua Eng. Antonio Penido', bairro:'', lat:-22.5789135, lng:-44.9583337 },
  { id:'sete_estrelas_015', nome:'Sete Estrelas', cidade:'Cruzeiro', uf:'SP', endereco:'Rua Antonio José da Cruz, 923', bairro:'Vila Washinton Beleza', lat:-22.5793003, lng:-44.9698205 },
  { id:'sete_estrelas_018', nome:'Sete Estrelas', cidade:'Itajubá', uf:'MG', endereco:'Av. Presidente Tancredo de Almeida Neves, 336', bairro:'São Judas Tadeu', lat:-22.422945, lng:-45.4697715 },
  { id:'sete_estrelas_019', nome:'Sete Estrelas', cidade:'Itajubá', uf:'MG', endereco:'Av. Presidente Tancredo de Almeida Neves, 845', bairro:'São Judas Tadeu', lat:-22.4236209, lng:-45.4690341 },
  { id:'sete_estrelas_020', nome:'Sete Estrelas', cidade:'Lorena', uf:'SP', endereco:'Av. Targino Vilela Nunes, 789', bairro:'Vila Nunes', lat:-22.7237957, lng:-45.1090584 },
  { id:'sete_estrelas_021', nome:'Sete Estrelas', cidade:'Jacareí', uf:'SP', endereco:'Rua das Begônias, 13', bairro:'Jardim Primavera', lat:-23.2860746, lng:-45.950157 },
  { id:'sete_estrelas_022', nome:'Sete Estrelas', cidade:'Jacareí', uf:'SP', endereco:'Av. São João, 173', bairro:'São João', lat:-23.3093377, lng:-45.9800756 },
  { id:'sete_estrelas_025', nome:'Sete Estrelas', cidade:'Jacareí', uf:'SP', endereco:'Rua Barão de Jacareí, 300', bairro:'Centro', lat:-23.3021097, lng:-45.9596929 },
  { id:'sete_estrelas_027', nome:'Sete Estrelas', cidade:'Jacareí', uf:'SP', endereco:'Av. Presidente Getúlio Vargas, 2700', bairro:'Córrego Seco', lat:-23.2693753, lng:-45.9505608 },
  { id:'sete_estrelas_028', nome:'Sete Estrelas', cidade:'Jacareí', uf:'SP', endereco:'Av. Malek Assad, 690', bairro:'Jardim Santa Maria', lat:-23.2888161, lng:-45.9690109 },
  { id:'sete_estrelas_032', nome:'Sete Estrelas', cidade:'Mogi das Cruzes', uf:'SP', endereco:'Rua Gonçalo Ferreira, 233', bairro:'Jardim Ponte Grande', lat:-23.5108054, lng:-46.2071005 },
  { id:'sete_estrelas_033', nome:'Sete Estrelas', cidade:'Monteiro Lobato', uf:'SP', endereco:'Largo Comendador Freire, 30', bairro:'Centro', lat:-22.9545166, lng:-45.8383007 },
  { id:'sete_estrelas_035', nome:'Sete Estrelas', cidade:'Pindamonhangaba', uf:'SP', endereco:'Av. Nossa Senhora do Bom Sucesso, 1600', bairro:'Altos do Cardoso', lat:-22.934981, lng:-45.4620952 },
  { id:'sete_estrelas_036', nome:'Sete Estrelas', cidade:'Pindamonhangaba', uf:'SP', endereco:'Rua das Andorinhas, 50', bairro:'Triângulo', lat:-22.943134, lng:-45.4187515 },
  { id:'sete_estrelas_038', nome:'Sete Estrelas', cidade:'Pindamonhangaba', uf:'SP', endereco:'Av. Dr. Francisco Lessa Junior, 776', bairro:'Socorro', lat:-22.926885, lng:-45.4753657 },
  { id:'sete_estrelas_040', nome:'Sete Estrelas', cidade:'Pindamonhangaba', uf:'SP', endereco:'Rodovia SP-62, 5000', bairro:'Água Preta', lat:-22.9203206, lng:-45.3410449 },
  { id:'sete_estrelas_041', nome:'Sete Estrelas', cidade:'Pindamonhangaba', uf:'SP', endereco:'Av. Doutor Francisco Lessa Jr, 1205', bairro:'Chácara Galega', lat:-22.9288036, lng:-45.4634504 },
  { id:'sete_estrelas_042', nome:'Sete Estrelas', cidade:'Piracicaba', uf:'SP', endereco:'Av. Abel Francisco Pereira, 131', bairro:'Jaraguá', lat:-22.7368534, lng:-47.6678709 },
  { id:'sete_estrelas_043', nome:'Sete Estrelas', cidade:'Praia Grande', uf:'SP', endereco:'Avenida Presidente Kennedy, 17911', bairro:'Balneário Flórida', lat:-24.0748567, lng:-46.5833303 },
  { id:'sete_estrelas_044', nome:'Sete Estrelas', cidade:'Praia Grande', uf:'SP', endereco:'Avenida Dr. Roberto de Almeida Vinhas, 5723', bairro:'Vila Tupi', lat:-24.0009365, lng:-46.4162974 },
  { id:'sete_estrelas_046', nome:'Sete Estrelas', cidade:'Sapucaí Mirim', uf:'MG', endereco:'Avenida Presidente Vargas, 147', bairro:'Centro', lat:-22.7452964, lng:-45.7413841 },
  { id:'sete_estrelas_047', nome:'Sete Estrelas', cidade:'Sapucaí Mirim', uf:'MG', endereco:'Rod. MG 173 - KM 67', bairro:'Ponte Nova', lat:-22.7480012, lng:-45.7427651 },
  { id:'sete_estrelas_048', nome:'Sete Estrelas', cidade:'São José dos Campos', uf:'SP', endereco:'Av. Perseu, 752', bairro:'Jardim Satélite', lat:-23.2274965, lng:-45.8905572 },
  { id:'sete_estrelas_049', nome:'Sete Estrelas', cidade:'São José dos Campos', uf:'SP', endereco:'Rua Ceci, 215', bairro:'Jardim Paulista', lat:-23.1911123, lng:-45.8712171 },
  { id:'sete_estrelas_050', nome:'Sete Estrelas', cidade:'São José dos Campos', uf:'SP', endereco:'Rua Penedo, 1051', bairro:'Jardim Petrópolis', lat:-23.2409417, lng:-45.9145075 },
  { id:'sete_estrelas_053', nome:'Sete Estrelas', cidade:'São José dos Campos', uf:'SP', endereco:'Av. Perseu, 31', bairro:'Jardim Satélite', lat:-23.2226371, lng:-45.8890273 },
  { id:'sete_estrelas_054', nome:'Sete Estrelas', cidade:'São José dos Campos', uf:'SP', endereco:'Av. Senador Teotônio Vilela, 2001', bairro:'Vila Bethânia', lat:-23.1963129, lng:-45.884706 },
  { id:'sete_estrelas_055', nome:'Sete Estrelas', cidade:'São José dos Campos', uf:'SP', endereco:'Rua José de Campos, 66', bairro:'Cidade Morumbi', lat:-23.2593429, lng:-45.9053843 },
  { id:'sete_estrelas_056', nome:'Sete Estrelas', cidade:'São José dos Campos', uf:'SP', endereco:'Rua Paraibuna, 1340', bairro:'Vila Sanches', lat:-23.1955974, lng:-45.8878374 },
  { id:'sete_estrelas_058', nome:'Sete Estrelas', cidade:'São José dos Campos', uf:'SP', endereco:'Av. João Batista de Souza Soares, 2969', bairro:'Jardim Morumbi', lat:-23.2540395, lng:-45.9093949 },
  { id:'sete_estrelas_059', nome:'Sete Estrelas', cidade:'São José dos Campos', uf:'SP', endereco:'Av. Jorge Zarur, 1800', bairro:'Vila Betânia', lat:-23.2061548, lng:-45.9051189 },
  { id:'sete_estrelas_060', nome:'Sete Estrelas', cidade:'São José dos Campos', uf:'SP', endereco:'Av. Dr. João Batista de Souza Soares, 3423', bairro:'Jardim Morumbi', lat:-23.2499962, lng:-45.908427 },
  { id:'sete_estrelas_061', nome:'Sete Estrelas', cidade:'São José dos Campos', uf:'SP', endereco:'Rua São Jorge, 21', bairro:'Santana', lat:-23.1613321, lng:-45.8991287 },
  { id:'sete_estrelas_063', nome:'Sete Estrelas', cidade:'São José dos Campos', uf:'SP', endereco:'Av. Presidente Tancredo Neves, 1201', bairro:'Jd. Residencial Ana Maria', lat:-23.1896707, lng:-45.7887515 },
  { id:'sete_estrelas_064', nome:'Sete Estrelas', cidade:'São José dos Campos', uf:'SP', endereco:'Rua Benedito Julião Machado, 49', bairro:'Vila Tupi', lat:-23.1748754, lng:-45.8768736 },
  { id:'sete_estrelas_065', nome:'Sete Estrelas', cidade:'São José dos Campos', uf:'SP', endereco:'Av. Cassiano Ricardo, 1680', bairro:'Jardim Alvorada', lat:-23.2271922, lng:-45.9124884 },
  { id:'sete_estrelas_067', nome:'Sete Estrelas', cidade:'São José dos Campos', uf:'SP', endereco:'Av. Feira de Santana, 10', bairro:'Jardim Vale do Sol', lat:-23.2562033, lng:-45.912114 },
  { id:'sete_estrelas_068', nome:'Sete Estrelas', cidade:'São José dos Campos', uf:'SP', endereco:'Av. São João, 154', bairro:'Jardim América', lat:-23.2108335, lng:-45.9091762 },
  { id:'sete_estrelas_070', nome:'Sete Estrelas', cidade:'São José dos Campos', uf:'SP', endereco:'Av. Presidente Tancredo Neves, 1030', bairro:'Jardim Três José', lat:-23.1840061, lng:-45.8024648 },
  { id:'sete_estrelas_072', nome:'Sete Estrelas', cidade:'Taubaté', uf:'SP', endereco:'Av. Dr. Félix Guisard Filho, 355', bairro:'Belém', lat:-23.0421835, lng:-45.5576301 },
  { id:'sete_estrelas_073', nome:'Sete Estrelas', cidade:'Taubaté', uf:'SP', endereco:'Av. Charles Schneider, 1775', bairro:'Vila Progresso', lat:-23.0238988, lng:-45.5891265 },
  { id:'sete_estrelas_074', nome:'Sete Estrelas', cidade:'Taubaté', uf:'SP', endereco:'Av. José Olegário de Barros, 1462', bairro:'Areão', lat:-23.0150712, lng:-45.5561758 },
  { id:'sete_estrelas_075', nome:'Sete Estrelas', cidade:'Taubaté', uf:'SP', endereco:'Av. dos Bandeirantes, 5236', bairro:'Independência', lat:-23.0310615, lng:-45.5488828 },
  { id:'sete_estrelas_077', nome:'Sete Estrelas', cidade:'Taubaté', uf:'SP', endereco:'Rua Padre Fischer, 1487', bairro:'Vila São Geraldo', lat:-23.0005235, lng:-45.5537607 },
  { id:'sete_estrelas_078', nome:'Sete Estrelas', cidade:'Taubaté', uf:'SP', endereco:'Av. Dom Pedro I, 5391', bairro:'Independência', lat:-23.0574063, lng:-45.6152253 },
  { id:'sete_estrelas_080', nome:'Sete Estrelas', cidade:'Taubaté', uf:'SP', endereco:'Av. Dom Duarte Leopoldo e Silva, 501', bairro:'Vila São José', lat:-23.0103679, lng:-45.5386995 },
  { id:'sete_estrelas_081', nome:'Sete Estrelas', cidade:'Taubaté', uf:'SP', endereco:'Av. Voluntário Benedito Sérgio, 849', bairro:'Jardim Santa Catarina', lat:-23.0186798, lng:-45.5728404 },
  { id:'sete_estrelas_082', nome:'Sete Estrelas', cidade:'Ubatuba', uf:'SP', endereco:'Av. Leovigildo Dias Vieira, 590', bairro:'Itaguá', lat:-23.4584634, lng:-45.0575766 },
  { id:'sete_estrelas_083', nome:'Sete Estrelas', cidade:'Ubatuba', uf:'SP', endereco:'Av. Marginal, 323', bairro:'Saco da Ribeiro', lat:-23.442068, lng:-45.0865643 },
  { id:'sete_estrelas_084', nome:'Sete Estrelas', cidade:'Ubatuba', uf:'SP', endereco:'Rua das Begônias, 223', bairro:'Jardim Carolina', lat:-23.4382728, lng:-45.093676 },
];

const LOGO_URIS = {
  shell:     Image.resolveAssetSource(require('../../assets/icons/Shell-Logo-PNG-Photos.png')).uri,
  ipiranga:  Image.resolveAssetSource(require('../../assets/icons/Ipiranga_monograma_RGB_azul_amarelo.png')).uri,
  petrobras: Image.resolveAssetSource(require('../../assets/icons/petrobras-br-vector-logo.png')).uri,
  sete:      Image.resolveAssetSource(require('../../assets/icons/seteestrelas.png')).uri,
};

const BANNERS = [
  { id: '1', titulo: 'Receba cashback', desc: 'Abasteça e ganhe dinheiro de volta.', icon: '💰', bg: ['#1a3a1a', '#2a5a2a'] },
  { id: '2', titulo: 'Abasteça e economize', desc: 'Encontre os melhores preços perto de você.', icon: '⛽', bg: ['#1a2a4a', '#2a4a7a'] },
  { id: '3', titulo: 'Indique um amigo', desc: 'Ganhe bônus indicando amigos.', icon: '👥', bg: ['#2a1a4a', '#4a2a7a'] },
  { id: '4', titulo: 'Promoção da semana', desc: 'Descontos exclusivos para você.', icon: '🎁', bg: ['#3a2a1a', '#6a4a1a'] },
];

const ATALHOS = [
  { icon: '⛽', label: 'Abastecer', sub: 'Encontre postos', screen: 'Autorizacao' },
  { icon: '👛', label: 'Carteira',  sub: 'Ver extrato',     screen: 'Carteira'   },
  { icon: '💰', label: 'Cashback',  sub: 'Ver meus ganhos', screen: 'Carteira'   },
  { icon: '🕐', label: 'Histórico', sub: 'Últimas atividades', screen: 'Historico' },
];

function buildMapHTML(userLat, userLng, logoUris) {
  const centerLat = userLat ?? -14.2350;
  const centerLng = userLng ?? -51.9253;

  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body, #map { width:100%; height:100%; background:#0D1B2E; }
  @keyframes pulse {
    0%   { box-shadow: 0 0 0 0px rgba(255,255,255,0.5), 0 4px 12px rgba(0,0,0,0.6); }
    70%  { box-shadow: 0 0 0 10px rgba(255,255,255,0),  0 4px 12px rgba(0,0,0,0.6); }
    100% { box-shadow: 0 0 0 0px rgba(255,255,255,0),   0 4px 12px rgba(0,0,0,0.6); }
  }
  .posto-pin { display:flex; flex-direction:column; align-items:center; cursor:pointer; }
  .posto-bubble {
    width:46px; height:46px; border-radius:10px;
    border:2.5px solid rgba(255,255,255,0.9);
    box-shadow: 0 4px 12px rgba(0,0,0,0.6);
    display:flex; align-items:center; justify-content:center;
    overflow:hidden; background:#fff;
    animation: pulse 2.4s ease-out infinite;
  }
  .posto-bubble img { width:100%; height:100%; object-fit:contain; padding:4px; background:#fff; }
  .posto-tail {
    width:0; height:0;
    border-left:7px solid transparent;
    border-right:7px solid transparent;
    border-top:9px solid rgba(255,255,255,0.9);
    margin-top:-1px;
  }
  .user-pin {
    width:14px; height:14px; background:#2196F3;
    border-radius:50%; border:3px solid rgba(33,150,243,0.4);
    box-shadow:0 0 0 6px rgba(33,150,243,0.15);
  }
  .marker-cluster { background: rgba(109,194,41,0.25) !important; border: 2px solid #6DC229 !important; }
  .marker-cluster div { background: #6DC229 !important; color: #fff !important; font-weight: 900 !important; font-family: sans-serif !important; font-size: 13px !important; }
</style>
</head>
<body>
<div id="map"></div>
<script>
var map = L.map('map', { zoomControl:false, attributionControl:false }).setView([${centerLat}, ${centerLng}], 4);
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
var cluster = L.markerClusterGroup({ maxClusterRadius: 60, disableClusteringAtZoom: 13, spiderfyOnMaxZoom: true, showCoverageOnHover: false });
map.addLayer(cluster);
var LOGOS = ${JSON.stringify(logoUris)};
var BRAND_MAP = [
  { keys:['shell'],               logo: LOGOS.shell,     bg:'#DD1D21' },
  { keys:['ipiranga'],            logo: LOGOS.ipiranga,  bg:'#003087' },
  { keys:['petrobras','br ','br$'], logo: LOGOS.petrobras, bg:'#009640' },
  { keys:['sete estrela','sete'], logo: LOGOS.sete,      bg:'#1a1a2e'  },
];
function getBrand(nome) {
  var key = (nome || '').toLowerCase();
  for (var i = 0; i < BRAND_MAP.length; i++) {
    var b = BRAND_MAP[i];
    for (var j = 0; j < b.keys.length; j++) { if (key.indexOf(b.keys[j]) !== -1) return b; }
  }
  return { logo: null, bg: '#1a3a0a' };
}
function makePinHtml(brand, size) {
  var s = size || 46;
  var inner = brand.logo ? '<img src="' + brand.logo + '">' : '<span style="font-size:' + Math.round(s*0.45) + 'px">⛽</span>';
  var bubble = '<div class="posto-bubble" style="width:'+s+'px;height:'+s+'px;border-radius:'+Math.round(s*0.22)+'px;background:' + brand.bg + '">' + inner + '</div>';
  var tw = Math.round(s*0.3); var th = Math.round(s*0.2);
  var tail = '<div style="width:0;height:0;border-left:'+tw+'px solid transparent;border-right:'+tw+'px solid transparent;border-top:'+th+'px solid '+brand.bg+';margin-top:-1px"></div>';
  return '<div class="posto-pin">' + bubble + tail + '</div>';
}
function addPosto(lat, lng, nome, id) {
  var brand = getBrand(nome);
  var icon = L.divIcon({ className:'', html: makePinHtml(brand, 46), iconAnchor:[23, 56] });
  var marker = L.marker([lat, lng], { icon: icon });
  marker.on('click', function() { window.ReactNativeWebView.postMessage(JSON.stringify({ type:'posto', id: id })); });
  cluster.addLayer(marker);
}
${userLat ? `var userIcon = L.divIcon({ className:'', html:'<div class="user-pin"></div>', iconAnchor:[7,7] }); L.marker([${userLat}, ${userLng}], { icon: userIcon }).addTo(map);` : ''}
document.addEventListener('message', handleMsg);
window.addEventListener('message', handleMsg);
function handleMsg(e) {
  try {
    var msg = JSON.parse(e.data);
    if (msg.type === 'postos') { msg.postos.forEach(function(p) { addPosto(p.lat, p.lng, p.nome, p.id); }); }
    if (msg.type === 'fitBounds' && msg.postos && msg.postos.length > 0) {
      var latlngs = msg.postos.map(function(p) { return [p.lat, p.lng]; });
      ${userLat ? `latlngs.push([${userLat}, ${userLng}]);` : ''}
      map.fitBounds(L.latLngBounds(latlngs), { padding: [40, 40] });
    }
    if (msg.type === 'flyTo') { map.flyTo([msg.lat, msg.lng], 16, { duration: 0.8 }); }
  } catch(err) {}
}
</script>
</body>
</html>`;
}

export default function MapaScreen({ navigation }) {
  const { usuario } = useAuth();
  const primeiroNome = usuario?.nome?.split(' ')[0] ?? 'Motorista';
  const [avatarUri, setAvatarUri] = useState(null);

  useEffect(() => {
    avatarService.carregar().then(uri => uri && setAvatarUri(uri));
  }, []);
  const cashbackSaldo = usuario?.cashback_saldo != null
    ? parseFloat(usuario.cashback_saldo).toFixed(2).replace('.', ',')
    : '0,00';

  const webRef = useRef(null);
  const mapReady = useRef(false);
  const pendingPostos = useRef(null);

  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(false);
  const [postos, setPostos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [postoSelecionado, setPostoSelecionado] = useState(null);
  const [modalVisivel, setModalVisivel] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') { setLocationError(true); buscarPostos(null); return; }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const ul = { lat: loc.coords.latitude, lng: loc.coords.longitude };
        setUserLocation(ul);
        buscarPostos(ul);
      } catch {
        setLocationError(true);
        buscarPostos(null);
      }
    })();
  }, []);

  const buscarPostos = () => {
    setCarregando(false);
    setPostos(SETE_ESTRELAS);
    enviarPostosAoMapa(SETE_ESTRELAS);
  };

  const enviarPostosAoMapa = (lista) => {
    const msg = JSON.stringify({ type: 'postos', postos: lista });
    const fit = JSON.stringify({ type: 'fitBounds', postos: lista });
    if (mapReady.current) {
      webRef.current?.injectJavaScript(`window.dispatchEvent(new MessageEvent('message', { data: '${msg.replace(/'/g, "\\'")}' })); true;`);
      if (lista.length > 0) {
        webRef.current?.injectJavaScript(`window.dispatchEvent(new MessageEvent('message', { data: '${fit.replace(/'/g, "\\'")}' })); true;`);
      }
    } else {
      pendingPostos.current = lista;
    }
  };

  const onMapLoad = () => {
    setTimeout(() => {
      mapReady.current = true;
      if (pendingPostos.current) {
        enviarPostosAoMapa(pendingPostos.current);
        pendingPostos.current = null;
      } else {
        enviarPostosAoMapa(SETE_ESTRELAS);
      }
    }, 800);
  };

  const onMapMessage = (event) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'posto') {
        const p = postos.find(x => x.id === msg.id);
        if (p) {
          setPostoSelecionado(p);
          webRef.current?.injectJavaScript(
            `window.dispatchEvent(new MessageEvent('message', { data: '${JSON.stringify({ type:'flyTo', lat: p.lat, lng: p.lng }).replace(/'/g, "\\'")}' })); true;`
          );
        }
      }
    } catch {}
  };

  const mapHTML = buildMapHTML(userLocation?.lat, userLocation?.lng, LOGO_URIS);

  return (
    <ScreenWrapper edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerLeft}
            onPress={() => navigation.navigate('Perfil')}
            activeOpacity={0.8}
          >
            <View style={styles.avatarCircle}>
              {avatarUri
                ? <Image
                    source={{ uri: avatarUri }}
                    style={styles.avatarImg}
                    onError={() => { setAvatarUri(null); avatarService.remover(); }}
                  />
                : <Text style={styles.avatarIniciais}>
                    {(usuario?.nome ?? 'U').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                  </Text>
              }
            </View>
            <View>
              <Text style={styles.headerSub}>Olá,</Text>
              <Text style={styles.headerName}>{primeiroNome}!</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn}>
              <Text style={styles.iconBtnText}>🔔</Text>
              <View style={styles.notifDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Perfil')}>
              <Text style={styles.iconBtnText}>👤</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card Cashback */}
        <View style={styles.cashbackCard}>
          <View style={styles.cashbackIconWrap}>
            <Text style={{ fontSize: 22 }}>💰</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cashbackLabel}>CASHBACK ACUMULADO</Text>
            <Text style={styles.cashbackValor}>R$ {cashbackSaldo}</Text>
            <Text style={styles.cashbackSub}>em 7 abastecimentos</Text>
          </View>
          <TouchableOpacity style={styles.carteiraBtn} onPress={() => navigation.navigate('Carteira')}>
            <Text style={styles.carteiraBtnText}>Ver carteira</Text>
          </TouchableOpacity>
        </View>

        {/* Banners */}
        <FlatList
          horizontal
          data={BANNERS}
          keyExtractor={b => b.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.bannersRow}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.bannerCard, { backgroundColor: item.bg[0] }]}>
              <Text style={styles.bannerIcon}>{item.icon}</Text>
              <Text style={styles.bannerTitulo}>{item.titulo}</Text>
              <Text style={styles.bannerDesc}>{item.desc}</Text>
            </TouchableOpacity>
          )}
        />

        {/* Postos próximos */}
        <View style={styles.mapaSection}>
          <View style={styles.mapaSectionHeader}>
            <View>
              <Text style={styles.mapaTitulo}>📍 Postos próximos</Text>
              <Text style={styles.mapaSub}>Encontre postos perto de você.</Text>
            </View>
            <TouchableOpacity style={styles.verMapaBtn}>
              <Text style={styles.verMapaText}>Ver mapa completo ›</Text>
            </TouchableOpacity>
          </View>

          {carregando && (
            <View style={styles.loadingBar}>
              <ActivityIndicator size="small" color={colors.verde} />
              <Text style={styles.loadingText}>Buscando postos...</Text>
            </View>
          )}

          <View style={styles.mapWrap}>
            <WebView
              ref={webRef}
              source={{ html: mapHTML }}
              style={styles.map}
              onMessage={onMapMessage}
              onLoadEnd={onMapLoad}
              scrollEnabled={false}
              javaScriptEnabled
              originWhitelist={['*']}
              mixedContentMode="always"
            />
            <TouchableOpacity
              style={styles.myLocBtn}
              onPress={() => userLocation && webRef.current?.injectJavaScript(`map.setView([${userLocation.lat}, ${userLocation.lng}], 15); true;`)}
            >
              <Text style={styles.myLocBtnText}>{locationError ? '⚠️' : '📍'}</Text>
            </TouchableOpacity>

            {/* Card do posto — overlay sobre o mapa */}
            {postoSelecionado && (
              <View style={styles.postoPopup}>
                <View style={styles.postoPopupIcon}>
                  <Text style={{ fontSize: 22 }}>⛽</Text>
                </View>
                <View style={styles.postoPopupInfo}>
                  <Text style={styles.postoPopupNome} numberOfLines={1}>{postoSelecionado.nome}</Text>
                  <Text style={styles.postoPopupEnde} numberOfLines={1}>
                    {postoSelecionado.endereco} — {postoSelecionado.cidade}/{postoSelecionado.uf}
                  </Text>
                </View>
                <View style={styles.postoPopupBtns}>
                  <TouchableOpacity style={styles.btnVisualizar} onPress={() => setModalVisivel(true)}>
                    <Text style={styles.btnVisualizarText}>👁 Ver</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.btnAbastecer}
                    onPress={() => navigation.navigate('Autorizacao', { posto: postoSelecionado })}
                  >
                    <Text style={styles.btnAbastecerText}>⚡</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.postoPopupClose} onPress={() => setPostoSelecionado(null)}>
                  <Text style={styles.postoPopupCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Legenda */}
          <View style={styles.legenda}>
            <View style={styles.legendaItem}><View style={[styles.legendaDot, { backgroundColor: '#6DC229' }]} /><Text style={styles.legendaText}>Baixo preço</Text></View>
            <View style={styles.legendaItem}><View style={[styles.legendaDot, { backgroundColor: '#F5A623' }]} /><Text style={styles.legendaText}>Preço médio</Text></View>
            <View style={styles.legendaItem}><View style={[styles.legendaDot, { backgroundColor: '#E53935' }]} /><Text style={styles.legendaText}>Alto preço</Text></View>
          </View>
        </View>


      </ScrollView>

      {/* Modal posto */}
      <Modal visible={modalVisivel} transparent animationType="slide" onRequestClose={() => setModalVisivel(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Text style={styles.modalNome}>{postoSelecionado?.nome}</Text>
                <Text style={styles.modalCidade}>{postoSelecionado?.cidade}/{postoSelecionado?.uf}</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisivel(false)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalEnderecoRow}>
              <Text style={styles.modalEnderecoIcon}>📍</Text>
              <Text style={styles.modalEndereco}>
                {postoSelecionado?.endereco}{postoSelecionado?.bairro ? `, ${postoSelecionado.bairro}` : ''}
              </Text>
            </View>
            <View style={styles.modalDivider} />
            <Text style={styles.modalSecTitle}>Combustíveis</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                { tipo: 'Gasolina Comum',     icone: '🔴', preco: 'R$ 5,89' },
                { tipo: 'Gasolina Aditivada', icone: '🟡', preco: 'R$ 6,19' },
                { tipo: 'Etanol',             icone: '🟢', preco: 'R$ 3,99' },
                { tipo: 'Diesel S-10',        icone: '🔵', preco: 'R$ 6,49' },
              ].map(c => (
                <View key={c.tipo} style={styles.combustivelRow}>
                  <Text style={styles.combustivelIcone}>{c.icone}</Text>
                  <Text style={styles.combustivelTipo}>{c.tipo}</Text>
                  <Text style={styles.combustivelPreco}>{c.preco}</Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.modalDivider} />
            <TouchableOpacity
              style={styles.modalBtnAbastecer}
              onPress={() => { setModalVisivel(false); navigation.navigate('Autorizacao', { posto: postoSelecionado }); }}
            >
              <Text style={styles.modalBtnAbastecerText}>⚡ Abastecer agora</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        {[
          { icon: '🗺️', label: 'Mapa',      screen: 'Mapa',        active: true  },
          { icon: '⛽',  label: 'Abastecer', screen: 'Autorizacao', active: false },
          { icon: '👛',  label: 'Carteira',  screen: 'Carteira',    active: false },
          { icon: '🕐',  label: 'Histórico', screen: 'Historico',   active: false },
          { icon: '👤',  label: 'Perfil',    screen: 'Perfil',      active: false },
        ].map(item => (
          <TouchableOpacity
            key={item.label}
            style={styles.navItem}
            onPress={() => !item.active && navigation.navigate(item.screen)}
          >
            <Text style={styles.navIcon}>{item.icon}</Text>
            <Text style={[styles.navLabel, item.active && styles.navLabelActive]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 20 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.verde,
    borderWidth: 2, borderColor: 'rgba(108,194,74,0.5)',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: colors.verde, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  avatarImg: { width: 44, height: 44, borderRadius: 22 },
  avatarIniciais: { fontSize: 16, fontWeight: '900', color: colors.white },
  headerSub: { fontSize: 12, color: colors.textSec, fontWeight: '500' },
  headerName: { fontSize: 20, fontWeight: '900', color: colors.text },
  headerActions: { flexDirection: 'row', gap: 10 },
  iconBtn: {
    width: 42, height: 42, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  iconBtnText: { fontSize: 18 },
  notifDot: {
    position: 'absolute', top: 8, right: 8,
    width: 8, height: 8, backgroundColor: colors.laranja,
    borderRadius: 4, borderWidth: 2, borderColor: colors.bg,
  },

  cashbackCard: {
    marginHorizontal: spacing.xl, marginBottom: 16,
    backgroundColor: colors.verdeBg, borderRadius: radius.xl, padding: spacing.lg,
    borderWidth: 1, borderColor: 'rgba(109,194,41,0.25)',
    flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: colors.verde, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4,
  },
  cashbackIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: 'rgba(109,194,41,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  cashbackLabel: { fontSize: 10, color: 'rgba(109,194,41,0.7)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  cashbackValor: { fontSize: 26, fontWeight: '900', color: colors.text, marginTop: 1 },
  cashbackSub:   { fontSize: 11, color: colors.laranja, fontWeight: '600', marginTop: 1 },
  carteiraBtn: {
    backgroundColor: colors.verde, borderRadius: radius.md,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  carteiraBtnText: { color: colors.white, fontSize: 11, fontWeight: '800' },

  bannersRow: { paddingLeft: spacing.xl, paddingRight: 8, gap: 12, marginBottom: 20 },
  bannerCard: {
    width: 170, borderRadius: radius.xl, padding: 18, gap: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  bannerIcon:   { fontSize: 32 },
  bannerTitulo: { fontSize: 14, fontWeight: '900', color: colors.text, lineHeight: 19 },
  bannerDesc:   { fontSize: 11, color: 'rgba(255,255,255,0.65)', lineHeight: 16 },

  atalhos: {
    flexDirection: 'row', marginHorizontal: spacing.xl,
    marginBottom: 20, gap: 10,
  },
  atalhoItem: {
    flex: 1, backgroundColor: colors.card,
    borderRadius: radius.xl, padding: 12,
    alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: colors.border,
  },
  atalhoIconBox: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: 'rgba(109,194,41,0.1)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  atalhoIcon: { fontSize: 24 },
  atalhoLabel: { fontSize: 11, fontWeight: '800', color: colors.text, textAlign: 'center' },
  atalhoSub: { fontSize: 9, color: colors.textSec, textAlign: 'center' },

  mapaSection: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden',
  },
  mapaSectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: 16, paddingBottom: 12,
  },
  mapaTitulo: { fontSize: 15, fontWeight: '800', color: colors.text },
  mapaSub: { fontSize: 11, color: colors.textSec, marginTop: 2 },
  verMapaBtn: {
    backgroundColor: 'rgba(109,194,41,0.1)',
    borderWidth: 1, borderColor: 'rgba(109,194,41,0.3)',
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6,
  },
  verMapaText: { fontSize: 11, color: colors.verde, fontWeight: '700' },

  loadingBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingBottom: 8,
  },
  loadingText: { fontSize: 12, color: colors.textSec },

  mapWrap: { height: 320, marginHorizontal: 0 },
  map: { flex: 1, backgroundColor: colors.bg },
  myLocBtn: {
    position: 'absolute', left: 10, bottom: 10,
    backgroundColor: 'rgba(13,27,46,0.85)',
    borderWidth: 1, borderColor: colors.verde,
    borderRadius: 10, width: 36, height: 36,
    alignItems: 'center', justifyContent: 'center',
  },
  myLocBtnText: { fontSize: 16 },

  legenda: {
    flexDirection: 'row', gap: 16, padding: 12, paddingTop: 10,
  },
  legendaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendaDot: { width: 8, height: 8, borderRadius: 4 },
  legendaText: { fontSize: 11, color: colors.textSec },

  postoPopup: {
    position: 'absolute', bottom: 10, left: 10, right: 10,
    backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.verde, borderRadius: radius.xl,
    padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10,
    shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
  postoPopupIcon: {
    width: 48, height: 48, borderRadius: radius.md,
    backgroundColor: colors.verdeBg,
    alignItems: 'center', justifyContent: 'center',
  },
  postoPopupInfo: { flex: 1 },
  postoPopupNome: { fontSize: 14, fontWeight: '800', color: colors.text },
  postoPopupEnde: { fontSize: 11, color: colors.textSec, marginTop: 2 },
  postoPopupBtns: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  btnVisualizar: {
    borderWidth: 1, borderColor: colors.verde,
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8,
  },
  btnVisualizarText: { color: colors.verde, fontSize: 12, fontWeight: '700' },
  btnAbastecer: {
    backgroundColor: colors.verde, borderRadius: 10,
    width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
  },
  btnAbastecerText: { fontSize: 16 },
  postoPopupClose: { padding: 4 },
  postoPopupCloseText: { color: colors.textMuted, fontSize: 16 },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)' },
  modalBox: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: spacing.xl, paddingBottom: 36,
    borderTopWidth: 1, borderColor: colors.border,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  modalHeaderLeft: { flex: 1 },
  modalNome: { fontSize: 20, fontWeight: '900', color: colors.text },
  modalCidade: { fontSize: 13, color: colors.verde, fontWeight: '700', marginTop: 2 },
  modalCloseBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.07)', alignItems: 'center', justifyContent: 'center' },
  modalCloseText: { color: colors.textMuted, fontSize: 16 },
  modalEnderecoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 16 },
  modalEnderecoIcon: { fontSize: 14, marginTop: 1 },
  modalEndereco: { flex: 1, fontSize: 13, color: colors.textSec, lineHeight: 18 },
  modalDivider: { height: 1, backgroundColor: colors.border, marginVertical: 14 },
  modalSecTitle: { fontSize: 12, fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  combustivelRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  combustivelIcone: { fontSize: 16 },
  combustivelTipo: { flex: 1, fontSize: 14, color: colors.text, fontWeight: '600' },
  combustivelPreco: { fontSize: 18, fontWeight: '900', color: colors.verde },
  modalBtnAbastecer: { backgroundColor: colors.verde, borderRadius: radius.lg, padding: 16, alignItems: 'center', marginTop: 4 },
  modalBtnAbastecerText: { color: colors.white, fontSize: 16, fontWeight: '900' },

  bottomNav: {
    flexDirection: 'row', backgroundColor: colors.surface,
    borderTopWidth: 1, borderTopColor: colors.border,
    paddingTop: 10, paddingBottom: 28,
  },
  navItem: { flex: 1, alignItems: 'center', gap: 3 },
  navIcon: { fontSize: 20 },
  navLabel: { fontSize: 9, color: colors.textSec, fontWeight: '500' },
  navLabelActive: { color: colors.verde, fontWeight: '700' },
});
