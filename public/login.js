document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('loginForm');

  const apiBaseUrl = 'http://localhost:3000';

  loginForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('password').value;

    if (email && senha) {
      try {
        const response = await fetch(`${apiBaseUrl}/api/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password: senha }),
        });

        const data = await response.json();

        if (response.ok) {
          // Armazena os dados do usuário logado
          localStorage.setItem('usuarioLogado', JSON.stringify({
            nome: data.name || data.username || email.split('@')[0],
            email: email,
            dataCadastro: new Date().toISOString()
          }));
          
          alert('Login realizado com sucesso!');
          window.location.href = './index.html';
        } else {
          alert(data.error || 'Erro ao realizar login.');
        }
      } catch (error) {
        alert('Erro na conexão com o servidor.');
        console.error(error);
      }
    } else {
      alert('Por favor, preencha todos os campos.');
    }
  });
});