import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity, Modal, Easing,
} from 'react-native';
import ErroConexao from '../../components/ErroConexao';
import { colors, radius, spacing } from '../../components/theme';
import ScreenWrapper from '../../components/ScreenWrapper';
import { abastecimentoService } from '../services/abastecimentoService';

// ── Bolha subindo dentro do líquido ──
function Bubble({ delay, x }) {
  const ty = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(ty, { toValue: -30, duration: 1200, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(op, { toValue: 0.5, duration: 300, useNativeDriver: true }),
            Animated.timing(op, { toValue: 0,   duration: 900, useNativeDriver: true }),
          ]),
        ]),
        Animated.timing(ty, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.timing(op, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute', left: x, bottom: 10,
        width: 6, height: 6, borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.4)',
        opacity: op, transform: [{ translateY: ty }],
      }}
    />
  );
}

// ── Tanque vertical com líquido subindo ──
function TankGauge({ fillAnim, fillColor, pct }) {
  const fillHeight = fillAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={tank.wrap}>
      {[75, 50, 25].map(m => (
        <View key={m} pointerEvents="none" style={[tank.mark, { bottom: `${m}%` }]}>
          <Text style={tank.markText}>{m}</Text>
          <View style={tank.markLine} />
        </View>
      ))}
      <View style={tank.body}>
        <View style={tank.cap}><View style={tank.capSlot} /></View>
        <Animated.View style={[tank.liquid, { height: fillHeight, backgroundColor: fillColor }]}>
          <View style={tank.waveRow}>
            <View style={tank.waveBump} />
            <View style={[tank.waveBump, { width: 18, height: 6 }]} />
            <View style={[tank.waveBump, { width: 24 }]} />
          </View>
          <View style={tank.shine} />
          <Bubble delay={0}    x={18} />
          <Bubble delay={600}  x={55} />
          <Bubble delay={1100} x={35} />
        </Animated.View>
      </View>
      <View pointerEvents="none" style={tank.pctOverlay}>
        <Text style={tank.pctNum}>{pct}</Text>
        <Text style={tank.pctSuf}>%</Text>
      </View>
    </View>
  );
}

