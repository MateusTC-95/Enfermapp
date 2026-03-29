import axios from 'axios';

// Criamos uma instância do Axios para não ter que repetir a URL em todas as telas
const api = axios.create({
  // baseURL: É o endereço principal do servidor
  // Todas as requisições que a gente fizer vai usar esse início:
  baseURL: 'http://enfermapp.great-site.net/backend/public/',

  // timeout: Define quanto tempo (em milissegundos) o app deve esperar 
  // o servidor responder antes de desistir e dar erro. (10 segundos aqui)
  timeout: 10000,

  // headers: São as "etiquetas" da requisição
  headers: {
    // Content-Type: Avisa ao servidor PHP que estamos enviando dados em formato JSON.
    'Content-Type': 'application/json',
    // Accept: Avisa ao servidor que o celular espera receber um JSON como resposta.
    'Accept': 'application/json',
  }
});

// Exportamos a instância para que as telas (como a index.tsx) possam importá-la
export default api;