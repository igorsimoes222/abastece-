import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Image, Modal, ScrollView, FlatList, Dimensions,
} from 'react-native';
import { avatarService } from '../services/avatarService';
import { postosService } from '../services/postosService';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { Asset } from 'expo-asset';
import { colors, radius, spacing } from '../../components/theme';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const LOGO_URIS = {
  shell:     Asset.fromModule(require('../../assets/icons/Shell-Logo-PNG-Photos.png')).uri,
  ipiranga:  Asset.fromModule(require('../../assets/icons/Ipiranga_monograma_RGB_azul_amarelo.png')).uri,
  petrobras: Asset.fromModule(require('../../assets/icons/petrobras-br-vector-logo.png')).uri,
  sete:      Asset.fromModule(require('../../assets/icons/seteestrelas.png')).uri,
};

const BANNERS = [
  { id: '1', titulo: 'Receba cashback', desc: 'Abasteça e ganhe dinheiro de volta.', icon: '💰', bg: ['#1a3a1a', '#2a5a2a'] },
  { id: '2', titulo: 'Abasteça e economize', desc: 'Encontre os melhores preços perto de você.', icon: '⛽', bg: ['#1a2a4a', '#2a4a7a'] },
  { id: '3', titulo: 'Indique um amigo', desc: 'Ganhe bônus indicando amigos.', icon: '👥', bg: ['#2a1a4a', '#4a2a7a'] },
  { id: '4', titulo: 'Promoção da semana', desc: 'Descontos exclusivos para você.', icon: '🎁', bg: ['#3a2a1a', '#6a4a1a'] },
];

const ATALHOS = [
  { icon: '⛽', label: 'Abastecer', sub: 'Encontre postos', screen: 'NFC' },
  { icon: '👛', label: 'Carteira',  sub: 'Ver extrato',     screen: 'Carteira'   },
  { icon: '💰', label: 'Cashback',  sub: 'Ver meus ganhos', screen: 'Carteira'   },
  { icon: '🕐', label: 'Histórico', sub: 'Últimas atividades', screen: 'Historico' },
];

const RAIO_ABASTECER_METROS = 150;

