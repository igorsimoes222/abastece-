import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, TextInput,
} from 'react-native';
import { colors, radius, spacing } from '../../components/theme';
import ScreenWrapper from '../../components/ScreenWrapper';
import { abastecimentoService } from '../services/abastecimentoService';
import { api } from '../services/api';

const PRESETS = [50, 100, 150, 200];

// Mock para desenvolvimento — remove quando o backend estiver pronto
function mockValidarBomba(codigo) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!codigo || codigo.length < 3) {
        reject(new Error('Código não encontrado'));
        return;
      }
      resolve({
        posto: { nome: 'Posto Abastece+', cidade: 'São Paulo', uf: 'SP', cashback: 3 },
        bicos: [
          { id: 1, numero: '01', combustivel: 'Gasolina Comum',  preco: '5,89' },
          { id: 2, numero: '02', combustivel: 'Gasolina Aditivada', preco: '6,19' },
          { id: 3, numero: '03', combustivel: 'Etanol',           preco: '3,99' },
        ],
      });
    }, 1200);
  });
}

export default function AutorizacaoScreen({ navigation }) {
  // Etapas: 1=código bomba, 2=escolher bico, 3=valor, 4=confirmar
  const [etapa, setEtapa] = useState(1);

  // Etapa 1
  const [codigoBomba, setCodigoBomba] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [erroBusca, setErroBusca] = useState('');

  // Resultado da busca
  const [posto, setPosto] = useState(null);
  const [bicos, setBicos] = useState([]);

  // Etapa 2
  const [bicoSelecionado, setBicoSelecionado] = useState(null);

  // Etapa 3
  const [querDefinirValor, setQuerDefinirValor] = useState(null);
  const [valor, setValor] = useState('100,00');
  const [valorPersonalizado, setValorPersonalizado] = useState(false);
  const [valorInput, setValorInput] = useState('');

  // Etapa 4
  const [autorizando, setAutorizando] = useState(false);

  const STEPS = ['Bomba', 'Bico', 'Valor', 'Confirmar'];

  const stepDone = (i) => etapa > i + 1;
  const stepActive = (i) => etapa === i + 1;

  const buscarBomba = async () => {
    if (!codigoBomba.trim()) return;
    setBuscando(true);
    setErroBusca('');
    try {
      let res;
      try {
        res = await api.post('/bomba/validar', { codigo: codigoBomba.trim().toUpperCase() });
      } catch {
        // fallback mock em dev
        res = await mockValidarBomba(codigoBomba.trim());
      }
      setPosto(res.posto);
      setBicos(res.bicos ?? []);
      setEtapa(2);
    } catch (e) {
      setErroBusca(e.message ?? 'Código não encontrado. Tente novamente.');
    } finally {
      setBuscando(false);
    }
  };

  const selecionarBico = (bico) => {
    setBicoSelecionado(bico);
    setEtapa(3);
  };

  const confirmarValor = () => setEtapa(4);

  const autorizar = async () => {
    setAutorizando(true);
    try {
      const valorNum = querDefinirValor === false ? 999 : parseFloat(valor.replace(',', '.')) || 999;
      await abastecimentoService.iniciar({ bico: bicoSelecionado.numero, valor: valorNum });
      navigation.navigate('Abastecendo', {
        posto,
        bico: bicoSelecionado.numero,
        valor: querDefinirValor === false ? 'Tanque cheio' : valor,
      });
    } catch {
      navigation.navigate('Abastecendo', {
        posto,
        bico: bicoSelecionado?.numero,
        valor,
      });
    } finally {
      setAutorizando(false);
    }
  };

  const voltar = () => {
    if (etapa > 1) setEtapa(etapa - 1);
    else navigation.goBack();
  };

  const valorNum = parseFloat(valor.replace(',', '.')) || 0;
  const cashbackEst = (posto ? (valorNum * (posto.cashback ?? 3)) / 100 : 0)
    .toFixed(2).replace('.', ',');

  return (
    <ScreenWrapper edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={voltar}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Abastecer</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Steps */}
      <View style={s.steps}>
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            <View style={s.step}>
              <View style={[s.stepCircle, stepDone(i) && s.stepDone, stepActive(i) && s.stepActive]}>
                <Text style={s.stepNum}>{stepDone(i) ? '✓' : i + 1}</Text>
              </View>
              <Text style={[s.stepLabel, (stepDone(i) || stepActive(i)) && s.stepLabelActive]}>
                {label}
              </Text>
            </View>
            {i < STEPS.length - 1 && (
              <View style={[s.stepLine, stepDone(i) && s.stepLineDone]} />
            )}
          </React.Fragment>
        ))}
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ETAPA 1 — Código da bomba */}
        {etapa === 1 && (
          <View style={s.card}>
            <Text style={s.cardTitle}>⛽ Código da bomba</Text>
            <Text style={s.cardDesc}>
              Digite o código exibido no display da bomba de combustível.
            </Text>

            <View style={s.codeInputWrap}>
              <TextInput
                style={s.codeInput}
                placeholder="ex: A12"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="characters"
                maxLength={8}
                value={codigoBomba}
                onChangeText={t => {
                  setCodigoBomba(t.toUpperCase());
                  setErroBusca('');
                }}
                autoFocus
              />
            </View>

            {erroBusca ? (
              <View style={s.erroBadge}>
                <Text style={s.erroText}>{erroBusca}</Text>
              </View>
            ) : null}

            <Text style={s.hint}>O código está no display ou no painel da bomba</Text>
          </View>
        )}

        {/* ETAPA 2 — Escolher bico */}
        {etapa === 2 && (
          <>
            {/* Info do posto */}
            {posto && (
              <View style={s.postoCard}>
                <Text style={s.postoIcon}>⛽</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.postoNome}>{posto.nome}</Text>
                  <Text style={s.postoCidade}>{posto.cidade} — {posto.uf}</Text>
                </View>
                <View style={s.cashbackBadge}>
                  <Text style={s.cashbackText}>{posto.cashback}% cashback</Text>
                </View>
              </View>
            )}

            <Text style={s.sectionLabel}>Escolha o bico</Text>

            {bicos.map(bico => (
              <TouchableOpacity
                key={bico.id}
                style={s.bicoCard}
                onPress={() => selecionarBico(bico)}
                activeOpacity={0.75}
              >
                <View style={s.bicoNum}>
                  <Text style={s.bicoNumText}>#{bico.numero}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.bicoComb}>{bico.combustivel}</Text>
                  <Text style={s.bicoPreco}>R$ {bico.preco}/L</Text>
                </View>
                <Text style={s.bicoArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* ETAPA 3 — Valor */}
        {etapa === 3 && (
          <>
            {/* Resumo bico selecionado */}
            <View style={s.bicoBadge}>
              <Text style={s.bicoBadgeNum}>Bico #{bicoSelecionado?.numero}</Text>
              <Text style={s.bicoBadgeComb}>{bicoSelecionado?.combustivel} • R$ {bicoSelecionado?.preco}/L</Text>
            </View>

            <View style={s.card}>
              <Text style={s.cardTitle}>💲 Como quer abastecer?</Text>
              <View style={s.opcoesFlex}>
                <TouchableOpacity
                  style={[s.opcaoBtn, querDefinirValor === false && s.opcaoBtnActive]}
                  onPress={() => { setQuerDefinirValor(false); setValorPersonalizado(false); }}
                >
                  <Text style={s.opcaoIcon}>💧</Text>
                  <Text style={s.opcaoTitulo}>Tanque cheio</Text>
                  <Text style={s.opcaoDesc}>Cobra só o abastecido</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.opcaoBtn, querDefinirValor === true && s.opcaoBtnActive]}
                  onPress={() => setQuerDefinirValor(true)}
                >
                  <Text style={s.opcaoIcon}>💲</Text>
                  <Text style={s.opcaoTitulo}>Definir valor</Text>
                  <Text style={s.opcaoDesc}>Você escolhe o limite</Text>
                </TouchableOpacity>
              </View>

              {querDefinirValor === true && (
                <View style={s.valorWrap}>
                  <Text style={s.valorGrande}>
                    <Text style={{ color: colors.verde }}>R$ </Text>{valor}
                  </Text>
                  <View style={s.presets}>
                    {PRESETS.map(p => (
                      <TouchableOpacity
                        key={p}
                        style={[s.presetBtn, !valorPersonalizado && valor === `${p},00` && s.presetBtnActive]}
                        onPress={() => { setValor(`${p},00`); setValorPersonalizado(false); setValorInput(''); }}
                      >
                        <Text style={[s.presetText, !valorPersonalizado && valor === `${p},00` && { color: '#060F1A' }]}>
                          R$ {p}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {!valorPersonalizado ? (
                    <TouchableOpacity
                      style={s.personalizarBtn}
                      onPress={() => { setValorPersonalizado(true); setValorInput(''); }}
                    >
                      <Text style={s.personalizarText}>✏️  Outro valor</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={s.personalizarWrap}>
                      <View style={s.personalizarRow}>
                        <Text style={s.personalizarRS}>R$</Text>
                        <TextInput
                          style={s.personalizarInput}
                          placeholder="0,00"
                          placeholderTextColor={colors.textMuted}
                          keyboardType="numeric"
                          value={valorInput}
                          autoFocus
                          onChangeText={t => {
                            const limpo = t.replace(/[^0-9,]/g, '');
                            setValorInput(limpo);
                            if (limpo) setValor(limpo.includes(',') ? limpo : `${limpo},00`);
                          }}
                        />
                        <TouchableOpacity onPress={() => { setValorPersonalizado(false); setValorInput(''); setValor('100,00'); }}>
                          <Text style={s.personalizarFechar}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>
          </>
        )}

        {/* ETAPA 4 — Resumo */}
        {etapa === 4 && (
          <View style={s.summary}>
            <Text style={s.sectionLabel}>Resumo do abastecimento</Text>
            {[
              { label: 'Posto', value: posto?.nome },
              { label: 'Cidade', value: `${posto?.cidade} — ${posto?.uf}` },
              { label: 'Bico', value: `#${bicoSelecionado?.numero} — ${bicoSelecionado?.combustivel}` },
              { label: 'Preço/L', value: `R$ ${bicoSelecionado?.preco}` },
              {
                label: querDefinirValor === false ? 'Modalidade' : 'Valor programado',
                value: querDefinirValor === false ? 'Tanque cheio' : `R$ ${valor}`,
              },
              { label: 'Cashback estimado', value: `+ R$ ${cashbackEst}`, verde: true },
            ].map(row => (
              <View key={row.label} style={s.summaryRow}>
                <Text style={s.summaryLabel}>{row.label}</Text>
                <Text style={[s.summaryValue, row.verde && { color: colors.verde }]}>{row.value}</Text>
              </View>
            ))}
            <View style={s.divider} />
            <View style={s.summaryRow}>
              <Text style={[s.summaryLabel, { color: colors.text, fontWeight: '800', fontSize: 15 }]}>
                {querDefinirValor === false ? 'Valor máximo' : 'Total autorizado'}
              </Text>
              <Text style={[s.summaryValue, { color: colors.verde, fontSize: 16, fontWeight: '900' }]}>
                {querDefinirValor === false ? 'Tanque cheio' : `R$ ${valor}`}
              </Text>
            </View>
            <View style={s.infoBox}>
              <Text style={s.infoText}>
                💳 Após concluir o abastecimento, você selecionará a forma de pagamento.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={s.footer}>
        {etapa === 1 && (
          <TouchableOpacity
            style={[s.btnConfirm, (!codigoBomba.trim() || buscando) && s.btnDisabled]}
            onPress={buscarBomba}
            disabled={!codigoBomba.trim() || buscando}
          >
            {buscando
              ? <ActivityIndicator color="#060F1A" />
              : <Text style={s.btnConfirmText}>Buscar bomba →</Text>
            }
          </TouchableOpacity>
        )}
        {etapa === 3 && (
          <TouchableOpacity
            style={[s.btnConfirm, querDefinirValor === null && s.btnDisabled]}
            onPress={confirmarValor}
            disabled={querDefinirValor === null}
          >
            <Text style={s.btnConfirmText}>Confirmar valor →</Text>
          </TouchableOpacity>
        )}
        {etapa === 4 && (
          <TouchableOpacity
            style={[s.btnConfirm, autorizando && s.btnDisabled]}
            onPress={autorizar}
            disabled={autorizando}
          >
            {autorizando
              ? <ActivityIndicator color="#060F1A" />
              : <Text style={s.btnConfirmText}>⚡ Autorizar abastecimento</Text>
            }
          </TouchableOpacity>
        )}
      </View>
    </ScreenWrapper>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  backText: { fontSize: 20, color: colors.text },
  headerTitle: { fontSize: 18, fontWeight: '900', color: colors.text },

  steps: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingBottom: spacing.md,
  },
  step: { alignItems: 'center', gap: 4 },
  stepCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  stepDone: { backgroundColor: colors.verde, borderColor: colors.verde },
  stepActive: { backgroundColor: colors.verde, borderColor: colors.verde },
  stepNum: { fontSize: 11, fontWeight: '800', color: '#060F1A' },
  stepLabel: { fontSize: 9, fontWeight: '600', color: colors.textSec },
  stepLabelActive: { color: colors.verde },
  stepLine: { flex: 1, height: 2, backgroundColor: colors.border, marginBottom: 14 },
  stepLineDone: { backgroundColor: colors.verde },

  scroll: { flex: 1 },
  scrollContent: { padding: spacing.xl, gap: 14 },

  card: {
    backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.xl, padding: 20, gap: 14, alignItems: 'center',
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: colors.text, textAlign: 'center' },
  cardDesc: { fontSize: 13, color: colors.textSec, textAlign: 'center', lineHeight: 18 },

  codeInputWrap: {
    backgroundColor: colors.bg,
    borderWidth: 2, borderColor: 'rgba(74,222,128,0.4)',
    borderRadius: radius.xl, paddingHorizontal: 20,
    width: '70%',
  },
  codeInput: {
    fontSize: 40, fontWeight: '900', color: colors.text,
    textAlign: 'center', paddingVertical: 14, letterSpacing: 8,
  },

  erroBadge: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 8,
  },
  erroText: { fontSize: 13, color: colors.red, fontWeight: '700', textAlign: 'center' },
  hint: { fontSize: 12, color: colors.textMuted, textAlign: 'center' },

  // Posto
  postoCard: {
    backgroundColor: colors.verdeBg,
    borderWidth: 1, borderColor: 'rgba(74,222,128,0.2)',
    borderRadius: radius.xl, padding: spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  postoIcon: { fontSize: 26 },
  postoNome: { fontSize: 15, fontWeight: '800', color: colors.text },
  postoCidade: { fontSize: 12, color: colors.textSec, marginTop: 2 },
  cashbackBadge: {
    backgroundColor: 'rgba(251,146,60,0.15)',
    borderRadius: radius.md, paddingHorizontal: 8, paddingVertical: 4,
  },
  cashbackText: { fontSize: 11, fontWeight: '800', color: colors.laranja },

  sectionLabel: {
    fontSize: 11, color: colors.textSec, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },

  // Bicos
  bicoCard: {
    backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.xl, padding: spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  bicoNum: {
    width: 48, height: 48, borderRadius: radius.md,
    backgroundColor: colors.verdeBg,
    borderWidth: 1, borderColor: 'rgba(74,222,128,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  bicoNumText: { fontSize: 14, fontWeight: '900', color: colors.verde },
  bicoComb: { fontSize: 15, fontWeight: '800', color: colors.text },
  bicoPreco: { fontSize: 12, color: colors.textSec, marginTop: 2 },
  bicoArrow: { fontSize: 18, color: colors.verde, fontWeight: '800' },

  // Bico selecionado badge
  bicoBadge: {
    backgroundColor: colors.verdeBg,
    borderWidth: 1, borderColor: 'rgba(74,222,128,0.25)',
    borderRadius: radius.lg, padding: spacing.md,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  bicoBadgeNum: { fontSize: 14, fontWeight: '900', color: colors.verde },
  bicoBadgeComb: { fontSize: 12, color: colors.textSec },

  // Valor
  opcoesFlex: { flexDirection: 'row', gap: 10, width: '100%' },
  opcaoBtn: {
    flex: 1, backgroundColor: colors.bg,
    borderWidth: 2, borderColor: colors.border,
    borderRadius: radius.lg, padding: 14, alignItems: 'center', gap: 4,
  },
  opcaoBtnActive: { borderColor: colors.verde, backgroundColor: colors.verdeBg },
  opcaoIcon: { fontSize: 24 },
  opcaoTitulo: { fontSize: 13, fontWeight: '800', color: colors.text, textAlign: 'center' },
  opcaoDesc: { fontSize: 11, color: colors.textSec, textAlign: 'center' },

  valorWrap: { width: '100%', alignItems: 'center', gap: 12, marginTop: 4 },
  valorGrande: { fontSize: 40, fontWeight: '900', color: colors.text },
  presets: { flexDirection: 'row', gap: 8 },
  presetBtn: {
    backgroundColor: colors.verdeBg,
    borderWidth: 1, borderColor: 'rgba(74,222,128,0.2)',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8,
  },
  presetBtnActive: { backgroundColor: colors.verde },
  presetText: { fontSize: 13, fontWeight: '700', color: colors.verde },

  personalizarBtn: {
    borderWidth: 1.5, borderColor: 'rgba(74,222,128,0.3)',
    borderRadius: radius.lg, paddingVertical: 10, paddingHorizontal: 20,
    borderStyle: 'dashed',
  },
  personalizarText: { fontSize: 13, color: colors.verde, fontWeight: '700' },
  personalizarWrap: {
    width: '100%', backgroundColor: colors.bg,
    borderWidth: 2, borderColor: 'rgba(74,222,128,0.4)',
    borderRadius: radius.xl, padding: 14,
  },
  personalizarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  personalizarRS: { fontSize: 26, fontWeight: '900', color: colors.verde },
  personalizarInput: {
    flex: 1, fontSize: 42, fontWeight: '900', color: colors.text,
    textAlign: 'center', paddingVertical: 4,
  },
  personalizarFechar: { fontSize: 18, color: colors.textMuted, paddingHorizontal: 4 },

  // Resumo
  summary: {
    backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.xl, padding: 16, gap: 4,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  summaryLabel: { fontSize: 13, color: colors.textSec },
  summaryValue: { fontSize: 13, fontWeight: '700', color: colors.text, textAlign: 'right', flex: 1, marginLeft: 8 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 6 },
  infoBox: { backgroundColor: 'rgba(43,95,170,0.12)', borderRadius: radius.md, padding: 10, marginTop: 6 },
  infoText: { fontSize: 12, color: '#7B9FD4', lineHeight: 16 },

  footer: { padding: spacing.xl },
  btnConfirm: {
    backgroundColor: colors.verde,
    borderRadius: radius.lg, padding: 16, alignItems: 'center',
  },
  btnDisabled: { backgroundColor: colors.border, opacity: 0.5 },
  btnConfirmText: { color: '#060F1A', fontSize: 16, fontWeight: '800' },
});
