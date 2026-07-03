import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, TextInput,
} from 'react-native';
import { colors, radius, spacing } from '../../components/theme';
import ScreenWrapper from '../../components/ScreenWrapper';
import { abastecimentoService } from '../services/abastecimentoService';
import { api } from '../services/api';

const presets = [50, 100, 150, 200];

export default function AutorizacaoScreen({ navigation, route }) {
  const postoParam = route?.params?.posto ?? null;
  const [posto, setPosto] = useState(postoParam ?? {
    nome: 'Carregando...', ende: '',
    cidade: '', uf: 'SP',
    preco: '0,00', cashback: '1',
  });

  useEffect(() => {
    api.get('/postos/2').then(r => {
      const p = r.posto;
      setPosto({
        nome: p.nome,
        ende: p.endereco ?? '',
        cidade: p.cidade ?? '',
        uf: p.uf ?? 'SP',
        preco: String(p.preco_etanol || '0').replace('.', ','),
        precoGasolina: String(p.preco_gasolina || '0').replace('.', ','),
        precoEtanol: String(p.preco_etanol || '0').replace('.', ','),
        precoDiesel: String(p.preco_diesel || '0').replace('.', ','),
        cashback: String(p.cashback_pct ?? 1),
      });
    }).catch(() => {});
  }, []);

  const preAuth = route?.params?.preAuth ?? null;

  // etapa: 1=número bico, 2=código adesivo, 3=valor, 4=confirmar
  const [etapa, setEtapa] = useState(1);
  const [bico, setBico] = useState('');
  const [codigo, setCodigo] = useState('');
  const [codigoStatus, setCodigoStatus] = useState(null); // null | 'validando' | 'ok' | 'erro'
  const [codigoErro, setCodigoErro] = useState('');
  const [bicoCombustivel, setBicoCombustivel] = useState('');
  const [querDefinirValor, setQuerDefinirValor] = useState(null);
  const [valor, setValor] = useState(preAuth ? preAuth.valor : '100,00');
  const [valorPersonalizado, setValorPersonalizado] = useState(false);
  const [valorInput, setValorInput] = useState('');
  const [autorizando, setAutorizando] = useState(false);

  const stepLabels = ['Posto', 'Bico', 'Código', 'Valor', 'Confirmar'];

  const stepDone = (i) => {
    if (i === 0) return true;
    if (i === 1) return etapa > 1;
    if (i === 2) return etapa > 2;
    if (i === 3) return etapa > 3;
    return false;
  };
  const stepActive = (i) => etapa === i;

  const confirmarBico = () => {
    if (!bico.trim()) return;
    setEtapa(2);
  };

  const validarCodigo = async () => {
    if (!codigo.trim()) return;
    setCodigoStatus('validando');
    setCodigoErro('');
    try {
      const res = await api.post('/bico/validar', {
        numero: bico.trim(),
        codigo: codigo.trim().toUpperCase(),
      });
      setBicoCombustivel(res.bico?.combustivel ?? 'Gasolina Comum');
      setCodigoStatus('ok');
    } catch (e) {
      setCodigoStatus('erro');
      setCodigoErro(e.message ?? 'Código inválido');
    }
  };

  const confirmarCodigo = () => setEtapa(3);
  const confirmarValor = () => setEtapa(4);

  const autorizar = async () => {
    setAutorizando(true);
    try {
      const valorNum = parseFloat(valor.replace(',', '.')) || 999;
      await abastecimentoService.iniciar({ bico, valor: valorNum });
      // Seleciona o preço/L de acordo com o combustível do bico
      const comb = bicoCombustivel.toLowerCase();
      let precoLitro = posto.preco;
      if (comb.includes('etanol')) precoLitro = posto.preco_etanol ?? posto.precoEtanol ?? posto.preco;
      else if (comb.includes('diesel')) precoLitro = posto.preco_diesel ?? posto.precoDiesel ?? posto.preco;
      else precoLitro = posto.preco_gasolina ?? posto.precoGasolina ?? posto.preco;
      navigation.navigate('Abastecendo', { posto: { ...posto, preco: precoLitro }, bico, valor });
    } catch (e) {
      console.warn('Erro ao autorizar:', e.message);
      navigation.navigate('Abastecendo', { posto, bico, valor });
    } finally {
      setAutorizando(false);
    }
  };

  const voltar = () => {
    if (etapa > 1) setEtapa(etapa - 1);
    else navigation.goBack();
  };

  const valorNum = parseFloat(valor.replace(',', '.')) || 0;
  const cashbackEst = ((valorNum * parseFloat(posto.cashback)) / 100)
    .toFixed(2).replace('.', ',');

  const subTitulo = [
    '', 'Digite o número do bico', 'Digite o código do adesivo',
    'Defina o valor', 'Confirme e autorize',
  ][etapa];

  return (
    <ScreenWrapper edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={voltar}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Abastecer</Text>
          <Text style={styles.headerSub}>{subTitulo}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Steps */}
      <View style={styles.steps}>
        {stepLabels.map((label, i) => (
          <React.Fragment key={label}>
            <View style={styles.step}>
              <View style={[
                styles.stepCircle,
                stepDone(i) && styles.stepDone,
                stepActive(i) && styles.stepActive,
              ]}>
                <Text style={styles.stepNum}>{stepDone(i) ? '✓' : i + 1}</Text>
              </View>
              <Text style={[
                styles.stepLabel,
                (stepDone(i) || stepActive(i)) && styles.stepLabelActive,
              ]}>
                {label}
              </Text>
            </View>
            {i < 4 && <View style={[styles.stepLine, stepDone(i) && styles.stepLineDone]} />}
          </React.Fragment>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Card do posto */}
        <View style={styles.postoCard}>
          <View style={styles.postoIcon}><Text style={{ fontSize: 26 }}>⛽</Text></View>
          <View style={styles.postoInfo}>
            <Text style={styles.postoNome}>{posto.nome}</Text>
            <Text style={styles.postoEnde}>{posto.ende}</Text>
            <Text style={styles.postoCidade}>📍 {posto.cidade} — {posto.uf}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.trocarBtn}>Trocar</Text>
          </TouchableOpacity>
        </View>

        {/* ETAPA 1 — Número do bico */}
        {etapa === 1 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>⛽ Qual é o número do bico?</Text>
            <Text style={styles.cardDesc}>
              Olhe a bomba que você vai usar e digite o número do bico.
            </Text>

            <View style={styles.bicoInputWrap}>
              <Text style={styles.bicoInputPrefix}>#</Text>
              <TextInput
                style={styles.bicoInput}
                placeholder="00"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                maxLength={2}
                value={bico}
                onChangeText={t => setBico(t.replace(/\D/g, ''))}
                autoFocus
              />
            </View>

            <Text style={styles.bicoHint}>
              O número está exibido na frente da bomba ou no display
            </Text>
          </View>
        )}

        {/* ETAPA 2 — Código do adesivo */}
        {etapa === 2 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🔑 Código do bico #{bico.padStart(2, '0')}</Text>
            <Text style={styles.cardDesc}>
              Digite o código que está no adesivo colado na bomba #{bico.padStart(2, '0')}.
            </Text>

            <View style={styles.codigoWrap}>
              <TextInput
                style={styles.codigoInput}
                placeholder="ex: AB47"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="characters"
                maxLength={10}
                value={codigo}
                onChangeText={t => {
                  setCodigo(t.toUpperCase());
                  setCodigoStatus(null);
                  setCodigoErro('');
                }}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[styles.btnVerificar, !codigo.trim() && styles.btnDisabled]}
              onPress={validarCodigo}
              disabled={!codigo.trim() || codigoStatus === 'validando'}
            >
              {codigoStatus === 'validando' ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.btnVerificarText}>Validar código</Text>
              )}
            </TouchableOpacity>

            {codigoStatus === 'ok' && (
              <View style={styles.sucessoBadge}>
                <View style={styles.sucessoDot} />
                <Text style={styles.sucessoText}>
                  Bico #{bico.padStart(2, '0')} validado — {bicoCombustivel}
                </Text>
              </View>
            )}
            {codigoStatus === 'erro' && (
              <View style={styles.erroBadge}>
                <Text style={styles.erroText}>{codigoErro}</Text>
              </View>
            )}
          </View>
        )}

        {/* ETAPA 3 — Valor */}
        {etapa === 3 && (
          <>
            {preAuth ? (
              <View style={styles.card}>
                <View style={styles.preAuthBadge}>
                  <Text style={styles.preAuthBadgeText}>🔒 Pré-autorização ativa</Text>
                </View>
                <Text style={styles.cardTitle}>Valor pré-autorizado</Text>
                <Text style={styles.valorGrande}>R$ {preAuth.valor}</Text>
                <Text style={styles.cardDesc}>
                  Apenas o valor abastecido será debitado — o restante é liberado.
                </Text>
              </View>
            ) : (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>💲 Como quer abastecer?</Text>
                <Text style={styles.cardDesc}>
                  Escolha entre tanque cheio ou defina um valor máximo.
                </Text>
                <View style={styles.opcoesFlex}>
                  <TouchableOpacity
                    style={[styles.opcaoBtn, querDefinirValor === false && styles.opcaoBtnActive]}
                    onPress={() => setQuerDefinirValor(false)}
                  >
                    <Text style={styles.opcaoIcon}>💧</Text>
                    <Text style={styles.opcaoTitulo}>Tanque Cheio</Text>
                    <Text style={styles.opcaoDesc}>Cobra só o abastecido</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.opcaoBtn, querDefinirValor === true && styles.opcaoBtnActive]}
                    onPress={() => setQuerDefinirValor(true)}
                  >
                    <Text style={styles.opcaoIcon}>💲</Text>
                    <Text style={styles.opcaoTitulo}>Definir Valor</Text>
                    <Text style={styles.opcaoDesc}>Você escolhe o limite</Text>
                  </TouchableOpacity>
                </View>

                {querDefinirValor === true && (
                  <View style={styles.valorWrap}>
                    <Text style={styles.valorLabel}>Valor a programar</Text>
                    <Text style={styles.valorGrande}>
                      <Text style={{ color: colors.verde }}>R$ </Text>{valor}
                    </Text>
                    <View style={styles.presets}>
                      {presets.map(p => (
                        <TouchableOpacity
                          key={p}
                          style={[styles.presetBtn, !valorPersonalizado && valor === `${p},00` && styles.presetBtnActive]}
                          onPress={() => {
                            setValor(`${p},00`);
                            setValorPersonalizado(false);
                            setValorInput('');
                          }}
                        >
                          <Text style={[styles.presetText, !valorPersonalizado && valor === `${p},00` && { color: colors.white }]}>
                            R$ {p}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Botão personalizar */}
                    {!valorPersonalizado ? (
                      <TouchableOpacity
                        style={styles.personalizarBtn}
                        onPress={() => { setValorPersonalizado(true); setValorInput(''); }}
                      >
                        <Text style={styles.personalizarText}>✏️  Personalizar valor</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.personalizarWrap}>
                        <Text style={styles.personalizarLabel}>Digite o valor desejado</Text>
                        <View style={styles.personalizarInputRow}>
                          <Text style={styles.personalizarRS}>R$</Text>
                          <TextInput
                            style={styles.personalizarInput}
                            placeholder="0,00"
                            placeholderTextColor={colors.textMuted}
                            keyboardType="numeric"
                            value={valorInput}
                            autoFocus
                            onChangeText={t => {
                              // Permite apenas números e vírgula
                              const limpo = t.replace(/[^0-9,]/g, '');
                              setValorInput(limpo);
                              if (limpo) setValor(limpo.includes(',') ? limpo : `${limpo},00`);
                            }}
                          />
                          <TouchableOpacity
                            onPress={() => { setValorPersonalizado(false); setValorInput(''); setValor('100,00'); }}
                          >
                            <Text style={styles.personalizarFechar}>✕</Text>
                          </TouchableOpacity>
                        </View>
                        {valorInput ? (
                          <Text style={styles.personalizarPreview}>
                            Valor selecionado: <Text style={{ color: colors.verde, fontWeight: '800' }}>R$ {valor}</Text>
                          </Text>
                        ) : null}
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}
          </>
        )}

        {/* ETAPA 4 — Resumo */}
        {etapa === 4 && (
          <View style={styles.summary}>
            <Text style={styles.sectionLabel}>Resumo do abastecimento</Text>
            {[
              { label: 'Posto', value: posto.nome },
              { label: 'Cidade', value: `${posto.cidade} — ${posto.uf}` },
              { label: 'Bico', value: `#${bico.padStart(2, '0')}` },
              { label: 'Combustível', value: `${bicoCombustivel || 'Gasolina'} • R$ ${posto.preco}/L` },
              {
                label: preAuth ? 'Pré-autorização' : querDefinirValor === false ? 'Modalidade' : 'Valor programado',
                value: preAuth ? `R$ ${preAuth.valor} (bloqueado)` : querDefinirValor === false ? 'Tanque Cheio' : `R$ ${valor}`,
              },
              { label: 'Cashback estimado', value: `+ R$ ${cashbackEst}`, verde: true },
            ].map(row => (
              <View key={row.label} style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{row.label}</Text>
                <Text style={[styles.summaryValue, row.verde && { color: colors.verde }]}>
                  {row.value}
                </Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.text, fontWeight: '800', fontSize: 15 }]}>
                {preAuth || querDefinirValor === false ? 'Valor máximo' : 'Total autorizado'}
              </Text>
              <Text style={[styles.summaryValue, { color: colors.verde, fontSize: 16, fontWeight: '900' }]}>
                {preAuth ? `R$ ${preAuth.valor}` : querDefinirValor === false ? 'Tanque cheio' : `R$ ${valor}`}
              </Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                💳 Após concluir o abastecimento, você selecionará a forma de pagamento.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Rodapé */}
      <View style={styles.footer}>
        {etapa === 1 && (
          <TouchableOpacity
            style={[styles.btnConfirm, !bico.trim() && styles.btnDisabled]}
            onPress={confirmarBico}
            disabled={!bico.trim()}
          >
            <Text style={styles.btnConfirmText}>Continuar →</Text>
          </TouchableOpacity>
        )}
        {etapa === 2 && (
          <TouchableOpacity
            style={[styles.btnConfirm, codigoStatus !== 'ok' && styles.btnDisabled]}
            onPress={confirmarCodigo}
            disabled={codigoStatus !== 'ok'}
          >
            <Text style={styles.btnConfirmText}>Confirmar bico →</Text>
          </TouchableOpacity>
        )}
        {etapa === 3 && (
          <TouchableOpacity
            style={[styles.btnConfirm, (!preAuth && querDefinirValor === null) && styles.btnDisabled]}
            onPress={confirmarValor}
            disabled={!preAuth && querDefinirValor === null}
          >
            <Text style={styles.btnConfirmText}>Confirmar valor →</Text>
          </TouchableOpacity>
        )}
        {etapa === 4 && (
          <TouchableOpacity
            style={[styles.btnConfirm, autorizando && styles.btnDisabled]}
            onPress={autorizar}
            disabled={autorizando}
          >
            {autorizando
              ? <ActivityIndicator color={colors.white} />
              : <Text style={styles.btnConfirmText}>⚡ Autorizar Abastecimento</Text>
            }
          </TouchableOpacity>
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
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
  headerSub: { fontSize: 12, color: colors.textSec },

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
  stepActive: {
    backgroundColor: colors.verde, borderColor: colors.verde,
    shadowColor: colors.verde, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4,
  },
  stepNum: { fontSize: 11, fontWeight: '800', color: colors.text },
  stepLabel: { fontSize: 9, fontWeight: '600', color: colors.textSec },
  stepLabelActive: { color: colors.verde },
  stepLine: { flex: 1, height: 2, backgroundColor: colors.border, marginBottom: 14 },
  stepLineDone: { backgroundColor: colors.verde },

  scroll: { flex: 1 },
  scrollContent: { padding: spacing.xl, gap: 16 },

  postoCard: {
    backgroundColor: colors.verdeBg,
    borderWidth: 1, borderColor: 'rgba(109,194,41,0.2)',
    borderRadius: radius.xl, padding: spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  postoIcon: {
    width: 50, height: 50, borderRadius: 14,
    backgroundColor: 'rgba(109,194,41,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  postoInfo: { flex: 1 },
  postoNome: { fontSize: 15, fontWeight: '800', color: colors.text },
  postoEnde: { fontSize: 12, color: colors.textSec, marginTop: 2 },
  postoCidade: { fontSize: 11, color: colors.verde, fontWeight: '600', marginTop: 4 },
  trocarBtn: { fontSize: 13, color: colors.verde, fontWeight: '700' },

  card: {
    backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.xl, padding: 20, gap: 14,
    alignItems: 'center',
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: colors.text, textAlign: 'center' },
  cardDesc: { fontSize: 13, color: colors.textSec, textAlign: 'center', lineHeight: 18 },

  // Bico
  bicoInputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bg,
    borderWidth: 2, borderColor: 'rgba(109,194,41,0.4)',
    borderRadius: radius.xl, paddingHorizontal: 20,
    width: '55%',
  },
  bicoInputPrefix: { fontSize: 36, fontWeight: '900', color: colors.verde, marginRight: 4 },
  bicoInput: {
    flex: 1, fontSize: 56, fontWeight: '900', color: colors.text,
    textAlign: 'center', paddingVertical: 10,
  },
  bicoHint: { fontSize: 12, color: colors.textMuted, textAlign: 'center' },

  // Código
  codigoWrap: {
    backgroundColor: colors.bg,
    borderWidth: 2, borderColor: 'rgba(109,194,41,0.4)',
    borderRadius: radius.xl, paddingHorizontal: 20,
    width: '70%',
  },
  codigoInput: {
    fontSize: 38, fontWeight: '900', color: colors.text,
    textAlign: 'center', paddingVertical: 14, letterSpacing: 6,
  },

  btnVerificar: {
    backgroundColor: colors.verde,
    borderRadius: radius.lg, paddingHorizontal: 28, paddingVertical: 12,
    alignItems: 'center', width: '80%',
  },
  btnVerificarText: { color: colors.white, fontSize: 15, fontWeight: '800' },

  sucessoBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(109,194,41,0.1)',
    borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 8,
  },
  sucessoDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.verde },
  sucessoText: { fontSize: 13, color: colors.verde, fontWeight: '700' },

  erroBadge: {
    backgroundColor: 'rgba(229,57,53,0.1)',
    borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 8,
  },
  erroText: { fontSize: 13, color: colors.red, fontWeight: '700', textAlign: 'center' },

  // Valor
  preAuthBadge: {
    backgroundColor: 'rgba(109,194,41,0.12)',
    borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 4,
  },
  preAuthBadgeText: { fontSize: 12, color: colors.verde, fontWeight: '700' },
  valorGrande: { fontSize: 40, fontWeight: '900', color: colors.text, textAlign: 'center' },
  opcoesFlex: { flexDirection: 'row', gap: 10, width: '100%' },
  opcaoBtn: {
    flex: 1, backgroundColor: colors.bg,
    borderWidth: 2, borderColor: colors.border,
    borderRadius: radius.lg, padding: 14, alignItems: 'center', gap: 4,
  },
  opcaoBtnActive: { borderColor: colors.verde, backgroundColor: 'rgba(109,194,41,0.06)' },
  opcaoIcon: { fontSize: 24 },
  opcaoTitulo: { fontSize: 13, fontWeight: '800', color: colors.text, textAlign: 'center' },
  opcaoDesc: { fontSize: 11, color: colors.textSec, textAlign: 'center' },
  valorWrap: { width: '100%', alignItems: 'center', gap: 10, marginTop: 4 },
  valorLabel: { fontSize: 12, color: colors.textSec, fontWeight: '600' },
  presets: { flexDirection: 'row', gap: 8 },
  presetBtn: {
    backgroundColor: 'rgba(109,194,41,0.08)',
    borderWidth: 1, borderColor: 'rgba(109,194,41,0.2)',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6,
  },
  presetBtnActive: { backgroundColor: colors.verde, borderColor: colors.verde },
  presetText: { fontSize: 13, fontWeight: '700', color: colors.verde },

  personalizarBtn: {
    borderWidth: 1.5, borderColor: 'rgba(109,194,41,0.3)',
    borderRadius: radius.lg, paddingVertical: 10, paddingHorizontal: 20,
    borderStyle: 'dashed',
  },
  personalizarText: { fontSize: 13, color: colors.verde, fontWeight: '700' },
  personalizarWrap: {
    width: '100%', backgroundColor: colors.bg,
    borderWidth: 2, borderColor: 'rgba(109,194,41,0.4)',
    borderRadius: radius.xl, padding: 14, gap: 8, alignItems: 'center',
  },
  personalizarLabel: { fontSize: 12, color: colors.textSec, fontWeight: '600' },
  personalizarInputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%',
  },
  personalizarRS: { fontSize: 26, fontWeight: '900', color: colors.verde },
  personalizarInput: {
    flex: 1, fontSize: 42, fontWeight: '900', color: colors.text,
    textAlign: 'center', paddingVertical: 4,
  },
  personalizarFechar: { fontSize: 18, color: colors.textMuted, paddingHorizontal: 4 },
  personalizarPreview: { fontSize: 13, color: colors.textSec },

  // Resumo
  sectionLabel: {
    fontSize: 12, color: colors.textSec, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4,
  },
  summary: {
    backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.xl, padding: 16, gap: 4,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  summaryLabel: { fontSize: 13, color: colors.textSec },
  summaryValue: {
    fontSize: 13, fontWeight: '700', color: colors.text,
    textAlign: 'right', flex: 1, marginLeft: 8,
  },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 6 },
  infoBox: {
    backgroundColor: 'rgba(43,95,170,0.12)',
    borderRadius: radius.md, padding: 10, marginTop: 6,
  },
  infoText: { fontSize: 12, color: '#7B9FD4', lineHeight: 16 },

  footer: { padding: spacing.xl, paddingBottom: spacing.xl },
  btnConfirm: {
    backgroundColor: colors.verde,
    borderRadius: radius.lg, padding: 16, alignItems: 'center',
  },
  btnDisabled: { backgroundColor: colors.border, opacity: 0.5 },
  btnConfirmText: { color: colors.white, fontSize: 16, fontWeight: '800' },
});