// ─── Tela principal ──────────────────────────────────────────────────────────
export default function AbastecendoScreen({ navigation, route }) {
  const { posto, bico, bomba, valor, preAuth } = route?.params ?? {
    posto: { nome: 'Sete Estrelas', preco: '5,89', cashback: '1' },
    bico: '08', bomba: null, valor: '50,00', preAuth: null,
  };

  // fase: 'aguardando' | 'abastecendo' | 'concluindo'
  const [fase, setFase]               = useState('aguardando');
  const [pct, setPct]                 = useState(0);
  const [valorReal, setValorReal]     = useState('0,00');
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelado, setCancelado]     = useState(false);
  const [erroConexao, setErroConexao] = useState(false);
  const [erroMsg, setErroMsg]         = useState('');

  const pollingRef  = useRef(null);
  const falhasRef   = useRef(0);
  const faseRef     = useRef('aguardando'); // ref para acessar dentro do interval

  const fillAnim  = useRef(new Animated.Value(0)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const glowAnim  = useRef(new Animated.Value(0.6)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waitAnim  = useRef(new Animated.Value(0)).current; // pulso da fase aguardando

  const totalValor = parseFloat(valor.replace(',', '.'));
  const precoLitro = parseFloat(posto.preco?.replace(',', '.') ?? 5.39);
  const litros     = (parseFloat(valorReal.replace(',', '.')) / precoLitro).toFixed(2).replace('.', ',');
  const numeroBico = String(bico ?? bomba ?? '0').padStart(2, '0');

  // ── Navega para conclusão ──
  const finalizarAbastecimento = async () => {
    if (faseRef.current === 'concluindo') return;
    faseRef.current = 'concluindo';
    setFase('concluindo');
    clearInterval(pollingRef.current);

    try {
      const resultado = await abastecimentoService.confirmarValor(numeroBico);
      const valorFinal = resultado.valorConfirmado
        ? String(resultado.valorConfirmado).replace('.', ',')
        : valorReal;
      navigation.replace('ConfirmacaoValor', {
        posto, bico,
        valorProgramado: valor,
        valorAbastecido: valorFinal,
        volume: resultado.volume,
        preco: resultado.preco,
      });
    } catch {
      navigation.replace('ConfirmacaoValor', {
        posto, bico,
        valorProgramado: valor,
        valorAbastecido: valorReal,
      });
    }
  };

  useEffect(() => {
    // Animações decorativas contínuas
    Animated.loop(Animated.sequence([
      Animated.timing(blinkAnim, { toValue: 0.1, duration: 500, useNativeDriver: true }),
      Animated.timing(blinkAnim, { toValue: 1,   duration: 500, useNativeDriver: true }),
    ])).start();

    Animated.loop(Animated.sequence([
      Animated.timing(glowAnim, { toValue: 1,   duration: 1200, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 0.5, duration: 1200, useNativeDriver: true }),
    ])).start();

    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.04, duration: 1000, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1,    duration: 1000, useNativeDriver: true }),
    ])).start();

    // Pulso suave da fase "aguardando"
    Animated.loop(Animated.sequence([
      Animated.timing(waitAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(waitAnim, { toValue: 0.3, duration: 900, useNativeDriver: true }),
    ])).start();

    // ── Polling principal ──
    pollingRef.current = setInterval(async () => {
      if (faseRef.current === 'concluindo') return;

      try {
        const prog = await abastecimentoService.consultarProgresso(numeroBico);
        falhasRef.current = 0;
        setErroConexao(false);

        if (prog.status === 'abastecendo' && parseFloat(prog.valorAtual) > 0) {
          // Bico foi retirado — inicia contagem real
          if (faseRef.current === 'aguardando') {
            faseRef.current = 'abastecendo';
            setFase('abastecendo');
          }

          const v = parseFloat(prog.valorAtual);
          const vStr = v.toFixed(2).replace('.', ',');
          setValorReal(vStr);

          const pctReal = (v / totalValor) * 100;
          const pctExibir = Math.min(pctReal, 100);
          setPct(Math.round(pctExibir));
          Animated.timing(fillAnim, {
            toValue: pctExibir / 100,
            duration: 600,
            useNativeDriver: false,
          }).start();

          // Bateu o valor autorizado → bomba parou automaticamente
          if (pctReal >= 100) {
            finalizarAbastecimento();
          }

        } else if (prog.status === 'aguardando' && faseRef.current === 'abastecendo') {
          // Bico voltou para a bomba (ou bomba parou) → concluído
          finalizarAbastecimento();
        }

      } catch (err) {
        falhasRef.current += 1;
        if (falhasRef.current >= 3) {
          setErroConexao(true);
          setErroMsg(err?.code === 'OFFLINE'
            ? 'Sem conexão com a internet. Verifique sua rede.'
            : 'Não foi possível contatar o servidor. Aguarde...');
        }
      }
    }, 2000);

    return () => clearInterval(pollingRef.current);
  }, []);

  const solicitarCancelamento = () => {
    clearInterval(pollingRef.current);
    setCancelModal(false);
    setCancelado(true);
    setTimeout(() => navigation.navigate('Mapa'), 2000);
  };

  const fillColor = fillAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#3A9B1E', '#6CC24A', '#8FD96A'],
  });

  return (
    <ScreenWrapper edges={['top', 'bottom']}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.statusBadge}>
            <Animated.View style={[styles.dot, {
              opacity: fase === 'abastecendo' ? blinkAnim : waitAnim,
              backgroundColor: fase === 'abastecendo' ? colors.verde : colors.laranja,
            }]} />
            <Text style={[styles.statusText, { color: fase === 'abastecendo' ? colors.verde : colors.laranja }]}>
              {fase === 'aguardando' ? 'AGUARDANDO' : fase === 'abastecendo' ? 'AO VIVO' : 'CONCLUINDO...'}
            </Text>
          </View>
          <Text style={styles.headerTitle}>Abastecendo</Text>
          <View style={styles.bicoTag}>
            <Text style={styles.bicoTagText}>#{numeroBico}</Text>
          </View>
        </View>

        {erroConexao && (
          <ErroConexao
            mensagem={erroMsg}
            tipo="offline"
            onRetry={() => { falhasRef.current = 0; setErroConexao(false); }}
          />
        )}

        {/* Fase aguardando — mensagem de instrução */}
        {fase === 'aguardando' && (
          <Animated.View style={[styles.aguardandoBox, { opacity: waitAnim }]}>
            <Text style={styles.aguardandoIcon}>⛽</Text>
            <Text style={styles.aguardandoTitulo}>Aguardando frentista</Text>
            <Text style={styles.aguardandoDesc}>
              O bico foi liberado.{'\n'}Retire o bico da bomba para iniciar.
            </Text>
          </Animated.View>
        )}

        {/* Tanque — aparece só durante e após abastecimento */}
        {fase !== 'aguardando' && (
          <View style={styles.central}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TankGauge fillAnim={fillAnim} fillColor={fillColor} pct={pct} />
            </Animated.View>
          </View>
        )}

        {/* Métricas */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>VALOR ATUAL</Text>
            <Animated.Text style={[styles.metricValor, { opacity: glowAnim }]}>
              R$ {valorReal}
            </Animated.Text>
            <Text style={styles.metricSub}>cobrado até agora</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>LITROS</Text>
            <Text style={[styles.metricValor, { color: colors.laranja }]}>{litros}</Text>
            <Text style={styles.metricSub}>abastecidos</Text>
          </View>
        </View>

        {/* Barra de progresso */}
        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, {
              width: fillAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            }]}>
              <View style={styles.progressGlow} />
            </Animated.View>
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabelText}>R$ 0,00</Text>
            <Text style={styles.progressLabelText}>R$ {valor}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoItem}>⛽ {posto.nome}</Text>
          <Text style={styles.infoDot}>·</Text>
          <Text style={styles.infoItem}>R$ {posto.preco}/L</Text>
          <Text style={styles.infoDot}>·</Text>
          <Text style={[styles.infoItem, { color: colors.laranja }]}>+{posto.cashback}% cashback</Text>
        </View>

        <View style={styles.footer}>
          {cancelado ? (
            <View style={styles.canceladoBadge}>
              <Text style={styles.canceladoText}>⚠️ Cancelamento enviado — aguarde o frentista</Text>
            </View>
          ) : (
            <>
              <Text style={styles.footerNote}>
                {fase === 'aguardando'
                  ? 'O abastecimento inicia assim que o bico for retirado da bomba.'
                  : 'A bomba permanece bloqueada até a finalização do pagamento.'}
              </Text>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setCancelModal(true)}>
                <Text style={styles.cancelText}>✕  Cancelar abastecimento</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <Modal visible={cancelModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={{ fontSize: 36, textAlign: 'center' }}>⚠️</Text>
            <Text style={styles.modalTitulo}>Cancelar abastecimento?</Text>
            <Text style={styles.modalDesc}>O frentista deverá ser avisado para interromper. A bomba será desbloqueada.</Text>
            <TouchableOpacity style={styles.modalBtnCancel} onPress={solicitarCancelamento}>
              <Text style={styles.modalBtnCancelText}>✕  Confirmar cancelamento</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtnVoltar} onPress={() => setCancelModal(false)}>
              <Text style={styles.modalBtnVoltarText}>Voltar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const tank = StyleSheet.create({
  wrap: { width: 140, height: 260, alignItems: 'center', justifyContent: 'flex-end' },
  mark: { position: 'absolute', right: -36, flexDirection: 'row', alignItems: 'center', gap: 4 },
  markText: { fontSize: 9, fontWeight: '700', color: 'rgba(108,194,74,0.4)' },
  markLine: { width: 10, height: 1, backgroundColor: 'rgba(108,194,74,0.2)' },
  body: {
    width: 140, height: 260,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 2, borderColor: 'rgba(108,194,74,0.35)',
    borderRadius: 22, overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  cap: {
    position: 'absolute', top: -10, left: '50%', marginLeft: -15,
    width: 30, height: 14, borderRadius: 6,
    backgroundColor: '#162416',
    borderWidth: 1.5, borderColor: 'rgba(108,194,74,0.5)',
    alignItems: 'center', justifyContent: 'center', zIndex: 5,
  },
  capSlot: { width: 10, height: 5, backgroundColor: 'rgba(108,194,74,0.45)', borderRadius: 3 },
  liquid: { width: '100%', overflow: 'hidden', position: 'absolute', bottom: 0, left: 0 },
  waveRow: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 12,
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
  },
  waveBump: { width: 30, height: 8, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.18)' },
  shine: { position: 'absolute', top: 0, bottom: 0, left: 10, width: 10, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 10 },
  pctOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  pctNum: { fontSize: 64, fontWeight: '900', color: colors.verde, lineHeight: 70 },
  pctSuf: { fontSize: 24, fontWeight: '900', color: colors.verde, marginTop: 14 },
});

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.xl },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 16, paddingBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(108,194,74,0.12)',
    borderWidth: 1, borderColor: 'rgba(108,194,74,0.3)',
    borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 5,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: colors.text },
  bicoTag: { backgroundColor: colors.verde, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5 },
  bicoTagText: { fontSize: 14, fontWeight: '900', color: colors.white },

  // Fase aguardando
  aguardandoBox: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  aguardandoIcon: { fontSize: 64 },
  aguardandoTitulo: { fontSize: 20, fontWeight: '900', color: colors.laranja, textAlign: 'center' },
  aguardandoDesc: { fontSize: 14, color: colors.textSec, textAlign: 'center', lineHeight: 22 },

  central: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  metricsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.xl, padding: 16, marginBottom: 12,
  },
  metricCard: { flex: 1, alignItems: 'center', gap: 3 },
  metricDivider: { width: 1, height: 44, backgroundColor: colors.border },
  metricLabel: { fontSize: 9, fontWeight: '800', color: colors.textMuted, letterSpacing: 1.5 },
  metricValor: { fontSize: 24, fontWeight: '900', color: colors.verde },
  metricSub: { fontSize: 10, color: colors.textSec },
  progressWrap: { gap: 6, marginBottom: 10 },
  progressTrack: {
    height: 8, backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 8, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(108,194,74,0.1)',
  },
  progressFill: { height: '100%', backgroundColor: colors.verde, borderRadius: 8, overflow: 'hidden', position: 'relative' },
  progressGlow: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 20, backgroundColor: 'rgba(255,255,255,0.35)', borderRadius: 8 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabelText: { fontSize: 10, color: colors.textMuted, fontWeight: '600' },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 6 },
  infoItem: { fontSize: 12, color: colors.textSec, fontWeight: '600' },
  infoDot: { fontSize: 12, color: colors.border },
  footer: { paddingVertical: 12, alignItems: 'center', gap: 10 },
  footerNote: { fontSize: 11, color: colors.textMuted, textAlign: 'center' },
  cancelBtn: {
    borderWidth: 1.5, borderColor: 'rgba(229,57,53,0.5)',
    borderRadius: radius.lg, paddingHorizontal: 28, paddingVertical: 10,
    backgroundColor: 'rgba(229,57,53,0.06)',
  },
  cancelText: { color: colors.red, fontSize: 13, fontWeight: '700' },
  canceladoBadge: {
    backgroundColor: 'rgba(245,166,35,0.12)',
    borderWidth: 1, borderColor: 'rgba(245,166,35,0.3)',
    borderRadius: radius.lg, padding: 14, width: '100%',
  },
  canceladoText: { color: colors.laranja, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end', padding: 20 },
  modalBox: { backgroundColor: colors.card, borderRadius: radius.xxl, padding: 28, gap: 14 },
  modalTitulo: { fontSize: 20, fontWeight: '900', color: colors.text, textAlign: 'center' },
  modalDesc: { fontSize: 14, color: colors.textSec, textAlign: 'center', lineHeight: 20 },
  modalBtnCancel: { backgroundColor: colors.red, borderRadius: radius.lg, padding: 15, alignItems: 'center' },
  modalBtnCancelText: { color: colors.white, fontSize: 15, fontWeight: '800' },
  modalBtnVoltar: { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.lg, padding: 15, alignItems: 'center' },
  modalBtnVoltarText: { color: colors.textSec, fontSize: 14, fontWeight: '700' },
});
