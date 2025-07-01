document.addEventListener('DOMContentLoaded', function () {
  const registerForm = document.getElementById('registerForm');
  const errorDiv = document.getElementById('formError');

  const apiBaseUrl = 'http://localhost:3000';

  registerForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const nome = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('password').value;

    if (nome && email && senha) {
      try {
        const response = await fetch(`${apiBaseUrl}/api/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: nome, email, password: senha }),
        });

        const data = await response.json();

        if (response.ok) {
          errorDiv.style.display = 'none';
          alert('Cadastro realizado com sucesso!');
          window.location.href = './login.html';
        } else {
          errorDiv.textContent = data.error || 'Erro ao cadastrar usuário.';
          errorDiv.style.display = 'block';
        }
      } catch (error) {
        errorDiv.textContent = 'Erro na conexão com o servidor.';
        errorDiv.style.display = 'block';
        console.error(error);
      }
    } else {
      errorDiv.textContent = 'Por favor, preencha todos os campos.';
      errorDiv.style.display = 'block';
    }
  });
});