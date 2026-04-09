const finalizarPagamento = async () => {
  setAguardando(true);

  try {
    // 1. Criar o registro na tabela USUARIO
    const { data: novoUsuario, error: erroUsuario } = await supabase
      .from('usuario')
      .insert([
        { 
          nome_usuario: params.nome_usuario, 
          senha: params.senha, 
          tipo_conta: 'profissional', 
          cidade: params.cidade,
          status_conta: 'pendente' // Fica pendente até admin aprovar
        }
      ])
      .select() // Isso pede para o Supabase devolver os dados do usuário criado
      .single();

    if (erroUsuario) {
      setAguardando(false);
      if (erroUsuario.code === '23505') {
        Alert.alert("Erro", "Este nome de usuário já existe.");
      } else {
        Alert.alert("Erro", "Não foi possível criar seu usuário.");
      }
      return;
    }

    // 2. Agora que temos o ID do usuário, criamos o registro na tabela PROFISSIONAL
    const { error: erroProfissional } = await supabase
      .from('profissional')
      .insert([
        { 
          id_usuario: novoUsuario.id, // O ID que veio do passo acima
          plano: params.plano,
          cidade: params.cidade,
          // Aqui você pode salvar a URL da foto se fizer o upload, 
          // ou apenas marcar que o documento foi enviado
          documento_validado: false 
        }
      ]);

    if (erroProfissional) {
      setAguardando(false);
      console.error(erroProfissional);
      Alert.alert("Erro", "Usuário criado, mas erro ao salvar dados profissionais.");
      return;
    }

    // 3. Se chegou aqui, deu tudo certo! 
    // O estado 'aguardando' continua true para mostrar a mensagem de análise.
    console.log("Profissional cadastrado com sucesso no Supabase!");

  } catch (error) {
    setAguardando(false);
    Alert.alert("Erro Fatal", "Ocorreu um erro inesperado.");
    console.error(error);
  }
};