// Fórmula de Haversine — distância em metros entre dois pontos GPS
function calcularDistancia(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const ICONES_PRODUTO = { gasolina: '🔴', etanol: '🟢', diesel: '🔵' };
function iconePorProduto(nome) {
  const chave = (nome || '').toLowerCase();
  const encontrado = Object.keys(ICONES_PRODUTO).find(k => chave.includes(k));
  return encontrado ? ICONES_PRODUTO[encontrado] : '⛽';
}

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

  const buscarPostos = async (localizacao) => {
    setCarregando(true);
    try {
      const resposta = await postosService.listar(localizacao?.lat, localizacao?.lng);
      const lista = resposta.postos ?? [];
      setPostos(lista);
      enviarPostosAoMapa(lista);
    } catch (e) {
      setPostos([]);
    } finally {
      setCarregando(false);
    }
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
      }
      // Sem "else": se ainda não chegou resposta do backend, buscarPostos()
      // manda pro mapa assim que resolver (mapReady já estará true).
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

  // Verifica se usuário está dentro do raio do posto selecionado
  const distanciaAoPosto = (userLocation && postoSelecionado)
    ? calcularDistancia(userLocation.lat, userLocation.lng, postoSelecionado.lat, postoSelecionado.lng)
    : null;
  const dentroDoRaio = distanciaAoPosto !== null && distanciaAoPosto <= RAIO_ABASTECER_METROS;
  const podAbastecer = dentroDoRaio || locationError; // se não tem GPS, não bloqueia

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
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Notificacoes')}>
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
                {/* Linha principal: ícone + info + botões + fechar */}
                <View style={styles.postoPopupRow}>
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
                      style={[styles.btnAbastecer, !podAbastecer && styles.btnAbastecerBloqueado]}
                      onPress={() => podAbastecer && navigation.navigate('Autorizacao', { posto: postoSelecionado })}
                      disabled={!podAbastecer}
                    >
                      <Text style={styles.btnAbastecerText}>{podAbastecer ? '⚡' : '🔒'}</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity style={styles.postoPopupClose} onPress={() => setPostoSelecionado(null)}>
                    <Text style={styles.postoPopupCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>
                {/* Aviso de distância — linha separada abaixo */}
                {distanciaAoPosto !== null && !dentroDoRaio && (
                  <View style={styles.distanciaAviso}>
                    <Text style={styles.distanciaAvisoText}>
                      📍 Você está a {distanciaAoPosto >= 1000
                        ? `${(distanciaAoPosto / 1000).toFixed(1)} km`
                        : `${Math.round(distanciaAoPosto)} m`} do posto — chegue para abastecer
                    </Text>
                  </View>
                )}
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
              {(postoSelecionado?.precos ?? []).map(c => (
                <View key={c.produto} style={styles.combustivelRow}>
                  <Text style={styles.combustivelIcone}>{iconePorProduto(c.produto)}</Text>
                  <Text style={styles.combustivelTipo}>{c.produto}</Text>
                  <Text style={styles.combustivelPreco}>
                    R$ {parseFloat(c.preco).toFixed(2).replace('.', ',')}
                  </Text>
                </View>
              ))}
              {(postoSelecionado?.precos ?? []).length === 0 && (
                <Text style={styles.mapaSub}>Preço não informado ainda para este posto.</Text>
              )}
            </ScrollView>
            <View style={styles.modalDivider} />
            <TouchableOpacity
              style={[styles.modalBtnAbastecer, !podAbastecer && { backgroundColor: colors.border }]}
              onPress={() => {
                if (!podAbastecer) return;
                setModalVisivel(false);
                navigation.navigate('Autorizacao', { posto: postoSelecionado });
              }}
              disabled={!podAbastecer}
            >
              <Text style={styles.modalBtnAbastecerText}>
                {podAbastecer ? '⚡ Abastecer agora' : `🔒 Chegue ao posto para abastecer`}
              </Text>
            </TouchableOpacity>
            {distanciaAoPosto !== null && !dentroDoRaio && (
              <Text style={styles.modalDistanciaText}>
                Você está a {distanciaAoPosto >= 1000
                  ? `${(distanciaAoPosto / 1000).toFixed(1)} km`
                  : `${Math.round(distanciaAoPosto)} m`} deste posto
              </Text>
            )}
          </View>
        </View>
      </Modal>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        {[
          { icon: '🗺️', label: 'Mapa',      screen: 'Mapa',        active: true  },
          { icon: '⛽',  label: 'Abastecer', screen: 'NFC', active: false },
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
    overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
  postoPopupRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12,
  },
  postoPopupIcon: {
    width: 44, height: 44, borderRadius: radius.md,
    backgroundColor: colors.verdeBg,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  postoPopupInfo: { flex: 1, minWidth: 0 },
  postoPopupNome: { fontSize: 13, fontWeight: '800', color: colors.text },
  postoPopupEnde: { fontSize: 10, color: colors.textSec, marginTop: 2 },
  postoPopupBtns: { flexDirection: 'row', gap: 8, alignItems: 'center', flexShrink: 0 },
  btnVisualizar: {
    borderWidth: 1, borderColor: colors.verde,
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7,
  },
  btnVisualizarText: { color: colors.verde, fontSize: 12, fontWeight: '700' },
  btnAbastecer: {
    backgroundColor: colors.verde, borderRadius: 10,
    width: 34, height: 34, alignItems: 'center', justifyContent: 'center',
  },
  btnAbastecerBloqueado: { backgroundColor: colors.border },
  btnAbastecerText: { fontSize: 15 },
  distanciaAviso: {
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderTopWidth: 1, borderTopColor: 'rgba(239,68,68,0.15)',
    paddingHorizontal: 14, paddingVertical: 8,
  },
  distanciaAvisoText: { fontSize: 11, color: '#F87171', textAlign: 'center' },
  modalDistanciaText: {
    fontSize: 12, color: colors.textMuted,
    textAlign: 'center', marginTop: 8,
  },
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
