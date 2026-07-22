# posto-front — App do Frentista (PostoPrático)

App React Native que roda na **Smart Cielo** do posto (terminal POS Android).

---

## Status

**A desenvolver** — aguardando definição com a Cielo sobre MDM e distribuição.

---

## Responsável pela distribuição

**Cielo** — instala e atualiza o app via MDM (Mobile Device Management) nos terminais Smart.
**SECC** — desenvolve e envia os builds para a Cielo.

---

## Fluxo previsto

```
1. Dashboard       KPIs: pendentes, abastecendo, concluídos, faturamento
2. Solicitação     Cliente + Placa + Valor + Produto + Timer de aprovação
3. Aprovação       Botões APROVAR / RECUSAR
4. Em andamento    Stats ao vivo de todas as bombas ativas
5. Conclusão       Comprovante completo + impressão automática via Smart
```

---

## Características

- Modo kiosk — não sai do app
- Notificação visual + sonora ao receber solicitação
- Timer de aprovação — cancela automaticamente se não responder
- Impressão automática do comprovante no terminal Smart
- Comunicação com `mobile-backend` via polling ou push notification

---

## Hardware alvo

**Smart Cielo** (terminal POS)
- Android 10+
- Impressora térmica integrada
- Conectividade Wi-Fi + 4G
- Gerenciado pela Cielo via MDM

**Exceção:** Sete Estrelas possui Smart própria (não alugada).
