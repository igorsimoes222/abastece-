const { inicializarBanco } = require('./db');
const { cadastrar, login } = require('./auth');

async function testar() {
  await inicializarBanco();

  console.log('\n=== TESTE DE AUTENTICAÇÃO ===\n');

  // 1. Cadastro
  try {
    console.log('--- CADASTRO ---');
    const res = await cadastrar({
      nome:      'Igor Simoes',
      email:     'igor@abasteceplus.com',
      senha:     '123456',
      telefone:  '(12) 99999-0000',
      cpf:       '000.000.000-00',
      perfil:    'pf',
    });
    console.log('✅ Usuário criado:', res.usuario);
    console.log('🔑 Token JWT:', res.token.slice(0, 40) + '...');
  } catch (e) {
    if (e.mensagem === 'E-mail já cadastrado') {
      console.log('⚠️  Usuário já existe, pulando cadastro');
    } else {
      console.log('❌ Erro cadastro:', e);
    }
  }

  // 2. Login
  try {
    console.log('\n--- LOGIN ---');
    const res = await login({ email: 'igor@abasteceplus.com', senha: '123456' });
    console.log('✅ Login OK!');
    console.log('👤 Usuário:', res.usuario.nome, '|', res.usuario.email);
    console.log('💰 Cashback:', res.usuario.cashback_saldo);
    console.log('🔑 Token:', res.token.slice(0, 40) + '...');
  } catch (e) {
    console.log('❌ Erro login:', e);
  }

  // 3. Senha errada
  try {
    console.log('\n--- LOGIN COM SENHA ERRADA ---');
    await login({ email: 'igor@abasteceplus.com', senha: 'senhaerrada' });
  } catch (e) {
    console.log('✅ Bloqueado corretamente:', e.mensagem);
  }

  console.log('\n=== FIM DOS TESTES ===\n');
  process.exit(0);
}

testar().catch(e => { console.error(e); process.exit(1); });
